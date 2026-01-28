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
