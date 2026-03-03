import { addMinutes, format, isSameDay } from 'date-fns'

const DEFAULT_TIME = '09:00'
const DEFAULT_INTERVAL_MINUTES = 5
const DEFAULT_LEAD_MINUTES = 5

interface SuggestedAppointmentTimeOptions {
  selectedDate: Date
  now?: Date
  fallbackTime?: string
  intervalMinutes?: number
  leadMinutes?: number
}

function roundUpToInterval(date: Date, intervalMinutes: number): Date {
  const rounded = new Date(date)
  rounded.setSeconds(0, 0)

  const minutes = rounded.getMinutes()
  const remainder = minutes % intervalMinutes
  if (remainder !== 0) {
    rounded.setMinutes(minutes + (intervalMinutes - remainder))
  }

  return rounded
}

export function getSuggestedAppointmentTime({
  selectedDate,
  now = new Date(),
  fallbackTime = DEFAULT_TIME,
  intervalMinutes = DEFAULT_INTERVAL_MINUTES,
  leadMinutes = DEFAULT_LEAD_MINUTES,
}: SuggestedAppointmentTimeOptions): string {
  if (!isSameDay(selectedDate, now)) {
    return fallbackTime
  }

  const safeInterval = Math.max(1, intervalMinutes)
  const candidate = roundUpToInterval(addMinutes(now, leadMinutes), safeInterval)

  if (!isSameDay(candidate, selectedDate)) {
    return '23:55'
  }

  return format(candidate, 'HH:mm')
}
