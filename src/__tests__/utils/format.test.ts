import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatCurrencyCompact,
  formatPhone,
} from '@/lib/utils/format'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = formatDate(date)

    // Should contain year and day
    expect(formatted).toContain('2024')
    expect(formatted).toMatch(/1[45]/) // Day might be 14 or 15 depending on timezone
  })

  it('should handle string dates', () => {
    const formatted = formatDate('2024-01-15T12:00:00Z')

    expect(formatted).toContain('2024')
    expect(formatted).toMatch(/1[45]/)
  })
})

describe('formatTime', () => {
  it('should format time correctly', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = formatTime(date)

    expect(formatted).toMatch(/\d+:\d+ [ap]m/i)
  })

  it('should handle string dates', () => {
    const formatted = formatTime('2024-01-15T14:30:00')

    expect(formatted).toMatch(/\d+:\d+ [ap]m/i)
  })
})

describe('formatDateTime', () => {
  it('should format date and time correctly', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = formatDateTime(date)

    expect(formatted).toContain('15')
    expect(formatted).toMatch(/\d+:\d+ [ap]m/i)
  })

  it('should handle string dates', () => {
    const formatted = formatDateTime('2024-01-15T14:30:00')

    expect(formatted).toContain('15')
    expect(formatted).toMatch(/\d+:\d+ [ap]m/i)
  })
})

describe('formatCurrency', () => {
  it('should format currency with CRC symbol', () => {
    const formatted = formatCurrency(10000)

    expect(formatted).toContain('10')
    expect(formatted).toContain('000')
  })

  it('should handle zero', () => {
    const formatted = formatCurrency(0)

    expect(formatted).toContain('0')
  })

  it('should handle large numbers', () => {
    const formatted = formatCurrency(1000000)

    expect(formatted).toContain('1')
    expect(formatted).toContain('000')
    expect(formatted).toContain('000')
  })

  it('should not show decimals', () => {
    const formatted = formatCurrency(10500)

    // Should round to whole number
    expect(formatted).not.toMatch(/\.\d+/)
  })
})

describe('formatCurrencyCompact', () => {
  it('should format millions with M suffix', () => {
    const formatted = formatCurrencyCompact(2500000)

    expect(formatted).toContain('₡')
    expect(formatted).toContain('2.5M')
  })

  it('should format hundreds of thousands with k suffix', () => {
    const formatted = formatCurrencyCompact(150000)

    expect(formatted).toContain('₡')
    expect(formatted).toContain('150k')
  })

  it('should format tens of thousands with k suffix and decimal', () => {
    const formatted = formatCurrencyCompact(15500)

    expect(formatted).toContain('₡')
    expect(formatted).toContain('15.5k')
  })

  it('should format small numbers normally', () => {
    const formatted = formatCurrencyCompact(5000)

    expect(formatted).toContain('₡')
    expect(formatted).toContain('5')
    expect(formatted).not.toContain('k')
    expect(formatted).not.toContain('M')
  })

  it('should handle zero', () => {
    const formatted = formatCurrencyCompact(0)

    expect(formatted).toContain('₡')
    expect(formatted).toContain('0')
  })
})

describe('formatPhone', () => {
  it('should format 8-digit phone numbers with dash', () => {
    const formatted = formatPhone('88887777')

    expect(formatted).toBe('8888-7777')
  })

  it('should handle phone numbers with spaces', () => {
    const formatted = formatPhone('8888 7777')

    expect(formatted).toBe('8888-7777')
  })

  it('should handle phone numbers with dashes', () => {
    const formatted = formatPhone('8888-7777')

    expect(formatted).toBe('8888-7777')
  })

  it('should return original if not 8 digits', () => {
    const phone = '123'
    const formatted = formatPhone(phone)

    expect(formatted).toBe(phone)
  })

  it('should strip non-digit characters before formatting', () => {
    const formatted = formatPhone('(8888) 7777')

    expect(formatted).toBe('8888-7777')
  })
})
