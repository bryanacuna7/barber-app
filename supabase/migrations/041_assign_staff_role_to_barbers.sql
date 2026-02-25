-- Migration 041: Assign 'staff' role to barbers with user_id but no role_id
-- Problem: Barbers seeded/created before RBAC (migration 023) have role_id = NULL.
-- Without a role, the user_has_permission() RPC returns false for all checks,
-- blocking check-in, complete, and no-show actions.
--
-- Fix: Set role_id = staff for all barbers that have a user_id but no role_id.

UPDATE barbers
SET role_id = (SELECT id FROM roles WHERE name = 'staff')
WHERE user_id IS NOT NULL
  AND role_id IS NULL;

-- Also set a default for future inserts so new barbers always get 'staff' role.
-- PostgreSQL doesn't allow subqueries in DEFAULT, so we use a DO block.
DO $$
DECLARE
  staff_role_id UUID;
BEGIN
  SELECT id INTO staff_role_id FROM roles WHERE name = 'staff';
  IF staff_role_id IS NOT NULL THEN
    EXECUTE format('ALTER TABLE barbers ALTER COLUMN role_id SET DEFAULT %L', staff_role_id);
  END IF;
END $$;
