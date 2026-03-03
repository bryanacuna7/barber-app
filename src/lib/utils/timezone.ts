import { toZonedTime } from 'date-fns-tz'

/**
 * Get the hour (0-23) of a Date in a specific timezone.
 * Uses date-fns-tz for proper DST handling.
 */
export function getHourInTimezone(date: Date, tz: string): number {
  const zonedDate = toZonedTime(date, tz)
  return zonedDate.getHours()
}

/**
 * Get the day of week (0=Sun...6=Sat) of a Date in a specific timezone.
 * Uses date-fns-tz for proper DST handling.
 */
export function getDayOfWeekInTimezone(date: Date, tz: string): number {
  const zonedDate = toZonedTime(date, tz)
  return zonedDate.getDay()
}

/**
 * Convert local date + local time into UTC ISO string.
 * Example: ('2026-03-03', '12:30') -> '2026-03-03T18:30:00.000Z' (in UTC-6 locale)
 */
export function localDateTimeToUtcIso(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00`)
  if (Number.isNaN(local.getTime())) {
    throw new Error(`Invalid local datetime: ${date} ${time}`)
  }
  return local.toISOString()
}

/**
 * Normalize any valid datetime string to canonical UTC ISO format.
 * Useful as a defensive layer before persisting `scheduled_at`.
 */
export function normalizeDateTimeToUtcIso(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid datetime value: ${value}`)
  }
  return parsed.toISOString()
}
