import { describe, expect, it } from 'vitest'
import { localDateTimeToUtcIso, normalizeDateTimeToUtcIso } from '../utils/timezone'

describe('timezone utils', () => {
  it('converts local date+time to UTC ISO preserving local wall time on round-trip', () => {
    const iso = localDateTimeToUtcIso('2026-03-03', '12:30')
    const local = new Date(iso)

    expect(local.getFullYear()).toBe(2026)
    expect(local.getMonth()).toBe(2) // March (0-based)
    expect(local.getDate()).toBe(3)
    expect(local.getHours()).toBe(12)
    expect(local.getMinutes()).toBe(30)
    expect(iso.endsWith('Z')).toBe(true)
  })

  it('normalizes offset/Z datetime strings to UTC ISO', () => {
    const iso = normalizeDateTimeToUtcIso('2026-03-03T18:30:00Z')
    expect(iso).toBe('2026-03-03T18:30:00.000Z')
  })

  it('normalizes local datetime strings to UTC ISO', () => {
    const iso = normalizeDateTimeToUtcIso('2026-03-03T12:30:00')
    const local = new Date(iso)
    expect(local.getHours()).toBe(12)
    expect(local.getMinutes()).toBe(30)
  })

  it('throws on invalid datetime input', () => {
    expect(() => localDateTimeToUtcIso('invalid', '12:30')).toThrow()
    expect(() => normalizeDateTimeToUtcIso('not-a-date')).toThrow()
  })
})
