-- Migration: 013_tour_progress.sql
-- Description: Add tour progress tracking for interactive product tours
-- Created: 2026-01-28

-- Create tour_progress table
CREATE TABLE IF NOT EXISTS tour_progress (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tour_id VARCHAR(50) NOT NULL, -- 'dashboard', 'citas', 'clientes'
  completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (business_id, tour_id)
);

-- Add trigger to update updated_at
CREATE TRIGGER update_tour_progress_updated_at
  BEFORE UPDATE ON tour_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_tour_progress_business_id ON tour_progress(business_id);
CREATE INDEX IF NOT EXISTS idx_tour_progress_tour_id ON tour_progress(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_progress_completed ON tour_progress(business_id, completed) WHERE NOT completed;

-- Add RLS policies
ALTER TABLE tour_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tour progress
CREATE POLICY "Users can view own tour progress" ON tour_progress
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their own tour progress
CREATE POLICY "Users can update own tour progress" ON tour_progress
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert their own tour progress
CREATE POLICY "Users can insert own tour progress" ON tour_progress
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can delete their own tour progress (optional)
CREATE POLICY "Users can delete own tour progress" ON tour_progress
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE tour_progress IS 'Tracks completion status of interactive product tours per business';
COMMENT ON COLUMN tour_progress.tour_id IS 'Tour identifier: dashboard, citas, clientes, etc.';
COMMENT ON COLUMN tour_progress.completed IS 'Whether the tour has been completed';
COMMENT ON COLUMN tour_progress.completed_at IS 'Timestamp when tour was completed';
