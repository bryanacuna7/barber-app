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
