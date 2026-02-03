-- ============================================================================
-- Fix: Add RLS policies for barber_stats table
-- Issue: Trigger fails with "new row violates row-level security policy"
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Business owners can view barber stats" ON barber_stats;
DROP POLICY IF EXISTS "Business owners can manage barber stats" ON barber_stats;
DROP POLICY IF EXISTS "Barbers can view own stats" ON barber_stats;

-- Policy: Business owners can view all barber stats for their business
CREATE POLICY "Business owners can view barber stats"
  ON barber_stats FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Business owners can manage (INSERT/UPDATE/DELETE) barber stats for their business
CREATE POLICY "Business owners can manage barber stats"
  ON barber_stats FOR ALL
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

-- Policy: Barbers can view their own stats
CREATE POLICY "Barbers can view own stats"
  ON barber_stats FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Business owners can view barber stats" ON barber_stats IS
'Allows business owners to view all barber stats for their business';

COMMENT ON POLICY "Business owners can manage barber stats" ON barber_stats IS
'Allows business owners to create, update, and delete barber stats for their business. Also allows triggers with SECURITY DEFINER to bypass RLS.';

COMMENT ON POLICY "Barbers can view own stats" ON barber_stats IS
'Allows barbers to view their own statistics';

-- ============================================================================
-- Fix: Add SECURITY DEFINER to trigger function
-- This allows the trigger to bypass RLS when inserting/updating barber_stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_barber_stats_on_appointment()
RETURNS TRIGGER
SECURITY DEFINER  -- This is the key: runs with definer's privileges, not invoker's
SET search_path = public
AS $$
DECLARE
  v_is_new_client BOOLEAN;
BEGIN
  -- Only process completed appointments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Check if this is a new client for this barber
    SELECT NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE barber_id = NEW.barber_id
        AND client_id = NEW.client_id
        AND status = 'completed'
        AND id != NEW.id
    ) INTO v_is_new_client;

    -- Update or create barber_stats
    INSERT INTO barber_stats (
      barber_id,
      business_id,
      total_appointments,
      total_revenue,
      total_clients,
      last_appointment_date
    )
    VALUES (
      NEW.barber_id,
      NEW.business_id,
      1,
      NEW.price,
      CASE WHEN v_is_new_client THEN 1 ELSE 0 END,
      CURRENT_DATE
    )
    ON CONFLICT (barber_id) DO UPDATE SET
      total_appointments = barber_stats.total_appointments + 1,
      total_revenue = barber_stats.total_revenue + NEW.price,
      total_clients = barber_stats.total_clients + CASE WHEN v_is_new_client THEN 1 ELSE 0 END,
      last_appointment_date = CURRENT_DATE,
      updated_at = NOW();

    -- Update streak
    UPDATE barber_stats
    SET
      current_streak_days = CASE
        WHEN last_appointment_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
        WHEN last_appointment_date = CURRENT_DATE THEN current_streak_days
        ELSE 1
      END,
      best_streak_days = GREATEST(
        best_streak_days,
        CASE
          WHEN last_appointment_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak_days + 1
          ELSE current_streak_days
        END
      )
    WHERE barber_id = NEW.barber_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_barber_stats_on_appointment IS
'Auto-updates barber stats when appointment completes. Runs with SECURITY DEFINER to bypass RLS.';
