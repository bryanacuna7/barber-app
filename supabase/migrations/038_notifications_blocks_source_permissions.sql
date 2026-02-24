-- =====================================================
-- MIGRATION 038: Notifications, Blocks, Source & Custom Permissions
-- =====================================================
-- Created: 2026-02-24
-- Purpose: Five independent additions to support the notification
--          orchestrator, barber agenda blocks, appointment source
--          tracking, and per-barber custom permission overrides.
--
-- Changes:
-- 1. clients: Add claim_token + claim_token_expires_at
--             (security fix — IDOR prevention for client self-claim)
-- 2. New table: notification_log
--             (audit trail for all outbound notification events)
-- 3. New table: barber_blocks
--             (breaks, vacations, personal time on barber agendas)
-- 4. appointments: Add source column
--             (tracks booking origin: web, walk-in, owner, barber)
-- 5. barbers: Add custom_permissions JSONB with validation function
--             (per-barber UI permission overrides on top of role grants)
-- =====================================================

-- =====================================================
-- 1. CLIENT CLAIM TOKEN (IDOR Security Fix)
-- =====================================================
-- Allows an unauthenticated client to claim their record
-- via a one-time token sent to their phone/email, rather
-- than exposing the raw client UUID in public URLs.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_token_expires_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN clients.claim_token IS 'One-time UUID token for unauthenticated client self-claim flow (IDOR prevention)';
COMMENT ON COLUMN clients.claim_token_expires_at IS 'Expiry for claim_token; API must reject tokens past this timestamp';

-- Partial index: only rows that currently have an active token
-- are indexed, keeping the index tiny in steady state.
CREATE INDEX IF NOT EXISTS idx_clients_claim_token
  ON clients(claim_token)
  WHERE claim_token IS NOT NULL;

-- =====================================================
-- 2. NOTIFICATION LOG TABLE
-- =====================================================
-- Immutable audit log written by the server-side
-- notification orchestrator. Used for deduplication,
-- retry logic, and delivery dashboards.

CREATE TABLE IF NOT EXISTS notification_log (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id)    ON DELETE CASCADE,
  appointment_id   UUID                 REFERENCES appointments(id)  ON DELETE SET NULL,
  user_id          UUID                 REFERENCES auth.users(id)    ON DELETE SET NULL,
  event_type       TEXT        NOT NULL,
  channel          TEXT        NOT NULL CHECK (channel IN ('push', 'email', 'whatsapp', 'in_app')),
  status           TEXT        NOT NULL CHECK (status IN ('sent', 'failed', 'retried', 'deduped', 'skipped')),
  error_code       TEXT,
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notification_log IS 'Immutable audit log for all outbound notification events; written by the notification orchestrator';
COMMENT ON COLUMN notification_log.event_type IS 'Logical event name, e.g. new_appointment, appointment_reminder, appointment_cancelled';
COMMENT ON COLUMN notification_log.channel    IS 'Delivery channel: push | email | whatsapp | in_app';
COMMENT ON COLUMN notification_log.status     IS 'Outcome: sent | failed | retried | deduped | skipped';
COMMENT ON COLUMN notification_log.error_code IS 'Short machine-readable error code when status = failed or retried';

-- Deduplication index: for a given (event, appointment, channel), find
-- whether a successful delivery already exists in O(1).
CREATE INDEX IF NOT EXISTS idx_notif_log_dedup
  ON notification_log(event_type, appointment_id, channel)
  WHERE status = 'sent';

-- Dashboard / analytics queries: scan recent events for a business.
CREATE INDEX IF NOT EXISTS idx_notif_log_business
  ON notification_log(business_id, created_at DESC);

-- RLS: table is enabled; all writes go through service-role (bypasses RLS).
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Business owner can read all notification log entries for their business.
CREATE POLICY "Owner views business notification log"
  ON notification_log FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Authenticated client can read their own appointment-related events.
-- Restricted to non-sensitive event types only.
CREATE POLICY "Client views own notification history"
  ON notification_log FOR SELECT
  USING (
    user_id = auth.uid()
    AND event_type IN (
      'new_appointment',
      'appointment_reminder',
      'appointment_cancelled',
      'appointment_rescheduled'
    )
  );

-- =====================================================
-- 3. BARBER BLOCKS TABLE
-- =====================================================
-- Stores non-appointment time blocks on a barber's agenda:
-- breaks, lunch, vacation days, personal appointments, etc.
-- The scheduling engine must exclude these intervals when
-- computing available slots.
--
-- NOTE: start_time >= NOW() is intentionally NOT enforced
-- as a CHECK constraint because CHECK constraints that call
-- NOW() evaluate at INSERT time and produce misleading results
-- in schema dumps and logical replication. This is enforced
-- at the API layer instead.

CREATE TABLE IF NOT EXISTS barber_blocks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  barber_id        UUID        NOT NULL REFERENCES barbers(id)   ON DELETE CASCADE,
  block_type       TEXT        NOT NULL CHECK (block_type IN ('break', 'vacation', 'personal', 'other')),
  title            TEXT,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  all_day          BOOLEAN     NOT NULL DEFAULT false,
  recurrence_rule  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_block_times CHECK (end_time > start_time)
);

COMMENT ON TABLE  barber_blocks IS 'Non-appointment agenda blocks (breaks, vacations, personal time) for barbers; consumed by the scheduling engine';
COMMENT ON COLUMN barber_blocks.block_type      IS 'Category: break | vacation | personal | other';
COMMENT ON COLUMN barber_blocks.all_day         IS 'When true, start_time/end_time represent calendar dates (time component ignored)';
COMMENT ON COLUMN barber_blocks.recurrence_rule IS 'Optional iCal RRULE string for recurring blocks, e.g. FREQ=WEEKLY;BYDAY=MO,WE';
COMMENT ON COLUMN barber_blocks.title           IS 'Optional human-readable label shown in the admin calendar';

-- Fast availability lookup: given a barber, find all blocks that
-- overlap a requested time window.
CREATE INDEX IF NOT EXISTS idx_barber_blocks_lookup
  ON barber_blocks(barber_id, start_time, end_time);

-- Owner-side dashboard: list all upcoming blocks for a business.
CREATE INDEX IF NOT EXISTS idx_barber_blocks_business
  ON barber_blocks(business_id, start_time);

ALTER TABLE barber_blocks ENABLE ROW LEVEL SECURITY;

-- Barbers can fully manage their own blocks.
CREATE POLICY "Barbers manage own blocks"
  ON barber_blocks FOR ALL
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid()
    )
  );

-- Business owner can manage all blocks across their entire business.
CREATE POLICY "Owner manages business blocks"
  ON barber_blocks FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 4. APPOINTMENTS SOURCE COLUMN
-- =====================================================
-- Records how the appointment was originally created.
-- Existing rows receive NULL (unknown / legacy), which is
-- intentionally allowed so we do not need to backfill.

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS source TEXT
    CHECK (source IN ('web_booking', 'walk_in', 'owner_created', 'barber_created'));

COMMENT ON COLUMN appointments.source IS 'Booking origin: web_booking (public form) | walk_in | owner_created | barber_created; NULL for legacy rows';

-- =====================================================
-- 5. BARBERS CUSTOM PERMISSIONS
-- =====================================================
-- An optional JSONB column that lets a business owner
-- override individual UI navigation/action permissions
-- for a specific barber, independently of their role.
-- Only the known permission keys listed below are accepted;
-- unknown keys cause the constraint to reject the update.
--
-- Known keys (nav flags & action flags):
--   nav_citas, nav_servicios, nav_clientes,
--   nav_analiticas, nav_changelog,
--   can_create_citas, can_view_all_citas
--
-- Example value:
--   {"nav_analiticas": false, "can_view_all_citas": true}

-- Validation function: returns true when all top-level JSONB
-- keys belong to the allow-list above. Declared IMMUTABLE so
-- PostgreSQL can use it inside a CHECK constraint.
CREATE OR REPLACE FUNCTION validate_custom_permissions(perms JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF perms IS NULL THEN
    RETURN true;
  END IF;

  RETURN (
    SELECT bool_and(
      key IN (
        'nav_citas',
        'nav_servicios',
        'nav_clientes',
        'nav_analiticas',
        'nav_changelog',
        'can_create_citas',
        'can_view_all_citas'
      )
    )
    FROM jsonb_object_keys(perms) AS key
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_custom_permissions IS
  'Returns true when all JSONB keys in custom_permissions belong to the allowed nav/action key allow-list';

ALTER TABLE barbers
  ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT NULL
    CONSTRAINT chk_custom_perms
      CHECK (
        custom_permissions IS NULL
        OR validate_custom_permissions(custom_permissions)
      );

COMMENT ON COLUMN barbers.custom_permissions IS
  'Optional per-barber UI permission overrides (nav flags, action flags). NULL = use role defaults. Unknown keys are rejected by chk_custom_perms.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verification queries (run manually to verify):
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'clients' AND column_name LIKE 'claim_token%';
-- SELECT COUNT(*) FROM notification_log;
-- SELECT COUNT(*) FROM barber_blocks;
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'appointments' AND column_name = 'source';
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'barbers' AND column_name = 'custom_permissions';
