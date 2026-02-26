-- Migration 047: Analytics Aggregation RPCs
--
-- Moves client-side aggregation to DB-side for 4 analytics endpoints.
-- All RPCs use LEFT JOIN to preserve entities with 0 appointments.
-- Heatmap and revenue-series handle timezone conversion in SQL.
-- Follows fallback pattern from migration 045.

-- ============================================================
-- RPC 1: Service Analytics (LEFT JOIN preserves 0-booking services)
-- Replaces: /api/analytics/services JS-side Map aggregation
-- ============================================================
CREATE OR REPLACE FUNCTION get_service_analytics(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ
)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_order), '[]'::json)
  FROM (
    SELECT
      s.id,
      s.name,
      COUNT(a.id)::INT AS bookings,
      COALESCE(SUM(a.price), 0)::NUMERIC AS revenue
    FROM services s
    LEFT JOIN appointments a
      ON a.service_id = s.id
      AND a.business_id = p_business_id
      AND a.status = 'completed'
      AND a.scheduled_at >= p_start_date
    WHERE s.business_id = p_business_id
      AND s.is_active = true
    GROUP BY s.id, s.name
    ORDER BY revenue DESC
    LIMIT 10
  ) row_order;
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- RPC 2: Barber Analytics (LEFT JOIN preserves 0-appointment barbers)
-- Replaces: /api/analytics/barbers JS-side Map + Set aggregation
-- ============================================================
CREATE OR REPLACE FUNCTION get_barber_analytics(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ
)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_order), '[]'::json)
  FROM (
    SELECT
      b.id,
      b.name,
      b.photo_url,
      COUNT(a.id)::INT AS appointments,
      COALESCE(SUM(a.price), 0)::NUMERIC AS revenue,
      COUNT(DISTINCT a.client_id)::INT AS "uniqueClients",
      CASE WHEN COUNT(a.id) > 0
        THEN ROUND(SUM(a.price) / COUNT(a.id))::INT
        ELSE 0
      END AS "avgPerAppointment"
    FROM barbers b
    LEFT JOIN appointments a
      ON a.barber_id = b.id
      AND a.business_id = p_business_id
      AND a.status = 'completed'
      AND a.scheduled_at >= p_start_date
    WHERE b.business_id = p_business_id
      AND b.is_active = true
    GROUP BY b.id, b.name, b.photo_url
    ORDER BY revenue DESC
  ) row_order;
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- RPC 3: Revenue Series (timezone-aware grouping)
-- Replaces: /api/analytics/revenue-series JS-side date grouping
-- Returns pre-aggregated rows; JS fills empty date buckets
-- ============================================================
CREATE OR REPLACE FUNCTION get_revenue_series(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ,
  p_group_by TEXT DEFAULT 'day'
)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(row_order), '[]'::json)
  FROM (
    SELECT
      CASE p_group_by
        WHEN 'month' THEN to_char(scheduled_at AT TIME ZONE 'America/Costa_Rica', 'YYYY-MM')
        ELSE to_char(scheduled_at AT TIME ZONE 'America/Costa_Rica', 'YYYY-MM-DD')
      END AS date_key,
      COALESCE(SUM(price), 0)::NUMERIC AS revenue,
      COUNT(*)::INT AS appointments
    FROM appointments
    WHERE business_id = p_business_id
      AND status = 'completed'
      AND scheduled_at >= p_start_date
    GROUP BY date_key
    ORDER BY date_key
  ) row_order;
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- RPC 4: Demand Heatmap (timezone-aware day/hour extraction)
-- Replaces: /api/analytics/heatmap JS-side Intl.DateTimeFormat loop
-- ============================================================
CREATE OR REPLACE FUNCTION get_demand_heatmap(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ,
  p_timezone TEXT DEFAULT 'America/Costa_Rica'
)
RETURNS JSON AS $$
  WITH apts AS (
    SELECT
      EXTRACT(DOW FROM scheduled_at AT TIME ZONE p_timezone)::INT AS day,
      EXTRACT(HOUR FROM scheduled_at AT TIME ZONE p_timezone)::INT AS hour
    FROM appointments
    WHERE business_id = p_business_id
      AND status IN ('confirmed', 'completed', 'no_show')
      AND scheduled_at >= p_start_date
  ),
  grouped AS (
    SELECT day, hour, COUNT(*)::INT AS count
    FROM apts
    GROUP BY day, hour
  )
  SELECT json_build_object(
    'cells', COALESCE((SELECT json_agg(json_build_object('day', day, 'hour', hour, 'count', count)) FROM grouped), '[]'::json),
    'maxCount', COALESCE((SELECT MAX(count) FROM grouped), 0),
    'totalAppointments', (SELECT COUNT(*) FROM apts)::INT
  );
$$ LANGUAGE sql STABLE SECURITY INVOKER;

-- ============================================================
-- Grants (same pattern as 045)
-- ============================================================
GRANT EXECUTE ON FUNCTION get_service_analytics(UUID, TIMESTAMPTZ) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_service_analytics(UUID, TIMESTAMPTZ) FROM anon;

GRANT EXECUTE ON FUNCTION get_barber_analytics(UUID, TIMESTAMPTZ) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_barber_analytics(UUID, TIMESTAMPTZ) FROM anon;

GRANT EXECUTE ON FUNCTION get_revenue_series(UUID, TIMESTAMPTZ, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_revenue_series(UUID, TIMESTAMPTZ, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION get_demand_heatmap(UUID, TIMESTAMPTZ, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_demand_heatmap(UUID, TIMESTAMPTZ, TEXT) FROM anon;
