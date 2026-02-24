-- Migration 039: Smart client notifications (habit + promo)
-- Adds business toggle, per-client preferences, attribution tokens, and RLS.

-- 1) Business-level feature toggle
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS smart_notifications_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN businesses.smart_notifications_enabled IS
  'Enables smart promo notifications for this business (habit-based, promo-required).';

-- 2) Per-client smart notification preferences (per business)
CREATE TABLE IF NOT EXISTS client_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  smart_promos_enabled BOOLEAN NOT NULL DEFAULT true,
  smart_promos_paused_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_client_notif_prefs_business_user UNIQUE (business_id, user_id),
  CONSTRAINT uq_client_notif_prefs_business_client UNIQUE (business_id, client_id)
);

COMMENT ON TABLE client_notification_preferences IS
  'Per-client (per business) opt-in/opt-out settings for smart promotional notifications.';

CREATE INDEX IF NOT EXISTS idx_client_notif_prefs_business_user
  ON client_notification_preferences (business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_client_notif_prefs_business_client
  ON client_notification_preferences (business_id, client_id);

CREATE OR REPLACE FUNCTION set_client_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_client_notif_prefs_updated_at ON client_notification_preferences;
CREATE TRIGGER trg_client_notif_prefs_updated_at
  BEFORE UPDATE ON client_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION set_client_notification_preferences_updated_at();

ALTER TABLE client_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client can view own smart prefs"
  ON client_notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Client can insert own smart prefs"
  ON client_notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Client can update own smart prefs"
  ON client_notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3) Notification attribution tokens (notification -> booking conversion)
CREATE TABLE IF NOT EXISTS smart_notification_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  habit_bucket_dow INT NOT NULL CHECK (habit_bucket_dow BETWEEN 0 AND 6),
  habit_bucket_hour INT NOT NULL CHECK (habit_bucket_hour BETWEEN 0 AND 23),
  promo_rule_id UUID,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  consumed_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE smart_notification_attribution IS
  'Attribution ledger for smart promo notifications; stores token lifecycle and conversion to appointment.';

CREATE INDEX IF NOT EXISTS idx_smart_notif_attr_token
  ON smart_notification_attribution (token);

CREATE INDEX IF NOT EXISTS idx_smart_notif_attr_cooldown
  ON smart_notification_attribution (business_id, user_id, sent_at DESC)
  WHERE sent_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_smart_notif_attr_consumed
  ON smart_notification_attribution (consumed_at)
  WHERE consumed_at IS NOT NULL;

ALTER TABLE smart_notification_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client can view own smart attribution"
  ON smart_notification_attribution FOR SELECT
  USING (user_id = auth.uid());

-- Intentionally no INSERT/UPDATE/DELETE RLS policies for regular users.
-- Writes are done by backend/cron with service role.
