import { describe, it, expect } from 'vitest'
import { evaluatePromo, computeDiscountedPrice, validatePromoRules } from '../promo-engine'
import type { PromoRule } from '@/types/promo'

function makeRule(overrides: Partial<PromoRule> = {}): PromoRule {
  return {
    id: 'rule-001',
    label: 'Test Promo',
    enabled: true,
    priority: 0,
    days: [1, 2, 3, 4, 5], // Mon-Fri
    start_hour: 14,
    end_hour: 17, // 2pm-5pm
    discount_type: 'percent',
    discount_value: 15,
    service_ids: [],
    ...overrides,
  }
}

// Costa Rica timezone (UTC-6, no DST)
const TZ_CR = 'America/Costa_Rica'
// US Eastern (has DST)
const TZ_ET = 'America/New_York'

describe('evaluatePromo', () => {
  it('returns no_rules when rules array is empty', () => {
    const result = evaluatePromo([], new Date(), 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('no_rules')
    expect(result.final_price).toBe(8000)
  })

  it('returns rule_disabled when all rules are disabled', () => {
    const rules = [makeRule({ enabled: false })]
    const slot = new Date('2026-03-03T20:00:00Z') // Tue 14:00 CR
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('rule_disabled')
  })

  it('applies percent discount correctly', () => {
    const rules = [makeRule({ discount_type: 'percent', discount_value: 15 })]
    // Tuesday 14:00 CR = 20:00 UTC
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(true)
    expect(result.reason).toBe('rule_matched')
    expect(result.final_price).toBe(6800)
    expect(result.discount_amount).toBe(1200)
  })

  it('applies fixed discount correctly', () => {
    const rules = [makeRule({ discount_type: 'fixed', discount_value: 2000 })]
    const slot = new Date('2026-03-03T20:00:00Z') // Tue 14:00 CR
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(true)
    expect(result.final_price).toBe(6000)
    expect(result.discount_amount).toBe(2000)
  })

  // Test 1: Overlapping rules — higher priority wins
  it('higher priority rule wins over lower (lower number = higher priority)', () => {
    const rules = [
      makeRule({ id: 'low', priority: 10, discount_value: 5, label: 'Low' }),
      makeRule({ id: 'high', priority: 0, discount_value: 25, label: 'High' }),
    ]
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(true)
    expect(result.rule?.id).toBe('high')
    expect(result.rule?.discount_value).toBe(25)
  })

  // Test 2: Tie-breaker — same priority, id ASC
  it('tie-breaker: same priority uses id ASC', () => {
    const rules = [
      makeRule({ id: 'zzz-rule', priority: 0, discount_value: 10, label: 'Z' }),
      makeRule({ id: 'aaa-rule', priority: 0, discount_value: 20, label: 'A' }),
    ]
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.rule?.id).toBe('aaa-rule')
    expect(result.rule?.discount_value).toBe(20)
  })

  // Test 3: DST transition — US Eastern spring forward
  it('handles DST transition correctly (US Eastern spring forward)', () => {
    // 2026-03-08 is spring forward in US: 2am -> 3am ET
    // At 2026-03-09T19:00:00Z = 15:00 ET (after spring forward, EDT = UTC-4)
    const rules = [makeRule({ days: [1], start_hour: 15, end_hour: 16 })] // Monday 3pm
    const slot = new Date('2026-03-09T19:00:00Z') // Monday
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_ET)
    expect(result.applied).toBe(true)
    expect(result.reason).toBe('rule_matched')
  })

  // Test 4: Negative price clamp
  it('clamps price to 0 when fixed discount exceeds service price', () => {
    const rules = [makeRule({ discount_type: 'fixed', discount_value: 15000 })]
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(true)
    expect(result.final_price).toBe(0)
    expect(result.discount_amount).toBe(8000)
  })

  // Test 5: Disabled rule
  it('does not apply disabled rule even if time matches', () => {
    const rules = [makeRule({ enabled: false })]
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(false)
  })

  // Test 6: Boundary — start_hour is inclusive
  it('matches slot at exactly start_hour (inclusive)', () => {
    const rules = [makeRule({ start_hour: 14, end_hour: 17 })]
    // Exactly 14:00 CR
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(true)
  })

  // Test 7: Boundary — end_hour is exclusive
  it('does NOT match slot at exactly end_hour (exclusive)', () => {
    const rules = [makeRule({ start_hour: 14, end_hour: 17 })]
    // Exactly 17:00 CR = 23:00 UTC
    const slot = new Date('2026-03-03T23:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('no_matching_rule')
  })

  // Test 9: Different timezones for different businesses
  it('evaluates same UTC time differently per business timezone', () => {
    const rules = [makeRule({ start_hour: 14, end_hour: 17, days: [1] })] // Mon 2-5pm
    // 2026-03-02T20:00:00Z = Mon 14:00 CR (UTC-6) = Mon 15:00 ET (UTC-5 winter)
    const slotUtc = new Date('2026-03-02T20:00:00Z')

    const resultCR = evaluatePromo(rules, slotUtc, 'svc-1', 8000, TZ_CR)
    const resultET = evaluatePromo(rules, slotUtc, 'svc-1', 8000, TZ_ET)

    // Both should match (14:00 CR and 15:00 ET are both within 14-17)
    expect(resultCR.applied).toBe(true)
    expect(resultET.applied).toBe(true)

    // But at 19:00 UTC = 13:00 CR (outside) = 14:00 ET (inside)
    const slotUtc2 = new Date('2026-03-02T19:00:00Z')
    const resultCR2 = evaluatePromo(rules, slotUtc2, 'svc-1', 8000, TZ_CR)
    const resultET2 = evaluatePromo(rules, slotUtc2, 'svc-1', 8000, TZ_ET)
    expect(resultCR2.applied).toBe(false) // 13:00 CR = outside
    expect(resultET2.applied).toBe(true) // 14:00 ET = inside
  })

  it('filters by service_ids when specified', () => {
    const rules = [makeRule({ service_ids: ['svc-match'] })]
    const slot = new Date('2026-03-03T20:00:00Z')

    const match = evaluatePromo(rules, slot, 'svc-match', 8000, TZ_CR)
    expect(match.applied).toBe(true)

    const noMatch = evaluatePromo(rules, slot, 'svc-other', 8000, TZ_CR)
    expect(noMatch.applied).toBe(false)
    expect(noMatch.reason).toBe('no_matching_rule')
  })

  it('returns no_matching_rule when day does not match', () => {
    const rules = [makeRule({ days: [6] })] // Saturday only
    // Tuesday
    const slot = new Date('2026-03-03T20:00:00Z')
    const result = evaluatePromo(rules, slot, 'svc-1', 8000, TZ_CR)
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('no_matching_rule')
  })
})

describe('computeDiscountedPrice', () => {
  it('percent: 15% off 8000 = 6800', () => {
    expect(computeDiscountedPrice(8000, { discount_type: 'percent', discount_value: 15 })).toBe(
      6800
    )
  })

  it('percent: 100% off = 0', () => {
    expect(computeDiscountedPrice(8000, { discount_type: 'percent', discount_value: 100 })).toBe(0)
  })

  it('fixed: 2000 off 8000 = 6000', () => {
    expect(computeDiscountedPrice(8000, { discount_type: 'fixed', discount_value: 2000 })).toBe(
      6000
    )
  })

  it('fixed: clamps to 0 when discount > price', () => {
    expect(computeDiscountedPrice(5000, { discount_type: 'fixed', discount_value: 9000 })).toBe(0)
  })
})

describe('validatePromoRules', () => {
  it('passes valid rules', () => {
    const rules = [makeRule()]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  // Test 8: Zero-width rule rejected
  it('rejects start_hour === end_hour', () => {
    const rules = [makeRule({ start_hour: 14, end_hour: 14 })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('menor que hora fin'))).toBe(true)
  })

  it('rejects start_hour > end_hour', () => {
    const rules = [makeRule({ start_hour: 17, end_hour: 14 })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
  })

  it('rejects more than 20 rules', () => {
    const rules = Array.from({ length: 21 }, (_, i) =>
      makeRule({ id: `rule-${i}`, label: `Rule ${i}` })
    )
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('20'))).toBe(true)
  })

  it('rejects percent > 100', () => {
    const rules = [makeRule({ discount_type: 'percent', discount_value: 150 })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
  })

  it('rejects empty days', () => {
    const rules = [makeRule({ days: [] })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
  })

  it('rejects empty label', () => {
    const rules = [makeRule({ label: '' })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
  })

  it('warns on overlapping rules with same priority', () => {
    const rules = [
      makeRule({ id: 'a', priority: 0, start_hour: 14, end_hour: 17, label: 'A' }),
      makeRule({ id: 'b', priority: 0, start_hour: 15, end_hour: 18, label: 'B' }),
    ]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(true) // warnings don't block
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('solapan')
  })

  it('does not warn on overlapping rules with different priority', () => {
    const rules = [
      makeRule({ id: 'a', priority: 0, start_hour: 14, end_hour: 17, label: 'A' }),
      makeRule({ id: 'b', priority: 1, start_hour: 15, end_hour: 18, label: 'B' }),
    ]
    const result = validatePromoRules(rules)
    expect(result.warnings).toHaveLength(0)
  })

  it('rejects duplicate IDs', () => {
    const rules = [makeRule({ id: 'same-id', label: 'A' }), makeRule({ id: 'same-id', label: 'B' })]
    const result = validatePromoRules(rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('duplicado'))).toBe(true)
  })
})
