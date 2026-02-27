'use client'

import { useMemo, useState, useCallback, memo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge, type AppointmentStatus } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-is-mobile'
import type { Appointment } from '@/types'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

interface MonthViewProps {
  selectedDate: Date
  appointments: AppointmentWithRelations[]
  onDateSelect?: (date: Date) => void
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  maxVisibleAppointments?: number
}

interface DayDetailsProps {
  date: Date
  appointments: AppointmentWithRelations[]
  onClose: () => void
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
}

// Day Details Popover Component
function DayDetailsPopover({ date, appointments, onClose, onAppointmentClick }: DayDetailsProps) {
  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ),
    [appointments]
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {format(date, "d 'de' MMMM", { locale: es })}
            </h3>
            <p className="text-sm text-muted">
              {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedAppointments.map((apt) => {
            const aptDate = new Date(apt.scheduled_at)

            return (
              <button
                key={apt.id}
                onClick={() => onAppointmentClick?.(apt)}
                className="w-full text-left p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {format(aptDate, 'HH:mm')}
                  </span>
                  <StatusBadge status={apt.status as AppointmentStatus} size="sm" />
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  {apt.client?.name || 'Sin cliente'}
                </div>
                {apt.service && (
                  <div className="text-xs text-muted mt-1">
                    {apt.service.name} • {apt.service.duration_minutes} min
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export const MonthView = memo(function MonthView({
  selectedDate,
  appointments,
  onDateSelect,
  onAppointmentClick,
  maxVisibleAppointments = 3,
}: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const isMobile = useIsMobile()

  // Generate calendar days (including padding days from prev/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, AppointmentWithRelations[]>()

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.scheduled_at)
      const dayKey = format(aptDate, 'yyyy-MM-dd')
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, [])
      }
      grouped.get(dayKey)!.push(apt)
    })

    return grouped
  }, [appointments])

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
  }, [])

  // Handle day click
  const handleDayClick = useCallback(
    (day: Date) => {
      const dayKey = format(day, 'yyyy-MM-dd')
      const dayAppointments = appointmentsByDay.get(dayKey) || []

      if (dayAppointments.length > 0) {
        setSelectedDay(day)
      } else if (onDateSelect) {
        onDateSelect(day)
      }
    },
    [appointmentsByDay, onDateSelect]
  )

  // Close day details popover
  const closeDayDetails = useCallback(() => {
    setSelectedDay(null)
  }, [])

  // Weekday headers - Desktop: full names, Mobile: first letter only
  const weekDaysFull = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const weekDaysShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  return (
    <div className="flex flex-col h-full">
      {/* Month Header */}
      <div className="flex items-center justify-between p-2 md:p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <button
            onClick={goToToday}
            className="px-2 md:px-4 py-1 md:py-2 text-sm md:text-lg font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </button>
          <Button variant="ghost" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goToToday} className="text-xs md:text-sm">
          Hoy
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 h-full">
          {/* Weekday headers */}
          {weekDaysFull.map((day, index) => (
            <div
              key={day}
              className="p-1 md:p-2 text-center text-[10px] md:text-xs font-medium text-muted uppercase border-b border-zinc-200 dark:border-zinc-700"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{weekDaysShort[index]}</span>
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayAppointments = appointmentsByDay.get(dayKey) || []
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)
            const hasAppointments = dayAppointments.length > 0
            // Mobile: show 1 appointment, Desktop: show 3
            const maxVisible = isMobile ? 1 : maxVisibleAppointments
            const visibleAppointments = dayAppointments.slice(0, maxVisible)
            const hiddenCount = Math.max(0, dayAppointments.length - maxVisible)

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[60px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-zinc-200 dark:border-zinc-700',
                  'text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                  !isCurrentMonth && 'bg-zinc-50/50 dark:bg-zinc-900/50',
                  isCurrentDay && 'bg-blue-50 dark:bg-blue-950/30'
                )}
              >
                {/* Day number */}
                <div
                  className={cn(
                    'text-xs md:text-sm font-semibold mb-0.5 md:mb-1',
                    isCurrentMonth
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-400 dark:text-zinc-600',
                    isCurrentDay &&
                      'inline-flex items-center justify-center w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-600 text-white'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* Appointment pills */}
                {hasAppointments && (
                  <div className="space-y-0.5 md:space-y-1">
                    {visibleAppointments.map((apt) => {
                      const aptTime = format(new Date(apt.scheduled_at), 'HH:mm')

                      // Status color mapping (simplified for pills)
                      const statusColors = {
                        pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                        confirmed:
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                        completed:
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                        cancelled:
                          'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400',
                        no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                      }

                      return (
                        <div
                          key={apt.id}
                          className={cn(
                            'text-[9px] md:text-[10px] font-medium px-1 md:px-1.5 py-0.5 rounded truncate',
                            statusColors[apt.status]
                          )}
                          title={`${aptTime} - ${apt.client?.name || 'Sin cliente'}`}
                        >
                          <span className="hidden md:inline">
                            {aptTime} {apt.client?.name || 'Sin cliente'}
                          </span>
                          <span className="md:hidden">{aptTime}</span>
                        </div>
                      )
                    })}

                    {/* +X more indicator */}
                    {hiddenCount > 0 && (
                      <div className="text-[9px] md:text-[10px] font-medium text-muted px-1 md:px-1.5">
                        +{hiddenCount}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day Details Popover */}
      {selectedDay && (
        <DayDetailsPopover
          date={selectedDay}
          appointments={appointmentsByDay.get(format(selectedDay, 'yyyy-MM-dd')) || []}
          onClose={closeDayDetails}
          onAppointmentClick={(apt) => {
            closeDayDetails()
            onAppointmentClick?.(apt)
          }}
        />
      )}
    </div>
  )
})
