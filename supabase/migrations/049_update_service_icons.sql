-- Migration 049: Update service icon set for barbershop context
-- Replaces generic icons with barbershop-relevant ones.
-- Transitional constraint accepts BOTH old + new values for safe deploy order.

-- Step A: Drop old constraint FIRST so new values are allowed
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_icon_check;

-- Step B: Remap old icon values to new equivalents
UPDATE services SET icon = 'Scissors' WHERE icon = 'Zap';
UPDATE services SET icon = 'SprayCan' WHERE icon = 'Flame';
UPDATE services SET icon = 'PaintbrushVertical' WHERE icon = 'Wind';
UPDATE services SET icon = 'Hand' WHERE icon = 'Waves';
UPDATE services SET icon = 'Baby' WHERE icon = 'Users';
UPDATE services SET icon = 'Eye' WHERE icon = 'CircleDot';
UPDATE services SET icon = 'Crown' WHERE icon = 'Star';
UPDATE services SET icon = 'Sparkles' WHERE icon = 'Sparkle';

-- Step C: Normalize facial category default (Sparkles was old default, Smile is new)
-- Only touch facial rows — combo rows keep Sparkles as their new default
UPDATE services SET icon = 'Smile' WHERE category = 'facial' AND icon = 'Sparkles';

ALTER TABLE services
ADD CONSTRAINT services_icon_check
CHECK (
  icon IS NULL
  OR icon IN (
    -- New set (12 icons)
    'Scissors', 'SprayCan', 'Sparkles', 'Smile', 'Baby', 'Eye',
    'PaintbrushVertical', 'Hand', 'Crown', 'Gift', 'Palette', 'Bath',
    -- Old set (transitional, kept for safe deploy order)
    'Zap', 'Flame', 'Wind', 'Waves', 'Users', 'CircleDot', 'Star', 'Sparkle'
  )
);
