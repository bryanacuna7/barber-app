-- ===========================================
-- SEED DATA - Datos de prueba realistas
-- Ejecutar en Supabase SQL Editor
-- ===========================================

-- Primero, actualizar el negocio existente con datos completos
UPDATE businesses SET
  name = 'Barbería El Patrón',
  phone = '2222-3456',
  whatsapp = '87175866',
  address = 'Avenida Central, 200m norte del Parque Central, San José',
  timezone = 'America/Costa_Rica',
  operating_hours = '{
    "mon": {"open": "08:00", "close": "19:00"},
    "tue": {"open": "08:00", "close": "19:00"},
    "wed": {"open": "08:00", "close": "19:00"},
    "thu": {"open": "08:00", "close": "19:00"},
    "fri": {"open": "08:00", "close": "20:00"},
    "sat": {"open": "09:00", "close": "17:00"},
    "sun": null
  }'::jsonb,
  booking_buffer_minutes = 10,
  advance_booking_days = 21
WHERE slug = 'barberia-test';

-- ===========================================
-- SERVICIOS - Si no existen, crearlos
-- ===========================================

-- Obtener el business_id
DO $$
DECLARE
  v_business_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses WHERE slug = 'barberia-test' LIMIT 1;

  IF v_business_id IS NOT NULL THEN
    -- Eliminar servicios existentes para empezar limpio
    DELETE FROM services WHERE business_id = v_business_id;

    -- Insertar servicios típicos de barbería
    INSERT INTO services (business_id, name, description, duration_minutes, price, display_order, is_active) VALUES
      (v_business_id, 'Corte Clásico', 'Corte tradicional con tijera o máquina, incluye lavado', 30, 8000, 1, true),
      (v_business_id, 'Corte + Barba', 'Corte de cabello más perfilado de barba con navaja', 45, 12000, 2, true),
      (v_business_id, 'Barba Completa', 'Perfilado y afeitado de barba con toalla caliente', 25, 5000, 3, true),
      (v_business_id, 'Corte Fade', 'Degradado moderno con diseño opcional', 40, 10000, 4, true),
      (v_business_id, 'Corte Niño', 'Corte para menores de 12 años', 20, 5000, 5, true),
      (v_business_id, 'Tratamiento Capilar', 'Hidratación y masaje capilar premium', 35, 15000, 6, true),
      (v_business_id, 'Corte + Cejas', 'Corte de cabello con perfilado de cejas', 35, 9000, 7, true);

    RAISE NOTICE 'Servicios insertados para %', v_business_id;
  END IF;
END $$;

-- ===========================================
-- CLIENTES DE EJEMPLO
-- ===========================================

DO $$
DECLARE
  v_business_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses WHERE slug = 'barberia-test' LIMIT 1;

  IF v_business_id IS NOT NULL THEN
    -- Solo insertar si no existen
    INSERT INTO clients (business_id, name, phone, email, notes, total_visits, total_spent, last_visit_at)
    VALUES
      (v_business_id, 'Carlos Rodríguez', '88881111', 'carlos@email.com', 'Prefiere corte fade bajo', 12, 96000, NOW() - INTERVAL '3 days'),
      (v_business_id, 'José Martínez', '88882222', 'jose@email.com', 'Cliente desde 2023', 8, 64000, NOW() - INTERVAL '7 days'),
      (v_business_id, 'Luis Hernández', '88883333', NULL, 'Alergia a algunos productos', 5, 40000, NOW() - INTERVAL '14 days'),
      (v_business_id, 'Marco Vargas', '88884444', 'marco.v@gmail.com', NULL, 3, 24000, NOW() - INTERVAL '21 days'),
      (v_business_id, 'Pedro Jiménez', '88885555', NULL, 'Siempre viene con su hijo', 15, 150000, NOW() - INTERVAL '2 days'),
      (v_business_id, 'Andrés Solano', '88886666', 'andres@work.cr', 'Ejecutivo, prefiere citas temprano', 6, 72000, NOW() - INTERVAL '5 days'),
      (v_business_id, 'Roberto Mora', '88887777', NULL, 'Barba larga, necesita tiempo extra', 4, 48000, NOW() - INTERVAL '10 days'),
      (v_business_id, 'Fernando Castro', '88888888', 'fcastro@email.com', NULL, 2, 16000, NOW() - INTERVAL '30 days')
    ON CONFLICT (business_id, phone) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      notes = EXCLUDED.notes,
      total_visits = EXCLUDED.total_visits,
      total_spent = EXCLUDED.total_spent,
      last_visit_at = EXCLUDED.last_visit_at;

    RAISE NOTICE 'Clientes insertados/actualizados para %', v_business_id;
  END IF;
END $$;

-- ===========================================
-- BARBEROS
-- ===========================================

DO $$
DECLARE
  v_business_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses WHERE slug = 'barberia-test' LIMIT 1;

  IF v_business_id IS NOT NULL THEN
    -- Insertar barberos si no existen
    INSERT INTO barbers (business_id, name, email, phone, is_active, is_owner)
    VALUES
      (v_business_id, 'Juan Carlos', 'juan@barberia.cr', '87171111', true, true),
      (v_business_id, 'Miguel Ángel', 'miguel@barberia.cr', '87172222', true, false),
      (v_business_id, 'David López', 'david@barberia.cr', '87173333', true, false)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Barberos insertados para %', v_business_id;
  END IF;
END $$;

-- ===========================================
-- CITAS DE EJEMPLO (próximos días)
-- ===========================================

DO $$
DECLARE
  v_business_id UUID;
  v_client_id UUID;
  v_service_id UUID;
  v_barber_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses WHERE slug = 'barberia-test' LIMIT 1;

  IF v_business_id IS NOT NULL THEN
    -- Obtener IDs para crear citas
    SELECT id INTO v_client_id FROM clients WHERE business_id = v_business_id AND phone = '88881111' LIMIT 1;
    SELECT id INTO v_service_id FROM services WHERE business_id = v_business_id AND name = 'Corte Clásico' LIMIT 1;
    SELECT id INTO v_barber_id FROM barbers WHERE business_id = v_business_id LIMIT 1;

    -- Eliminar citas existentes para empezar limpio
    DELETE FROM appointments WHERE business_id = v_business_id;

    -- Insertar citas para hoy y los próximos días
    IF v_client_id IS NOT NULL AND v_service_id IS NOT NULL THEN
      INSERT INTO appointments (business_id, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, status) VALUES
        -- Hoy
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '9 hours', 30, 8000, 'confirmed'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '10 hours', 30, 8000, 'pending'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '11 hours', 30, 8000, 'confirmed'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '14 hours', 45, 12000, 'confirmed'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '16 hours', 30, 8000, 'pending'),
        -- Mañana
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '9 hours', 30, 8000, 'confirmed'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '11 hours', 45, 12000, 'pending'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '15 hours', 30, 8000, 'confirmed'),
        -- Pasado mañana
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '2 days' + INTERVAL '10 hours', 30, 8000, 'pending'),
        (v_business_id, v_client_id, v_service_id, v_barber_id,
         DATE_TRUNC('day', NOW()) + INTERVAL '2 days' + INTERVAL '14 hours', 40, 10000, 'confirmed');

      RAISE NOTICE 'Citas insertadas para %', v_business_id;
    END IF;
  END IF;
END $$;

-- ===========================================
-- VERIFICACIÓN
-- ===========================================

SELECT 'Negocio' as tipo, name as detalle FROM businesses WHERE slug = 'barberia-test'
UNION ALL
SELECT 'Servicios', COUNT(*)::text FROM services s
  JOIN businesses b ON s.business_id = b.id WHERE b.slug = 'barberia-test'
UNION ALL
SELECT 'Clientes', COUNT(*)::text FROM clients c
  JOIN businesses b ON c.business_id = b.id WHERE b.slug = 'barberia-test'
UNION ALL
SELECT 'Barberos', COUNT(*)::text FROM barbers br
  JOIN businesses b ON br.business_id = b.id WHERE b.slug = 'barberia-test'
UNION ALL
SELECT 'Citas', COUNT(*)::text FROM appointments a
  JOIN businesses b ON a.business_id = b.id WHERE b.slug = 'barberia-test';
