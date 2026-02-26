-- Migration: 046_onboarding_redesign.sql
-- Description: Redesign onboarding from 6 steps to 3 steps + analytics events table
-- Created: 2026-02-26

-- ============================================================
-- 1. Update business_onboarding for 3-step flow
-- ============================================================

-- Completed onboardings with step > 3: set to 3 (final step in new flow)
UPDATE business_onboarding
SET current_step = 3
WHERE completed AND current_step > 3;

-- In-progress onboardings with step > 3: reset to 1 (restart new flow)
UPDATE business_onboarding
SET current_step = 1
WHERE NOT completed AND current_step > 3;

-- Drop old CHECK constraint and add new one (1-3 steps)
ALTER TABLE business_onboarding
  DROP CONSTRAINT IF EXISTS business_onboarding_current_step_check;

ALTER TABLE business_onboarding
  ADD CONSTRAINT business_onboarding_current_step_check
  CHECK (current_step >= 1 AND current_step <= 3);

-- Add defaults_applied column to track which path user took
ALTER TABLE business_onboarding
  ADD COLUMN IF NOT EXISTS defaults_applied BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN business_onboarding.current_step IS 'Current step in the wizard (1-3)';
COMMENT ON COLUMN business_onboarding.defaults_applied IS 'Whether user chose the turbo defaults path instead of customizing';

-- ============================================================
-- 2. Create analytics_events table for funnel tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_business ON analytics_events(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
-- Composite index for funnel queries (events for a business, ordered by time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_business_time ON analytics_events(business_id, created_at);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Owners can view their own analytics events
CREATE POLICY "Owners can view own analytics events" ON analytics_events
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Insert is done via API route using service role (no user INSERT policy needed)

-- Comments
COMMENT ON TABLE analytics_events IS 'Lightweight event tracking for onboarding funnel and activation metrics';
COMMENT ON COLUMN analytics_events.event_name IS 'Event name: welcome_start, defaults_applied, customize_start, onboarding_completed, share_link_copy, share_whatsapp_click, first_booking_created';
COMMENT ON COLUMN analytics_events.metadata IS 'Optional JSON metadata for the event';
