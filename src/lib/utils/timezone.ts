import { fromZonedTime, toZonedTime } from 'date-fns-tz'

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
 * Uses fromZonedTime to correctly interpret the time in the business timezone.
 * Example: ('2026-03-03', '12:30') -> '2026-03-03T18:30:00.000Z' (America/Costa_Rica = UTC-6)
 */
export function localDateTimeToUtcIso(
  date: string,
  time: string,
  tz: string = 'America/Costa_Rica'
): string {
  const naive = `${date}T${time}:00`
  const utcDate = fromZonedTime(naive, tz)
  if (Number.isNaN(utcDate.getTime())) {
    throw new Error(`Invalid local datetime: ${date} ${time}`)
  }
  return utcDate.toISOString()
}

/**
 * Anchor a date string (YYYY-MM-DD) to noon in the given timezone.
 * Returns a Date that is guaranteed to be the correct calendar day
 * regardless of the runtime's local timezone.
 *
 * Use this for day-only logic (filtering, grouping, display).
 * NEVER use this to persist appointment times — use localDateTimeToUtcIso() instead.
 */
export function anchorDateToNoon(dateStr: string, tz: string = 'America/Costa_Rica'): Date {
  return fromZonedTime(`${dateStr}T12:00:00`, tz)
}

/**
 * Format a date string (YYYY-MM-DD) as a display-friendly local Date.
 * Thin wrapper over anchorDateToNoon for components that just need a Date object.
 */
export function localDate(dateStr: string, tz: string = 'America/Costa_Rica'): Date {
  return anchorDateToNoon(dateStr, tz)
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
