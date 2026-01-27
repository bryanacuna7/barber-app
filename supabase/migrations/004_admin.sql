-- Migration: 004_admin.sql
-- Description: Create admin_users table for super admin access
-- Date: 2026-01-27

-- ============================================
-- Table: admin_users
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- Insert initial admin (bryn.acuna7@gmail.com)
-- ============================================
-- Note: This will only work if the user already exists in auth.users
-- Run this manually in Supabase Dashboard if user doesn't exist yet:
--
-- INSERT INTO admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'bryn.acuna7@gmail.com';

DO $$
BEGIN
  INSERT INTO admin_users (user_id)
  SELECT id FROM auth.users WHERE email = 'bryn.acuna7@gmail.com'
  ON CONFLICT (user_id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not insert admin user. Run manually after user registers.';
END $$;

-- ============================================
-- Add is_active column to businesses if not exists
-- (for admin to activate/deactivate businesses)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE businesses ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
