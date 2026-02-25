-- Migration 043: Covering index for per-client duration prediction
--
-- Covers both cascade levels in duration-predictor.ts:
--   Level 1: client_id + service_id + barber_id (filtered by status + actual_duration)
--   Level 2: client_id + service_id (filtered by status + actual_duration)
-- Includes scheduled_at for ORDER BY DESC LIMIT 20 queries.
-- NOTE: Not using CONCURRENTLY (incompatible with transaction-based migrations).

CREATE INDEX IF NOT EXISTS idx_appointments_client_duration_lookup
ON appointments(client_id, service_id, barber_id, scheduled_at DESC)
WHERE status = 'completed' AND actual_duration_minutes > 0;

COMMENT ON INDEX idx_appointments_client_duration_lookup IS
  'Per-client duration prediction: covers client+service+barber lookups with scheduled_at ordering.';
