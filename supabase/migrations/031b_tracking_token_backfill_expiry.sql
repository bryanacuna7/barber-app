-- Migration 031b: Backfill tracking_expires_at for historical appointments
-- Purpose: Close P2 gap — historical completed/cancelled/no_show tokens have NULL expiry,
--          making them valid indefinitely if leaked.
-- Run in: Supabase Dashboard → SQL Editor

-- Set expiry for completed/cancelled/no_show appointments that were missed by 031
-- Use scheduled_at + duration + 2h (same formula as 031, retroactive)
UPDATE appointments
  SET tracking_expires_at = scheduled_at + (COALESCE(duration_minutes, 30) * interval '1 minute') + interval '2 hours'
  WHERE tracking_expires_at IS NULL
    AND status IN ('completed', 'cancelled', 'no_show');
