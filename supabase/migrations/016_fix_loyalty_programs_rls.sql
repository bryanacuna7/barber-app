-- Fix loyalty_programs RLS policy to allow inserts/updates
-- The original policy only had USING clause, which doesn't work for INSERT/UPDATE
-- We need WITH CHECK clause for those operations

-- Drop the old policy
DROP POLICY IF EXISTS "Business owners manage loyalty programs" ON loyalty_programs;

-- Create new policy with both USING and WITH CHECK
CREATE POLICY "Business owners manage loyalty programs"
  ON loyalty_programs
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'loyalty_programs';
