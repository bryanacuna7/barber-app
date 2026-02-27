-- Add optional icon override for services.
-- Used by dashboard service form and public booking cards.

ALTER TABLE services
ADD COLUMN IF NOT EXISTS icon TEXT;

UPDATE services
SET icon = CASE
  WHEN category = 'barba' THEN 'Flame'
  WHEN category = 'combo' THEN 'Crown'
  WHEN category = 'facial' THEN 'Sparkles'
  ELSE 'Zap'
END
WHERE icon IS NULL;

ALTER TABLE services
DROP CONSTRAINT IF EXISTS services_icon_check;

ALTER TABLE services
ADD CONSTRAINT services_icon_check
CHECK (
  icon IS NULL
  OR icon IN (
    'Zap',
    'Flame',
    'Crown',
    'Sparkles',
    'Waves',
    'Wind',
    'Users',
    'CircleDot',
    'Scissors',
    'Gift',
    'Star',
    'Sparkle'
  )
);

