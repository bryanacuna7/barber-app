export interface PromoRule {
  id: string
  label: string
  enabled: boolean
  priority: number // lower = higher priority (0 = top). Tie-break: id ASC
  days: number[] // 0=Sun...6=Sat
  start_hour: number // 0-23 (inclusive)
  end_hour: number // 1-24 (exclusive) — must be > start_hour
  discount_type: 'percent' | 'fixed'
  discount_value: number
  service_ids: string[] // empty = all services
}

export interface PromoEvaluation {
  applied: boolean
  rule: PromoRule | null
  original_price: number
  final_price: number
  discount_amount: number
  reason:
    | 'rule_matched'
    | 'no_matching_rule'
    | 'rule_disabled'
    | 'time_mismatch'
    | 'service_mismatch'
    | 'no_rules'
}
