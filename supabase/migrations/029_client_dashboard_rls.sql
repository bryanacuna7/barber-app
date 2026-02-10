-- Migration 029: Client Dashboard RLS Policies
-- Enables authenticated clients to read their own data for /mi-cuenta.
--
-- Existing policies already cover:
--   - services: "Public can view active services" (SELECT, is_active=true)
--   - barbers: "Public can view active barbers" (SELECT, is_active=true)
--   - businesses: "Public can view active businesses" (SELECT, is_active=true)
-- So we only need new policies on: clients, appointments.

-- 1. Clients can read their own records (linked via user_id)
CREATE POLICY "Clients view own records"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

-- 2. Clients can update their own name/email
--    (phone is business-controlled, stats are trigger-managed)
CREATE POLICY "Clients update own profile"
  ON clients FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Clients can view their own appointments
--    Uses subquery on clients table (different table = no self-referencing RLS issue)
CREATE POLICY "Clients view own appointments"
  ON appointments FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- 4. Index for fast client lookup by user_id (used by layout, hooks, RLS)
CREATE INDEX IF NOT EXISTS idx_clients_user_id
  ON clients(user_id)
  WHERE user_id IS NOT NULL;
