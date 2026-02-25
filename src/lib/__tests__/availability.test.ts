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

// Wednesday 2026-02-25 — all tests that need a fixed date use this.
// "now" is set to 06:00 so every slot within operating hours (09:00–17:00) is in the future.
const TEST_DATE = new Date('2026-02-25T00:00:00')
const MORNING_NOW = new Date('2026-02-25T06:00:00')

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

// ---------------------------------------------------------------------------
// Gap-based algorithm tests
// ---------------------------------------------------------------------------

describe('calculateAvailableSlots — gap-based algorithm basics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns only slots with available: true', () => {
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T11:00:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((s) => s.available === true)).toBe(true)
  })

  it('generates slots only in gaps, not during appointments', () => {
    // Single 60-min appointment from 10:00–11:00 with no buffer.
    // Slots at 10:xx should NOT appear; slots at 09:xx and 11:xx should appear.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    const aptStart = new Date('2026-02-25T10:00:00').getTime()
    const aptEnd = new Date('2026-02-25T11:00:00').getTime()

    // No slot may start inside the occupied window [10:00, 11:00)
    const slotsDuringApt = datetimes.filter((t) => t >= aptStart && t < aptEnd)
    expect(slotsDuringApt).toHaveLength(0)

    // There are slots before 10:00 and at/after 11:00
    expect(datetimes.some((t) => t < aptStart)).toBe(true)
    expect(datetimes.some((t) => t >= aptEnd)).toBe(true)
  })

  it('returns slots for the entire operating window when there are no appointments', () => {
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    // 09:00–17:00 = 480 min / 30 min per service = 16 slots (step by serviceDuration)
    // The tail slot aligns with the last regular slot so no extra tail is added.
    expect(slots.length).toBeGreaterThanOrEqual(16)

    // First slot starts at open (09:00)
    const first = new Date(slots[0].datetime)
    expect(first.getHours()).toBe(9)
    expect(first.getMinutes()).toBe(0)

    // Last slot end must not exceed close (17:00)
    const last = new Date(slots[slots.length - 1].datetime)
    const lastEnd = new Date(last.getTime() + 30 * 60000)
    expect(lastEnd.getTime()).toBeLessThanOrEqual(new Date('2026-02-25T17:00:00').getTime())
  })

  it('returns empty array when appointments cover the entire operating window', () => {
    // One appointment that spans the full day (09:00–17:00)
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T09:00:00').toISOString(),
          duration_minutes: 480, // 8 hours
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    expect(slots).toHaveLength(0)
  })

  it('returns empty array for a closed day', () => {
    const closedSchedule: OperatingHours = {
      mon: { open: '09:00', close: '17:00' },
      tue: { open: '09:00', close: '17:00' },
      // Wednesday (wed) is absent / closed
      thu: { open: '09:00', close: '17:00' },
      fri: { open: '09:00', close: '17:00' },
      sat: { open: '09:00', close: '17:00' },
      sun: { open: '09:00', close: '17:00' },
    }

    // TEST_DATE is Wednesday 2026-02-25
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: closedSchedule,
      existingAppointments: [],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    expect(slots).toHaveLength(0)
  })
})

describe('calculateAvailableSlots — gap-based: effective window calculation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses started_at instead of scheduled_at when provided', () => {
    // Appointment scheduled at 10:00 but barber started at 10:15 (late check-in).
    // The blocked window should start at 10:15, so 10:00–10:14 is free.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          started_at: new Date('2026-02-25T10:15:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 15,
      bufferMinutes: 0,
      gapBased: true,
    })

    // A 15-min slot at 10:00 should be available because the window starts at 10:15
    const tenOclock = slots.find(
      (s) => new Date(s.datetime).getTime() === new Date('2026-02-25T10:00:00').getTime()
    )
    expect(tenOclock).toBeDefined()
    expect(tenOclock?.available).toBe(true)
  })

  it('uses actual_duration_minutes for completed appointments', () => {
    // Appointment scheduled for 60 min but only took 30 min (completed early).
    // After 30 min (10:30) the slot should be free again.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 60,
          status: 'completed',
          actual_duration_minutes: 30,
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    // 10:30 should be available because the appointment only used 30 min
    const tenThirty = slots.find(
      (s) => new Date(s.datetime).getTime() === new Date('2026-02-25T10:30:00').getTime()
    )
    expect(tenThirty).toBeDefined()
    expect(tenThirty?.available).toBe(true)
  })

  it('does not apply buffer to completed appointments', () => {
    // Completed appointment 10:00–10:30 with 15-min buffer configured.
    // Because it is completed, the buffer should be 0, so 10:30 is immediately free.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 30,
          status: 'completed',
          actual_duration_minutes: 30,
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 15,
      gapBased: true,
    })

    const tenThirty = slots.find(
      (s) => new Date(s.datetime).getTime() === new Date('2026-02-25T10:30:00').getTime()
    )
    expect(tenThirty).toBeDefined()
    expect(tenThirty?.available).toBe(true)
  })
})

describe('calculateAvailableSlots — gap-based: buffer handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('blocks the buffer window before and after a non-completed appointment', () => {
    // Confirmed appointment 10:00–10:30, buffer=15.
    // Effective blocked zone: 09:45–10:45.
    // A 30-min slot at 09:45 should NOT appear (its end 10:15 falls in the buffer).
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 15,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    // 09:45 is inside the pre-buffer (occupied window starts at 09:45)
    const nineFortyFive = new Date('2026-02-25T09:45:00').getTime()
    expect(datetimes).not.toContain(nineFortyFive)

    // 10:00 is inside the appointment itself
    const tenAm = new Date('2026-02-25T10:00:00').getTime()
    expect(datetimes).not.toContain(tenAm)

    // 10:30 is inside the post-buffer (buffer ends at 10:45)
    const tenThirty = new Date('2026-02-25T10:30:00').getTime()
    expect(datetimes).not.toContain(tenThirty)

    // 10:45 is the first free slot after buffer
    const tenFortyFive = new Date('2026-02-25T10:45:00').getTime()
    expect(datetimes).toContain(tenFortyFive)
  })

  it('pending appointment also receives configured buffer', () => {
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T11:00:00').toISOString(),
          duration_minutes: 30,
          status: 'pending',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 10,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    // Pre-buffer starts at 10:50; a slot at 10:50 would end at 11:20 which overlaps
    const tenFifty = new Date('2026-02-25T10:50:00').getTime()
    expect(datetimes).not.toContain(tenFifty)
  })
})

describe('calculateAvailableSlots — gap-based: tail slot generation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a tail slot that captures remaining capacity at gap end', () => {
    // Gap: 09:00–09:50 (50 min). Service = 30 min.
    // Regular stepping: slot at 09:00 (ends 09:30), then 09:30 (ends 10:00) > gap.end → stops.
    // Tail candidate = 09:50 - 30 = 09:20. That is > lastSlotStart (09:00) so tail at 09:20 added.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          // Appointment at 09:50 blocks from 09:50 onward
          scheduled_at: new Date('2026-02-25T09:50:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    // Tail slot at 09:20 (gap.end 09:50 minus 30 min)
    const nineTwenty = new Date('2026-02-25T09:20:00').getTime()
    expect(datetimes).toContain(nineTwenty)
  })

  it('does not produce a duplicate when tail aligns with the last regular slot', () => {
    // Gap: 09:00–10:00 (60 min). Service = 30 min.
    // Regular: 09:00, 09:30. Tail candidate = 10:00 - 30 = 09:30 → same as last regular slot.
    // Dedup guard must prevent duplicate.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 420, // 7 hours — blocks 10:00 to 17:00
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    // Gather datetimes and check for duplicates
    const datetimes = slots.map((s) => s.datetime)
    const unique = new Set(datetimes)
    expect(datetimes.length).toBe(unique.size)
  })

  it('does not add a tail slot that would be in the past', () => {
    // Set "now" to 09:25 so the tail candidate at 09:20 is in the past.
    vi.setSystemTime(new Date('2026-02-25T09:25:00'))

    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T09:50:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())
    const ninetwenty = new Date('2026-02-25T09:20:00').getTime()
    expect(datetimes).not.toContain(ninetwenty)
  })
})

describe('calculateAvailableSlots — gap-based: slot deduplication', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('never returns the same datetime twice', () => {
    // Two appointments that produce adjacent gaps whose boundary slot could coincide.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
        {
          scheduled_at: new Date('2026-02-25T11:30:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => s.datetime)
    const unique = new Set(datetimes)
    expect(datetimes.length).toBe(unique.size)
  })

  it('returns slots sorted chronologically', () => {
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T11:00:00').toISOString(),
          duration_minutes: 30,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const times = slots.map((s) => new Date(s.datetime).getTime())
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i - 1])
    }
  })
})

describe('calculateAvailableSlots — gap-based: edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MORNING_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns no slots when the only gap is shorter than the service duration', () => {
    // Gap: 09:00–09:20 (20 min). Service = 30 min. No slot fits.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T09:20:00').toISOString(),
          duration_minutes: 460, // blocks 09:20 through end of day
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    expect(slots).toHaveLength(0)
  })

  it('returns exactly one slot when the gap equals the service duration', () => {
    // Gap: 09:00–09:30 (30 min). Service = 30 min. Exactly one slot fits.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T09:30:00').toISOString(),
          duration_minutes: 450, // blocks 09:30 through end of day
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    expect(slots).toHaveLength(1)
    expect(new Date(slots[0].datetime).getTime()).toBe(new Date('2026-02-25T09:00:00').getTime())
  })

  it('handles multiple appointments creating multiple independent gaps', () => {
    // Three appointments leave three gaps: 09:00–10:00, 11:00–12:00, 13:00–17:00
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
        {
          scheduled_at: new Date('2026-02-25T12:00:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    // Slots in first gap (09:00–10:00)
    expect(datetimes).toContain(new Date('2026-02-25T09:00:00').getTime())
    expect(datetimes).toContain(new Date('2026-02-25T09:30:00').getTime())

    // No slots during first appointment (10:00–11:00)
    expect(datetimes).not.toContain(new Date('2026-02-25T10:00:00').getTime())
    expect(datetimes).not.toContain(new Date('2026-02-25T10:30:00').getTime())

    // Slots in second gap (11:00–12:00)
    expect(datetimes).toContain(new Date('2026-02-25T11:00:00').getTime())
    expect(datetimes).toContain(new Date('2026-02-25T11:30:00').getTime())

    // No slots during second appointment (12:00–13:00)
    expect(datetimes).not.toContain(new Date('2026-02-25T12:00:00').getTime())

    // Slots in third gap (13:00–17:00)
    expect(datetimes).toContain(new Date('2026-02-25T13:00:00').getTime())
  })

  it('merges overlapping appointments before computing gaps', () => {
    // Two overlapping appointments: 10:00–10:45 and 10:30–11:30.
    // After merge: single blocked window 10:00–11:30.
    // Only gaps 09:00–10:00 and 11:30–17:00 should exist.
    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [
        {
          scheduled_at: new Date('2026-02-25T10:00:00').toISOString(),
          duration_minutes: 45,
          status: 'confirmed',
        },
        {
          scheduled_at: new Date('2026-02-25T10:30:00').toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
        },
      ],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const datetimes = slots.map((s) => new Date(s.datetime).getTime())

    // Nothing inside merged window 10:00–11:30
    const inWindow = datetimes.filter(
      (t) =>
        t >= new Date('2026-02-25T10:00:00').getTime() &&
        t < new Date('2026-02-25T11:30:00').getTime()
    )
    expect(inWindow).toHaveLength(0)

    // 11:30 should be the first free slot after the merged window
    expect(datetimes).toContain(new Date('2026-02-25T11:30:00').getTime())
  })

  it('skips all slots that start at or before the current time', () => {
    // Move "now" into the middle of the operating day
    vi.setSystemTime(new Date('2026-02-25T13:00:00'))

    const slots = calculateAvailableSlots({
      date: TEST_DATE,
      operatingHours: fullDaySchedule,
      existingAppointments: [],
      serviceDuration: 30,
      bufferMinutes: 0,
      gapBased: true,
    })

    const now = new Date('2026-02-25T13:00:00').getTime()
    expect(slots.every((s) => new Date(s.datetime).getTime() > now)).toBe(true)
  })
})
