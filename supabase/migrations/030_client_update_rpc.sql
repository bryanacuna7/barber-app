-- Migration 030: Restrict client profile updates to name/email only
--
-- Problem: Migration 029's UPDATE policy on clients allowed ANY column update.
-- A client could directly call supabase.from('clients').update({total_spent: 0})
-- and bypass the UI restriction.
--
-- Fix: Drop the open UPDATE policy. Replace with a SECURITY DEFINER function
-- that only updates name and email.

-- 1. Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Clients update own profile" ON clients;

-- 2. Create a restricted RPC for client profile updates
CREATE OR REPLACE FUNCTION update_client_profile(
  p_client_id UUID,
  p_name TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE clients
  SET
    name = p_name,
    email = p_email,
    updated_at = NOW()
  WHERE id = p_client_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client record not found or not owned by user';
  END IF;
END;
$$;

-- 3. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_client_profile(UUID, TEXT, TEXT) TO authenticated;
