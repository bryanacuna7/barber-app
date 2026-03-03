import { describe, expect, it } from 'vitest'
import { getSuggestedAppointmentTime } from '../utils/appointment-time'

describe('appointment time utils', () => {
  it('suggests the next valid slot for today with lead time', () => {
    const suggested = getSuggestedAppointmentTime({
      selectedDate: new Date('2026-03-03T00:00:00'),
      now: new Date('2026-03-03T12:25:00'),
    })

    expect(suggested).toBe('12:30')
  })

  it('falls back to opening default for non-today dates', () => {
    const suggested = getSuggestedAppointmentTime({
      selectedDate: new Date('2026-03-04T00:00:00'),
      now: new Date('2026-03-03T12:25:00'),
    })

    expect(suggested).toBe('09:00')
  })

  it('supports custom interval and lead minutes', () => {
    const suggested = getSuggestedAppointmentTime({
      selectedDate: new Date('2026-03-03T00:00:00'),
      now: new Date('2026-03-03T12:21:00'),
      leadMinutes: 15,
      intervalMinutes: 10,
    })

    expect(suggested).toBe('12:40')
  })

  it('guards against day rollover when suggesting time for today', () => {
    const suggested = getSuggestedAppointmentTime({
      selectedDate: new Date('2026-03-03T00:00:00'),
      now: new Date('2026-03-03T23:58:00'),
    })

    expect(suggested).toBe('23:55')
  })
})
