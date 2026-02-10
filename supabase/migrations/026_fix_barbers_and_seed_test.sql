-- ========================================
-- Migration 026: Fix barbers schema + Seed test data
-- Run in Supabase Dashboard SQL Editor
-- ========================================

-- ========================================
-- PART 1: Fix barbers table (add missing columns)
-- ========================================
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'barber' CHECK (role IN ('owner', 'barber'));
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role_id UUID;

-- Copy photo_url → avatar_url if applicable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'barbers' AND column_name = 'photo_url'
  ) THEN
    UPDATE barbers SET avatar_url = photo_url WHERE avatar_url IS NULL AND photo_url IS NOT NULL;
  END IF;
END $$;

-- ========================================
-- PART 2: Seed test barber for test business
-- ========================================
INSERT INTO barbers (id, business_id, name, email, phone, role, is_active)
VALUES (
  'aaaaaaaa-0001-0001-0001-000000000001',
  'b261af68-ba0f-4f09-a957-9a3df303641d',
  'Carlos Test',
  'carlos@test-barbershop.dev',
  '88881111',
  'barber',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PART 3: Seed test client for test business
-- ========================================
INSERT INTO clients (id, business_id, name, phone, email, total_visits, total_spent)
VALUES (
  'bbbbbbbb-0001-0001-0001-000000000001',
  'b261af68-ba0f-4f09-a957-9a3df303641d',
  'María Prueba',
  '87771111',
  'maria@test.dev',
  2,
  16000
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PART 4: Seed test appointment for TODAY
-- ========================================
INSERT INTO appointments (
  id, business_id, client_id, service_id, barber_id,
  scheduled_at, duration_minutes, price, status
)
SELECT
  'cccccccc-0001-0001-0001-000000000001',
  'b261af68-ba0f-4f09-a957-9a3df303641d',
  'bbbbbbbb-0001-0001-0001-000000000001',
  s.id,
  'aaaaaaaa-0001-0001-0001-000000000001',
  -- Schedule for today at 10:00 AM local time (Costa Rica = UTC-6)
  (CURRENT_DATE + INTERVAL '16 hours')::timestamptz,
  s.duration_minutes,
  s.price,
  'pending'
FROM services s
WHERE s.business_id = 'b261af68-ba0f-4f09-a957-9a3df303641d'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert a second appointment (confirmed, ready to test "Iniciar")
INSERT INTO appointments (
  id, business_id, client_id, service_id, barber_id,
  scheduled_at, duration_minutes, price, status
)
SELECT
  'cccccccc-0001-0001-0001-000000000002',
  'b261af68-ba0f-4f09-a957-9a3df303641d',
  'bbbbbbbb-0001-0001-0001-000000000001',
  s.id,
  'aaaaaaaa-0001-0001-0001-000000000001',
  -- Schedule for today at 11:00 AM local time
  (CURRENT_DATE + INTERVAL '17 hours')::timestamptz,
  s.duration_minutes,
  s.price,
  'confirmed'
FROM services s
WHERE s.business_id = 'b261af68-ba0f-4f09-a957-9a3df303641d'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Verify results
SELECT 'barbers' as table_name, count(*) as count FROM barbers WHERE business_id = 'b261af68-ba0f-4f09-a957-9a3df303641d'
UNION ALL
SELECT 'clients', count(*) FROM clients WHERE business_id = 'b261af68-ba0f-4f09-a957-9a3df303641d'
UNION ALL
SELECT 'appointments_today', count(*) FROM appointments
WHERE business_id = 'b261af68-ba0f-4f09-a957-9a3df303641d'
AND scheduled_at::date = CURRENT_DATE;
