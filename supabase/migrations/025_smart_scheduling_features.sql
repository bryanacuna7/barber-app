-- ========================================
-- Migration 025: Smart Scheduling Features
-- Duration Tracking + Payment Method + Business Settings
-- ========================================

-- ========================================
-- P1: Duration Tracking + Payment Method
-- ========================================
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_duration_minutes INT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'sinpe', 'card'));

-- ========================================
-- P1: Business Payment & Notification Settings
-- ========================================
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS accepted_payment_methods JSONB DEFAULT '["cash"]'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
    "email_on_booking": true,
    "email_post_visit": false,
    "whatsapp_buttons": true,
    "arrive_early_enabled": true,
    "tracking_link_enabled": false
  }'::jsonb;

-- ========================================
-- Indexes for new columns
-- ========================================
CREATE INDEX IF NOT EXISTS idx_appointments_started
  ON appointments(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_payment
  ON appointments(business_id, payment_method) WHERE payment_method IS NOT NULL;
