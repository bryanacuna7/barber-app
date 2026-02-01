-- Allow public read access to loyalty programs (for showing banner to non-authenticated users)
-- But keep write access restricted to business owners

-- Drop the old all-in-one policy
DROP POLICY IF EXISTS "Business owners manage loyalty programs" ON loyalty_programs;

-- Create separate policies for read and write

-- 1. Allow everyone to read enabled loyalty programs (for public booking page)
CREATE POLICY "Anyone can view enabled loyalty programs"
  ON loyalty_programs
  FOR SELECT
  USING (enabled = true);

-- 2. Only business owners can insert/update/delete
CREATE POLICY "Business owners can manage their loyalty programs"
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

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'loyalty_programs'
ORDER BY policyname;
