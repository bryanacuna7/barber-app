-- Migration 031: Add tracking_token for public live queue links
-- Purpose: Enable Uber-style public tracking without auth
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Add columns
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS tracking_expires_at TIMESTAMPTZ;

-- 2. Unique index for fast token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_tracking_token
  ON appointments(tracking_token) WHERE tracking_token IS NOT NULL;

-- 3. Backfill existing appointments with tokens
UPDATE appointments
  SET tracking_token = gen_random_uuid()
  WHERE tracking_token IS NULL;

-- 4. Set expiry for pending/confirmed appointments (scheduled_at + duration + 2h)
UPDATE appointments
  SET tracking_expires_at = scheduled_at + (duration_minutes * interval '1 minute') + interval '2 hours'
  WHERE tracking_expires_at IS NULL
    AND status IN ('pending', 'confirmed')
    AND duration_minutes IS NOT NULL;
