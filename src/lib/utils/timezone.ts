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
