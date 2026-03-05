import { describe, expect, it } from 'vitest'
import { localDateTimeToUtcIso, normalizeDateTimeToUtcIso } from '../utils/timezone'

describe('timezone utils', () => {
  it('converts Costa Rica local time to correct UTC (UTC-6 → +6 hours)', () => {
    const iso = localDateTimeToUtcIso('2026-03-03', '12:30', 'America/Costa_Rica')
    // Costa Rica is UTC-6, so 12:30 local = 18:30 UTC
    expect(iso).toBe('2026-03-03T18:30:00.000Z')
  })

  it('converts 16:00 CR to 22:00 UTC (the reported bug scenario)', () => {
    const iso = localDateTimeToUtcIso('2026-03-05', '16:00', 'America/Costa_Rica')
    // 4pm CR = 10pm UTC
    expect(iso).toBe('2026-03-05T22:00:00.000Z')
  })

  it('defaults to America/Costa_Rica timezone', () => {
    const iso = localDateTimeToUtcIso('2026-03-03', '12:30')
    expect(iso).toBe('2026-03-03T18:30:00.000Z')
  })

  it('supports custom timezone', () => {
    const iso = localDateTimeToUtcIso('2026-03-03', '12:30', 'America/New_York')
    // EST is UTC-5 in March (EDT), so 12:30 local = 17:30 UTC
    // Actually March 3 2026 is still EST (DST starts March 8), so UTC-5
    expect(iso).toBe('2026-03-03T17:30:00.000Z')
  })

  it('normalizes offset/Z datetime strings to UTC ISO', () => {
    const iso = normalizeDateTimeToUtcIso('2026-03-03T18:30:00Z')
    expect(iso).toBe('2026-03-03T18:30:00.000Z')
  })

  it('throws on invalid datetime input', () => {
    expect(() => localDateTimeToUtcIso('invalid', '12:30')).toThrow()
    expect(() => normalizeDateTimeToUtcIso('not-a-date')).toThrow()
  })
})
