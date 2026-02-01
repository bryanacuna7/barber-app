-- Fix notification trigger that references wrong column name
-- Bug: trigger was using NEW.date_time but appointments table has scheduled_at

-- Drop and recreate the function with correct column name
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_owner_id UUID;
  v_client_name TEXT;
  v_service_name TEXT;
BEGIN
  -- Get business owner ID
  SELECT owner_id INTO v_business_owner_id
  FROM businesses
  WHERE id = NEW.business_id;

  -- Get client name
  SELECT name INTO v_client_name
  FROM clients
  WHERE id = NEW.client_id;

  -- Get service name
  SELECT name INTO v_service_name
  FROM services
  WHERE id = NEW.service_id;

  -- Create notification for business owner
  PERFORM create_notification(
    p_user_id := v_business_owner_id,
    p_business_id := NEW.business_id,
    p_type := 'new_appointment',
    p_title := 'Nueva cita agendada',
    p_message := format('%s agendó %s para %s',
      COALESCE(v_client_name, 'Un cliente'),
      COALESCE(v_service_name, 'un servicio'),
      to_char(NEW.scheduled_at AT TIME ZONE 'America/Costa_Rica', 'DD/MM a las HH:MI')
    ),
    p_reference_type := 'appointment',
    p_reference_id := NEW.id
  );

  RETURN NEW;
END;
$$;
