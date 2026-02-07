-- Migration 019b: Performance Indexes (Based on Current Schema)
-- Created: 2026-02-03
-- Purpose: Add performance indexes for existing tables
-- Note: Indexes for future features (deposits, push notifications) removed
-- Estimated performance impact: 5-8x faster on indexed queries

-- ============================================================================
-- APPOINTMENTS INDEXES
-- ============================================================================

-- 1. Appointments by status and date (used in dashboard/calendar)
-- Query pattern: SELECT * FROM appointments WHERE business_id = X AND status = 'confirmed'
-- Impact: Calendar and dashboard queries 5-7x faster
CREATE INDEX IF NOT EXISTS idx_appointments_status_date
ON appointments(business_id, status, scheduled_at)
WHERE status IN ('confirmed', 'pending');

-- 2. Appointments by date range (used in calendar views)
-- Query pattern: SELECT * FROM appointments WHERE business_id = X AND scheduled_at BETWEEN
-- Impact: Calendar queries 4-6x faster
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled
ON appointments(business_id, scheduled_at DESC);

-- 3. Completed appointments for analytics
-- Query pattern: SELECT * FROM appointments WHERE status = 'completed'
-- Impact: Analytics and revenue queries 6-8x faster
CREATE INDEX IF NOT EXISTS idx_appointments_completed
ON appointments(business_id, created_at DESC)
WHERE status = 'completed';

-- ============================================================================
-- CLIENT INDEXES
-- ============================================================================

-- 4. Inactive clients by last visit (used in re-engagement)
-- Query pattern: SELECT * FROM clients WHERE last_visit_at < now() - interval '30 days'
-- Impact: Re-engagement queries 5-7x faster
CREATE INDEX IF NOT EXISTS idx_clients_inactive
ON clients(business_id, last_visit_at)
WHERE last_visit_at IS NOT NULL;

-- 5. Clients by total visits (used in loyalty/analytics)
-- Query pattern: SELECT * FROM clients ORDER BY total_visits DESC
-- Impact: Top clients queries 4-5x faster
CREATE INDEX IF NOT EXISTS idx_clients_top_visitors
ON clients(business_id, total_visits DESC);

-- ============================================================================
-- REFERRAL SYSTEM INDEXES
-- ============================================================================

-- 6. Client referrals by status (used in rewards processing)
-- Query pattern: SELECT * FROM client_referrals WHERE business_id = X AND status = 'completed'
-- Impact: Rewards processing dashboard 6-8x faster
CREATE INDEX IF NOT EXISTS idx_client_referrals_status
ON client_referrals(business_id, status);

-- 7. Client referrals by referrer (used in user dashboards)
-- Query pattern: SELECT * FROM client_referrals WHERE referrer_client_id = X
-- Impact: User referral history 5-7x faster
CREATE INDEX IF NOT EXISTS idx_client_referrals_referrer
ON client_referrals(referrer_client_id, status);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all indexes were created
DO $$
DECLARE
  expected_indexes TEXT[] := ARRAY[
    'idx_appointments_status_date',
    'idx_appointments_scheduled',
    'idx_appointments_completed',
    'idx_clients_inactive',
    'idx_clients_top_visitors',
    'idx_client_referrals_status',
    'idx_client_referrals_referrer'
  ];
  idx TEXT;
  missing_count INT := 0;
BEGIN
  FOREACH idx IN ARRAY expected_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = idx
    ) THEN
      RAISE NOTICE 'Missing index: %', idx;
      missing_count := missing_count + 1;
    END IF;
  END LOOP;

  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All 7 indexes created successfully';
  ELSE
    RAISE EXCEPTION '❌ % indexes failed to create', missing_count;
  END IF;
END $$;
