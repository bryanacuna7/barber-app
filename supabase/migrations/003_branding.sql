-- 003_branding.sql
-- Add brand customization fields to businesses table

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#27272A',
  ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;
