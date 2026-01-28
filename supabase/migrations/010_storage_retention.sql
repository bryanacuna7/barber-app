-- Migration: 010_storage_retention.sql
-- Description: Add storage retention policy for payment proofs
-- Strategy: Auto-delete approved proofs after 30 days, rejected immediately
-- Created: 2026-01-28

-- Add delete_after column to payment_reports
ALTER TABLE payment_reports ADD COLUMN IF NOT EXISTS delete_after TIMESTAMPTZ;

-- Create function to mark payments for deletion based on status
CREATE OR REPLACE FUNCTION mark_payment_for_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to approved: delete after 30 days
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    NEW.delete_after := now() + INTERVAL '30 days';

  -- When status changes to rejected: delete immediately
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.delete_after := now();

  -- If status goes back to pending, clear delete_after
  ELSIF NEW.status = 'pending' THEN
    NEW.delete_after := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic marking
DROP TRIGGER IF EXISTS trigger_mark_payment_deletion ON payment_reports;
CREATE TRIGGER trigger_mark_payment_deletion
  BEFORE UPDATE OF status ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION mark_payment_for_deletion();

-- Also mark on insert (in case status is set directly)
DROP TRIGGER IF EXISTS trigger_mark_payment_deletion_insert ON payment_reports;
CREATE TRIGGER trigger_mark_payment_deletion_insert
  BEFORE INSERT ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION mark_payment_for_deletion();

-- Mark pending payments older than 90 days for cleanup (stale)
-- This will be handled by the cron job, not a trigger

-- Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_payment_reports_delete_after
  ON payment_reports(delete_after)
  WHERE delete_after IS NOT NULL;

-- Comment
COMMENT ON COLUMN payment_reports.delete_after IS 'Timestamp when payment proof should be deleted. NULL means keep indefinitely.';
COMMENT ON FUNCTION mark_payment_for_deletion IS 'Automatically sets delete_after timestamp based on payment status changes';
