-- Migration 040: Fix barber RLS for appointments + clients
-- Problem: Barbers cannot see their own appointments in Mi Día view.
-- The policy "Barbers can view own appointments" from migration 002 may not
-- have been applied, or PostgreSQL's self-referencing RLS on the barbers table
-- blocks the subquery. This migration re-creates the policies cleanly.

-- =============================================================================
-- 1. RE-CREATE barber appointment policies (idempotent)
-- =============================================================================

-- Drop existing policies if they exist (safe re-apply)
DROP POLICY IF EXISTS "Barbers can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Barbers can update status of own appointments" ON appointments;

-- Barbers can SELECT appointments assigned to them
CREATE POLICY "Barbers can view own appointments"
  ON appointments FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Barbers can UPDATE status of appointments assigned to them
CREATE POLICY "Barbers can update status of own appointments"
  ON appointments FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =============================================================================
-- 2. ADD barber read access to clients (needed for appointment JOINs)
-- =============================================================================

-- Barbers need to see client info (name, phone) for their appointments
DROP POLICY IF EXISTS "Barbers can view business clients" ON clients;

CREATE POLICY "Barbers can view business clients"
  ON clients FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM barbers WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =============================================================================
-- DONE
-- =============================================================================
-- After applying: Barbers can see their own appointments with client details
-- in Mi Día view.
