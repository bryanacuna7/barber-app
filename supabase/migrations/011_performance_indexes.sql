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
