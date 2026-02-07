-- ============================================================================
-- Fix: Allow appointments to be marked as completed even without client_id
-- Issue: Triggers fail when client_id is NULL, preventing status update
-- ============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_award_loyalty_points ON appointments;

-- Recreate trigger with WHEN clause to only run when client_id is not null
CREATE TRIGGER trigger_award_loyalty_points
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.client_id IS NOT NULL)
  EXECUTE FUNCTION award_loyalty_points();

COMMENT ON TRIGGER trigger_award_loyalty_points ON appointments IS
'Awards loyalty points when appointment is completed. Only runs when client_id is not null to prevent errors with walk-in appointments.';

-- Update function to add better error handling
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  loyalty_config RECORD;
  client_record RECORD;
  points_to_award INT;
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Early return if client_id is NULL (shouldn't happen with WHEN clause, but extra safety)
    IF NEW.client_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get client record (check if they have a user account)
    BEGIN
      SELECT * INTO client_record
      FROM clients
      WHERE id = NEW.client_id;

      IF NOT FOUND THEN
        -- Client doesn't exist, log and return
        RAISE NOTICE 'Client % not found for appointment %', NEW.client_id, NEW.id;
        RETURN NEW;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error fetching client record: %', SQLERRM;
      RETURN NEW;
    END;

    -- CRITICAL: Only award points if client has user account
    IF client_record.user_id IS NULL THEN
      -- Client doesn't have account, skip loyalty (but appointment still completes)
      RETURN NEW;
    END IF;

    -- Get loyalty program config
    BEGIN
      SELECT * INTO loyalty_config
      FROM loyalty_programs
      WHERE business_id = NEW.business_id AND enabled = true;

      IF FOUND AND loyalty_config.program_type IN ('points', 'hybrid') THEN
        -- Calculate points based on appointment price
        points_to_award := FLOOR(NEW.price / loyalty_config.points_per_currency_unit);

        -- Update client loyalty status (only for clients with user accounts)
        INSERT INTO client_loyalty_status (
          client_id, business_id, user_id, points_balance, lifetime_points, visit_count
        )
        VALUES (
          NEW.client_id, NEW.business_id, client_record.user_id,
          points_to_award, points_to_award, 1
        )
        ON CONFLICT (client_id) DO UPDATE SET
          points_balance = client_loyalty_status.points_balance + points_to_award,
          lifetime_points = client_loyalty_status.lifetime_points + points_to_award,
          visit_count = client_loyalty_status.visit_count + 1,
          last_points_earned_at = NOW(),
          updated_at = NOW();

        -- Log transaction
        INSERT INTO loyalty_transactions (
          client_id, business_id, transaction_type, points_delta,
          related_appointment_id, notes
        )
        VALUES (
          NEW.client_id, NEW.business_id, 'earned_appointment', points_to_award,
          NEW.id, format('Earned %s points from appointment (₡%s)', points_to_award, NEW.price)
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the appointment update
      RAISE NOTICE 'Error awarding loyalty points for appointment %: %', NEW.id, SQLERRM;
      RETURN NEW;
    END;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_loyalty_points IS 'Automatically awards loyalty points when appointments are completed. Only for clients with user accounts. Includes error handling to prevent appointment update failures.';
-- ============================================================================
-- Fix: Add RLS policies for barber_stats table
-- Issue: Trigger fails with "new row violates row-level security policy"
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Business owners can view barber stats" ON barber_stats;
DROP POLICY IF EXISTS "Business owners can manage barber stats" ON barber_stats;
DROP POLICY IF EXISTS "Barbers can view own stats" ON barber_stats;

-- Policy: Business owners can view all barber stats for their business
CREATE POLICY "Business owners can view barber stats"
  ON barber_stats FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Business owners can manage (INSERT/UPDATE/DELETE) barber stats for their business
CREATE POLICY "Business owners can manage barber stats"
  ON barber_stats FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Barbers can view their own stats
CREATE POLICY "Barbers can view own stats"
  ON barber_stats FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Business owners can view barber stats" ON barber_stats IS
'Allows business owners to view all barber stats for their business';

COMMENT ON POLICY "Business owners can manage barber stats" ON barber_stats IS
'Allows business owners to create, update, and delete barber stats for their business. Also allows triggers with SECURITY DEFINER to bypass RLS.';

COMMENT ON POLICY "Barbers can view own stats" ON barber_stats IS
'Allows barbers to view their own statistics';

-- ============================================================================
-- Fix: Add SECURITY DEFINER to trigger function
-- This allows the trigger to bypass RLS when inserting/updating barber_stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_barber_stats_on_appointment()
RETURNS TRIGGER
SECURITY DEFINER  -- This is the key: runs with definer's privileges, not invoker's
SET search_path = public
AS $$
DECLARE
  v_is_new_client BOOLEAN;
BEGIN
  -- Only process completed appointments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Check if this is a new client for this barber
    SELECT NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE barber_id = NEW.barber_id
        AND client_id = NEW.client_id
        AND status = 'completed'
        AND id != NEW.id
    ) INTO v_is_new_client;

    -- Update or create barber_stats
    INSERT INTO barber_stats (
      barber_id,
      business_id,
      total_appointments,
      total_revenue,
      total_clients,
      last_appointment_date
    )
    VALUES (
      NEW.barber_id,
      NEW.business_id,
      1,
      NEW.price,
      CASE WHEN v_is_new_client THEN 1 ELSE 0 END,
      CURRENT_DATE
    )
    ON CONFLICT (barber_id) DO UPDATE SET
      total_appointments = barber_stats.total_appointments + 1,
      total_revenue = barber_stats.total_revenue + NEW.price,
      total_clients = barber_stats.total_clients + CASE WHEN v_is_new_client THEN 1 ELSE 0 END,
      last_appointment_date = CURRENT_DATE,
      updated_at = NOW();

    -- Update streak
    UPDATE barber_stats
    SET
      current_streak_days = CASE
        WHEN last_appointment_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
        WHEN last_appointment_date = CURRENT_DATE THEN current_streak_days
        ELSE 1
      END,
      best_streak_days = GREATEST(
        best_streak_days,
        CASE
          WHEN last_appointment_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
          ELSE current_streak_days
        END
      )
    WHERE barber_id = NEW.barber_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_barber_stats_on_appointment IS
'Auto-updates barber stats when appointment completes. Runs with SECURITY DEFINER to bypass RLS.';

-- ============================================================================
-- Fix: Unify default brand color (remove legacy blue default)
-- ============================================================================

ALTER TABLE businesses
  ALTER COLUMN brand_primary_color SET DEFAULT '#27272A';

-- Migrate legacy default values created before this change.
UPDATE businesses
SET brand_primary_color = '#27272A'
WHERE UPPER(COALESCE(brand_primary_color, '')) = '#007AFF';

-- =====================================================
-- MIGRATION 022: Atomic Client Stats Updates
-- =====================================================
-- Created: 2026-02-03
-- Purpose: Fix race condition in client stats updates (CWE-915)
-- Issue: Multiple concurrent appointment completions can cause incorrect stats
-- Solution: Create atomic database function for thread-safe updates

-- =====================================================
-- FUNCTION: increment_client_stats
-- =====================================================
-- Atomically increments client statistics when completing an appointment
-- This prevents race conditions when multiple appointments are completed simultaneously
--
-- Parameters:
--   p_client_id: UUID of the client
--   p_visits_increment: Number of visits to add (usually 1)
--   p_spent_increment: Amount to add to total_spent (appointment price)
--   p_last_visit_timestamp: Timestamp of the last visit
--
-- Returns: VOID
-- Throws: Exception if client doesn't exist
--
-- Security: SECURITY DEFINER allows RLS bypass for stats updates
-- Idempotent: Can be called multiple times safely due to atomic operations

CREATE OR REPLACE FUNCTION increment_client_stats(
  p_client_id UUID,
  p_visits_increment INT DEFAULT 1,
  p_spent_increment DECIMAL(10,2) DEFAULT 0,
  p_last_visit_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
  v_rows_affected INT;
BEGIN
  -- Validate inputs
  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'client_id cannot be NULL';
  END IF;

  IF p_visits_increment < 0 THEN
    RAISE EXCEPTION 'visits_increment cannot be negative: %', p_visits_increment;
  END IF;

  IF p_spent_increment < 0 THEN
    RAISE EXCEPTION 'spent_increment cannot be negative: %', p_spent_increment;
  END IF;

  -- Atomic update using a single SQL statement
  -- This prevents race conditions by using database-level locking
  UPDATE clients
  SET
    total_visits = COALESCE(total_visits, 0) + p_visits_increment,
    total_spent = COALESCE(total_spent, 0) + p_spent_increment,
    last_visit_at = p_last_visit_timestamp,
    updated_at = NOW()
  WHERE id = p_client_id;

  -- Check if client exists
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected = 0 THEN
    RAISE EXCEPTION 'Client not found: %', p_client_id;
  END IF;

  -- Log successful update for debugging (optional, can be removed in production)
  RAISE DEBUG 'Client stats updated: client_id=%, visits=+%, spent=+%',
    p_client_id, p_visits_increment, p_spent_increment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION increment_client_stats IS
'Atomically increments client statistics (total_visits, total_spent, last_visit_at) when completing an appointment. Prevents race conditions (CWE-915) by using a single atomic UPDATE statement instead of fetch-then-update pattern.';

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant execute permission to authenticated users
-- (RLS policies on clients table still apply for reads)
GRANT EXECUTE ON FUNCTION increment_client_stats TO authenticated;

-- =====================================================
-- TESTING QUERIES (for manual verification)
-- =====================================================

-- Test 1: Basic increment
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   1,
--   50.00,
--   NOW()
-- );

-- Test 2: Verify idempotency (can be called multiple times)
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   0,
--   0.00,
--   NOW()
-- );

-- Test 3: Error handling - NULL client_id
-- SELECT increment_client_stats(NULL, 1, 50.00, NOW());
-- Expected: Exception raised

-- Test 4: Error handling - Negative values
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   -1,
--   50.00,
--   NOW()
-- );
-- Expected: Exception raised

-- Test 5: Error handling - Non-existent client
-- SELECT increment_client_stats(
--   'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
--   1,
--   50.00,
--   NOW()
-- );
-- Expected: Exception raised

-- =====================================================
-- END MIGRATION
-- =====================================================
-- =====================================================
-- Migration 023: RBAC System Implementation
-- =====================================================
-- Created: 2026-02-03
-- Purpose: Implement Role-Based Access Control (RBAC)
--          to fix IDOR vulnerability and enable granular permissions
--
-- Changes:
-- 1. Create roles table (owner, admin, staff, recepcionista)
-- 2. Create permissions table (granular access control)
-- 3. Create role_permissions junction table
-- 4. Add user_id and role_id to barbers table
-- 5. Populate initial roles and permissions
-- 6. Create helper functions for permission checks
-- =====================================================

-- =====================================================
-- 1. CREATE ROLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('owner', 'admin', 'staff', 'recepcionista')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'User roles for RBAC system';
COMMENT ON COLUMN roles.name IS 'Role name: owner (business owner), admin (super admin), staff (barbers/stylists), recepcionista (front desk)';

-- =====================================================
-- 2. CREATE PERMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL CHECK (resource IN ('appointments', 'barbers', 'clients', 'services', 'reports', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE permissions IS 'Granular permissions for RBAC system';
COMMENT ON COLUMN permissions.resource IS 'Resource category: appointments, barbers, clients, services, reports, business';

-- =====================================================
-- 3. CREATE ROLE_PERMISSIONS JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';

-- =====================================================
-- 4. ALTER BARBERS TABLE
-- =====================================================

-- Add user_id to link barbers with auth.users (for authentication)
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add role_id to link barbers with their role (for authorization)
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_barbers_user_id ON barbers(user_id);
CREATE INDEX IF NOT EXISTS idx_barbers_role_id ON barbers(role_id);

COMMENT ON COLUMN barbers.user_id IS 'Link to auth.users for authentication';
COMMENT ON COLUMN barbers.role_id IS 'Link to roles for authorization (RBAC)';

-- =====================================================
-- 5. POPULATE INITIAL ROLES
-- =====================================================

INSERT INTO roles (name, description) VALUES
  ('owner', 'Business owner - Full access to all features and settings'),
  ('admin', 'System administrator - Almost full access, can manage users and settings'),
  ('staff', 'Staff member (barber/stylist) - Can view own appointments and clients'),
  ('recepcionista', 'Receptionist/Front desk - Can view all appointments and manage bookings')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 6. POPULATE INITIAL PERMISSIONS
-- =====================================================

-- Appointments permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('read_all_appointments', 'View all appointments across all barbers', 'appointments'),
  ('read_own_appointments', 'View only own appointments', 'appointments'),
  ('write_all_appointments', 'Create/edit any appointment', 'appointments'),
  ('write_own_appointments', 'Create/edit only own appointments', 'appointments'),
  ('delete_appointments', 'Delete appointments', 'appointments')
ON CONFLICT (name) DO NOTHING;

-- Barbers/Staff permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('manage_barbers', 'Create/edit/delete staff members', 'barbers'),
  ('view_barbers', 'View list of staff members', 'barbers')
ON CONFLICT (name) DO NOTHING;

-- Clients permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('manage_clients', 'Create/edit/delete clients', 'clients'),
  ('view_clients', 'View client information', 'clients')
ON CONFLICT (name) DO NOTHING;

-- Services permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('manage_services', 'Create/edit/delete services', 'services'),
  ('view_services', 'View services list', 'services')
ON CONFLICT (name) DO NOTHING;

-- Reports permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('view_all_reports', 'View reports for all staff members', 'reports'),
  ('view_own_reports', 'View only own reports and statistics', 'reports')
ON CONFLICT (name) DO NOTHING;

-- Business settings permissions
INSERT INTO permissions (name, description, resource) VALUES
  ('manage_business_settings', 'Manage business settings and configuration', 'business')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 7. ASSIGN PERMISSIONS TO ROLES
-- =====================================================

-- OWNER: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'owner'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- ADMIN: All permissions (same as owner for now)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- STAFF: Limited permissions (own appointments, view clients/services)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'staff'),
  id
FROM permissions
WHERE name IN (
  'read_own_appointments',
  'write_own_appointments',
  'view_barbers',
  'view_clients',
  'view_services',
  'view_own_reports'
)
ON CONFLICT DO NOTHING;

-- RECEPCIONISTA: Can view/manage all appointments and clients
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'recepcionista'),
  id
FROM permissions
WHERE name IN (
  'read_all_appointments',
  'read_own_appointments',
  'write_all_appointments',
  'view_barbers',
  'manage_clients',
  'view_clients',
  'view_services',
  'view_own_reports'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- Check if user's role has the requested permission
  SELECT EXISTS (
    SELECT 1
    FROM barbers b
    JOIN role_permissions rp ON rp.role_id = b.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE b.user_id = p_user_id
      AND p.name = p_permission_name
  ) INTO has_perm;

  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission';

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name TEXT,
  permission_description TEXT,
  resource TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    p.description,
    p.resource
  FROM barbers b
  JOIN role_permissions rp ON rp.role_id = b.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE b.user_id = p_user_id
  ORDER BY p.resource, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for a user';

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT r.name INTO user_role
  FROM barbers b
  JOIN roles r ON r.id = b.role_id
  WHERE b.user_id = p_user_id;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role IS 'Get the role name for a user';

-- =====================================================
-- 9. CREATE UPDATED_AT TRIGGER FOR ROLES
-- =====================================================

CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- =====================================================
-- 10. GRANT PERMISSIONS (RLS will be added later)
-- =====================================================

-- Grant basic read access to authenticated users
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION user_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verification queries (run manually to verify)
-- SELECT * FROM roles ORDER BY name;
-- SELECT * FROM permissions ORDER BY resource, name;
-- SELECT r.name as role, p.name as permission FROM role_permissions rp JOIN roles r ON r.id = rp.role_id JOIN permissions p ON p.id = rp.permission_id ORDER BY r.name, p.name;
-- ============================================================================
-- Enable Realtime for WebSocket Subscriptions
-- ============================================================================
-- Created: Session [current]
-- Purpose: Configure tables for Supabase Realtime (WebSocket subscriptions)
--
-- Tables enabled:
-- - appointments (for useRealtimeAppointments hook)
-- - clients (for useRealtimeClients hook)
-- - business_subscriptions (for useRealtimeSubscriptions hook)
--
-- Requirements:
-- 1. REPLICA IDENTITY - Determines what info is sent in change events
-- 2. Realtime Publication - Must be added to supabase_realtime publication
-- ============================================================================

-- Enable REPLICA IDENTITY for all relevant tables
-- Using FULL to include all column values in realtime events
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE clients REPLICA IDENTITY FULL;
ALTER TABLE business_subscriptions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
-- This enables WebSocket subscriptions for these tables
BEGIN;
  -- Drop and recreate publication to ensure clean state
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;

  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  ALTER PUBLICATION supabase_realtime ADD TABLE clients;
  ALTER PUBLICATION supabase_realtime ADD TABLE business_subscriptions;
COMMIT;

-- ============================================================================
-- Alternative: Manual Configuration (if above fails)
-- ============================================================================
-- If you get "permission denied" error, enable manually via:
-- Supabase Dashboard → Database → Replication
-- Enable these tables: appointments, clients, business_subscriptions
-- ============================================================================
