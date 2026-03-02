'use client'

import { motion } from 'framer-motion'
import { format, isSameDay } from 'date-fns'

interface MonthDay {
  date: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
  isCurrentMonth: boolean
}

interface CalendarMonthViewProps {
  monthDays: MonthDay[]
  today: Date
  onDayClick: (date: Date) => void
}

export function CalendarMonthView({ monthDays, today, onDayClick }: CalendarMonthViewProps) {
  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 mb-px">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div
            key={day}
            className="bg-white dark:bg-zinc-900 text-center text-xs text-muted py-2 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800">
        {monthDays.map((day) => (
          <motion.div
            key={day.date.toISOString()}
            onClick={() => onDayClick(day.date)}
            whileTap={{ scale: 0.95 }}
            className={`bg-white dark:bg-zinc-900 aspect-square p-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
              !day.isCurrentMonth ? 'opacity-30' : ''
            }`}
          >
            <div
              className={`inline-flex items-center justify-center ${
                isSameDay(day.date, today)
                  ? 'bg-red-500 dark:bg-red-500 text-white w-6 h-6 rounded-full font-bold text-sm'
                  : 'text-zinc-900 dark:text-white text-sm'
              }`}
            >
              {format(day.date, 'd')}
            </div>

            {/* Event indicators (max 3 dots) */}
            {day.appointments.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {day.appointments.slice(0, 3).map((apt, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      apt.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                ))}
                {day.appointments.length > 3 && (
                  <div className="text-[11px] text-muted">+{day.appointments.length - 3}</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
