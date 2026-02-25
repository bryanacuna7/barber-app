-- Migration 042: Add configurable slot interval for booking availability
--
-- Allows businesses to customize the interval between bookable time slots.
-- Used when smart_duration_enabled = false (manual configuration).
-- When smart_duration_enabled = true, the system uses 5-min rolling slots automatically.

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS slot_interval_minutes INT DEFAULT 30
  CHECK (slot_interval_minutes BETWEEN 5 AND 60);

COMMENT ON COLUMN businesses.slot_interval_minutes IS
  'Interval in minutes between bookable slots (5-60). Default 30. Ignored when smart_duration_enabled = true (uses 5-min rolling).';
