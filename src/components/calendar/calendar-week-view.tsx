'use client'

import { useMemo } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion'
import { isSameDay, format, parseISO, isValid, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { animations } from '@/lib/design-system'

interface WeekDay {
  date: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
}

interface CalendarWeekViewProps {
  /** Full 7-day week for desktop */
  weekDays: WeekDay[]
  /** 3-day subset for mobile (current + next 2) */
  mobileWeekDays: WeekDay[]
  businessHours?: {
    /** Opening hour (24h) */
    start: number
    /** Closing hour label shown in grid (24h) */
    end: number
  }
  selectedDate: Date
  currentTime: Date
  currentTimePercent: number
  isSelectedDateToday: boolean
  unscheduledCount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredAppointments: any[]
  onSelectDate: (date: Date) => void
  onSelectAppointment: (id: string) => void
}

export function CalendarWeekView({
  weekDays,
  mobileWeekDays,
  businessHours = { start: 7, end: 20 },
  selectedDate,
  currentTime,
  currentTimePercent,
  isSelectedDateToday,
  unscheduledCount,
  filteredAppointments,
  onSelectDate,
  onSelectAppointment,
}: CalendarWeekViewProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const hourSlots = useMemo(() => {
    const start = Math.max(0, Math.min(23, businessHours.start))
    const end = Math.max(start, Math.min(23, businessHours.end))
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [businessHours.end, businessHours.start])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Unscheduled section (only when needed) */}
        {unscheduledCount > 0 && (
          <>
            {/* Mobile: 3-day view */}
            <div className="grid lg:hidden grid-cols-[60px_repeat(3,1fr)] border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <div className="p-2">
                <span className="text-xs text-muted">Sin hora</span>
              </div>
              {mobileWeekDays.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className="border-l border-zinc-200 dark:border-zinc-800 p-2 min-h-[40px]"
                />
              ))}
            </div>
            {/* Desktop: 7-day view */}
            <div className="hidden lg:grid grid-cols-[60px_repeat(7,1fr)] border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <div className="p-2">
                <span className="text-xs text-muted">Sin hora</span>
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className="border-l border-zinc-200 dark:border-zinc-800 p-2 min-h-[40px]"
                />
              ))}
            </div>
          </>
        )}

        {/* Day headers - Mobile: 3 days */}
        <div className="grid lg:hidden grid-cols-[60px_repeat(3,1fr)] mb-4">
          <div />
          {mobileWeekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="text-center border-l border-zinc-200 dark:border-zinc-800 py-2"
            >
              <div
                className={`inline-flex items-center justify-center ${
                  isSameDay(day.date, today)
                    ? 'bg-red-500 dark:bg-red-500 text-white w-8 h-8 rounded-full font-bold'
                    : 'text-muted'
                }`}
              >
                <span className="text-sm">{format(day.date, 'd')}</span>
              </div>
              <div className="text-xs text-muted mt-1">
                {format(day.date, 'EEE', { locale: es })}
              </div>
            </div>
          ))}
        </div>
        {/* Day headers - Desktop: 7 days */}
        <div className="hidden lg:grid grid-cols-[60px_repeat(7,1fr)] mb-4">
          <div />
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="text-center border-l border-zinc-200 dark:border-zinc-800 py-2"
            >
              <div
                className={`inline-flex items-center justify-center ${
                  isSameDay(day.date, today)
                    ? 'bg-red-500 dark:bg-red-500 text-white w-8 h-8 rounded-full font-bold'
                    : 'text-muted'
                }`}
              >
                <span className="text-sm">{format(day.date, 'd')}</span>
              </div>
              <div className="text-xs text-muted mt-1">
                {format(day.date, 'EEE', { locale: es })}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline grid - Mobile: 3 days */}
        <div className="relative lg:hidden">
          {/* Hour rows */}
          {hourSlots.map((hour) => {
            return (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(3,1fr)] border-t border-zinc-200 dark:border-zinc-800"
                style={{ minHeight: '60px' }}
              >
                {/* Hour label */}
                <div className="text-xs text-muted text-right pr-2 pt-1">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>

                {/* Day columns */}
                {mobileWeekDays.map((day) => {
                  const hourAppointments = day.appointments.filter((apt) => {
                    const aptDate = parseISO(apt.scheduled_at)
                    return isValid(aptDate) && aptDate.getHours() === hour
                  })
                  return (
                    <div
                      key={`${day.date.toISOString()}-${hour}`}
                      className="border-l border-zinc-200 dark:border-zinc-800 p-1 relative"
                    >
                      {hourAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onSelectAppointment(apt.id)}
                          className="bg-blue-500/80 rounded p-1.5 mb-1 cursor-pointer hover:bg-blue-500 transition-colors text-xs"
                        >
                          <div className="font-medium text-white truncate">
                            {apt.client?.name || 'Cliente'}
                          </div>
                          <div className="text-[11px] text-white/80 truncate">
                            {apt.service?.name || 'Servicio'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        {/* Timeline grid - Desktop: 7 days */}
        <div className="relative hidden lg:block">
          {/* Hour rows */}
          {hourSlots.map((hour) => {
            return (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-zinc-200 dark:border-zinc-800"
                style={{ minHeight: '60px' }}
              >
                {/* Hour label */}
                <div className="text-xs text-muted text-right pr-2 pt-1">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>

                {/* Day columns */}
                {weekDays.map((day) => {
                  const hourAppointments = day.appointments.filter((apt) => {
                    const aptDate = parseISO(apt.scheduled_at)
                    return isValid(aptDate) && aptDate.getHours() === hour
                  })
                  return (
                    <div
                      key={`${day.date.toISOString()}-${hour}`}
                      className="border-l border-zinc-200 dark:border-zinc-800 p-1 relative"
                    >
                      {hourAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onSelectAppointment(apt.id)}
                          className="bg-blue-500/80 rounded p-1.5 mb-1 cursor-pointer hover:bg-blue-500 transition-colors text-xs"
                        >
                          <div className="font-medium text-white truncate">
                            {apt.client?.name || 'Cliente'}
                          </div>
                          <div className="text-[11px] text-white/80 truncate">
                            {apt.service?.name || 'Servicio'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Current time indicator (Week view) */}
          {currentTime.getHours() >= businessHours.start &&
            currentTime.getHours() < businessHours.end + 1 && (
              <div
                className="absolute inset-x-0 h-0.5 bg-red-500 dark:bg-red-500 z-20 pointer-events-none"
                style={{ top: `${currentTimePercent}%` }}
              >
                <div className="absolute left-0 w-2 h-2 bg-red-500 dark:bg-red-500 rounded-full -translate-y-1/2 animate-pulse" />
                <div className="absolute left-3 -translate-y-1/2 text-xs font-bold text-white bg-red-500 dark:bg-red-500 px-2 py-0.5 rounded shadow-sm">
                  {format(currentTime, 'h:mm a')}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
