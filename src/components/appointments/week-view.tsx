'use client'

import { useMemo, useCallback, memo, useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  setHours,
  setMinutes,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCenter,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Appointment } from '@/types'

// Draggable Appointment Component
import { DraggableAppointment } from './draggable-appointment'
import { DroppableTimeSlot } from './droppable-time-slot'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

interface WeekViewProps {
  selectedDate: Date
  appointments: AppointmentWithRelations[]
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onTimeSlotClick?: (date: Date, hour: number) => void
  onAppointmentReschedule?: (appointmentId: string, newScheduledAt: string) => Promise<void>
  businessHours?: { start: number; end: number }
}

// Utility: Convert date to hour grid position
function getHourPosition(date: Date, startHour: number): number {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return (hours - startHour) * 60 + minutes
}

// Utility: Calculate appointment height in pixels (1 hour = 60px)
function getAppointmentHeight(durationMinutes: number): number {
  return (durationMinutes / 60) * 60 // 1px per minute
}

// Parse droppable ID to get day and hour
function parseDroppableId(id: string): { dayKey: string; hour: number } | null {
  const parts = id.split('_')
  if (parts.length !== 2) return null
  const dayKey = parts[0]
  const hour = parseInt(parts[1], 10)
  if (isNaN(hour)) return null
  return { dayKey, hour }
}

export const WeekView = memo(function WeekView({
  selectedDate,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentReschedule,
  businessHours = { start: 8, end: 20 },
}: WeekViewProps) {
  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold to start drag on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Generate week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  // Generate hour slots
  const hourSlots = useMemo(() => {
    const hours: number[] = []
    for (let i = businessHours.start; i <= businessHours.end; i++) {
      hours.push(i)
    }
    return hours
  }, [businessHours])

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, AppointmentWithRelations[]>()

    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd')
      grouped.set(dayKey, [])
    })

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.scheduled_at)
      const dayKey = format(aptDate, 'yyyy-MM-dd')
      if (grouped.has(dayKey)) {
        grouped.get(dayKey)!.push(apt)
      }
    })

    return grouped
  }, [appointments, weekDays])

  // Get active appointment being dragged
  const activeAppointment = useMemo(() => {
    if (!activeId) return null
    return appointments.find((apt) => apt.id === activeId) || null
  }, [activeId, appointments])

  // Check if a time slot has a conflict
  const hasConflict = useCallback(
    (dayKey: string, hour: number, excludeAppointmentId?: string) => {
      const dayAppointments = appointmentsByDay.get(dayKey) || []
      const slotStart = hour * 60
      const slotEnd = (hour + 1) * 60

      return dayAppointments.some((apt) => {
        if (apt.id === excludeAppointmentId) return false
        const aptDate = new Date(apt.scheduled_at)
        const aptStartMinutes = aptDate.getHours() * 60 + aptDate.getMinutes()
        const aptEndMinutes =
          aptStartMinutes + (apt.service?.duration_minutes || apt.duration_minutes || 60)
        // Check overlap
        return aptStartMinutes < slotEnd && aptEndMinutes > slotStart
      })
    },
    [appointmentsByDay]
  )

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setIsDragging(true)
  }, [])

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string | null)
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      setActiveId(null)
      setOverId(null)
      setIsDragging(false)

      if (!over || !onAppointmentReschedule) return

      const appointmentId = active.id as string
      const droppableId = over.id as string

      // Parse the droppable ID to get day and hour
      const dropTarget = parseDroppableId(droppableId)
      if (!dropTarget) return

      const { dayKey, hour } = dropTarget

      // Find the appointment being moved
      const appointment = appointments.find((apt) => apt.id === appointmentId)
      if (!appointment) return

      // Only allow rescheduling pending or confirmed appointments
      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        toast.error('Solo se pueden mover citas pendientes o confirmadas')
        return
      }

      // Check for conflicts
      if (hasConflict(dayKey, hour, appointmentId)) {
        toast.error('Ya existe una cita en ese horario')
        return
      }

      // Create new scheduled_at timestamp
      const newDate = parseISO(dayKey)
      const newScheduledAt = setMinutes(setHours(newDate, hour), 0)
      const newScheduledAtISO = newScheduledAt.toISOString()

      // Check if the time actually changed
      const currentScheduled = new Date(appointment.scheduled_at)
      if (currentScheduled.getHours() === hour && isSameDay(currentScheduled, newScheduledAt)) {
        return // No change needed
      }

      // Call the reschedule handler
      setIsUpdating(true)
      try {
        await onAppointmentReschedule(appointmentId, newScheduledAtISO)
        toast.success('Cita reprogramada exitosamente')
      } catch (error) {
        console.error('Error rescheduling appointment:', error)
        toast.error('Error al reprogramar la cita')
      } finally {
        setIsUpdating(false)
      }
    },
    [appointments, hasConflict, onAppointmentReschedule]
  )

  // Handle time slot click
  const handleSlotClick = useCallback(
    (day: Date, hour: number) => {
      if (onTimeSlotClick && !isDragging) {
        const slotDate = setMinutes(setHours(day, hour), 0)
        onTimeSlotClick(slotDate, hour)
      }
    },
    [onTimeSlotClick, isDragging]
  )

  // Get current time indicator position (only for today)
  const currentTimePosition = useMemo(() => {
    const now = new Date()
    if (!weekDays.some((day) => isToday(day))) return null

    const hours = now.getHours()
    const minutes = now.getMinutes()

    if (hours < businessHours.start || hours > businessHours.end) return null

    return (hours - businessHours.start) * 60 + minutes
  }, [weekDays, businessHours])

  // Get mobile days (current day + 2 adjacent days)
  const mobileDays = useMemo(() => {
    const currentIndex = weekDays.findIndex((day) => isToday(day))
    if (currentIndex === -1) return weekDays.slice(0, 3)

    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(weekDays.length, start + 3)
    return weekDays.slice(start, end)
  }, [weekDays])

  // Status color mapping
  const statusColors = {
    pending:
      'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200',
    confirmed:
      'bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200',
    completed:
      'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200',
    cancelled:
      'bg-zinc-100 border-zinc-300 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400',
    no_show:
      'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200',
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'flex flex-col h-full overflow-hidden',
          isUpdating && 'pointer-events-none opacity-70'
        )}
      >
        {/* Week Header - Desktop: all days, Mobile: 3 days centered on today */}
        <div className="grid border-b border-zinc-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900 z-10 grid-cols-[60px_repeat(3,1fr)] md:grid-cols-[80px_repeat(7,1fr)]">
          {/* Time column header */}
          <div className="p-1 md:p-2 text-[10px] md:text-xs font-medium text-zinc-500 text-right">
            Hora
          </div>

          {/* Day headers */}
          {weekDays.map((day) => {
            const isCurrentDay = isToday(day)
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayAppointments = appointmentsByDay.get(dayKey) || []
            const isInMobileView = mobileDays.some((mobileDay) => isSameDay(mobileDay, day))

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-1 md:p-2 text-center border-l border-zinc-200 dark:border-zinc-700',
                  isCurrentDay && 'bg-blue-50 dark:bg-blue-950/30',
                  // Hide days not in mobile view
                  !isInMobileView && 'hidden md:block'
                )}
              >
                <div
                  className={cn(
                    'text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase',
                    isCurrentDay && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div
                  className={cn(
                    'text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5',
                    isCurrentDay && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {format(day, 'd')}
                </div>
                {dayAppointments.length > 0 && (
                  <div className="text-[9px] md:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {dayAppointments.length}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Week Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-auto relative">
          <div className="grid grid-cols-[60px_repeat(3,minmax(100px,1fr))] md:grid-cols-[80px_repeat(7,1fr)]">
            {/* Hour labels column */}
            <div className="relative sticky left-0 bg-white dark:bg-zinc-900 z-[5]">
              {hourSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-zinc-200 dark:border-zinc-700 text-right pr-1 md:pr-2 pt-1"
                >
                  <span className="text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {format(setHours(new Date(), hour), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns with time slots */}
            {weekDays.map((day) => {
              const isCurrentDay = isToday(day)
              const dayKey = format(day, 'yyyy-MM-dd')
              const dayAppointments = appointmentsByDay.get(dayKey) || []
              const isInMobileView = mobileDays.some((mobileDay) => isSameDay(mobileDay, day))

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'relative border-l border-zinc-200 dark:border-zinc-700',
                    isCurrentDay && 'bg-blue-50/30 dark:bg-blue-950/10',
                    // Hide days not in mobile view
                    !isInMobileView && 'hidden md:block'
                  )}
                >
                  {/* Hour slots (droppable) */}
                  {hourSlots.map((hour) => {
                    const droppableId = `${dayKey}_${hour}`
                    const isOver = overId === droppableId
                    const hasExistingConflict = hasConflict(dayKey, hour, activeId || undefined)

                    return (
                      <DroppableTimeSlot
                        key={hour}
                        id={droppableId}
                        day={day}
                        hour={hour}
                        isOver={isOver}
                        hasConflict={hasExistingConflict && isDragging}
                        isDragging={isDragging}
                        onClick={() => handleSlotClick(day, hour)}
                      />
                    )
                  })}

                  {/* Appointments positioned absolutely */}
                  <div className="absolute inset-0 pointer-events-none">
                    {dayAppointments.map((apt) => {
                      const aptDate = new Date(apt.scheduled_at)
                      const topPosition = getHourPosition(aptDate, businessHours.start)
                      const height = getAppointmentHeight(
                        apt.service?.duration_minutes || apt.duration_minutes || 60
                      )
                      const isDragEnabled = apt.status === 'pending' || apt.status === 'confirmed'
                      const isBeingDragged = activeId === apt.id

                      return (
                        <DraggableAppointment
                          key={apt.id}
                          appointment={apt}
                          topPosition={topPosition}
                          height={height}
                          statusColors={statusColors}
                          isDragEnabled={isDragEnabled && !!onAppointmentReschedule}
                          isBeingDragged={isBeingDragged}
                          onClick={() => !isDragging && onAppointmentClick?.(apt)}
                        />
                      )
                    })}
                  </div>

                  {/* Current time indicator (only for today) */}
                  {isCurrentDay && currentTimePosition !== null && (
                    <div
                      className="absolute left-0 right-0 pointer-events-none z-10"
                      style={{ top: `${currentTimePosition}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500" />
                        <div className="flex-1 h-[2px] bg-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Drag Overlay - Shows preview of dragged appointment */}
      <DragOverlay dropAnimation={null}>
        {activeAppointment && (
          <div
            className={cn(
              'rounded-md border-l-4 p-1 md:p-2 shadow-lg',
              'text-left text-[10px] md:text-xs overflow-hidden',
              'transform scale-105 opacity-90',
              statusColors[activeAppointment.status]
            )}
            style={{
              width: '140px',
              height: `${Math.max(getAppointmentHeight(activeAppointment.service?.duration_minutes || activeAppointment.duration_minutes || 60), 40)}px`,
            }}
          >
            <div className="font-semibold truncate">
              {format(new Date(activeAppointment.scheduled_at), 'HH:mm')} -{' '}
              {activeAppointment.client?.name || 'Sin cliente'}
            </div>
            {activeAppointment.service && (
              <div className="text-[9px] md:text-[10px] opacity-80 truncate">
                {activeAppointment.service.name}
              </div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
})
