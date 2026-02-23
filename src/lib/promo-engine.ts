import { getHourInTimezone, getDayOfWeekInTimezone } from './utils/timezone'
import type { PromoRule, PromoEvaluation } from '@/types/promo'

/**
 * Evaluate which promo rule (if any) applies to a given slot.
 *
 * Sort order: priority ASC, id ASC (deterministic tie-breaker).
 * Convention: start_hour inclusive, end_hour exclusive.
 *
 * @param now - injectable for testing (defaults to new Date())
 */
export function evaluatePromo(
  rules: PromoRule[],
  slotDatetime: Date,
  serviceId: string,
  servicePrice: number,
  timezone: string,
  _now?: Date
): PromoEvaluation {
  const base: Omit<
    PromoEvaluation,
    'applied' | 'rule' | 'final_price' | 'discount_amount' | 'reason'
  > = {
    original_price: servicePrice,
  }

  if (!rules || rules.length === 0) {
    return {
      ...base,
      applied: false,
      rule: null,
      final_price: servicePrice,
      discount_amount: 0,
      reason: 'no_rules',
    }
  }

  // Filter enabled rules, sort by priority ASC then id ASC
  const activeRules = rules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))

  if (activeRules.length === 0) {
    return {
      ...base,
      applied: false,
      rule: null,
      final_price: servicePrice,
      discount_amount: 0,
      reason: 'rule_disabled',
    }
  }

  const localHour = getHourInTimezone(slotDatetime, timezone)
  const localDow = getDayOfWeekInTimezone(slotDatetime, timezone)

  for (const rule of activeRules) {
    const dayMatch = rule.days.includes(localDow)
    if (!dayMatch) continue

    // start_hour inclusive, end_hour exclusive
    const hourMatch = localHour >= rule.start_hour && localHour < rule.end_hour
    if (!hourMatch) continue

    const serviceMatch = rule.service_ids.length === 0 || rule.service_ids.includes(serviceId)
    if (!serviceMatch) continue

    // Match found
    const finalPrice = computeDiscountedPrice(servicePrice, rule)
    return {
      ...base,
      applied: true,
      rule,
      final_price: finalPrice,
      discount_amount: servicePrice - finalPrice,
      reason: 'rule_matched',
    }
  }

  return {
    ...base,
    applied: false,
    rule: null,
    final_price: servicePrice,
    discount_amount: 0,
    reason: 'no_matching_rule',
  }
}

/**
 * Compute discounted price. Clamps to 0 (never negative).
 */
export function computeDiscountedPrice(
  servicePrice: number,
  discount:
    | { discount_type: 'percent' | 'fixed'; discount_value: number }
    | { type: 'percent' | 'fixed'; value: number }
): number {
  const discountType = 'discount_type' in discount ? discount.discount_type : discount.type
  const discountValue = 'discount_value' in discount ? discount.discount_value : discount.value

  if (discountType === 'percent') {
    return Math.max(0, Math.round(servicePrice * (1 - discountValue / 100)))
  }
  return Math.max(0, servicePrice - discountValue)
}

/**
 * Validate promo rules array for PUT endpoint.
 * Returns hard errors (block save) and soft warnings (allow save).
 */
export function validatePromoRules(rules: PromoRule[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (rules.length > 20) {
    errors.push(`Máximo 20 reglas permitidas (tienes ${rules.length})`)
  }

  const ids = new Set<string>()

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const prefix = `Regla "${rule.label || i + 1}"`

    // ID uniqueness
    if (ids.has(rule.id)) {
      errors.push(`${prefix}: ID duplicado`)
    }
    ids.add(rule.id)

    // Label
    if (!rule.label || rule.label.trim().length === 0) {
      errors.push(`${prefix}: nombre requerido`)
    }
    if (rule.label && rule.label.length > 60) {
      errors.push(`${prefix}: nombre máximo 60 caracteres`)
    }

    // Hours
    if (rule.start_hour < 0 || rule.start_hour > 23) {
      errors.push(`${prefix}: hora inicio debe ser 0-23`)
    }
    if (rule.end_hour < 1 || rule.end_hour > 24) {
      errors.push(`${prefix}: hora fin debe ser 1-24`)
    }
    if (rule.start_hour >= rule.end_hour) {
      errors.push(`${prefix}: hora inicio debe ser menor que hora fin`)
    }

    // Days
    if (!rule.days || rule.days.length === 0) {
      errors.push(`${prefix}: al menos un día requerido`)
    }
    if (rule.days?.some((d) => d < 0 || d > 6)) {
      errors.push(`${prefix}: días deben ser 0-6`)
    }

    // Discount
    if (rule.discount_type === 'percent') {
      if (rule.discount_value < 1 || rule.discount_value > 100) {
        errors.push(`${prefix}: porcentaje debe ser 1-100`)
      }
    } else if (rule.discount_type === 'fixed') {
      if (rule.discount_value < 0) {
        errors.push(`${prefix}: monto fijo no puede ser negativo`)
      }
    }

    // Priority
    if (typeof rule.priority !== 'number' || rule.priority < 0) {
      errors.push(`${prefix}: prioridad debe ser >= 0`)
    }
  }

  // Check overlaps within same priority
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i]
      const b = rules[j]
      if (a.priority !== b.priority) continue

      const sharedDays = a.days.filter((d) => b.days.includes(d))
      if (sharedDays.length === 0) continue

      const hoursOverlap = a.start_hour < b.end_hour && b.start_hour < a.end_hour
      if (hoursOverlap) {
        warnings.push(`"${a.label}" y "${b.label}" se solapan en horario con misma prioridad`)
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
