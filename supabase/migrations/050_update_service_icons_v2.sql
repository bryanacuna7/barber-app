-- Migration 050: Replace 4 service icons with better barbershop alternatives
-- SprayCan → Slice (blade/razor), Sparkles → Layers (stacked services),
-- PaintbrushVertical → WandSparkles (creative styling), Bath → Droplets (steam/water)

-- Step A: Drop old constraint FIRST (so UPDATEs can use new values)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_icon_check;

-- Step B: Remap existing icon values
UPDATE services SET icon = 'Slice' WHERE icon = 'SprayCan';
UPDATE services SET icon = 'Layers' WHERE icon = 'Sparkles';
UPDATE services SET icon = 'WandSparkles' WHERE icon = 'PaintbrushVertical';
UPDATE services SET icon = 'Droplets' WHERE icon = 'Bath';

-- Step C: Add new constraint (transitional — accepts old + new for safe deploy)
ALTER TABLE services
ADD CONSTRAINT services_icon_check
CHECK (
  icon IS NULL
  OR icon IN (
    -- Current set (12 icons)
    'Scissors', 'Slice', 'Layers', 'Smile', 'Baby', 'Eye',
    'WandSparkles', 'Hand', 'Crown', 'Gift', 'Palette', 'Droplets',
    -- Previous set (transitional, kept for safe deploy order)
    'SprayCan', 'Sparkles', 'PaintbrushVertical', 'Bath',
    -- Legacy set (from migration 049)
    'Zap', 'Flame', 'Wind', 'Waves', 'Users', 'CircleDot', 'Star', 'Sparkle'
  )
);
