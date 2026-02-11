-- Migration 032: Service Duration Stats table
-- Purpose: Aggregated duration statistics for smart duration prediction
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Stats table
CREATE TABLE service_duration_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE, -- NULL = service-wide avg
  avg_duration_minutes DECIMAL(5,1) NOT NULL,
  min_duration_minutes INT NOT NULL,
  max_duration_minutes INT NOT NULL,
  sample_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Partial unique indexes (NULL ≠ NULL in PostgreSQL, so UNIQUE constraint won't work)
CREATE UNIQUE INDEX idx_duration_stats_barber_specific
  ON service_duration_stats(business_id, service_id, barber_id)
  WHERE barber_id IS NOT NULL;

CREATE UNIQUE INDEX idx_duration_stats_service_wide
  ON service_duration_stats(business_id, service_id)
  WHERE barber_id IS NULL;

-- 3. Lookup index for cascade predictor
CREATE INDEX idx_duration_stats_lookup
  ON service_duration_stats(business_id, service_id, barber_id);

-- 4. RLS: owners can read their own stats
ALTER TABLE service_duration_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view stats"
  ON service_duration_stats FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
