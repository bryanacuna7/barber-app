'use client'

import { useMemo, useCallback, memo } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  addMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import type { Appointment } from '@/types'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

interface WeekViewProps {
  selectedDate: Date
  appointments: AppointmentWithRelations[]
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onTimeSlotClick?: (date: Date, hour: number) => void
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

export const WeekView = memo(function WeekView({
  selectedDate,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  businessHours = { start: 8, end: 20 },
}: WeekViewProps) {
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

  // Handle time slot click
  const handleSlotClick = useCallback(
    (day: Date, hour: number) => {
      if (onTimeSlotClick) {
        const slotDate = setMinutes(setHours(day, hour), 0)
        onTimeSlotClick(slotDate, hour)
      }
    },
    [onTimeSlotClick]
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Week Header - Desktop: all days, Mobile: 3 days centered on today */}
      <div className="grid border-b border-zinc-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900 z-10 grid-cols-[60px_repeat(3,1fr)] md:grid-cols-[80px_repeat(7,1fr)]">
        {/* Time column header */}
        <div className="p-1 md:p-2 text-[10px] md:text-xs font-medium text-zinc-500 text-right">
          Hora
        </div>

        {/* Day headers */}
        {weekDays.map((day, index) => {
          const isCurrentDay = isToday(day)
          const dayAppointments = appointmentsByDay.get(format(day, 'yyyy-MM-dd')) || []
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
                {/* Hour slots (clickable) */}
                {hourSlots.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => handleSlotClick(day, hour)}
                    className={cn(
                      'w-full h-[60px] border-b border-zinc-200 dark:border-zinc-700',
                      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                      'text-left text-xs text-zinc-400'
                    )}
                    aria-label={`Crear cita ${format(day, 'd MMM')} ${hour}:00`}
                  />
                ))}

                {/* Appointments positioned absolutely */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayAppointments.map((apt) => {
                    const aptDate = new Date(apt.scheduled_at)
                    const topPosition = getHourPosition(aptDate, businessHours.start)
                    const height = getAppointmentHeight(apt.service?.duration_minutes || 60)

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
                      <button
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className={cn(
                          'absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-md border-l-4 p-1 md:p-2 pointer-events-auto',
                          'text-left text-[10px] md:text-xs overflow-hidden',
                          'hover:shadow-md transition-shadow cursor-pointer',
                          statusColors[apt.status]
                        )}
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 40)}px`, // Minimum 40px for visibility
                        }}
                      >
                        <div className="font-semibold truncate">
                          {format(aptDate, 'HH:mm')} - {apt.client?.name || 'Sin cliente'}
                        </div>
                        {apt.service && (
                          <div className="text-[9px] md:text-[10px] opacity-80 truncate">
                            {apt.service.name}
                          </div>
                        )}
                      </button>
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
  )
})
