-- =====================================================
-- MIGRATION 037: Advance Payment (SINPE)
-- =====================================================

-- 1. Business config columns
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS advance_payment_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS advance_payment_discount INT DEFAULT 10
    CHECK (advance_payment_discount BETWEEN 5 AND 50),
  ADD COLUMN IF NOT EXISTS advance_payment_deadline_hours INT DEFAULT 2
    CHECK (advance_payment_deadline_hours BETWEEN 0 AND 48),
  ADD COLUMN IF NOT EXISTS sinpe_phone TEXT,
  ADD COLUMN IF NOT EXISTS sinpe_holder_name TEXT;

-- 2. Appointment advance payment state
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS advance_payment_status TEXT DEFAULT 'none'
    CHECK (advance_payment_status IN ('none', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS proof_channel TEXT
    CHECK (proof_channel IN ('whatsapp', 'upload')),
  ADD COLUMN IF NOT EXISTS advance_payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS proof_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS base_price_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS discount_pct_snapshot INT,
  ADD COLUMN IF NOT EXISTS discount_amount_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS final_price_snapshot DECIMAL(10,2);

-- 3. Consistency constraints
ALTER TABLE appointments
  ADD CONSTRAINT chk_advance_none
    CHECK (advance_payment_status != 'none' OR (
      proof_channel IS NULL AND
      advance_payment_proof_url IS NULL AND
      proof_submitted_at IS NULL
    )),
  ADD CONSTRAINT chk_advance_verified
    CHECK (advance_payment_status != 'verified' OR (
      verified_by_user_id IS NOT NULL AND
      verified_at IS NOT NULL
    ));

-- 4. Index for dashboard queries (pending payments)
CREATE INDEX IF NOT EXISTS idx_appointments_advance_payment
  ON appointments(business_id, advance_payment_status)
  WHERE advance_payment_status != 'none';
