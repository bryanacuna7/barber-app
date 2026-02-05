-- ============================================================================
-- Enable Realtime for WebSocket Subscriptions
-- ============================================================================
-- Created: Session [current]
-- Purpose: Configure tables for Supabase Realtime (WebSocket subscriptions)
--
-- Tables enabled:
-- - appointments (for useRealtimeAppointments hook)
-- - clients (for useRealtimeClients hook)
-- - business_subscriptions (for useRealtimeSubscriptions hook)
--
-- Requirements:
-- 1. REPLICA IDENTITY - Determines what info is sent in change events
-- 2. Realtime Publication - Must be added to supabase_realtime publication
-- ============================================================================

-- Enable REPLICA IDENTITY for all relevant tables
-- Using FULL to include all column values in realtime events
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE clients REPLICA IDENTITY FULL;
ALTER TABLE business_subscriptions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
-- This enables WebSocket subscriptions for these tables
BEGIN;
  -- Drop and recreate publication to ensure clean state
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;

  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  ALTER PUBLICATION supabase_realtime ADD TABLE clients;
  ALTER PUBLICATION supabase_realtime ADD TABLE business_subscriptions;
COMMIT;

-- ============================================================================
-- Alternative: Manual Configuration (if above fails)
-- ============================================================================
-- If you get "permission denied" error, enable manually via:
-- Supabase Dashboard → Database → Replication
-- Enable these tables: appointments, clients, business_subscriptions
-- ============================================================================
