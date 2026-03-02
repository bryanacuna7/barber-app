-- Migration 051: Range-based overview RPC for dashboard KPI cards
--
-- The dashboard needs explicit [start, end] windows (today and current month).
-- Existing get_appointment_overview() only accepts start_date and has no upper bound.

CREATE OR REPLACE FUNCTION get_appointment_overview_range(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total', COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed', 'completed')),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'total_revenue', COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0)
  )
  FROM appointments
  WHERE business_id = p_business_id
    AND scheduled_at >= p_start_date
    AND scheduled_at <= p_end_date;
$$ LANGUAGE sql STABLE SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION get_appointment_overview_range(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_appointment_overview_range(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM anon;
