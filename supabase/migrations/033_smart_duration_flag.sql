-- Migration 033: Smart Duration feature flag + RPC
-- Purpose: Per-business toggle + atomic stats update function
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Feature flag on businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS smart_duration_enabled BOOLEAN DEFAULT false;

-- 2. RPC to update duration stats (called from complete API via service client)
-- SECURITY DEFINER: bypasses RLS
-- SET search_path: prevents search_path hijacking (CWE-426)
CREATE OR REPLACE FUNCTION update_duration_stats(
  p_business_id UUID,
  p_service_id UUID,
  p_barber_id UUID,
  p_actual_duration INT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_avg DECIMAL(5,1);
  v_current_count INT;
  v_is_outlier BOOLEAN := false;
BEGIN
  -- Skip invalid durations
  IF p_actual_duration IS NULL OR p_actual_duration <= 0 OR p_actual_duration > 480 THEN
    RETURN;
  END IF;

  -- === BARBER+SERVICE STATS ===
  SELECT avg_duration_minutes, sample_count
    INTO v_current_avg, v_current_count
    FROM service_duration_stats
    WHERE business_id = p_business_id
      AND service_id = p_service_id
      AND barber_id = p_barber_id;

  -- Outlier check: high (>3x avg) and low (<0.33x avg) after 3+ samples
  IF v_current_count >= 3 AND (
    p_actual_duration > (v_current_avg * 3) OR
    p_actual_duration < (v_current_avg * 0.33)
  ) THEN
    v_is_outlier := true;
  END IF;

  IF NOT v_is_outlier THEN
    INSERT INTO service_duration_stats (business_id, service_id, barber_id,
      avg_duration_minutes, min_duration_minutes, max_duration_minutes, sample_count)
    VALUES (p_business_id, p_service_id, p_barber_id,
      p_actual_duration, p_actual_duration, p_actual_duration, 1)
    ON CONFLICT (business_id, service_id, barber_id)
      WHERE barber_id IS NOT NULL
    DO UPDATE SET
      avg_duration_minutes = (service_duration_stats.avg_duration_minutes * service_duration_stats.sample_count + p_actual_duration)
        / (service_duration_stats.sample_count + 1),
      min_duration_minutes = LEAST(service_duration_stats.min_duration_minutes, p_actual_duration),
      max_duration_minutes = GREATEST(service_duration_stats.max_duration_minutes, p_actual_duration),
      sample_count = service_duration_stats.sample_count + 1,
      last_updated_at = NOW();
  END IF;

  -- === SERVICE-WIDE STATS (barber_id IS NULL) ===
  v_is_outlier := false;

  SELECT avg_duration_minutes, sample_count
    INTO v_current_avg, v_current_count
    FROM service_duration_stats
    WHERE business_id = p_business_id
      AND service_id = p_service_id
      AND barber_id IS NULL;

  IF v_current_count >= 3 AND (
    p_actual_duration > (v_current_avg * 3) OR
    p_actual_duration < (v_current_avg * 0.33)
  ) THEN
    v_is_outlier := true;
  END IF;

  IF NOT v_is_outlier THEN
    INSERT INTO service_duration_stats (business_id, service_id, barber_id,
      avg_duration_minutes, min_duration_minutes, max_duration_minutes, sample_count)
    VALUES (p_business_id, p_service_id, NULL,
      p_actual_duration, p_actual_duration, p_actual_duration, 1)
    ON CONFLICT (business_id, service_id)
      WHERE barber_id IS NULL
    DO UPDATE SET
      avg_duration_minutes = (service_duration_stats.avg_duration_minutes * service_duration_stats.sample_count + p_actual_duration)
        / (service_duration_stats.sample_count + 1),
      min_duration_minutes = LEAST(service_duration_stats.min_duration_minutes, p_actual_duration),
      max_duration_minutes = GREATEST(service_duration_stats.max_duration_minutes, p_actual_duration),
      sample_count = service_duration_stats.sample_count + 1,
      last_updated_at = NOW();
  END IF;
END;
$$;

-- 3. Grant only to service_role (complete API uses createServiceClient)
GRANT EXECUTE ON FUNCTION update_duration_stats(UUID, UUID, UUID, INT) TO service_role;
