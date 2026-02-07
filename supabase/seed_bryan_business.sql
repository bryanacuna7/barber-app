-- ============================================================
-- SEED DATA: Bryan's Barbershop Business
-- Business ID: 66bf2172-08b1-4afe-a47a-d1beb3ec7039
-- Owner: Bryan Acuña (user_id: 039c8d01-2081-4191-ba4c-a9e1a942f267)
-- ============================================================

DO $$
DECLARE
  v_business_id UUID := '66bf2172-08b1-4afe-a47a-d1beb3ec7039';
  v_staff_role_id UUID;

  -- Service IDs
  v_service_1 UUID; v_service_2 UUID; v_service_3 UUID; v_service_4 UUID;
  v_service_5 UUID; v_service_6 UUID; v_service_7 UUID; v_service_8 UUID;
  v_service_9 UUID; v_service_10 UUID; v_service_11 UUID;

  -- Barber IDs
  v_barber_1 UUID; v_barber_2 UUID; v_barber_3 UUID; v_barber_4 UUID; v_barber_5 UUID;

  -- Client IDs (first 20)
  v_client_1 UUID; v_client_2 UUID; v_client_3 UUID; v_client_4 UUID; v_client_5 UUID;
  v_client_6 UUID; v_client_7 UUID; v_client_8 UUID; v_client_9 UUID; v_client_10 UUID;
  v_client_11 UUID; v_client_12 UUID; v_client_13 UUID; v_client_14 UUID; v_client_15 UUID;
  v_client_16 UUID; v_client_17 UUID; v_client_18 UUID; v_client_19 UUID; v_client_20 UUID;

BEGIN
  RAISE NOTICE '🧹 Cleaning existing data...';

  -- Clean existing data (safe for re-runs)
  DELETE FROM appointments WHERE business_id = v_business_id;
  DELETE FROM barber_stats WHERE business_id = v_business_id;
  DELETE FROM client_loyalty_status WHERE business_id = v_business_id;
  DELETE FROM clients WHERE business_id = v_business_id;
  DELETE FROM services WHERE business_id = v_business_id;
  DELETE FROM barbers WHERE business_id = v_business_id;

  RAISE NOTICE '✅ Clean complete';

  -- Get staff role ID
  SELECT id INTO v_staff_role_id FROM roles WHERE name = 'staff' LIMIT 1;

  -- ============================================================
  -- 1. SERVICES (11 realistic barbershop services)
  -- ============================================================
  RAISE NOTICE '💈 Creating services...';

  INSERT INTO services (id, business_id, name, description, duration_minutes, price, display_order, is_active)
  VALUES
    (gen_random_uuid(), v_business_id, 'Corte Clásico', 'Corte tradicional con máquina y tijera', 30, 8000, 1, true),
    (gen_random_uuid(), v_business_id, 'Corte + Barba', 'Servicio completo de corte y arreglo de barba', 45, 12000, 2, true),
    (gen_random_uuid(), v_business_id, 'Barba Completa', 'Arreglo y perfilado de barba', 25, 5000, 3, true),
    (gen_random_uuid(), v_business_id, 'Corte Fade', 'Degradado moderno con diseño', 40, 10000, 4, true),
    (gen_random_uuid(), v_business_id, 'Corte Niño', 'Corte especial para niños', 20, 5000, 5, true),
    (gen_random_uuid(), v_business_id, 'Tratamiento Capilar', 'Tratamiento profundo del cuero cabelludo', 35, 15000, 6, true),
    (gen_random_uuid(), v_business_id, 'Corte + Cejas', 'Corte de cabello más arreglo de cejas', 35, 9000, 7, true),
    (gen_random_uuid(), v_business_id, 'Afeitado Clásico', 'Afeitado tradicional con navaja', 20, 6000, 8, true),
    (gen_random_uuid(), v_business_id, 'Tinte de Barba', 'Aplicación de tinte en barba', 30, 8500, 9, true),
    (gen_random_uuid(), v_business_id, 'Corte Premium VIP', 'Servicio premium completo con tratamientos', 60, 25000, 10, true),
    (gen_random_uuid(), v_business_id, 'Peinado Especial', 'Peinado y styling para eventos', 25, 7000, 11, true)
  RETURNING id INTO v_service_1;

  -- Get service IDs for appointments
  SELECT id INTO v_service_1 FROM services WHERE business_id = v_business_id AND name = 'Corte Clásico';
  SELECT id INTO v_service_2 FROM services WHERE business_id = v_business_id AND name = 'Corte + Barba';
  SELECT id INTO v_service_3 FROM services WHERE business_id = v_business_id AND name = 'Barba Completa';
  SELECT id INTO v_service_4 FROM services WHERE business_id = v_business_id AND name = 'Corte Fade';
  SELECT id INTO v_service_5 FROM services WHERE business_id = v_business_id AND name = 'Corte Niño';
  SELECT id INTO v_service_6 FROM services WHERE business_id = v_business_id AND name = 'Tratamiento Capilar';
  SELECT id INTO v_service_7 FROM services WHERE business_id = v_business_id AND name = 'Corte + Cejas';
  SELECT id INTO v_service_8 FROM services WHERE business_id = v_business_id AND name = 'Afeitado Clásico';
  SELECT id INTO v_service_9 FROM services WHERE business_id = v_business_id AND name = 'Tinte de Barba';
  SELECT id INTO v_service_10 FROM services WHERE business_id = v_business_id AND name = 'Corte Premium VIP';
  SELECT id INTO v_service_11 FROM services WHERE business_id = v_business_id AND name = 'Peinado Especial';

  RAISE NOTICE '✅ 11 services created';

  -- ============================================================
  -- 2. BARBERS (5 staff members)
  -- ============================================================
  RAISE NOTICE '👨‍💼 Creating barbers...';

  INSERT INTO barbers (id, business_id, name, email, phone, role, is_active, role_id)
  VALUES
    (gen_random_uuid(), v_business_id, 'Juan Carlos Sánchez', 'juan.sanchez@barberia.cr', '88887777', 'staff', true, v_staff_role_id),
    (gen_random_uuid(), v_business_id, 'Miguel Ángel Torres', 'miguel.torres@barberia.cr', '88886666', 'staff', true, v_staff_role_id),
    (gen_random_uuid(), v_business_id, 'David López Jiménez', 'david.lopez@barberia.cr', '88885555', 'staff', true, v_staff_role_id),
    (gen_random_uuid(), v_business_id, 'Fabio Rodríguez', 'fabio.rodriguez@barberia.cr', '88884444', 'staff', true, v_staff_role_id),
    (gen_random_uuid(), v_business_id, 'Raúl Martínez', 'raul.martinez@barberia.cr', '88883333', 'staff', true, v_staff_role_id)
  RETURNING id INTO v_barber_1;

  -- Get barber IDs
  SELECT id INTO v_barber_1 FROM barbers WHERE business_id = v_business_id AND email = 'juan.sanchez@barberia.cr';
  SELECT id INTO v_barber_2 FROM barbers WHERE business_id = v_business_id AND email = 'miguel.torres@barberia.cr';
  SELECT id INTO v_barber_3 FROM barbers WHERE business_id = v_business_id AND email = 'david.lopez@barberia.cr';
  SELECT id INTO v_barber_4 FROM barbers WHERE business_id = v_business_id AND email = 'fabio.rodriguez@barberia.cr';
  SELECT id INTO v_barber_5 FROM barbers WHERE business_id = v_business_id AND email = 'raul.martinez@barberia.cr';

  RAISE NOTICE '✅ 5 barbers created';

  -- ============================================================
  -- 3. CLIENTS (20 with realistic data)
  -- ============================================================
  RAISE NOTICE '👥 Creating clients...';

  INSERT INTO clients (id, business_id, name, phone, email, notes, total_visits, total_spent, last_visit_at)
  VALUES
    (gen_random_uuid(), v_business_id, 'Carlos Rodríguez', '88881111', 'carlos.r@email.com', 'Cliente frecuente, prefiere Juan Carlos', 18, 144000, NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), v_business_id, 'José Hernández', '88882222', 'jose.h@email.com', NULL, 12, 96000, NOW() - INTERVAL '1 week'),
    (gen_random_uuid(), v_business_id, 'Luis González', '88883333', NULL, 'Siempre llega puntual', 15, 120000, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_business_id, 'Mario Vargas', '88884444', 'mario.v@email.com', NULL, 8, 64000, NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_business_id, 'Roberto Campos', '88885555', NULL, 'Prefiere cortes fade', 20, 200000, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), v_business_id, 'Fernando Mora', '88886666', 'fernando.m@email.com', NULL, 5, 40000, NOW() - INTERVAL '2 weeks'),
    (gen_random_uuid(), v_business_id, 'Andrés Solís', '88887777', NULL, NULL, 10, 85000, NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), v_business_id, 'Pedro Jiménez', '88888888', 'pedro.j@email.com', 'Alérgico a ciertos productos', 14, 112000, NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), v_business_id, 'Daniel Castro', '88889999', NULL, NULL, 3, 24000, NOW() - INTERVAL '3 weeks'),
    (gen_random_uuid(), v_business_id, 'Javier Rojas', '88880000', 'javier.r@email.com', NULL, 16, 128000, NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_business_id, 'Ricardo Méndez', '87771111', NULL, 'Prefiere citas temprano', 11, 88000, NOW() - INTERVAL '8 days'),
    (gen_random_uuid(), v_business_id, 'Alejandro Núñez', '87772222', 'alex.n@email.com', NULL, 7, 56000, NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), v_business_id, 'Sergio Ramírez', '87773333', NULL, NULL, 1, 8000, NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), v_business_id, 'Gustavo Salas', '87774444', 'gustavo.s@email.com', 'Cliente VIP', 19, 285000, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), v_business_id, 'Pablo Monge', '87775555', NULL, NULL, 6, 48000, NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_business_id, 'Esteban Arias', '87776666', 'esteban.a@email.com', 'Viene con su hijo', 9, 72000, NOW() - INTERVAL '7 days'),
    (gen_random_uuid(), v_business_id, 'Mauricio Villalobos', '87777777', NULL, NULL, 4, 32000, NOW() - INTERVAL '3 weeks'),
    (gen_random_uuid(), v_business_id, 'Alberto Quesada', '87778888', 'alberto.q@email.com', NULL, 13, 104000, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_business_id, 'Rodrigo Fonseca', '87779999', NULL, 'Prefiere barba clásica', 17, 136000, NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), v_business_id, 'Óscar Montero', '87770000', 'oscar.m@email.com', NULL, 2, 16000, NOW() - INTERVAL '2 weeks')
  RETURNING id INTO v_client_1;

  -- Get client IDs
  SELECT id INTO v_client_1 FROM clients WHERE business_id = v_business_id AND phone = '88881111';
  SELECT id INTO v_client_2 FROM clients WHERE business_id = v_business_id AND phone = '88882222';
  SELECT id INTO v_client_3 FROM clients WHERE business_id = v_business_id AND phone = '88883333';
  SELECT id INTO v_client_4 FROM clients WHERE business_id = v_business_id AND phone = '88884444';
  SELECT id INTO v_client_5 FROM clients WHERE business_id = v_business_id AND phone = '88885555';
  SELECT id INTO v_client_6 FROM clients WHERE business_id = v_business_id AND phone = '88886666';
  SELECT id INTO v_client_7 FROM clients WHERE business_id = v_business_id AND phone = '88887777';
  SELECT id INTO v_client_8 FROM clients WHERE business_id = v_business_id AND phone = '88888888';
  SELECT id INTO v_client_9 FROM clients WHERE business_id = v_business_id AND phone = '88889999';
  SELECT id INTO v_client_10 FROM clients WHERE business_id = v_business_id AND phone = '88880000';
  SELECT id INTO v_client_11 FROM clients WHERE business_id = v_business_id AND phone = '87771111';
  SELECT id INTO v_client_12 FROM clients WHERE business_id = v_business_id AND phone = '87772222';
  SELECT id INTO v_client_13 FROM clients WHERE business_id = v_business_id AND phone = '87773333';
  SELECT id INTO v_client_14 FROM clients WHERE business_id = v_business_id AND phone = '87774444';
  SELECT id INTO v_client_15 FROM clients WHERE business_id = v_business_id AND phone = '87775555';
  SELECT id INTO v_client_16 FROM clients WHERE business_id = v_business_id AND phone = '87776666';
  SELECT id INTO v_client_17 FROM clients WHERE business_id = v_business_id AND phone = '87777777';
  SELECT id INTO v_client_18 FROM clients WHERE business_id = v_business_id AND phone = '87778888';
  SELECT id INTO v_client_19 FROM clients WHERE business_id = v_business_id AND phone = '87779999';
  SELECT id INTO v_client_20 FROM clients WHERE business_id = v_business_id AND phone = '87770000';

  RAISE NOTICE '✅ 20 clients created';

  -- ============================================================
  -- 4. APPOINTMENTS (35+ across past, today, future)
  -- ============================================================
  RAISE NOTICE '📅 Creating appointments...';

  -- PAST APPOINTMENTS (12 - last 2 weeks)
  INSERT INTO appointments (business_id, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, status)
  VALUES
    (v_business_id, v_client_1, v_service_1, v_barber_1, NOW() - INTERVAL '13 days' + INTERVAL '10 hours', 30, 8000, 'completed'),
    (v_business_id, v_client_2, v_service_2, v_barber_2, NOW() - INTERVAL '12 days' + INTERVAL '14 hours', 45, 12000, 'completed'),
    (v_business_id, v_client_3, v_service_4, v_barber_1, NOW() - INTERVAL '11 days' + INTERVAL '9 hours', 40, 10000, 'completed'),
    (v_business_id, v_client_4, v_service_3, v_barber_3, NOW() - INTERVAL '10 days' + INTERVAL '15 hours', 25, 5000, 'completed'),
    (v_business_id, v_client_5, v_service_2, v_barber_4, NOW() - INTERVAL '9 days' + INTERVAL '11 hours', 45, 12000, 'no_show'),
    (v_business_id, v_client_6, v_service_1, v_barber_5, NOW() - INTERVAL '8 days' + INTERVAL '16 hours', 30, 8000, 'completed'),
    (v_business_id, v_client_7, v_service_6, v_barber_2, NOW() - INTERVAL '7 days' + INTERVAL '10 hours', 35, 15000, 'completed'),
    (v_business_id, v_client_8, v_service_7, v_barber_1, NOW() - INTERVAL '6 days' + INTERVAL '13 hours', 35, 9000, 'completed'),
    (v_business_id, v_client_9, v_service_5, v_barber_3, NOW() - INTERVAL '5 days' + INTERVAL '12 hours', 20, 5000, 'cancelled'),
    (v_business_id, v_client_10, v_service_4, v_barber_4, NOW() - INTERVAL '4 days' + INTERVAL '14 hours', 40, 10000, 'completed'),
    (v_business_id, v_client_11, v_service_8, v_barber_5, NOW() - INTERVAL '3 days' + INTERVAL '11 hours', 20, 6000, 'completed'),
    (v_business_id, v_client_12, v_service_1, v_barber_1, NOW() - INTERVAL '2 days' + INTERVAL '15 hours', 30, 8000, 'completed');

  -- TODAY'S APPOINTMENTS (8 - spread 9am to 5pm)
  INSERT INTO appointments (business_id, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, status)
  VALUES
    (v_business_id, v_client_13, v_service_1, v_barber_1, DATE_TRUNC('day', NOW()) + INTERVAL '9 hours', 30, 8000, 'confirmed'),
    (v_business_id, v_client_14, v_service_2, v_barber_2, DATE_TRUNC('day', NOW()) + INTERVAL '10 hours', 45, 12000, 'confirmed'),
    (v_business_id, v_client_15, v_service_4, v_barber_3, DATE_TRUNC('day', NOW()) + INTERVAL '11 hours 30 minutes', 40, 10000, 'pending'),
    (v_business_id, v_client_16, v_service_3, v_barber_4, DATE_TRUNC('day', NOW()) + INTERVAL '13 hours', 25, 5000, 'confirmed'),
    (v_business_id, v_client_17, v_service_10, v_barber_5, DATE_TRUNC('day', NOW()) + INTERVAL '14 hours', 60, 25000, 'confirmed'),
    (v_business_id, v_client_18, v_service_1, v_barber_1, DATE_TRUNC('day', NOW()) + INTERVAL '15 hours 30 minutes', 30, 8000, 'pending'),
    (v_business_id, v_client_19, v_service_7, v_barber_2, DATE_TRUNC('day', NOW()) + INTERVAL '16 hours 30 minutes', 35, 9000, 'pending'),
    (v_business_id, v_client_20, v_service_9, v_barber_3, DATE_TRUNC('day', NOW()) + INTERVAL '17 hours', 30, 8500, 'confirmed');

  -- FUTURE APPOINTMENTS (15 - next 7 days)
  INSERT INTO appointments (business_id, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, status)
  VALUES
    (v_business_id, v_client_1, v_service_2, v_barber_1, NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 45, 12000, 'confirmed'),
    (v_business_id, v_client_2, v_service_1, v_barber_2, NOW() + INTERVAL '1 day' + INTERVAL '14 hours', 30, 8000, 'pending'),
    (v_business_id, v_client_3, v_service_4, v_barber_3, NOW() + INTERVAL '2 days' + INTERVAL '9 hours', 40, 10000, 'confirmed'),
    (v_business_id, v_client_4, v_service_3, v_barber_4, NOW() + INTERVAL '2 days' + INTERVAL '15 hours', 25, 5000, 'pending'),
    (v_business_id, v_client_5, v_service_6, v_barber_5, NOW() + INTERVAL '3 days' + INTERVAL '11 hours', 35, 15000, 'confirmed'),
    (v_business_id, v_client_6, v_service_1, v_barber_1, NOW() + INTERVAL '3 days' + INTERVAL '16 hours', 30, 8000, 'pending'),
    (v_business_id, v_client_7, v_service_7, v_barber_2, NOW() + INTERVAL '4 days' + INTERVAL '10 hours', 35, 9000, 'confirmed'),
    (v_business_id, v_client_8, v_service_8, v_barber_3, NOW() + INTERVAL '4 days' + INTERVAL '13 hours', 20, 6000, 'pending'),
    (v_business_id, v_client_9, v_service_1, v_barber_4, NOW() + INTERVAL '5 days' + INTERVAL '9 hours', 30, 8000, 'confirmed'),
    (v_business_id, v_client_10, v_service_2, v_barber_5, NOW() + INTERVAL '5 days' + INTERVAL '14 hours', 45, 12000, 'pending'),
    (v_business_id, v_client_11, v_service_4, v_barber_1, NOW() + INTERVAL '6 days' + INTERVAL '10 hours', 40, 10000, 'confirmed'),
    (v_business_id, v_client_12, v_service_5, v_barber_2, NOW() + INTERVAL '6 days' + INTERVAL '15 hours', 20, 5000, 'pending'),
    (v_business_id, v_client_13, v_service_9, v_barber_3, NOW() + INTERVAL '7 days' + INTERVAL '11 hours', 30, 8500, 'confirmed'),
    (v_business_id, v_client_14, v_service_1, v_barber_4, NOW() + INTERVAL '7 days' + INTERVAL '16 hours', 30, 8000, 'pending'),
    (v_business_id, v_client_15, v_service_10, v_barber_5, NOW() + INTERVAL '7 days' + INTERVAL '12 hours', 60, 25000, 'confirmed');

  RAISE NOTICE '✅ 35 appointments created (12 past, 8 today, 15 future)';

  -- ============================================================
  -- 5. BUSINESS CONFIGURATION
  -- ============================================================
  RAISE NOTICE '⚙️  Updating business configuration...';

  -- Update operating hours
  UPDATE businesses SET operating_hours = '{
    "monday": {"open": "09:00", "close": "19:00"},
    "tuesday": {"open": "09:00", "close": "19:00"},
    "wednesday": {"open": "09:00", "close": "19:00"},
    "thursday": {"open": "09:00", "close": "20:00"},
    "friday": {"open": "09:00", "close": "20:00"},
    "saturday": {"open": "08:00", "close": "17:00"},
    "sunday": {"open": null, "close": null}
  }'::jsonb WHERE id = v_business_id;

  -- Complete onboarding
  INSERT INTO business_onboarding (business_id, completed, completed_at, current_step, steps_completed)
  VALUES (v_business_id, true, NOW(), 5, '{"step1": true, "step2": true, "step3": true, "step4": true, "step5": true}'::jsonb)
  ON CONFLICT (business_id) DO UPDATE SET
    completed = true,
    completed_at = NOW(),
    current_step = 5,
    steps_completed = '{"step1": true, "step2": true, "step3": true, "step4": true, "step5": true}'::jsonb;

  RAISE NOTICE '✅ Business configuration complete';

  RAISE NOTICE '🎉 SEED DATA COMPLETE!';
  RAISE NOTICE '   - 11 services';
  RAISE NOTICE '   - 5 barbers';
  RAISE NOTICE '   - 20 clients';
  RAISE NOTICE '   - 35 appointments';

END $$;

-- ============================================================
-- NEXT STEPS (manual in Supabase Dashboard):
--
-- 1. Create auth user: barbero@test.com / TestPass123!
--    Then run:
--    UPDATE barbers SET user_id = '<NEW_UUID_FROM_AUTH>'
--    WHERE email = 'juan.sanchez@barberia.cr'
--    AND business_id = '66bf2172-08b1-4afe-a47a-d1beb3ec7039';
--
-- 2. Create auth user: cliente@test.com / TestPass123!
--    Then run:
--    UPDATE clients SET user_id = '<NEW_UUID_FROM_AUTH>'
--    WHERE phone = '88881111'
--    AND business_id = '66bf2172-08b1-4afe-a47a-d1beb3ec7039';
--
-- 3. Verify data in dashboard:
--    - Services visible in /configuracion
--    - Barbers listed in /barberos
--    - Clients in /clientes
--    - Appointments in /citas (calendar view)
-- ============================================================
