-- ============================================================================
-- Fix: Allow appointments to be marked as completed even without client_id
-- Issue: Triggers fail when client_id is NULL, preventing status update
-- ============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_award_loyalty_points ON appointments;

-- Recreate trigger with WHEN clause to only run when client_id is not null
CREATE TRIGGER trigger_award_loyalty_points
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.client_id IS NOT NULL)
  EXECUTE FUNCTION award_loyalty_points();

COMMENT ON TRIGGER trigger_award_loyalty_points ON appointments IS
'Awards loyalty points when appointment is completed. Only runs when client_id is not null to prevent errors with walk-in appointments.';

-- Update function to add better error handling
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  loyalty_config RECORD;
  client_record RECORD;
  points_to_award INT;
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Early return if client_id is NULL (shouldn't happen with WHEN clause, but extra safety)
    IF NEW.client_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get client record (check if they have a user account)
    BEGIN
      SELECT * INTO client_record
      FROM clients
      WHERE id = NEW.client_id;

      IF NOT FOUND THEN
        -- Client doesn't exist, log and return
        RAISE NOTICE 'Client % not found for appointment %', NEW.client_id, NEW.id;
        RETURN NEW;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error fetching client record: %', SQLERRM;
      RETURN NEW;
    END;

    -- CRITICAL: Only award points if client has user account
    IF client_record.user_id IS NULL THEN
      -- Client doesn't have account, skip loyalty (but appointment still completes)
      RETURN NEW;
    END IF;

    -- Get loyalty program config
    BEGIN
      SELECT * INTO loyalty_config
      FROM loyalty_programs
      WHERE business_id = NEW.business_id AND enabled = true;

      IF FOUND AND loyalty_config.program_type IN ('points', 'hybrid') THEN
        -- Calculate points based on appointment price
        points_to_award := FLOOR(NEW.price / loyalty_config.points_per_currency_unit);

        -- Update client loyalty status (only for clients with user accounts)
        INSERT INTO client_loyalty_status (
          client_id, business_id, user_id, points_balance, lifetime_points, visit_count
        )
        VALUES (
          NEW.client_id, NEW.business_id, client_record.user_id,
          points_to_award, points_to_award, 1
        )
        ON CONFLICT (client_id) DO UPDATE SET
          points_balance = client_loyalty_status.points_balance + points_to_award,
          lifetime_points = client_loyalty_status.lifetime_points + points_to_award,
          visit_count = client_loyalty_status.visit_count + 1,
          last_points_earned_at = NOW(),
          updated_at = NOW();

        -- Log transaction
        INSERT INTO loyalty_transactions (
          client_id, business_id, transaction_type, points_delta,
          related_appointment_id, notes
        )
        VALUES (
          NEW.client_id, NEW.business_id, 'earned_appointment', points_to_award,
          NEW.id, format('Earned %s points from appointment (₡%s)', points_to_award, NEW.price)
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the appointment update
      RAISE NOTICE 'Error awarding loyalty points for appointment %: %', NEW.id, SQLERRM;
      RETURN NEW;
    END;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION award_loyalty_points IS 'Automatically awards loyalty points when appointments are completed. Only for clients with user accounts. Includes error handling to prevent appointment update failures.';
