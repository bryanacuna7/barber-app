-- Add service categories for CRUD + filtering in dashboard services module

ALTER TABLE services
ADD COLUMN IF NOT EXISTS category TEXT;

UPDATE services
SET category = CASE
  WHEN LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%barba%'
    OR LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%afeitado%'
    THEN 'barba'
  WHEN LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%combo%'
    OR COALESCE(name, '') LIKE '%+%'
    THEN 'combo'
  WHEN LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%facial%'
    OR LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%ceja%'
    OR LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%piel%'
    OR LOWER(COALESCE(name, '') || ' ' || COALESCE(description, '')) LIKE '%masaje%'
    THEN 'facial'
  ELSE 'corte'
END
WHERE category IS NULL;

UPDATE services
SET category = 'corte'
WHERE category NOT IN ('corte', 'barba', 'combo', 'facial');

ALTER TABLE services
ALTER COLUMN category SET DEFAULT 'corte',
ALTER COLUMN category SET NOT NULL;

ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_category_check;

ALTER TABLE services
ADD CONSTRAINT services_category_check
CHECK (category IN ('corte', 'barba', 'combo', 'facial'));

CREATE INDEX IF NOT EXISTS idx_services_business_category
  ON services(business_id, category);
