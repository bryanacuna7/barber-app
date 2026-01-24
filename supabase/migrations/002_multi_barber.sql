-- BarberShop Pro - Multi-Barber Migration
-- Run this in Supabase SQL Editor

-- 1. Create Barbers Table
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if not yet registered
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);

-- 2. Create Barber Invitations Table
CREATE TABLE barber_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  UNIQUE(business_id, email)
);

-- 3. Add barber_id to Appointments
ALTER TABLE appointments ADD COLUMN barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL;
CREATE INDEX idx_appointments_barber ON appointments(barber_id);

-- 4. Update Functions & Triggers
CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Row Level Security (RLS)

ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_invitations ENABLE ROW LEVEL SECURITY;

-- Barbers: Owner can manage everything
CREATE POLICY "Owners can manage barbers"
  ON barbers FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Barbers: Barbers can view themselves and their peers in the same business
CREATE POLICY "Barbers can view business staff"
  ON barbers FOR SELECT
  USING (business_id IN (SELECT business_id FROM barbers WHERE user_id = auth.uid()));

-- Barbers: Public can view active barbers for booking
CREATE POLICY "Public can view active barbers"
  ON barbers FOR SELECT
  USING (is_active = true);

-- Invitations: Only owner can manage
CREATE POLICY "Owners can manage invitations"
  ON barber_invitations FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Appointments: Update RLS to allow barbers to see their own
CREATE POLICY "Barbers can view own appointments"
  ON appointments FOR SELECT
  USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

CREATE POLICY "Barbers can update status of own appointments"
  ON appointments FOR UPDATE
  USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()))
  WITH CHECK (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

-- 6. Add "Role" detection helper (Optional but useful)
-- This could be a view or just handled in the app logic.
