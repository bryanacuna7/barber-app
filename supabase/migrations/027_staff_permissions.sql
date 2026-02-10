-- Migration 027: Staff Permissions
-- Adds owner-configurable staff permissions as JSONB on businesses table.
-- Follows same pattern as notification_settings and accepted_payment_methods.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS staff_permissions JSONB DEFAULT '{
    "nav_citas": true,
    "nav_servicios": true,
    "nav_clientes": false,
    "nav_analiticas": false,
    "nav_changelog": true,
    "can_create_citas": true,
    "can_view_all_citas": false
  }'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN businesses.staff_permissions IS 'Owner-configurable UI permissions for staff/barbers. Controls which pages and actions are visible.';
