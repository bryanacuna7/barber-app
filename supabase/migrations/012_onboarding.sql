-- Migration: 012_onboarding.sql
-- Description: Add onboarding tracking table for new businesses
-- Created: 2026-01-28

-- Create or replace generic updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create business_onboarding table
CREATE TABLE IF NOT EXISTS business_onboarding (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false NOT NULL,
  current_step INT DEFAULT 1 NOT NULL CHECK (current_step >= 1 AND current_step <= 6),
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add trigger to update updated_at
CREATE TRIGGER update_business_onboarding_updated_at
  BEFORE UPDATE ON business_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_business_id ON business_onboarding(business_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON business_onboarding(completed) WHERE NOT completed;

-- Add RLS policies
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding status
CREATE POLICY "Users can view own onboarding" ON business_onboarding
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their own onboarding status
CREATE POLICY "Users can update own onboarding" ON business_onboarding
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert their own onboarding status
CREATE POLICY "Users can insert own onboarding" ON business_onboarding
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Auto-create onboarding record when business is created
CREATE OR REPLACE FUNCTION create_onboarding_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO business_onboarding (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_onboarding
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_onboarding_record();

-- Initialize onboarding records for existing businesses without one
INSERT INTO business_onboarding (business_id, completed, completed_at)
SELECT
  id,
  true, -- Mark existing businesses as completed (they're already setup)
  created_at
FROM businesses
WHERE id NOT IN (SELECT business_id FROM business_onboarding);

-- Comments
COMMENT ON TABLE business_onboarding IS 'Tracks onboarding wizard completion status for businesses';
COMMENT ON COLUMN business_onboarding.current_step IS 'Current step in the wizard (1-6)';
COMMENT ON COLUMN business_onboarding.skipped IS 'Whether user skipped the onboarding';
