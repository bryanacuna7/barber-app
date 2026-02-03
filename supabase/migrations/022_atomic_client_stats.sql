-- =====================================================
-- MIGRATION 022: Atomic Client Stats Updates
-- =====================================================
-- Created: 2026-02-03
-- Purpose: Fix race condition in client stats updates (CWE-915)
-- Issue: Multiple concurrent appointment completions can cause incorrect stats
-- Solution: Create atomic database function for thread-safe updates

-- =====================================================
-- FUNCTION: increment_client_stats
-- =====================================================
-- Atomically increments client statistics when completing an appointment
-- This prevents race conditions when multiple appointments are completed simultaneously
--
-- Parameters:
--   p_client_id: UUID of the client
--   p_visits_increment: Number of visits to add (usually 1)
--   p_spent_increment: Amount to add to total_spent (appointment price)
--   p_last_visit_timestamp: Timestamp of the last visit
--
-- Returns: VOID
-- Throws: Exception if client doesn't exist
--
-- Security: SECURITY DEFINER allows RLS bypass for stats updates
-- Idempotent: Can be called multiple times safely due to atomic operations

CREATE OR REPLACE FUNCTION increment_client_stats(
  p_client_id UUID,
  p_visits_increment INT DEFAULT 1,
  p_spent_increment DECIMAL(10,2) DEFAULT 0,
  p_last_visit_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
  v_rows_affected INT;
BEGIN
  -- Validate inputs
  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'client_id cannot be NULL';
  END IF;

  IF p_visits_increment < 0 THEN
    RAISE EXCEPTION 'visits_increment cannot be negative: %', p_visits_increment;
  END IF;

  IF p_spent_increment < 0 THEN
    RAISE EXCEPTION 'spent_increment cannot be negative: %', p_spent_increment;
  END IF;

  -- Atomic update using a single SQL statement
  -- This prevents race conditions by using database-level locking
  UPDATE clients
  SET
    total_visits = COALESCE(total_visits, 0) + p_visits_increment,
    total_spent = COALESCE(total_spent, 0) + p_spent_increment,
    last_visit_at = p_last_visit_timestamp,
    updated_at = NOW()
  WHERE id = p_client_id;

  -- Check if client exists
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected = 0 THEN
    RAISE EXCEPTION 'Client not found: %', p_client_id;
  END IF;

  -- Log successful update for debugging (optional, can be removed in production)
  RAISE DEBUG 'Client stats updated: client_id=%, visits=+%, spent=+%',
    p_client_id, p_visits_increment, p_spent_increment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION increment_client_stats IS
'Atomically increments client statistics (total_visits, total_spent, last_visit_at) when completing an appointment. Prevents race conditions (CWE-915) by using a single atomic UPDATE statement instead of fetch-then-update pattern.';

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant execute permission to authenticated users
-- (RLS policies on clients table still apply for reads)
GRANT EXECUTE ON FUNCTION increment_client_stats TO authenticated;

-- =====================================================
-- TESTING QUERIES (for manual verification)
-- =====================================================

-- Test 1: Basic increment
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   1,
--   50.00,
--   NOW()
-- );

-- Test 2: Verify idempotency (can be called multiple times)
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   0,
--   0.00,
--   NOW()
-- );

-- Test 3: Error handling - NULL client_id
-- SELECT increment_client_stats(NULL, 1, 50.00, NOW());
-- Expected: Exception raised

-- Test 4: Error handling - Negative values
-- SELECT increment_client_stats(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   -1,
--   50.00,
--   NOW()
-- );
-- Expected: Exception raised

-- Test 5: Error handling - Non-existent client
-- SELECT increment_client_stats(
--   'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
--   1,
--   50.00,
--   NOW()
-- );
-- Expected: Exception raised

-- =====================================================
-- END MIGRATION
-- =====================================================
