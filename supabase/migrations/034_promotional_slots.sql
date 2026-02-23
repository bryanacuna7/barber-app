-- Migration 034: Promotional Slots
-- Adds JSONB column for per-business promotional discount rules.
-- Pattern: same as accepted_payment_methods (JSONB on businesses).
-- Operational limit: max 20 rules per business (enforced in API).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS promotional_slots JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN businesses.promotional_slots IS
  'Array of PromoRule objects (max 20). Schema per element:
   { id: uuid, label: string, enabled: bool, priority: int,
     days: int[], start_hour: int, end_hour: int,
     discount_type: "percent"|"fixed", discount_value: number,
     service_ids: uuid[] }';
