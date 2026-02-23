-- =====================================================
-- MIGRATION 035: Secure referral_conversions RLS
-- =====================================================
-- Purpose:
-- - Remove overly permissive INSERT/UPDATE policies on referral_conversions
-- - All writes go through serviceClient (bypasses RLS), so no client-side
--   INSERT/UPDATE policy is needed
-- - Keep only the existing SELECT policy from migration 019
--
-- Security rationale:
-- - track-conversion API uses serviceClient for upserts
-- - Admin pages use serviceClient for reads
-- - Owner dashboard reads via authenticated SELECT (policy from 019)
-- - No legitimate client-side write path exists

DROP POLICY IF EXISTS "Allow conversion tracking" ON referral_conversions;
DROP POLICY IF EXISTS "Allow conversion status updates" ON referral_conversions;

-- No new INSERT/UPDATE policies created intentionally.
-- serviceClient bypasses RLS for all backend writes.
-- The SELECT policy "Business owners view own conversions" from migration 019 remains.
