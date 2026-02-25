import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateAvailableSlots } from '@/lib/utils/availability'
import type { OperatingHours } from '@/types'

const fullDaySchedule: OperatingHours = {
  mon: { open: '09:00', close: '17:00' },
  tue: { open: '09:00', close: '17:00' },
  wed: { open: '09:00', close: '17:00' },
  thu: { open: '09:00', close: '17:00' },
  fri: { open: '09:00', close: '17:00' },
  sat: { open: '09:00', close: '17:00' },
  sun: { open: '09:00', close: '17:00' },
}

describe('calculateAvailableSlots', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('omits slots that already started in the past', () => {
    const now = new Date('2026-02-25T15:34:00')
    vi.setSystemTime(now)

    const slots = calculateAvailableSlots({
      date: new Date('2026-02-25T00:00:00'),
      operatingHours: fullDaySchedule,
      existingAppointments: [],
      serviceDuration: 30,
      bufferMinutes: 15,
      slotInterval: 5,
    })

    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((slot) => new Date(slot.datetime).getTime() >= now.getTime())).toBe(true)
  })

  it('still returns future slots as unavailable when they conflict', () => {
    vi.setSystemTime(new Date('2026-02-25T09:00:00'))

    const slots = calculateAvailableSlots({
      date: new Date('2026-02-25T00:00:00'),
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      slotInterval: 30,
    })

    const tenAmSlot = slots.find((slot) => slot.time === '10:00 AM')
    expect(tenAmSlot).toBeDefined()
    expect(tenAmSlot?.available).toBe(false)
  })
})
