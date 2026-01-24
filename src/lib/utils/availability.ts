import { addDays, format, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns'
import type { OperatingHours, Appointment } from '@/types'

export interface TimeSlot {
  time: string
  datetime: string
  available: boolean
}

interface AvailabilityParams {
  date: Date
  operatingHours: OperatingHours
  existingAppointments: Pick<Appointment, 'scheduled_at' | 'duration_minutes'>[]
  serviceDuration: number
  bufferMinutes: number
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

function hasConflict(
  slotStart: Date,
  slotEnd: Date,
  appointments: Pick<Appointment, 'scheduled_at' | 'duration_minutes'>[],
  bufferMinutes: number
): boolean {
  for (const apt of appointments) {
    const aptStart = new Date(apt.scheduled_at)
    const aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000)

    // Add buffer
    const bufferedSlotStart = new Date(slotStart.getTime() - bufferMinutes * 60000)
    const bufferedSlotEnd = new Date(slotEnd.getTime() + bufferMinutes * 60000)

    // Check overlap
    if (bufferedSlotStart < aptEnd && bufferedSlotEnd > aptStart) {
      return true
    }
  }
  return false
}

export function calculateAvailableSlots(params: AvailabilityParams): TimeSlot[] {
  const { date, operatingHours, existingAppointments, serviceDuration, bufferMinutes } = params

  const dayOfWeek = date.getDay()
  const dayKey = dayMap[dayOfWeek]
  const hours = operatingHours[dayKey]

  // Closed this day
  if (!hours || !hours.open || !hours.close) {
    return []
  }

  const slots: TimeSlot[] = []
  const slotInterval = 30 // Generate slots every 30 min
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
      available: !isPast && !hasAppointmentConflict,
    })

    // Move to next slot
    currentTime = new Date(currentTime.getTime() + slotInterval * 60000)
  }

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
