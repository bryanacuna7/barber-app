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
