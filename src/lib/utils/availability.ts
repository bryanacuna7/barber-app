import { addDays, format, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns'
import type { OperatingHours } from '@/types'

export interface TimeSlot {
  time: string
  datetime: string
  available: boolean
}

/**
 * Appointment data used for conflict detection.
 * Supports both legacy (scheduled_at + duration_minutes only) and
 * smart-duration mode (with status, started_at, actual_duration_minutes).
 */
export interface AppointmentForConflict {
  scheduled_at: string
  duration_minutes: number
  status?: 'pending' | 'confirmed' | 'completed'
  started_at?: string | null
  actual_duration_minutes?: number | null
}

interface AvailabilityParams {
  date: Date
  operatingHours: OperatingHours
  existingAppointments: AppointmentForConflict[]
  serviceDuration: number
  bufferMinutes: number
  /** Interval between generated slots in minutes. Default 30. Use 5 for rolling smart-duration. */
  slotInterval?: number
  /** When true, use gap-based algorithm instead of fixed-interval. */
  gapBased?: boolean
}

const dayMap: Record<number, keyof OperatingHours> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

function parseTime(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return setMinutes(setHours(date, hours), minutes)
}

/**
 * Calculate the effective time window an appointment actually occupies.
 *
 * - Uses `started_at` as start when available (real check-in time), otherwise `scheduled_at`
 * - Uses `actual_duration_minutes` for completed appointments (real duration), otherwise `duration_minutes`
 *
 * This prevents overbooking from late starts and eliminates dead time from early completions.
 */
function getEffectiveWindow(apt: AppointmentForConflict): { start: Date; end: Date } {
  // Real start: use started_at if barber checked in, otherwise scheduled_at
  const start = apt.started_at ? new Date(apt.started_at) : new Date(apt.scheduled_at)

  // Real duration: for completed appointments with tracked actual duration, use that
  let durationMin = apt.duration_minutes
  if (
    apt.status === 'completed' &&
    apt.actual_duration_minutes != null &&
    apt.actual_duration_minutes > 0
  ) {
    durationMin = apt.actual_duration_minutes
  }

  const end = new Date(start.getTime() + durationMin * 60000)
  return { start, end }
}

function hasConflict(
  slotStart: Date,
  slotEnd: Date,
  appointments: AppointmentForConflict[],
  bufferMinutes: number
): boolean {
  for (const apt of appointments) {
    const { start: aptStart, end: aptEnd } = getEffectiveWindow(apt)

    // Buffer only applies to non-completed appointments (completed ones are done)
    const effectiveBuffer = apt.status === 'completed' ? 0 : bufferMinutes

    const bufferedSlotStart = new Date(slotStart.getTime() - effectiveBuffer * 60000)
    const bufferedSlotEnd = new Date(slotEnd.getTime() + effectiveBuffer * 60000)

    // Check overlap
    if (bufferedSlotStart < aptEnd && bufferedSlotEnd > aptStart) {
      return true
    }
  }
  return false
}

/**
 * Main entry point — delegates to gap-based or interval-based algorithm.
 */
export function calculateAvailableSlots(params: AvailabilityParams): TimeSlot[] {
  if (params.gapBased) {
    return calculateGapBasedSlots(params)
  }
  return calculateIntervalBasedSlots(params)
}

/**
 * Original interval-based algorithm: generates slots at fixed intervals,
 * marks each as available/unavailable based on conflict detection.
 */
function calculateIntervalBasedSlots(params: AvailabilityParams): TimeSlot[] {
  const { date, operatingHours, existingAppointments, serviceDuration, bufferMinutes } = params
  const slotInterval = params.slotInterval ?? 30

  const dayOfWeek = date.getDay()
  const dayKey = dayMap[dayOfWeek]
  const hours = operatingHours[dayKey]

  // Closed this day
  if (!hours || !hours.open || !hours.close) {
    return []
  }

  const slots: TimeSlot[] = []
  const dayStart = startOfDay(date)

  const openTime = parseTime(hours.open, dayStart)
  const closeTime = parseTime(hours.close, dayStart)

  let currentTime = openTime
  const now = new Date()

  while (true) {
    const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000)

    // Stop if slot would end after close time
    if (isAfter(slotEnd, closeTime)) {
      break
    }

    // Check if slot is in the past
    const isPast = isBefore(currentTime, now)

    // Don't return past slots: users shouldn't see hours that already passed.
    if (isPast) {
      currentTime = new Date(currentTime.getTime() + slotInterval * 60000)
      continue
    }

    // Check for conflicts with existing appointments
    const hasAppointmentConflict = hasConflict(
      currentTime,
      slotEnd,
      existingAppointments,
      bufferMinutes
    )

    slots.push({
      time: format(currentTime, 'h:mm a'),
      datetime: currentTime.toISOString(),
      available: !hasAppointmentConflict,
    })

    // Move to next slot
    currentTime = new Date(currentTime.getTime() + slotInterval * 60000)
  }

  return slots
}

/**
 * Gap-based algorithm: only generates slots in free gaps between occupied windows.
 * All returned slots are available by construction — no unavailable slots shown.
 *
 * Algorithm:
 * 1. Build occupied windows from appointments (with buffer for non-completed)
 * 2. Sort by start time, merge overlapping windows
 * 3. Calculate free gaps: [open→first], between consecutive, [last→close]
 * 4. For each gap: generate slots spaced by serviceDuration
 * 5. Tail slot: captures remaining capacity at gap end that fixed-step would skip
 */
function calculateGapBasedSlots(params: AvailabilityParams): TimeSlot[] {
  const { date, operatingHours, existingAppointments, serviceDuration, bufferMinutes } = params

  const dayOfWeek = date.getDay()
  const dayKey = dayMap[dayOfWeek]
  const hours = operatingHours[dayKey]

  if (!hours || !hours.open || !hours.close) {
    return []
  }

  const dayStart = startOfDay(date)
  const openTime = parseTime(hours.open, dayStart)
  const closeTime = parseTime(hours.close, dayStart)
  const now = new Date()

  // 1. Build occupied windows with per-appointment buffer
  const occupied: { start: number; end: number }[] = []
  for (const apt of existingAppointments) {
    const { start, end } = getEffectiveWindow(apt)
    const buf = apt.status === 'completed' ? 0 : bufferMinutes
    occupied.push({
      start: start.getTime() - buf * 60000,
      end: end.getTime() + buf * 60000,
    })
  }

  // 2. Sort by start, merge overlapping
  occupied.sort((a, b) => a.start - b.start)
  const merged: { start: number; end: number }[] = []
  for (const w of occupied) {
    if (merged.length > 0 && w.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, w.end)
    } else {
      merged.push({ ...w })
    }
  }

  // 3. Calculate free gaps
  const gaps: { start: number; end: number }[] = []
  let cursor = openTime.getTime()

  for (const w of merged) {
    if (w.start > cursor) {
      gaps.push({ start: cursor, end: w.start })
    }
    cursor = Math.max(cursor, w.end)
  }
  // Final gap from last occupied to close
  if (cursor < closeTime.getTime()) {
    gaps.push({ start: cursor, end: closeTime.getTime() })
  }

  // 4. Generate slots from each gap
  const serviceDurationMs = serviceDuration * 60000
  const slots: TimeSlot[] = []
  const seenDatetimes = new Set<string>()

  for (const gap of gaps) {
    let slotStart = gap.start
    let lastSlotStart = -1

    while (slotStart + serviceDurationMs <= gap.end) {
      const slotDate = new Date(slotStart)

      // Guard: skip past slots
      if (slotDate.getTime() > now.getTime()) {
        const iso = slotDate.toISOString()
        // Guard: dedupe by datetime
        if (!seenDatetimes.has(iso)) {
          seenDatetimes.add(iso)
          slots.push({
            time: format(slotDate, 'h:mm a'),
            datetime: iso,
            available: true,
          })
        }
      }

      lastSlotStart = slotStart
      slotStart += serviceDurationMs
    }

    // 5. Tail slot: capture remaining capacity at gap end
    // Only if there's enough room and it doesn't duplicate the last slot
    if (lastSlotStart >= 0) {
      const tailCandidate = gap.end - serviceDurationMs
      if (tailCandidate > lastSlotStart) {
        const tailDate = new Date(tailCandidate)
        // Guard: not in past + dedupe
        if (tailDate.getTime() > now.getTime()) {
          const tailIso = tailDate.toISOString()
          if (!seenDatetimes.has(tailIso)) {
            seenDatetimes.add(tailIso)
            slots.push({
              time: format(tailDate, 'h:mm a'),
              datetime: tailIso,
              available: true,
            })
          }
        }
      }
    }
  }

  // Sort all slots by time (tail slots may be out of order)
  slots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  return slots
}

export function getAvailableDates(
  operatingHours: OperatingHours,
  advanceBookingDays: number
): Date[] {
  const dates: Date[] = []
  const today = startOfDay(new Date())

  for (let i = 0; i < advanceBookingDays; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.getDay()
    const dayKey = dayMap[dayOfWeek]
    const hours = operatingHours[dayKey]

    // Only include days that are open
    if (hours && hours.open && hours.close) {
      dates.push(date)
    }
  }

  return dates
}
