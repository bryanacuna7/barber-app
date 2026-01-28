-- Migration: 009_notification_preferences.sql
-- Description: Add notification preferences table for email/app channel control
-- Created: 2026-01-28

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Canal principal
  channel TEXT DEFAULT 'both' CHECK (channel IN ('email', 'app', 'both')),
  email_address TEXT,  -- Override email (opcional)

  -- Preferencias por tipo (business owner)
  email_trial_expiring BOOLEAN DEFAULT true,
  email_subscription_expiring BOOLEAN DEFAULT true,
  email_payment_status BOOLEAN DEFAULT true,
  email_new_appointment BOOLEAN DEFAULT true,
  email_appointment_reminder BOOLEAN DEFAULT true,

  -- Preferencias admin
  email_new_business BOOLEAN DEFAULT true,
  email_payment_pending BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_business
  ON notification_preferences(business_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Seed: Create default notification preferences for all existing businesses
INSERT INTO notification_preferences (business_id, channel)
SELECT id, 'both' FROM businesses
ON CONFLICT (business_id) DO NOTHING;

-- Comment
COMMENT ON TABLE notification_preferences IS 'Stores user preferences for notification channels (email/app/both) and which notification types to receive';
