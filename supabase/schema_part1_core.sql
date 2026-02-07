-- BarberShop Pro - Initial Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- ===========================================
-- TABLES
-- ===========================================

-- Businesses (multi-tenant)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'America/Mexico_City',
  operating_hours JSONB DEFAULT '{
    "mon": {"open": "09:00", "close": "19:00"},
    "tue": {"open": "09:00", "close": "19:00"},
    "wed": {"open": "09:00", "close": "19:00"},
    "thu": {"open": "09:00", "close": "19:00"},
    "fri": {"open": "09:00", "close": "19:00"},
    "sat": {"open": "09:00", "close": "17:00"},
    "sun": null
  }',
  booking_buffer_minutes INT DEFAULT 15,
  advance_booking_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  total_visits INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  UNIQUE(business_id, phone)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  client_notes TEXT,
  internal_notes TEXT
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_clients_business ON clients(business_id);
CREATE INDEX idx_clients_phone ON clients(business_id, phone);
CREATE INDEX idx_appointments_business_date ON appointments(business_id, scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_client ON appointments(client_id);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Businesses: Owner can do everything
CREATE POLICY "Owner full access to own business"
  ON businesses FOR ALL
  USING (owner_id = auth.uid());

-- Services: Business owner can manage
CREATE POLICY "Business owner manages services"
  ON services FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Services: Public can read active services
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Clients: Business owner can manage
CREATE POLICY "Business owner manages clients"
  ON clients FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Appointments: Business owner can manage
CREATE POLICY "Business owner manages appointments"
  ON appointments FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Appointments: Public can create (for booking)
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- PUBLIC ACCESS FOR BOOKING
-- ===========================================

-- Allow public to read business info by slug
CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);
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
-- 003_branding.sql
-- Add brand customization fields to businesses table

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#27272A',
  ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- Migration: 004_admin.sql
-- Description: Create admin_users table for super admin access
-- Date: 2026-01-27

-- ============================================
-- Table: admin_users
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own admin status
CREATE POLICY "Users can check their own admin status"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- Insert initial admin (bryn.acuna7@gmail.com)
-- ============================================
-- Note: This will only work if the user already exists in auth.users
-- Run this manually in Supabase Dashboard if user doesn't exist yet:
--
-- INSERT INTO admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'bryn.acuna7@gmail.com';

DO $$
BEGIN
  INSERT INTO admin_users (user_id)
  SELECT id FROM auth.users WHERE email = 'bryn.acuna7@gmail.com'
  ON CONFLICT (user_id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not insert admin user. Run manually after user registers.';
END $$;

-- ============================================
-- Add is_active column to businesses if not exists
-- (for admin to activate/deactivate businesses)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE businesses ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
-- ============================================================================
-- Migration: 005_subscriptions.sql
-- Description: Sistema de suscripción con planes, trials y pagos manuales
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabla de planes de suscripción
-- ----------------------------------------------------------------------------
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,              -- 'basic', 'pro'
  display_name TEXT NOT NULL,             -- 'Básico', 'Pro'
  price_usd DECIMAL(10,2) NOT NULL,       -- 12.00, 29.00
  max_barbers INT,                        -- 2 para básico, NULL para ilimitado
  max_services INT,                       -- 3 para básico, NULL para ilimitado
  max_clients INT,                        -- 25 para básico, NULL para ilimitado
  has_branding BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar planes iniciales
INSERT INTO subscription_plans (name, display_name, price_usd, max_barbers, max_services, max_clients, has_branding)
VALUES
  ('basic', 'Básico', 12.00, 2, 3, 25, false),
  ('pro', 'Pro', 29.00, NULL, NULL, NULL, true);

-- ----------------------------------------------------------------------------
-- 2. Tabla de suscripciones de negocios
-- ----------------------------------------------------------------------------
CREATE TABLE business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,              -- Fecha fin del trial
  current_period_start TIMESTAMPTZ,       -- Inicio del período actual (para pagos)
  current_period_end TIMESTAMPTZ,         -- Fin del período actual
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_subscriptions_status ON business_subscriptions(status);
CREATE INDEX idx_subscriptions_trial_ends ON business_subscriptions(trial_ends_at) WHERE status = 'trial';

-- ----------------------------------------------------------------------------
-- 3. Tabla de reportes de pago (SINPE Móvil)
-- ----------------------------------------------------------------------------
CREATE TABLE payment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  amount_usd DECIMAL(10,2) NOT NULL,
  proof_url TEXT,                         -- URL del comprobante en Storage
  notes TEXT,                             -- Notas del usuario
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,                       -- Razón de rechazo si aplica
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_payments_status ON payment_reports(status);
CREATE INDEX idx_payments_business ON payment_reports(business_id);
CREATE INDEX idx_payments_created ON payment_reports(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. RLS Policies
-- ----------------------------------------------------------------------------

-- subscription_plans: lectura pública (todos pueden ver planes)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  USING (true);

-- business_subscriptions: solo el dueño del negocio puede ver
ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON business_subscriptions FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Admins pueden ver todas las suscripciones
CREATE POLICY "Admins can view all subscriptions"
  ON business_subscriptions FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- payment_reports: dueño puede crear y ver sus reportes
ALTER TABLE payment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create payment reports"
  ON payment_reports FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own payment reports"
  ON payment_reports FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Admins pueden ver y actualizar todos los pagos
CREATE POLICY "Admins can view all payments"
  ON payment_reports FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

CREATE POLICY "Admins can update payments"
  ON payment_reports FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- ----------------------------------------------------------------------------
-- 5. Función para crear trial automático al registrar negocio
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  pro_plan_id UUID;
BEGIN
  -- Obtener el ID del plan Pro
  SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'pro' LIMIT 1;

  -- Crear suscripción trial de 7 días
  INSERT INTO business_subscriptions (
    business_id,
    plan_id,
    status,
    trial_ends_at
  ) VALUES (
    NEW.id,
    pro_plan_id,
    'trial',
    now() + INTERVAL '7 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear trial al crear negocio
CREATE TRIGGER on_business_created_create_trial
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- ----------------------------------------------------------------------------
-- 6. Función para verificar y degradar trials expirados
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_and_expire_trials()
RETURNS void AS $$
DECLARE
  basic_plan_id UUID;
BEGIN
  -- Obtener el ID del plan Básico
  SELECT id INTO basic_plan_id FROM subscription_plans WHERE name = 'basic' LIMIT 1;

  -- Degradar trials expirados a básico
  UPDATE business_subscriptions
  SET
    status = 'expired',
    plan_id = basic_plan_id,
    updated_at = now()
  WHERE
    status = 'trial'
    AND trial_ends_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 7. Storage bucket para comprobantes de pago
-- ----------------------------------------------------------------------------
-- NOTA: Ejecutar esto manualmente en Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Políticas de Storage (ejecutar después de crear el bucket):
-- CREATE POLICY "Users can upload payment proofs"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'payment-proofs' AND
--     auth.uid() IN (
--       SELECT owner_id FROM businesses WHERE id::text = (storage.foldername(name))[1]
--     )
--   );

-- CREATE POLICY "Users can view own payment proofs"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'payment-proofs' AND
--     auth.uid() IN (
--       SELECT owner_id FROM businesses WHERE id::text = (storage.foldername(name))[1]
--     )
--   );

-- CREATE POLICY "Admins can view all payment proofs"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'payment-proofs' AND
--     auth.uid() IN (SELECT user_id FROM admin_users)
--   );

-- ----------------------------------------------------------------------------
-- 8. Crear suscripciones para negocios existentes (migración de datos)
-- ----------------------------------------------------------------------------
-- Negocios existentes obtienen trial de 7 días desde ahora
DO $$
DECLARE
  pro_plan_id UUID;
BEGIN
  SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'pro' LIMIT 1;

  INSERT INTO business_subscriptions (business_id, plan_id, status, trial_ends_at)
  SELECT
    b.id,
    pro_plan_id,
    'trial',
    now() + INTERVAL '7 days'
  FROM businesses b
  WHERE NOT EXISTS (
    SELECT 1 FROM business_subscriptions bs WHERE bs.business_id = b.id
  );
END $$;
-- Migration: 006_notifications.sql
-- Sistema de notificaciones para barberías y admin

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient (either business owner or admin)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Optional reference to related entity
  reference_type TEXT,  -- 'appointment', 'payment', 'subscription', etc.
  reference_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),

  -- At least one recipient must be specified
  CONSTRAINT notification_has_recipient CHECK (user_id IS NOT NULL OR business_id IS NOT NULL)
);

-- Notification types enum (documentation)
COMMENT ON COLUMN notifications.type IS '
Types for business owners:
- trial_expiring: Trial about to expire
- trial_expired: Trial has expired
- subscription_expiring: Paid subscription about to expire
- subscription_expired: Paid subscription expired
- payment_approved: Payment was approved
- payment_rejected: Payment was rejected
- new_appointment: New appointment booked
- appointment_reminder: Reminder for tomorrow appointments
- appointment_cancelled: Client cancelled appointment

Types for admins:
- new_business: New business registered
- payment_pending: New payment awaiting review
- trials_expiring_bulk: Multiple trials expiring soon
- system_alert: System error or anomaly
';

-- Indexes for efficient queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_business_id ON notifications(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Business owners can read their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Business owners can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Only system/triggers can insert notifications (service role)
-- No direct insert policy for regular users

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID DEFAULT NULL,
  p_business_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    business_id,
    type,
    title,
    message,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    p_business_id,
    p_type,
    p_title,
    p_message,
    p_reference_type,
    p_reference_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Trigger: Notify on new appointment
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
  -- Get business owner
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
      to_char(NEW.date_time AT TIME ZONE 'America/Costa_Rica', 'DD/MM a las HH:MI')
    ),
    p_reference_type := 'appointment',
    p_reference_id := NEW.id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_appointment();

-- Trigger: Notify on payment status change
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_owner_id UUID;
  v_plan_name TEXT;
BEGIN
  -- Only notify when status changes to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- Get business owner
    SELECT owner_id INTO v_business_owner_id
    FROM businesses
    WHERE id = NEW.business_id;

    -- Get plan name
    SELECT display_name INTO v_plan_name
    FROM subscription_plans
    WHERE id = NEW.plan_id;

    IF NEW.status = 'approved' THEN
      PERFORM create_notification(
        p_user_id := v_business_owner_id,
        p_business_id := NEW.business_id,
        p_type := 'payment_approved',
        p_title := 'Pago aprobado',
        p_message := format('Tu pago para el plan %s ha sido aprobado. Tu suscripción está activa.', v_plan_name),
        p_reference_type := 'payment',
        p_reference_id := NEW.id
      );
    ELSE
      PERFORM create_notification(
        p_user_id := v_business_owner_id,
        p_business_id := NEW.business_id,
        p_type := 'payment_rejected',
        p_title := 'Pago rechazado',
        p_message := format('Tu pago para el plan %s fue rechazado. %s',
          v_plan_name,
          COALESCE('Motivo: ' || NEW.admin_notes, 'Contacta soporte para más información.')
        ),
        p_reference_type := 'payment',
        p_reference_id := NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_payment_status
  AFTER UPDATE ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_status_change();

-- Trigger: Notify admin on new payment
CREATE OR REPLACE FUNCTION notify_admin_new_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
  v_business_name TEXT;
  v_plan_name TEXT;
BEGIN
  -- Get business name
  SELECT name INTO v_business_name
  FROM businesses
  WHERE id = NEW.business_id;

  -- Get plan name
  SELECT display_name INTO v_plan_name
  FROM subscription_plans
  WHERE id = NEW.plan_id;

  -- Notify all admins
  FOR v_admin IN SELECT user_id FROM admin_users LOOP
    PERFORM create_notification(
      p_user_id := v_admin.user_id,
      p_type := 'payment_pending',
      p_title := 'Nuevo pago pendiente',
      p_message := format('%s reportó un pago de $%.2f para plan %s',
        COALESCE(v_business_name, 'Un negocio'),
        NEW.amount_usd,
        v_plan_name
      ),
      p_reference_type := 'payment',
      p_reference_id := NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_payment
  AFTER INSERT ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_payment();

-- Trigger: Notify admin on new business
CREATE OR REPLACE FUNCTION notify_admin_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  -- Notify all admins
  FOR v_admin IN SELECT user_id FROM admin_users LOOP
    PERFORM create_notification(
      p_user_id := v_admin.user_id,
      p_type := 'new_business',
      p_title := 'Nuevo negocio registrado',
      p_message := format('%s se registró en la plataforma', NEW.name),
      p_reference_type := 'business',
      p_reference_id := NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_business
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_business();
-- System settings table for exchange rate and other configurations
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial exchange rate (USD to CRC)
-- Current approximate rate: 1 USD = 510 CRC
INSERT INTO system_settings (key, value)
VALUES (
  'exchange_rate',
  '{
    "usd_to_crc": 510,
    "last_updated": "2025-01-27",
    "notes": "Tipo de cambio manual - actualizar según mercado"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- USD bank account placeholder setting
INSERT INTO system_settings (key, value)
VALUES (
  'usd_bank_account',
  '{
    "enabled": false,
    "bank_name": "Banco Nacional",
    "account_number": "IBAN CR00 0000 0000 0000 0000 00",
    "account_holder": "BarberShop Pro S.A.",
    "notes": "Cuenta en dólares - próximamente"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for exchange rate display)
CREATE POLICY "Settings are viewable by everyone" ON system_settings
  FOR SELECT USING (true);

-- Only admins can update settings (via API)
CREATE POLICY "Only admins can update settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can insert settings" ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Create index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
-- WhatsApp support number setting
INSERT INTO system_settings (key, value)
VALUES (
  'support_whatsapp',
  '{
    "number": "50688888888",
    "display_number": "8888-8888",
    "message_template": "Hola! Quiero reportar mi pago para el plan {plan_name} ({price}). Adjunto mi comprobante."
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- SINPE Móvil payment details
INSERT INTO system_settings (key, value)
VALUES (
  'sinpe_details',
  '{
    "phone_number": "8888-8888",
    "account_name": "BarberShop Pro",
    "notes": "Realiza el SINPE Móvil al número indicado y sube el comprobante"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
-- Migration: 009_notification_preferences.sql
-- Description: Add notification preferences table for email/app channel control
-- Created: 2026-01-28

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Canal principal
  channel TEXT DEFAULT 'both' CHECK (channel IN ('email', 'app', 'both')),
  email_address TEXT,  -- Override email (opcional)

  -- Preferencias por tipo (business owner)
  email_trial_expiring BOOLEAN DEFAULT true,
  email_subscription_expiring BOOLEAN DEFAULT true,
  email_payment_status BOOLEAN DEFAULT true,
  email_new_appointment BOOLEAN DEFAULT true,
  email_appointment_reminder BOOLEAN DEFAULT true,

  -- Preferencias admin
  email_new_business BOOLEAN DEFAULT true,
  email_payment_pending BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_business
  ON notification_preferences(business_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Seed: Create default notification preferences for all existing businesses
INSERT INTO notification_preferences (business_id, channel)
SELECT id, 'both' FROM businesses
ON CONFLICT (business_id) DO NOTHING;

-- Comment
COMMENT ON TABLE notification_preferences IS 'Stores user preferences for notification channels (email/app/both) and which notification types to receive';
-- Migration: 010_storage_retention.sql
-- Description: Add storage retention policy for payment proofs
-- Strategy: Auto-delete approved proofs after 30 days, rejected immediately
-- Created: 2026-01-28

-- Add delete_after column to payment_reports
ALTER TABLE payment_reports ADD COLUMN IF NOT EXISTS delete_after TIMESTAMPTZ;

-- Create function to mark payments for deletion based on status
CREATE OR REPLACE FUNCTION mark_payment_for_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to approved: delete after 30 days
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    NEW.delete_after := now() + INTERVAL '30 days';

  -- When status changes to rejected: delete immediately
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.delete_after := now();

  -- If status goes back to pending, clear delete_after
  ELSIF NEW.status = 'pending' THEN
    NEW.delete_after := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic marking
DROP TRIGGER IF EXISTS trigger_mark_payment_deletion ON payment_reports;
CREATE TRIGGER trigger_mark_payment_deletion
  BEFORE UPDATE OF status ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION mark_payment_for_deletion();

-- Also mark on insert (in case status is set directly)
DROP TRIGGER IF EXISTS trigger_mark_payment_deletion_insert ON payment_reports;
CREATE TRIGGER trigger_mark_payment_deletion_insert
  BEFORE INSERT ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION mark_payment_for_deletion();

-- Mark pending payments older than 90 days for cleanup (stale)
-- This will be handled by the cron job, not a trigger

-- Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_payment_reports_delete_after
  ON payment_reports(delete_after)
  WHERE delete_after IS NOT NULL;

-- Comment
COMMENT ON COLUMN payment_reports.delete_after IS 'Timestamp when payment proof should be deleted. NULL means keep indefinitely.';
COMMENT ON FUNCTION mark_payment_for_deletion IS 'Automatically sets delete_after timestamp based on payment status changes';
