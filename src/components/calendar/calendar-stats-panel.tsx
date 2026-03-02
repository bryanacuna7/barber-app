'use client'

import { format, isSameDay, isSameMonth, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrencyCompactMillions } from '@/lib/utils'

type ViewMode = 'day' | 'week' | 'month'

export interface CalendarStatsPanelProps {
  today: Date
  miniCalendarDays: Date[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
  selectedDate: Date
  stats: {
    scheduled: number
    completed: number
    totalRevenue: number
  }
  setSelectedDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  onCloseDrawer: () => void
}

export function CalendarStatsPanel({
  today,
  miniCalendarDays,
  appointments,
  selectedDate,
  stats,
  setSelectedDate,
  setViewMode,
  onCloseDrawer,
}: CalendarStatsPanelProps) {
  return (
    <>
      {/* Mini calendar */}
      <div className="mb-6">
        <div className="text-center mb-3">
          <div className="text-sm font-medium text-white">
            {format(today, 'MMMM yyyy', { locale: es })}
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {miniCalendarDays.map((day) => {
            const hasAppointments = appointments.some((apt) => {
              const aptDate = parseISO(apt.scheduled_at)
              return isValid(aptDate) && isSameDay(aptDate, day)
            })
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day)
                  setViewMode('day')
                  onCloseDrawer()
                }}
                className={`aspect-square flex items-center justify-center text-xs rounded-full transition-colors ${
                  isSameDay(day, today)
                    ? 'bg-red-500 dark:bg-red-500 text-white font-bold'
                    : isSameDay(day, selectedDate)
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                      : isSameMonth(day, today)
                        ? 'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : 'text-zinc-400 dark:text-zinc-400/50'
                } ${hasAppointments && !isSameDay(day, today) ? 'font-bold' : ''}`}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats (Cinema feature) */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs font-medium text-muted mb-3">ESTADÍSTICAS HOY</div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-900 dark:text-white">Agendadas</span>
          <span className="text-sm font-bold text-blue-500 dark:text-blue-500">
            {stats.scheduled}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-900 dark:text-white">Completada</span>
          <span className="text-sm font-bold text-green-500 dark:text-emerald-500">
            {stats.completed}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-500/20 dark:to-red-500/20 rounded-lg border border-amber-500/20 dark:border-amber-500/30">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Ingresos</span>
          <span className="text-lg font-bold text-amber-500 dark:text-amber-500">
            {formatCurrencyCompactMillions(stats.totalRevenue)}
          </span>
        </div>
      </div>
    </>
  )
}
