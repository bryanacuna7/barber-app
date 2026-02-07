-- Quick seed script to create test appointments for drag-drop testing
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_business_id UUID;
  v_barber_id UUID;
  v_client_id UUID;
  v_service_id UUID;
  v_base_date DATE;
BEGIN
  -- Get the test business
  SELECT id INTO v_business_id FROM businesses WHERE slug = 'barberia-test' LIMIT 1;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Business not found. Please create a business with slug "barberia-test" first.';
  END IF;

  -- Get first barber for this business
  SELECT id INTO v_barber_id FROM barbers WHERE business_id = v_business_id LIMIT 1;

  IF v_barber_id IS NULL THEN
    RAISE EXCEPTION 'No barber found. Please create a barber first.';
  END IF;

  -- Get first client for this business
  SELECT id INTO v_client_id FROM clients WHERE business_id = v_business_id LIMIT 1;

  -- Get first service for this business
  SELECT id INTO v_service_id FROM services WHERE business_id = v_business_id LIMIT 1;

  -- Set base date to next Wednesday (2026-02-05)
  v_base_date := '2026-02-05'::DATE;

  -- Delete existing appointments for this week
  DELETE FROM appointments
  WHERE business_id = v_business_id
  AND scheduled_at >= v_base_date
  AND scheduled_at < v_base_date + INTERVAL '7 days';

  -- Insert test appointments for Week View (Feb 5-11, 2026)
  -- Wednesday Feb 5
  INSERT INTO appointments (business_id, barber_id, client_id, service_id, scheduled_at, status, duration_minutes, price)
  VALUES
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '9 hours', 'pending', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '11 hours', 'confirmed', 45, 12000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '14 hours', 'pending', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '16 hours', 'confirmed', 40, 10000);

  -- Thursday Feb 6
  INSERT INTO appointments (business_id, barber_id, client_id, service_id, scheduled_at, status, duration_minutes, price)
  VALUES
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '1 day 10 hours', 'pending', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '1 day 15 hours', 'confirmed', 45, 12000);

  -- Friday Feb 7
  INSERT INTO appointments (business_id, barber_id, client_id, service_id, scheduled_at, status, duration_minutes, price)
  VALUES
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '2 days 9 hours', 'confirmed', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '2 days 13 hours', 'pending', 40, 10000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '2 days 17 hours', 'confirmed', 25, 5000);

  -- Saturday Feb 8
  INSERT INTO appointments (business_id, barber_id, client_id, service_id, scheduled_at, status, duration_minutes, price)
  VALUES
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '3 days 10 hours', 'pending', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '3 days 12 hours', 'confirmed', 30, 8000),
    (v_business_id, v_barber_id, v_client_id, v_service_id, v_base_date + INTERVAL '3 days 15 hours', 'pending', 45, 12000);

  RAISE NOTICE '✅ Created % test appointments for week of %', 12, v_base_date;
  RAISE NOTICE 'Business: %', v_business_id;
  RAISE NOTICE 'Barber: %', v_barber_id;

END $$;

-- Verify appointments were created
SELECT
  DATE(scheduled_at) as date,
  TO_CHAR(scheduled_at, 'HH24:MI') as time,
  status,
  duration_minutes
FROM appointments
WHERE business_id = (SELECT id FROM businesses WHERE slug = 'barberia-test' LIMIT 1)
  AND scheduled_at >= '2026-02-05'
  AND scheduled_at < '2026-02-12'
ORDER BY scheduled_at;
