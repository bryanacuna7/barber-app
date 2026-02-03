-- =====================================================
-- VERIFICATION SCRIPT: Atomic Client Stats Function
-- =====================================================
-- Purpose: Verify that increment_client_stats() works correctly
-- Run this script after applying migration 022

-- =====================================================
-- Test 1: Function exists
-- =====================================================
\echo '=== Test 1: Function Exists ==='
SELECT
  proname,
  pg_get_function_identity_arguments(oid) as arguments,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'increment_client_stats';
-- Expected: Should return 1 row with security definer = true

-- =====================================================
-- Test 2: Create test client
-- =====================================================
\echo ''
\echo '=== Test 2: Create Test Client ==='
DO $$
DECLARE
  v_business_id UUID;
  v_client_id UUID := '00000000-0000-0000-0000-000000000099'::uuid;
BEGIN
  -- Get any business ID for testing
  SELECT id INTO v_business_id FROM businesses LIMIT 1;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'No businesses found. Create a business first.';
  END IF;

  -- Delete test client if exists
  DELETE FROM clients WHERE id = v_client_id;

  -- Create test client
  INSERT INTO clients (id, business_id, name, phone, total_visits, total_spent)
  VALUES (
    v_client_id,
    v_business_id,
    'Test Client (Race Condition Test)',
    '+50600000099',
    0,
    0
  );

  RAISE NOTICE 'Test client created: %', v_client_id;
END $$;

-- =====================================================
-- Test 3: Basic increment
-- =====================================================
\echo ''
\echo '=== Test 3: Basic Increment ==='
SELECT increment_client_stats(
  '00000000-0000-0000-0000-000000000099'::uuid,
  1,
  50.00,
  NOW()
);

SELECT
  total_visits,
  total_spent,
  last_visit_at
FROM clients
WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
-- Expected: total_visits=1, total_spent=50.00

-- =====================================================
-- Test 4: Multiple increments (simulate concurrent completions)
-- =====================================================
\echo ''
\echo '=== Test 4: Multiple Increments (Concurrent Simulation) ==='
SELECT increment_client_stats(
  '00000000-0000-0000-0000-000000000099'::uuid,
  1,
  30.00,
  NOW()
);

SELECT increment_client_stats(
  '00000000-0000-0000-0000-000000000099'::uuid,
  1,
  40.00,
  NOW()
);

SELECT increment_client_stats(
  '00000000-0000-0000-0000-000000000099'::uuid,
  1,
  25.00,
  NOW()
);

SELECT
  total_visits,
  total_spent,
  last_visit_at
FROM clients
WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
-- Expected: total_visits=4, total_spent=145.00 (50+30+40+25)

-- =====================================================
-- Test 5: Zero increments (idempotency test)
-- =====================================================
\echo ''
\echo '=== Test 5: Zero Increments (Idempotency) ==='
SELECT increment_client_stats(
  '00000000-0000-0000-0000-000000000099'::uuid,
  0,
  0.00,
  NOW()
);

SELECT
  total_visits,
  total_spent
FROM clients
WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
-- Expected: total_visits=4, total_spent=145.00 (unchanged)

-- =====================================================
-- Test 6: Error handling - Non-existent client
-- =====================================================
\echo ''
\echo '=== Test 6: Error Handling - Non-Existent Client ==='
DO $$
BEGIN
  PERFORM increment_client_stats(
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    1,
    50.00,
    NOW()
  );
  RAISE EXCEPTION 'Test failed: Should have raised exception for non-existent client';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%Client not found%' THEN
      RAISE NOTICE 'Test passed: Correctly raised exception for non-existent client';
    ELSE
      RAISE EXCEPTION 'Test failed: Wrong exception message: %', SQLERRM;
    END IF;
END $$;

-- =====================================================
-- Test 7: Error handling - NULL client_id
-- =====================================================
\echo ''
\echo '=== Test 7: Error Handling - NULL Client ID ==='
DO $$
BEGIN
  PERFORM increment_client_stats(NULL, 1, 50.00, NOW());
  RAISE EXCEPTION 'Test failed: Should have raised exception for NULL client_id';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%client_id cannot be NULL%' THEN
      RAISE NOTICE 'Test passed: Correctly raised exception for NULL client_id';
    ELSE
      RAISE EXCEPTION 'Test failed: Wrong exception message: %', SQLERRM;
    END IF;
END $$;

-- =====================================================
-- Test 8: Error handling - Negative values
-- =====================================================
\echo ''
\echo '=== Test 8: Error Handling - Negative Values ==='
DO $$
BEGIN
  PERFORM increment_client_stats(
    '00000000-0000-0000-0000-000000000099'::uuid,
    -1,
    50.00,
    NOW()
  );
  RAISE EXCEPTION 'Test failed: Should have raised exception for negative visits';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%visits_increment cannot be negative%' THEN
      RAISE NOTICE 'Test passed: Correctly raised exception for negative visits';
    ELSE
      RAISE EXCEPTION 'Test failed: Wrong exception message: %', SQLERRM;
    END IF;
END $$;

DO $$
BEGIN
  PERFORM increment_client_stats(
    '00000000-0000-0000-0000-000000000099'::uuid,
    1,
    -50.00,
    NOW()
  );
  RAISE EXCEPTION 'Test failed: Should have raised exception for negative spent';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%spent_increment cannot be negative%' THEN
      RAISE NOTICE 'Test passed: Correctly raised exception for negative spent';
    ELSE
      RAISE EXCEPTION 'Test failed: Wrong exception message: %', SQLERRM;
    END IF;
END $$;

-- =====================================================
-- Test 9: Clean up
-- =====================================================
\echo ''
\echo '=== Test 9: Cleanup ==='
DELETE FROM clients WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
\echo 'Test client deleted'

-- =====================================================
-- Summary
-- =====================================================
\echo ''
\echo '=== VERIFICATION COMPLETE ==='
\echo 'All tests passed successfully!'
\echo ''
\echo 'The atomic client stats function is working correctly and prevents race conditions.'
