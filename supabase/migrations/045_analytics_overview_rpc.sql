-- Migration 045: Analytics & Admin RPCs for egress optimization
--
-- Moves heavy JS-side aggregation to DB-side for two high-traffic endpoints:
-- 1. get_appointment_overview — replaces fetching all appointment rows for KPI dashboard
-- 2. get_business_stats_batch — replaces 3 unbounded batch queries in admin panel

-- ============================================================
-- RPC 1: Analytics Overview (authenticated users via withAuth)
-- ============================================================
CREATE OR REPLACE FUNCTION get_appointment_overview(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ
)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'no_show', COUNT(*) FILTER (WHERE status = 'no_show'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'total_revenue', COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0)
  )
  FROM appointments
  WHERE business_id = p_business_id
    AND scheduled_at >= p_start_date;
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- RPC 2: Admin Business Stats Batch (service_role only)
-- ============================================================
CREATE OR REPLACE FUNCTION get_business_stats_batch(p_business_ids UUID[])
RETURNS TABLE(business_id UUID, barber_count BIGINT, service_count BIGINT, appointment_count BIGINT) AS $$
  SELECT
    b.id AS business_id,
    (SELECT COUNT(*) FROM barbers WHERE business_id = b.id) AS barber_count,
    (SELECT COUNT(*) FROM services WHERE business_id = b.id) AS service_count,
    (SELECT COUNT(*) FROM appointments WHERE business_id = b.id) AS appointment_count
  FROM unnest(p_business_ids) AS b(id);
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- Grants (following pattern from 030_client_update_rpc.sql)
-- ============================================================

-- Overview: called by authenticated users via withAuth
GRANT EXECUTE ON FUNCTION get_appointment_overview(UUID, TIMESTAMPTZ) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_appointment_overview(UUID, TIMESTAMPTZ) FROM anon;

-- Admin stats: called via service client only
GRANT EXECUTE ON FUNCTION get_business_stats_batch(UUID[]) TO service_role;
REVOKE EXECUTE ON FUNCTION get_business_stats_batch(UUID[]) FROM anon, authenticated;
