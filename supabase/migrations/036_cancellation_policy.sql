-- =====================================================
-- MIGRATION 036: Cancellation Policy + Cancel Metadata
-- =====================================================
-- Purpose:
-- - Add cancellation_policy JSONB to businesses
-- - Add cancel metadata columns to appointments

-- 1. Business cancellation policy config
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS cancellation_policy JSONB
  DEFAULT '{"enabled": false, "deadline_hours": 24, "allow_reschedule": true}';

-- 2. Appointment cancel metadata
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT
  CHECK (cancelled_by IN ('owner', 'barber', 'client'));

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reschedule_count INT DEFAULT 0;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES appointments(id);

-- 3. Index for rescheduled_from lookups
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from
  ON appointments(rescheduled_from)
  WHERE rescheduled_from IS NOT NULL;
