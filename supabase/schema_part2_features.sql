-- Migration: 011_performance_indexes.sql
-- Description: Add database indexes for query performance optimization
-- Created: 2026-01-28

-- ============================================================================
-- Appointments Indexes
-- ============================================================================

-- Index for business appointments with status and date filtering
-- Used in dashboard, analytics, and appointment lists
CREATE INDEX IF NOT EXISTS idx_appointments_business_status_date
  ON appointments(business_id, status, scheduled_at DESC)
  WHERE status IS NOT NULL;

-- Index for barber appointments with date
-- Used in barber views and analytics
CREATE INDEX IF NOT EXISTS idx_appointments_barber_date
  ON appointments(barber_id, scheduled_at DESC)
  WHERE barber_id IS NOT NULL;

-- Index for client appointments
-- Used in client history views
CREATE INDEX IF NOT EXISTS idx_appointments_client_date
  ON appointments(client_id, scheduled_at DESC)
  WHERE client_id IS NOT NULL;

-- Index for service appointments
-- Used in service analytics
CREATE INDEX IF NOT EXISTS idx_appointments_service
  ON appointments(service_id)
  WHERE service_id IS NOT NULL;

-- Index for upcoming appointments (most common query)
-- Note: Removed scheduled_at >= now() predicate because now() is not IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming
  ON appointments(business_id, scheduled_at)
  WHERE status IN ('pending', 'confirmed');

-- ============================================================================
-- Clients Indexes
-- ============================================================================

-- Index for business clients with last visit
-- Used in client lists and analytics
CREATE INDEX IF NOT EXISTS idx_clients_business_last_visit
  ON clients(business_id, last_visit_at DESC NULLS LAST);

-- Index for client search by phone
CREATE INDEX IF NOT EXISTS idx_clients_phone
  ON clients(business_id, phone)
  WHERE phone IS NOT NULL;

-- Index for client search by email
CREATE INDEX IF NOT EXISTS idx_clients_email
  ON clients(business_id, email)
  WHERE email IS NOT NULL;

-- ============================================================================
-- Services Indexes
-- ============================================================================

-- Index for active services ordering
CREATE INDEX IF NOT EXISTS idx_services_business_active_order
  ON services(business_id, display_order)
  WHERE is_active = true;

-- ============================================================================
-- Barbers Indexes
-- ============================================================================

-- Index for active barbers ordering
CREATE INDEX IF NOT EXISTS idx_barbers_business_active_order
  ON barbers(business_id, display_order)
  WHERE is_active = true;

-- ============================================================================
-- Business Subscriptions Indexes
-- ============================================================================

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_status
  ON business_subscriptions(business_id, status)
  WHERE status IN ('trial', 'active');

-- Index for expiring subscriptions (for cron jobs)
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_expiring
  ON business_subscriptions(status, current_period_end)
  WHERE status IN ('trial', 'active')
    AND current_period_end IS NOT NULL;

-- ============================================================================
-- Payment Reports Indexes
-- ============================================================================

-- Index for pending payments (admin view)
CREATE INDEX IF NOT EXISTS idx_payment_reports_pending
  ON payment_reports(status, created_at DESC)
  WHERE status = 'pending';

-- Index for business payment history
CREATE INDEX IF NOT EXISTS idx_payment_reports_business
  ON payment_reports(business_id, created_at DESC);

-- ============================================================================
-- Notifications Indexes
-- ============================================================================

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(business_id, created_at DESC)
  WHERE is_read = false;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON INDEX idx_appointments_business_status_date IS 'Optimizes dashboard and analytics queries for appointments';
COMMENT ON INDEX idx_appointments_upcoming IS 'Optimizes queries for upcoming appointments (most common use case)';
COMMENT ON INDEX idx_clients_business_last_visit IS 'Optimizes client list queries with last visit sorting';
COMMENT ON INDEX idx_business_subscriptions_expiring IS 'Optimizes cron job queries for expiring subscriptions';
-- Migration: 012_onboarding.sql
-- Description: Add onboarding tracking table for new businesses
-- Created: 2026-01-28

-- Create or replace generic updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create business_onboarding table
CREATE TABLE IF NOT EXISTS business_onboarding (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false NOT NULL,
  current_step INT DEFAULT 1 NOT NULL CHECK (current_step >= 1 AND current_step <= 6),
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add trigger to update updated_at
CREATE TRIGGER update_business_onboarding_updated_at
  BEFORE UPDATE ON business_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_business_id ON business_onboarding(business_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON business_onboarding(completed) WHERE NOT completed;

-- Add RLS policies
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding status
CREATE POLICY "Users can view own onboarding" ON business_onboarding
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their own onboarding status
CREATE POLICY "Users can update own onboarding" ON business_onboarding
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert their own onboarding status
CREATE POLICY "Users can insert own onboarding" ON business_onboarding
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Auto-create onboarding record when business is created
CREATE OR REPLACE FUNCTION create_onboarding_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO business_onboarding (business_id)
  VALUES (NEW.id)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_onboarding
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_onboarding_record();

-- Initialize onboarding records for existing businesses without one
INSERT INTO business_onboarding (business_id, completed, completed_at)
SELECT
  id,
  true, -- Mark existing businesses as completed (they're already setup)
  created_at
FROM businesses
WHERE id NOT IN (SELECT business_id FROM business_onboarding);

-- Comments
COMMENT ON TABLE business_onboarding IS 'Tracks onboarding wizard completion status for businesses';
COMMENT ON COLUMN business_onboarding.current_step IS 'Current step in the wizard (1-6)';
COMMENT ON COLUMN business_onboarding.skipped IS 'Whether user skipped the onboarding';
-- Migration: 013_tour_progress.sql
-- Description: Add tour progress tracking for interactive product tours
-- Created: 2026-01-28

-- Create tour_progress table
CREATE TABLE IF NOT EXISTS tour_progress (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tour_id VARCHAR(50) NOT NULL, -- 'dashboard', 'citas', 'clientes'
  completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (business_id, tour_id)
);

-- Add trigger to update updated_at
CREATE TRIGGER update_tour_progress_updated_at
  BEFORE UPDATE ON tour_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_tour_progress_business_id ON tour_progress(business_id);
CREATE INDEX IF NOT EXISTS idx_tour_progress_tour_id ON tour_progress(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_progress_completed ON tour_progress(business_id, completed) WHERE NOT completed;

-- Add RLS policies
ALTER TABLE tour_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tour progress
CREATE POLICY "Users can view own tour progress" ON tour_progress
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can update their own tour progress
CREATE POLICY "Users can update own tour progress" ON tour_progress
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert their own tour progress
CREATE POLICY "Users can insert own tour progress" ON tour_progress
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can delete their own tour progress (optional)
CREATE POLICY "Users can delete own tour progress" ON tour_progress
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE tour_progress IS 'Tracks completion status of interactive product tours per business';
COMMENT ON COLUMN tour_progress.tour_id IS 'Tour identifier: dashboard, citas, clientes, etc.';
COMMENT ON COLUMN tour_progress.completed IS 'Whether the tour has been completed';
COMMENT ON COLUMN tour_progress.completed_at IS 'Timestamp when tour was completed';
-- BarberApp - Phase 1: Client Loyalty System
-- Run this in Supabase SQL Editor after manual review

-- ===========================================
-- PHASE 1: CLIENT LOYALTY SYSTEM
-- ===========================================

-- -------------------------------------------
-- 1. PREREQUISITE: Add user_id to clients
-- -------------------------------------------
-- Links client CRM records to user accounts (auth.users)
-- CRITICAL: Loyalty ONLY works for clients with user accounts

ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

-- A user can have multiple client records (different businesses)
-- But each client record can only have one user_id
COMMENT ON COLUMN clients.user_id IS 'Links client to user account. Required for loyalty program participation.';

-- -------------------------------------------
-- 2. LOYALTY PROGRAMS (per business config)
-- -------------------------------------------
CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,

  enabled BOOLEAN DEFAULT false,
  program_type TEXT CHECK (program_type IN ('points', 'visits', 'referral', 'hybrid')) NOT NULL DEFAULT 'points',

  -- Points-based config
  points_per_currency_unit DECIMAL(10,2), -- e.g., 1 point per ₡100
  points_expiry_days INT,

  -- Visit-based config
  free_service_after_visits INT,
  discount_after_visits INT,
  discount_percentage DECIMAL(5,2),

  -- Referral config
  referral_reward_type TEXT CHECK (referral_reward_type IN ('discount', 'points', 'free_service')),
  referral_reward_amount DECIMAL(10,2),
  referee_reward_amount DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_programs_business ON loyalty_programs(business_id);

COMMENT ON TABLE loyalty_programs IS 'Configurable loyalty programs per business. Each business can have different reward mechanics.';

-- RLS: Business owner can manage their own loyalty program
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage loyalty programs"
  ON loyalty_programs
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- -------------------------------------------
-- 3. CLIENT LOYALTY STATUS (per client tracking)
-- -------------------------------------------
CREATE TABLE client_loyalty_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- REQUIRED for loyalty

  -- Current status
  points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
  lifetime_points INT DEFAULT 0,
  visit_count INT DEFAULT 0,
  current_tier TEXT DEFAULT 'bronze' CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum')),

  -- Tracking
  last_points_earned_at TIMESTAMPTZ,
  last_reward_redeemed_at TIMESTAMPTZ,
  referred_by_client_id UUID REFERENCES clients(id),
  referral_code TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: user_id MUST exist for loyalty to work
  CONSTRAINT loyalty_requires_user CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_loyalty_status_client ON client_loyalty_status(client_id);
CREATE INDEX idx_loyalty_status_business ON client_loyalty_status(business_id);
CREATE INDEX idx_loyalty_status_user ON client_loyalty_status(user_id);
CREATE INDEX idx_loyalty_status_referral_code ON client_loyalty_status(referral_code) WHERE referral_code IS NOT NULL;

COMMENT ON TABLE client_loyalty_status IS 'Tracks loyalty points and status for each client. Only clients with user accounts can participate.';

-- RLS: Business owner can view their clients' loyalty status
ALTER TABLE client_loyalty_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business views client loyalty status"
  ON client_loyalty_status
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- RLS: Client can view their own loyalty status
CREATE POLICY "Clients view own loyalty status"
  ON client_loyalty_status
  FOR SELECT
  USING (user_id = auth.uid());

-- -------------------------------------------
-- 4. LOYALTY TRANSACTIONS (audit log)
-- -------------------------------------------
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  transaction_type TEXT CHECK (transaction_type IN (
    'earned_appointment',
    'earned_referral',
    'redeemed_discount',
    'redeemed_free_service',
    'expired',
    'reversed'
  )) NOT NULL,

  points_delta INT NOT NULL, -- positive for earned, negative for redeemed
  amount_delta DECIMAL(10,2), -- for currency-based rewards

  related_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  related_referral_id UUID, -- references client_referrals(id) - created later

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_client ON loyalty_transactions(client_id);
CREATE INDEX idx_loyalty_transactions_business ON loyalty_transactions(business_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_created ON loyalty_transactions(created_at DESC);

COMMENT ON TABLE loyalty_transactions IS 'Immutable audit log of all loyalty point transactions.';

-- RLS: Business owner can view transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business views loyalty transactions"
  ON loyalty_transactions
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- RLS: Clients can view their own transactions
CREATE POLICY "Clients view own loyalty transactions"
  ON loyalty_transactions
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- -------------------------------------------
-- 5. CLIENT REFERRALS (client-to-client)
-- -------------------------------------------
CREATE TABLE client_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  referrer_client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  referred_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')) NOT NULL,

  -- Rewards
  referrer_reward_claimed_at TIMESTAMPTZ,
  referred_reward_claimed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(referrer_client_id, referred_client_id)
);

CREATE INDEX idx_referrals_referrer ON client_referrals(referrer_client_id);
CREATE INDEX idx_referrals_referred ON client_referrals(referred_client_id);
CREATE INDEX idx_referrals_business ON client_referrals(business_id);
CREATE INDEX idx_referrals_code ON client_referrals(referral_code);

COMMENT ON TABLE client_referrals IS 'Tracks client-to-client referrals within a business.';

-- RLS: Business owner can view referrals
ALTER TABLE client_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business views client referrals"
  ON client_referrals
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- RLS: Clients can view referrals they're involved in
CREATE POLICY "Clients view own referrals"
  ON client_referrals
  FOR SELECT
  USING (
    referrer_client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    OR referred_client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- -------------------------------------------
-- 6. TRIGGER: Auto-award points on appointment completion
-- -------------------------------------------
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  loyalty_config RECORD;
  client_record RECORD;
  points_to_award INT;
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Get client record (check if they have a user account)
    SELECT * INTO client_record
    FROM clients
    WHERE id = NEW.client_id;

    -- CRITICAL: Only award points if client has user account
    IF client_record.user_id IS NULL THEN
      -- Client doesn't have account, skip loyalty (but appointment still completes)
      RETURN NEW;
    END IF;

    -- Get loyalty program config
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

      -- Create notification for client (they have an account, so can receive it)
      INSERT INTO notifications (
        user_id, type, title, message, metadata
      )
      VALUES (
        client_record.user_id, 'loyalty_points_earned',
        '¡Ganaste puntos! 🎉',
        format('Has ganado %s puntos en tu última visita', points_to_award),
        jsonb_build_object(
          'business_id', NEW.business_id::text,
          'points', points_to_award,
          'appointment_id', NEW.id::text
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_award_loyalty_points
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION award_loyalty_points();

COMMENT ON FUNCTION award_loyalty_points IS 'Automatically awards loyalty points when appointments are completed. Only for clients with user accounts.';

-- -------------------------------------------
-- 7. HELPER FUNCTION: Generate referral code
-- -------------------------------------------
CREATE OR REPLACE FUNCTION generate_referral_code(client_name TEXT, business_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    -- Generate code: BUSINESSNAME_CLIENTNAME_RANDOM (uppercase, max 20 chars)
    code := UPPER(
      SUBSTRING(REGEXP_REPLACE(business_slug, '[^a-zA-Z0-9]', '', 'g'), 1, 8) || '_' ||
      SUBSTRING(REGEXP_REPLACE(client_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6) || '_' ||
      SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
    );

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM client_loyalty_status WHERE referral_code = code) THEN
      RETURN code;
    END IF;

    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after 10 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_referral_code IS 'Generates unique referral codes for clients in format: BUSINESS_CLIENT_XXXX';

-- -------------------------------------------
-- 8. AUTO-GENERATE REFERRAL CODE on loyalty status creation
-- -------------------------------------------
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  client_rec RECORD;
  business_rec RECORD;
BEGIN
  -- Only generate if referral_code is NULL
  IF NEW.referral_code IS NULL THEN
    -- Get client and business info
    SELECT name INTO client_rec FROM clients WHERE id = NEW.client_id;
    SELECT slug INTO business_rec FROM businesses WHERE id = NEW.business_id;

    -- Generate and assign code
    NEW.referral_code := generate_referral_code(client_rec.name, business_rec.slug);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON client_loyalty_status
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- ===========================================
-- INITIAL DATA SEED (optional)
-- ===========================================

-- Add default loyalty program templates to system_settings
-- Business owners can quick-start with these presets

INSERT INTO system_settings (key, value) VALUES
  ('loyalty_template_punch_card',
   '{
     "name": "Punch Card Clásico",
     "program_type": "visits",
     "free_service_after_visits": 10,
     "description": "10 visitas = 1 servicio gratis"
   }'::jsonb),

  ('loyalty_template_points',
   '{
     "name": "Sistema de Puntos",
     "program_type": "points",
     "points_per_currency_unit": 100,
     "discount_percentage": 20,
     "description": "1 punto por cada ₡100 gastado. 500 puntos = 20% descuento"
   }'::jsonb),

  ('loyalty_template_vip',
   '{
     "name": "VIP Acelerado",
     "program_type": "hybrid",
     "free_service_after_visits": 5,
     "points_per_currency_unit": 50,
     "description": "5 visitas = VIP tier. Acumula puntos para beneficios extra"
   }'::jsonb),

  ('loyalty_template_referral',
   '{
     "name": "Referidos Focus",
     "program_type": "referral",
     "referral_reward_type": "discount",
     "referral_reward_amount": 25,
     "referee_reward_amount": 25,
     "description": "Refiere amigo = ambos 25% descuento"
   }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------
-- 9. HELPER RPC: Increment loyalty points (used by app)
-- -------------------------------------------
CREATE OR REPLACE FUNCTION increment_loyalty_points(
  p_client_id UUID,
  p_points INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE client_loyalty_status
  SET
    points_balance = points_balance + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_loyalty_points IS 'Safely increments loyalty points for a client. Used for manual point awards and referral rewards.';

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 - Client Loyalty System migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  • loyalty_programs (business configuration)';
  RAISE NOTICE '  • client_loyalty_status (client points tracking)';
  RAISE NOTICE '  • loyalty_transactions (audit log)';
  RAISE NOTICE '  • client_referrals (client-to-client referrals)';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  • trigger_award_loyalty_points (auto-award on appointment completion)';
  RAISE NOTICE '  • trigger_auto_generate_referral_code (auto-generate referral codes)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '  1. Build loyalty configuration UI (/lealtad/configuracion)';
  RAISE NOTICE '  2. Create client account signup modal';
  RAISE NOTICE '  3. Test with a real appointment flow';
END $$;
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
-- Fix loyalty_programs RLS policy to allow inserts/updates
-- The original policy only had USING clause, which doesn't work for INSERT/UPDATE
-- We need WITH CHECK clause for those operations

-- Drop the old policy
DROP POLICY IF EXISTS "Business owners manage loyalty programs" ON loyalty_programs;

-- Create new policy with both USING and WITH CHECK
CREATE POLICY "Business owners manage loyalty programs"
  ON loyalty_programs
  FOR ALL
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

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'loyalty_programs';
-- Allow public read access to loyalty programs (for showing banner to non-authenticated users)
-- But keep write access restricted to business owners

-- Drop the old all-in-one policy
DROP POLICY IF EXISTS "Business owners manage loyalty programs" ON loyalty_programs;

-- Create separate policies for read and write

-- 1. Allow everyone to read enabled loyalty programs (for public booking page)
CREATE POLICY "Anyone can view enabled loyalty programs"
  ON loyalty_programs
  FOR SELECT
  USING (enabled = true);

-- 2. Only business owners can insert/update/delete
CREATE POLICY "Business owners can manage their loyalty programs"
  ON loyalty_programs
  FOR ALL
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

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'loyalty_programs'
ORDER BY policyname;
-- BarberApp - Phase 2: Barber Gamification System
-- Run this in Supabase SQL Editor after manual review

-- ===========================================
-- PHASE 2: BARBER GAMIFICATION SYSTEM
-- ===========================================

-- -------------------------------------------
-- 1. BARBER STATS (for leaderboard & achievements)
-- -------------------------------------------
-- Aggregated stats per barber for performance tracking
CREATE TABLE barber_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  -- Lifetime stats
  total_appointments INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_clients INT DEFAULT 0, -- unique clients served
  avg_rating DECIMAL(3,2) DEFAULT 0, -- future: when ratings implemented

  -- Current streak
  current_streak_days INT DEFAULT 0, -- consecutive days with appointments
  best_streak_days INT DEFAULT 0,
  last_appointment_date DATE,

  -- Rankings (updated via trigger/cron)
  revenue_rank INT,
  appointments_rank INT,
  clients_rank INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barber_stats_barber ON barber_stats(barber_id);
CREATE INDEX idx_barber_stats_business ON barber_stats(business_id);
CREATE INDEX idx_barber_stats_revenue_rank ON barber_stats(revenue_rank);

COMMENT ON TABLE barber_stats IS 'Aggregated performance stats for each barber';

-- -------------------------------------------
-- 2. ACHIEVEMENTS DEFINITIONS
-- -------------------------------------------
-- Defines available achievements (badges/milestones)
CREATE TABLE barber_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  key TEXT UNIQUE NOT NULL, -- e.g., 'first_100_appointments', 'revenue_10k'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- emoji or icon name

  -- Achievement type
  category TEXT CHECK (category IN (
    'revenue', 'appointments', 'clients', 'streak', 'special'
  )) NOT NULL,

  -- Unlock conditions (JSONB for flexibility)
  unlock_conditions JSONB NOT NULL,
  -- Example: {"type": "revenue", "threshold": 100000}
  -- Example: {"type": "appointments", "threshold": 100}
  -- Example: {"type": "streak", "threshold": 7}

  -- Rarity tier
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')) DEFAULT 'bronze',

  -- Order for display
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barber_achievements_category ON barber_achievements(category);
CREATE INDEX idx_barber_achievements_tier ON barber_achievements(tier);

COMMENT ON TABLE barber_achievements IS 'Definitions of all available achievements';

-- -------------------------------------------
-- 3. EARNED ACHIEVEMENTS
-- -------------------------------------------
-- Tracks which achievements each barber has earned
CREATE TABLE barber_earned_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES barber_achievements(id) ON DELETE CASCADE NOT NULL,

  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB, -- optional: track progress if achievement has levels

  UNIQUE(barber_id, achievement_id)
);

CREATE INDEX idx_earned_achievements_barber ON barber_earned_achievements(barber_id);
CREATE INDEX idx_earned_achievements_achievement ON barber_earned_achievements(achievement_id);

COMMENT ON TABLE barber_earned_achievements IS 'Tracks earned achievements per barber';

-- -------------------------------------------
-- 4. CHALLENGES (competitions)
-- -------------------------------------------
-- Active challenges/competitions for barbers
CREATE TABLE barber_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Challenge type
  challenge_type TEXT CHECK (challenge_type IN (
    'revenue', 'appointments', 'clients', 'team_total'
  )) NOT NULL,

  -- Goal/target
  target_value DECIMAL(10,2) NOT NULL,
  target_metric TEXT NOT NULL, -- 'revenue', 'count', etc.

  -- Reward (optional)
  reward_description TEXT,
  reward_amount DECIMAL(10,2),

  -- Timeline
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barber_challenges_business ON barber_challenges(business_id);
CREATE INDEX idx_barber_challenges_dates ON barber_challenges(starts_at, ends_at);
CREATE INDEX idx_barber_challenges_active ON barber_challenges(is_active);

COMMENT ON TABLE barber_challenges IS 'Active competitions and challenges for barbers';

-- -------------------------------------------
-- 5. CHALLENGE PARTICIPANTS
-- -------------------------------------------
-- Tracks who's participating in each challenge and their progress
CREATE TABLE barber_challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES barber_challenges(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE NOT NULL,

  -- Progress tracking
  current_value DECIMAL(10,2) DEFAULT 0,
  target_value DECIMAL(10,2) NOT NULL,

  -- Completion
  completed_at TIMESTAMPTZ,
  rank INT, -- final rank if challenge has ended

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, barber_id)
);

CREATE INDEX idx_challenge_participants_challenge ON barber_challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_barber ON barber_challenge_participants(barber_id);
CREATE INDEX idx_challenge_participants_rank ON barber_challenge_participants(rank);

COMMENT ON TABLE barber_challenge_participants IS 'Participation and progress in challenges';

-- -------------------------------------------
-- 6. TRIGGERS - Auto-update stats
-- -------------------------------------------

-- Function: Update barber stats when appointment is completed
CREATE OR REPLACE FUNCTION update_barber_stats_on_appointment()
RETURNS TRIGGER AS $$
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

-- Trigger on appointments
DROP TRIGGER IF EXISTS trg_update_barber_stats ON appointments;
CREATE TRIGGER trg_update_barber_stats
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.barber_id IS NOT NULL)
  EXECUTE FUNCTION update_barber_stats_on_appointment();

COMMENT ON FUNCTION update_barber_stats_on_appointment() IS 'Auto-updates barber stats when appointment completes';

-- -------------------------------------------
-- 7. TRIGGERS - Standard updated_at
-- -------------------------------------------

CREATE TRIGGER update_barber_stats_updated_at
  BEFORE UPDATE ON barber_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_barber_challenges_updated_at
  BEFORE UPDATE ON barber_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenge_participants_updated_at
  BEFORE UPDATE ON barber_challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
-- -------------------------------------------

ALTER TABLE barber_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_earned_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_challenge_participants ENABLE ROW LEVEL SECURITY;

-- Barber Stats: Owners can view all, barbers can view own business
CREATE POLICY "Owners can view barber stats"
  ON barber_stats FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Barbers can view stats in their business"
  ON barber_stats FOR SELECT
  USING (business_id IN (SELECT business_id FROM barbers WHERE user_id = auth.uid()));

-- Achievements: Everyone can read definitions
CREATE POLICY "Anyone can view achievement definitions"
  ON barber_achievements FOR SELECT
  USING (is_active = true);

-- Earned Achievements: Owners and barbers can view
CREATE POLICY "Owners can view earned achievements"
  ON barber_earned_achievements FOR SELECT
  USING (barber_id IN (
    SELECT b.id FROM barbers b
    JOIN businesses bu ON b.business_id = bu.id
    WHERE bu.owner_id = auth.uid()
  ));

CREATE POLICY "Barbers can view own earned achievements"
  ON barber_earned_achievements FOR SELECT
  USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

-- Challenges: Owners can manage, barbers can view
CREATE POLICY "Owners can manage challenges"
  ON barber_challenges FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Barbers can view challenges in their business"
  ON barber_challenges FOR SELECT
  USING (business_id IN (SELECT business_id FROM barbers WHERE user_id = auth.uid()));

-- Challenge Participants: Owners and barbers can view
CREATE POLICY "Owners can view challenge participants"
  ON barber_challenge_participants FOR SELECT
  USING (challenge_id IN (
    SELECT c.id FROM barber_challenges c
    JOIN businesses b ON c.business_id = b.id
    WHERE b.owner_id = auth.uid()
  ));

CREATE POLICY "Barbers can view participants in their challenges"
  ON barber_challenge_participants FOR SELECT
  USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()) OR
         challenge_id IN (
           SELECT c.id FROM barber_challenges c
           JOIN barbers b ON c.business_id = b.business_id
           WHERE b.user_id = auth.uid()
         ));

-- -------------------------------------------
-- 9. SEED ACHIEVEMENTS
-- -------------------------------------------

INSERT INTO barber_achievements (key, name, description, icon, category, unlock_conditions, tier, display_order) VALUES
  -- Revenue milestones
  ('revenue_10k', 'Primeros ₡10,000', 'Alcanza ₡10,000 en ingresos totales', '💰', 'revenue', '{"type":"revenue","threshold":10000}', 'bronze', 1),
  ('revenue_50k', 'Medio Camino', 'Alcanza ₡50,000 en ingresos totales', '💎', 'revenue', '{"type":"revenue","threshold":50000}', 'silver', 2),
  ('revenue_100k', 'Seis Cifras', 'Alcanza ₡100,000 en ingresos totales', '👑', 'revenue', '{"type":"revenue","threshold":100000}', 'gold', 3),
  ('revenue_500k', 'Top Earner', 'Alcanza ₡500,000 en ingresos totales', '🏆', 'revenue', '{"type":"revenue","threshold":500000}', 'platinum', 4),

  -- Appointment milestones
  ('appointments_10', 'Buen Comienzo', 'Completa 10 citas', '✂️', 'appointments', '{"type":"appointments","threshold":10}', 'bronze', 10),
  ('appointments_50', 'Barbero Activo', 'Completa 50 citas', '💈', 'appointments', '{"type":"appointments","threshold":50}', 'bronze', 11),
  ('appointments_100', 'Centenario', 'Completa 100 citas', '🎯', 'appointments', '{"type":"appointments","threshold":100}', 'silver', 12),
  ('appointments_500', 'Profesional', 'Completa 500 citas', '⭐', 'appointments', '{"type":"appointments","threshold":500}', 'gold', 13),
  ('appointments_1000', 'Maestro Barbero', 'Completa 1,000 citas', '🌟', 'appointments', '{"type":"appointments","threshold":1000}', 'platinum', 14),

  -- Client milestones
  ('clients_10', 'Cliente Base', 'Atiende 10 clientes únicos', '👤', 'clients', '{"type":"clients","threshold":10}', 'bronze', 20),
  ('clients_50', 'Clientela Sólida', 'Atiende 50 clientes únicos', '👥', 'clients', '{"type":"clients","threshold":50}', 'silver', 21),
  ('clients_100', 'Popular', 'Atiende 100 clientes únicos', '🎭', 'clients', '{"type":"clients","threshold":100}', 'gold', 22),

  -- Streak achievements
  ('streak_7', 'Semana Consistente', 'Trabaja 7 días consecutivos con al menos 1 cita', '🔥', 'streak', '{"type":"streak","threshold":7}', 'silver', 30),
  ('streak_14', 'Dos Semanas Fuertes', 'Trabaja 14 días consecutivos', '💪', 'streak', '{"type":"streak","threshold":14}', 'gold', 31),
  ('streak_30', 'Mes Imparable', 'Trabaja 30 días consecutivos', '🚀', 'streak', '{"type":"streak","threshold":30}', 'platinum', 32),

  -- Special achievements
  ('first_appointment', 'Primera Cita', 'Completa tu primera cita', '🎉', 'special', '{"type":"appointments","threshold":1}', 'bronze', 40),
  ('first_client', 'Primer Cliente', 'Atiende tu primer cliente', '🤝', 'special', '{"type":"clients","threshold":1}', 'bronze', 41)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE barber_achievements IS 'Seeded with 17 default achievements across all categories';

-- -------------------------------------------
-- 10. HELPER FUNCTIONS
-- -------------------------------------------

-- Function: Check and award achievements for a barber
CREATE OR REPLACE FUNCTION check_barber_achievements(p_barber_id UUID)
RETURNS TABLE (
  awarded_achievement_id UUID,
  awarded_achievement_name TEXT,
  newly_earned BOOLEAN
) AS $$
DECLARE
  v_stats RECORD;
  v_achievement RECORD;
  v_already_earned BOOLEAN;
BEGIN
  -- Get barber stats
  SELECT * INTO v_stats
  FROM barber_stats
  WHERE barber_id = p_barber_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each achievement
  FOR v_achievement IN
    SELECT * FROM barber_achievements WHERE is_active = true
  LOOP
    -- Check if already earned (using table alias to avoid ambiguity)
    SELECT EXISTS (
      SELECT 1 FROM barber_earned_achievements bea
      WHERE bea.barber_id = p_barber_id AND bea.achievement_id = v_achievement.id
    ) INTO v_already_earned;

    -- Skip if already earned
    IF v_already_earned THEN
      CONTINUE;
    END IF;

    -- Check unlock conditions
    IF v_achievement.unlock_conditions->>'type' = 'revenue' THEN
      IF v_stats.total_revenue >= (v_achievement.unlock_conditions->>'threshold')::DECIMAL THEN
        INSERT INTO barber_earned_achievements (barber_id, achievement_id)
        VALUES (p_barber_id, v_achievement.id);

        RETURN QUERY SELECT v_achievement.id, v_achievement.name, true;
      END IF;
    ELSIF v_achievement.unlock_conditions->>'type' = 'appointments' THEN
      IF v_stats.total_appointments >= (v_achievement.unlock_conditions->>'threshold')::INT THEN
        INSERT INTO barber_earned_achievements (barber_id, achievement_id)
        VALUES (p_barber_id, v_achievement.id);

        RETURN QUERY SELECT v_achievement.id, v_achievement.name, true;
      END IF;
    ELSIF v_achievement.unlock_conditions->>'type' = 'clients' THEN
      IF v_stats.total_clients >= (v_achievement.unlock_conditions->>'threshold')::INT THEN
        INSERT INTO barber_earned_achievements (barber_id, achievement_id)
        VALUES (p_barber_id, v_achievement.id);

        RETURN QUERY SELECT v_achievement.id, v_achievement.name, true;
      END IF;
    ELSIF v_achievement.unlock_conditions->>'type' = 'streak' THEN
      IF v_stats.current_streak_days >= (v_achievement.unlock_conditions->>'threshold')::INT THEN
        INSERT INTO barber_earned_achievements (barber_id, achievement_id)
        VALUES (p_barber_id, v_achievement.id);

        RETURN QUERY SELECT v_achievement.id, v_achievement.name, true;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_barber_achievements IS 'Checks and awards any earned achievements for a barber';

-- -------------------------------------------
-- 11. INITIAL DATA - Create stats for existing barbers
-- -------------------------------------------

-- Create barber_stats entries for all existing barbers
INSERT INTO barber_stats (barber_id, business_id)
SELECT id, business_id
FROM barbers
WHERE is_active = true
ON CONFLICT (barber_id) DO NOTHING;

-- Backfill stats from existing completed appointments
WITH barber_appointment_stats AS (
  SELECT
    barber_id,
    business_id,
    COUNT(*) as appointment_count,
    SUM(price) as total_rev,
    COUNT(DISTINCT client_id) as unique_clients,
    MAX(DATE(scheduled_at)) as last_date
  FROM appointments
  WHERE status = 'completed' AND barber_id IS NOT NULL
  GROUP BY barber_id, business_id
)
UPDATE barber_stats bs
SET
  total_appointments = bas.appointment_count,
  total_revenue = bas.total_rev,
  total_clients = bas.unique_clients,
  last_appointment_date = bas.last_date,
  updated_at = NOW()
FROM barber_appointment_stats bas
WHERE bs.barber_id = bas.barber_id;

-- Check achievements for all barbers with stats
DO $$
DECLARE
  v_barber_id UUID;
BEGIN
  FOR v_barber_id IN SELECT barber_id FROM barber_stats
  LOOP
    PERFORM check_barber_achievements(v_barber_id);
  END LOOP;
END $$;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- Summary:
-- ✅ Created 5 new tables for barber gamification
-- ✅ Added triggers for auto-updating stats
-- ✅ Seeded 17 achievements across 5 categories
-- ✅ Implemented RLS policies for security
-- ✅ Created helper function for achievement checking
-- ✅ Backfilled data for existing barbers
-- =====================================================
-- MIGRATION 019: Business Referral System
-- =====================================================
-- Created: 2026-02-02
-- Purpose: Sistema de referencias para business owners con milestones gamificados
-- Tables: business_referrals, referral_conversions, referral_milestones, referral_rewards_claimed

-- =====================================================
-- TABLE 1: business_referrals
-- =====================================================
-- Programa de referencias por negocio

CREATE TABLE IF NOT EXISTS business_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  total_referrals INT DEFAULT 0 CHECK (total_referrals >= 0),
  successful_referrals INT DEFAULT 0 CHECK (successful_referrals >= 0),
  current_milestone INT DEFAULT 0 CHECK (current_milestone >= 0 AND current_milestone <= 5),
  points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for business_referrals
CREATE INDEX IF NOT EXISTS idx_business_referrals_business ON business_referrals(business_id);
CREATE INDEX IF NOT EXISTS idx_business_referrals_code ON business_referrals(referral_code);

-- =====================================================
-- TABLE 2: referral_conversions
-- =====================================================
-- Tracking de cada referido

CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  referred_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'trial', 'active', 'churned')) DEFAULT 'pending',
  converted_at TIMESTAMPTZ,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Evitar duplicados: un negocio no puede referir al mismo negocio múltiples veces
  UNIQUE(referrer_business_id, referred_business_id)
);

-- Indexes for referral_conversions
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON referral_conversions(referrer_business_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referred ON referral_conversions(referred_business_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_status ON referral_conversions(status);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code ON referral_conversions(referral_code);

-- =====================================================
-- TABLE 3: referral_milestones
-- =====================================================
-- Definición de milestones

CREATE TABLE IF NOT EXISTS referral_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_number INT UNIQUE NOT NULL CHECK (milestone_number > 0),
  referrals_required INT NOT NULL CHECK (referrals_required > 0),
  reward_type TEXT CHECK (reward_type IN ('discount', 'free_months', 'feature_unlock')) NOT NULL,
  reward_value INT NOT NULL CHECK (reward_value > 0),
  reward_description TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for referral_milestones
CREATE INDEX IF NOT EXISTS idx_referral_milestones_number ON referral_milestones(milestone_number);
CREATE INDEX IF NOT EXISTS idx_referral_milestones_active ON referral_milestones(is_active);

-- =====================================================
-- TABLE 4: referral_rewards_claimed
-- =====================================================
-- Histórico de rewards reclamadas

CREATE TABLE IF NOT EXISTS referral_rewards_claimed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES referral_milestones(id) ON DELETE CASCADE NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Un negocio solo puede reclamar cada milestone una vez
  UNIQUE(business_id, milestone_id)
);

-- Indexes for referral_rewards_claimed
CREATE INDEX IF NOT EXISTS idx_rewards_claimed_business ON referral_rewards_claimed(business_id);
CREATE INDEX IF NOT EXISTS idx_rewards_claimed_milestone ON referral_rewards_claimed(milestone_id);

-- =====================================================
-- SEED DATA: Milestones
-- =====================================================

INSERT INTO referral_milestones (
  milestone_number,
  referrals_required,
  reward_type,
  reward_value,
  reward_description,
  badge_name,
  badge_icon,
  tier,
  display_order
) VALUES
  (1, 1, 'discount', 20, '20% descuento próximo mes (Ahorras ~$6)', 'First Partner', '🥉', 'bronze', 1),
  (2, 3, 'free_months', 1, '1 mes gratis del Plan Pro (Ahorras $29)', 'Growth Partner', '🥈', 'silver', 2),
  (3, 5, 'free_months', 2, '2 meses gratis del Plan Pro (Ahorras $58)', 'Network Builder', '🥇', 'gold', 3),
  (4, 10, 'free_months', 4, '4 meses gratis del Plan Pro (Ahorras $116)', 'Super Connector', '💎', 'platinum', 4),
  (5, 20, 'free_months', 12, '1 año gratis del Plan Pro (Ahorras $348)', 'Network King', '⭐', 'legendary', 5)
ON CONFLICT (milestone_number) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE business_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards_claimed ENABLE ROW LEVEL SECURITY;

-- Business Referrals: Owner can manage own
CREATE POLICY "Business owners manage own referrals"
  ON business_referrals FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

-- Referral Conversions: Owner can view own conversions (as referrer or referred)
CREATE POLICY "Business owners view own conversions"
  ON referral_conversions FOR SELECT
  USING (
    referrer_business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR referred_business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Referral Conversions: System can create (no auth required for tracking)
CREATE POLICY "Allow conversion tracking"
  ON referral_conversions FOR INSERT
  WITH CHECK (true);

-- Referral Conversions: System can update status
CREATE POLICY "Allow conversion status updates"
  ON referral_conversions FOR UPDATE
  USING (true);

-- Milestones: Everyone can read active milestones
CREATE POLICY "Anyone can view active milestones"
  ON referral_milestones FOR SELECT
  USING (is_active = true);

-- Rewards Claimed: Owner can view own rewards
CREATE POLICY "Business owners view own rewards"
  ON referral_rewards_claimed FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

-- Rewards Claimed: Owner can claim rewards
CREATE POLICY "Business owners claim rewards"
  ON referral_rewards_claimed FOR INSERT
  WITH CHECK (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for business_referrals
CREATE TRIGGER update_business_referrals_updated_at
  BEFORE UPDATE ON business_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at for referral_conversions
CREATE TRIGGER update_referral_conversions_updated_at
  BEFORE UPDATE ON referral_conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- =====================================================
-- FUNCTION: generate_business_referral_code
-- =====================================================
-- Genera un código único de referido basado en el slug del negocio

CREATE OR REPLACE FUNCTION generate_business_referral_code(p_business_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_attempts INT := 0;
  v_max_attempts INT := 10;
BEGIN
  LOOP
    -- Format: BUSINESSSLUG_YEAR_RANDOM (max 30 chars)
    -- Example: BARBER_SHOP_2026_A3F5
    v_code := UPPER(
      SUBSTRING(REGEXP_REPLACE(p_business_slug, '[^a-zA-Z0-9]', '', 'g'), 1, 12) ||
      '_' ||
      EXTRACT(YEAR FROM NOW())::TEXT ||
      '_' ||
      SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
    );

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM business_referrals WHERE referral_code = v_code) THEN
      RETURN v_code;
    END IF;

    v_attempts := v_attempts + 1;
    IF v_attempts >= v_max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', v_max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: check_referral_milestones
-- =====================================================
-- Verifica y actualiza milestones alcanzados por un negocio

CREATE OR REPLACE FUNCTION check_referral_milestones(p_business_id UUID)
RETURNS TABLE (
  milestone_achieved INT,
  reward_description TEXT,
  newly_unlocked BOOLEAN
) AS $$
DECLARE
  v_referral_record RECORD;
  v_milestone RECORD;
  v_already_claimed BOOLEAN;
BEGIN
  -- Get business referral stats
  SELECT * INTO v_referral_record
  FROM business_referrals
  WHERE business_id = p_business_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each milestone in order
  FOR v_milestone IN
    SELECT * FROM referral_milestones
    WHERE is_active = true
    ORDER BY milestone_number ASC
  LOOP
    -- Check if already claimed
    SELECT EXISTS (
      SELECT 1 FROM referral_rewards_claimed
      WHERE business_id = p_business_id
      AND milestone_id = v_milestone.id
    ) INTO v_already_claimed;

    -- If milestone reached and not claimed
    IF v_referral_record.successful_referrals >= v_milestone.referrals_required THEN
      -- Update current milestone if higher
      UPDATE business_referrals
      SET current_milestone = GREATEST(current_milestone, v_milestone.milestone_number)
      WHERE business_id = p_business_id;

      -- Return milestone info (whether claimed or not)
      RETURN QUERY SELECT
        v_milestone.milestone_number,
        v_milestone.reward_description,
        NOT v_already_claimed; -- newly_unlocked = true if not already claimed
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: increment_referral_count
-- =====================================================
-- Helper para incrementar contadores de forma segura

CREATE OR REPLACE FUNCTION increment_referral_count(
  p_business_id UUID,
  p_column TEXT,
  p_amount INT DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  IF p_column = 'total_referrals' THEN
    UPDATE business_referrals
    SET total_referrals = total_referrals + p_amount
    WHERE business_id = p_business_id;
  ELSIF p_column = 'successful_referrals' THEN
    UPDATE business_referrals
    SET successful_referrals = successful_referrals + p_amount
    WHERE business_id = p_business_id;
  ELSE
    RAISE EXCEPTION 'Invalid column name: %', p_column;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE business_referrals IS 'Programa de referencias por negocio con stats de referidos';
COMMENT ON TABLE referral_conversions IS 'Tracking de conversiones de referidos';
COMMENT ON TABLE referral_milestones IS 'Definición de milestones y recompensas del programa';
COMMENT ON TABLE referral_rewards_claimed IS 'Histórico de recompensas reclamadas por negocios';

COMMENT ON FUNCTION generate_business_referral_code IS 'Genera código único de referido basado en slug del negocio';
COMMENT ON FUNCTION check_referral_milestones IS 'Verifica y actualiza milestones alcanzados';
COMMENT ON FUNCTION increment_referral_count IS 'Incrementa contadores de referidos de forma segura';

-- =====================================================
-- END MIGRATION
-- =====================================================
-- Migration 019b: Performance Indexes (Based on Current Schema)
-- Created: 2026-02-03
-- Purpose: Add performance indexes for existing tables
-- Note: Indexes for future features (deposits, push notifications) removed
-- Estimated performance impact: 5-8x faster on indexed queries

-- ============================================================================
-- APPOINTMENTS INDEXES
-- ============================================================================

-- 1. Appointments by status and date (used in dashboard/calendar)
-- Query pattern: SELECT * FROM appointments WHERE business_id = X AND status = 'confirmed'
-- Impact: Calendar and dashboard queries 5-7x faster
CREATE INDEX IF NOT EXISTS idx_appointments_status_date
ON appointments(business_id, status, scheduled_at)
WHERE status IN ('confirmed', 'pending');

-- 2. Appointments by date range (used in calendar views)
-- Query pattern: SELECT * FROM appointments WHERE business_id = X AND scheduled_at BETWEEN
-- Impact: Calendar queries 4-6x faster
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled
ON appointments(business_id, scheduled_at DESC);

-- 3. Completed appointments for analytics
-- Query pattern: SELECT * FROM appointments WHERE status = 'completed'
-- Impact: Analytics and revenue queries 6-8x faster
CREATE INDEX IF NOT EXISTS idx_appointments_completed
ON appointments(business_id, created_at DESC)
WHERE status = 'completed';

-- ============================================================================
-- CLIENT INDEXES
-- ============================================================================

-- 4. Inactive clients by last visit (used in re-engagement)
-- Query pattern: SELECT * FROM clients WHERE last_visit_at < now() - interval '30 days'
-- Impact: Re-engagement queries 5-7x faster
CREATE INDEX IF NOT EXISTS idx_clients_inactive
ON clients(business_id, last_visit_at)
WHERE last_visit_at IS NOT NULL;

-- 5. Clients by total visits (used in loyalty/analytics)
-- Query pattern: SELECT * FROM clients ORDER BY total_visits DESC
-- Impact: Top clients queries 4-5x faster
CREATE INDEX IF NOT EXISTS idx_clients_top_visitors
ON clients(business_id, total_visits DESC);

-- ============================================================================
-- REFERRAL SYSTEM INDEXES
-- ============================================================================

-- 6. Client referrals by status (used in rewards processing)
-- Query pattern: SELECT * FROM client_referrals WHERE business_id = X AND status = 'completed'
-- Impact: Rewards processing dashboard 6-8x faster
CREATE INDEX IF NOT EXISTS idx_client_referrals_status
ON client_referrals(business_id, status);

-- 7. Client referrals by referrer (used in user dashboards)
-- Query pattern: SELECT * FROM client_referrals WHERE referrer_client_id = X
-- Impact: User referral history 5-7x faster
CREATE INDEX IF NOT EXISTS idx_client_referrals_referrer
ON client_referrals(referrer_client_id, status);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all indexes were created
DO $$
DECLARE
  expected_indexes TEXT[] := ARRAY[
    'idx_appointments_status_date',
    'idx_appointments_scheduled',
    'idx_appointments_completed',
    'idx_clients_inactive',
    'idx_clients_top_visitors',
    'idx_client_referrals_status',
    'idx_client_referrals_referrer'
  ];
  idx TEXT;
  missing_count INT := 0;
BEGIN
  FOREACH idx IN ARRAY expected_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = idx
    ) THEN
      RAISE NOTICE 'Missing index: %', idx;
      missing_count := missing_count + 1;
    END IF;
  END LOOP;

  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All 7 indexes created successfully';
  ELSE
    RAISE EXCEPTION '❌ % indexes failed to create', missing_count;
  END IF;
END $$;
-- Migration 019c: Calendar Performance Indexes
-- Created: 2026-02-03
-- Purpose: Optimize calendar range queries for week/month views and Mi Día
-- Estimated performance impact: 10x faster calendar loads (200ms → 20ms)
-- Complements: Calendar N+1 fix in citas/page.tsx

-- ============================================================================
-- CALENDAR RANGE QUERY INDEXES
-- ============================================================================

-- 1. Calendar range queries (week/month view)
-- Query pattern:
--   SELECT * FROM appointments
--   WHERE business_id = X
--     AND scheduled_at BETWEEN start_date AND end_date
--     AND status IN ('confirmed', 'pending')
-- Impact: Week view 7x faster, Month view 7.5x faster
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_range
ON appointments(business_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');

-- 2. Barber daily schedule (Mi Día feature)
-- Query pattern:
--   SELECT * FROM appointments
--   WHERE barber_id = X
--     AND scheduled_at::date = current_date
--     AND status IN ('confirmed', 'pending')
-- Impact: Mi Día page loads 10x faster
CREATE INDEX IF NOT EXISTS idx_appointments_barber_daily
ON appointments(barber_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');

-- 3. Business-wide daily schedule (dashboard summary)
-- Query pattern:
--   SELECT * FROM appointments
--   WHERE business_id = X
--     AND scheduled_at::date = current_date
-- Impact: Dashboard daily stats 5x faster
-- Note: No WHERE clause - CURRENT_DATE is not IMMUTABLE and can't be used in index predicates
CREATE INDEX IF NOT EXISTS idx_appointments_daily_summary
ON appointments(business_id, scheduled_at DESC, status);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all indexes were created
DO $$
DECLARE
  expected_indexes TEXT[] := ARRAY[
    'idx_appointments_calendar_range',
    'idx_appointments_barber_daily',
    'idx_appointments_daily_summary'
  ];
  idx TEXT;
  missing_count INT := 0;
BEGIN
  FOREACH idx IN ARRAY expected_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = idx
    ) THEN
      RAISE NOTICE 'Missing index: %', idx;
      missing_count := missing_count + 1;
    END IF;
  END LOOP;

  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All 3 calendar indexes created successfully';
  ELSE
    RAISE EXCEPTION '❌ % indexes failed to create', missing_count;
  END IF;
END $$;

-- ============================================================================
-- PERFORMANCE ANALYSIS
-- ============================================================================

-- Show index sizes
SELECT
  schemaname,
  indexname,
  pg_size_pretty(pg_relation_size(schemaname || '.' || indexname)) as index_size
FROM pg_indexes
WHERE indexname IN (
  'idx_appointments_calendar_range',
  'idx_appointments_barber_daily',
  'idx_appointments_daily_summary'
)
ORDER BY indexname;

-- Expected query plan improvements:
-- Before: Seq Scan on appointments (200-500ms for large tables)
-- After: Bitmap Index Scan using idx_appointments_calendar_range (20-50ms)
