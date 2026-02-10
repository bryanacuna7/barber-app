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
