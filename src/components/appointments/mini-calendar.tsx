'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'

interface MiniCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  appointmentDates?: Date[]
  className?: string
}

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  appointmentDates = [],
  className
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const hasAppointment = (date: Date) => {
    return appointmentDates.some(d => isSameDay(d, date))
  }

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(startOfMonth(new Date()))
    onDateSelect(new Date())
  }

  return (
    <div className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={goToToday}
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </button>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Weekday headers */}
      <div
        className="gap-1 mb-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-zinc-500 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        className="gap-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isDayToday = isToday(day)
          const hasAppt = hasAppointment(day)

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth}
              className={cn(
                'relative h-10 w-full flex items-center justify-center rounded-lg',
                'text-sm font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
                !isCurrentMonth && 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed',
                isCurrentMonth && !isSelected && !isDayToday && 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                isDayToday && !isSelected && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
                isSelected && 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg'
              )}
            >
              {format(day, 'd')}
              {/* Appointment indicator */}
              {hasAppt && isCurrentMonth && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
