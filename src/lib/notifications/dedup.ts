/**
 * Notification Deduplication
 *
 * Checks the `notification_log` table for existing 'sent' entries
 * to prevent double-sending the same notification.
 *
 * Key: (event_type, appointment_id, channel)
 * Only deduplicates when appointment_id is present — event-only
 * notifications (e.g., trial_expiring) are not deduplicated here
 * because they are typically idempotent cron events.
 */

import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'
import type { NotificationType, NotificationChannel } from './types'

/**
 * Returns true if a notification with the same (event, appointment, channel)
 * has already been sent. Returns false (allow send) if:
 *   - No appointmentId is provided (non-appointment events)
 *   - No matching 'sent' row exists in notification_log
 */
export async function isDuplicate(
  event: NotificationType,
  appointmentId: string | undefined,
  channel: NotificationChannel
): Promise<boolean> {
  // Non-appointment events bypass dedup
  if (!appointmentId) return false

  try {
    const supabase = createServiceClient()

    // Uses the idx_notif_log_dedup index from migration 038
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('notification_log')
      .select('id')
      .eq('event_type', event)
      .eq('appointment_id', appointmentId)
      .eq('channel', channel)
      .eq('status', 'sent')
      .limit(1)
      .maybeSingle()

    if (error) {
      // On DB error, fail open (allow send) to avoid silent message loss
      logger.warn(
        { err: error, event, appointmentId, channel },
        'notification-dedup: DB error, failing open'
      )
      return false
    }

    return data !== null
  } catch (err) {
    logger.warn(
      { err, event, appointmentId, channel },
      'notification-dedup: unexpected error, failing open'
    )
    return false
  }
}

/**
 * Record a notification attempt in the notification_log table.
 * Sanitizes error_message to strip potential PII before storing.
 */
export async function logNotification(entry: {
  businessId: string
  appointmentId?: string
  userId?: string
  eventType: NotificationType
  channel: NotificationChannel
  status: 'sent' | 'failed' | 'retried' | 'deduped' | 'skipped'
  errorCode?: string
  errorMessage?: string
}): Promise<void> {
  try {
    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('notification_log').insert({
      business_id: entry.businessId,
      appointment_id: entry.appointmentId || null,
      user_id: entry.userId || null,
      event_type: entry.eventType,
      channel: entry.channel,
      status: entry.status,
      error_code: entry.errorCode || null,
      error_message: sanitizeErrorMessage(entry.errorMessage),
    })
  } catch (err) {
    // Non-fatal: logging failure should never block notification delivery
    logger.error(
      { err, event: entry.eventType, channel: entry.channel },
      'notification-log: failed to write audit log'
    )
  }
}

/**
 * Strip emails, phone numbers, and truncate to 500 chars.
 * Prevents PII leaking into the notification_log table.
 */
function sanitizeErrorMessage(msg: string | undefined): string | null {
  if (!msg) return null

  return msg
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '[PHONE]')
    .slice(0, 500)
}
