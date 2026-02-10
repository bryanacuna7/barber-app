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
