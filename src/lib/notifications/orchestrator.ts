/**
 * Notification Orchestrator
 *
 * Central entry point for ALL outbound notifications. Wraps existing senders
 * (push, email, in-app) with deduplication, preference checking, and audit logging.
 *
 * Usage:
 *   import { notify } from '@/lib/notifications/orchestrator'
 *
 *   await notify('new_appointment', {
 *     businessId: '...',
 *     appointmentId: '...',
 *     userId: ownerUserId,
 *     recipientEmail: ownerEmail,
 *     data: { clientName, serviceName, ... },
 *   })
 *
 * Design principles:
 * - Never blocks the calling operation (booking, cancel, etc.) — callers
 *   should wrap in `.catch()` or fire-and-forget.
 * - Dedup: checks notification_log before sending on each channel.
 * - Preferences: respects business-level notification_preferences.
 * - Audit: logs every attempt (sent/failed/deduped/skipped) to notification_log.
 * - Retry: single retry on transient failures; logs 'retried' status.
 * - PII: sanitizes error messages before persisting.
 */

import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { sendPushToUser, isPushConfigured } from '@/lib/push/sender'
import { sendEmail, isEmailConfigured, getNotificationPreferences } from '@/lib/email/sender'
import { isDuplicate, logNotification } from './dedup'
import type {
  NotificationType,
  NotifyContext,
  NotificationResult,
  ChannelResult,
  NotificationChannel,
  InAppPayload,
  PushPayloadParams,
  EmailPayloadParams,
} from './types'

// Re-export for convenience
export type { NotificationType, NotifyContext, NotificationResult }

// ─── Email types that support preference checking ────────────────────────────

const EMAIL_PREF_TYPES = new Set<string>([
  'trial_expiring',
  'subscription_expiring',
  'payment_approved',
  'payment_rejected',
  'new_appointment',
  'appointment_reminder',
  'appointment_cancelled',
  'new_business',
  'payment_pending',
])

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Send a notification across all configured channels.
 *
 * @param event   Canonical event type (from NotificationType)
 * @param context Delivery context — who, what, where
 * @param options Optional overrides for channel-specific payloads
 */
export async function notify(
  event: NotificationType,
  context: NotifyContext,
  options?: {
    inApp?: InAppPayload
    push?: PushPayloadParams
    email?: EmailPayloadParams
    /** Skip specific channels */
    skipChannels?: NotificationChannel[]
    /** WhatsApp deep link text (generates wa.me link, does not auto-send) */
    whatsappText?: string
  }
): Promise<NotificationResult> {
  const results: ChannelResult[] = []
  const skip = new Set(options?.skipChannels || [])

  // ── 1. In-App Notification ───────────────────────────────────────────────

  if (!skip.has('in_app') && options?.inApp) {
    const result = await sendInApp(event, context, options.inApp)
    results.push(result)
  }

  // ── 2. Push Notification ─────────────────────────────────────────────────

  if (!skip.has('push') && context.userId && isPushConfigured()) {
    const result = await sendPush(event, context, options?.push)
    results.push(result)
  }

  // ── 3. Email Notification ────────────────────────────────────────────────

  if (!skip.has('email') && context.recipientEmail && isEmailConfigured()) {
    const result = await sendEmailChannel(event, context, options?.email)
    results.push(result)
  }

  // ── 4. WhatsApp (deep link generation only) ──────────────────────────────

  if (!skip.has('whatsapp') && context.recipientPhone && options?.whatsappText) {
    const result = await generateWhatsAppLink(event, context, options.whatsappText)
    results.push(result)
  }

  return {
    event,
    channels: results,
    success: results.some((r) => r.status === 'sent'),
  }
}

// ─── Channel Handlers ────────────────────────────────────────────────────────

async function sendInApp(
  event: NotificationType,
  ctx: NotifyContext,
  payload: InAppPayload
): Promise<ChannelResult> {
  const channel: NotificationChannel = 'in_app'

  // Dedup check
  if (await isDuplicate(event, ctx.appointmentId, channel)) {
    await logNotification({
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      userId: ctx.userId,
      eventType: event,
      channel,
      status: 'deduped',
    })
    return { channel, status: 'deduped' }
  }

  try {
    const supabase = createServiceClient()
    const id = await createNotification(supabase, {
      user_id: ctx.userId,
      business_id: ctx.businessId,
      type: event,
      title: payload.title,
      message: payload.message,
      reference_type: payload.referenceType,
      reference_id: payload.referenceId,
    })

    if (!id) throw new Error('createNotification returned null')

    await logNotification({
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      userId: ctx.userId,
      eventType: event,
      channel,
      status: 'sent',
    })

    return { channel, status: 'sent' }
  } catch (err) {
    return await handleFailure(event, ctx, channel, err)
  }
}

async function sendPush(
  event: NotificationType,
  ctx: NotifyContext,
  payload?: PushPayloadParams
): Promise<ChannelResult> {
  const channel: NotificationChannel = 'push'

  if (!ctx.userId) {
    return { channel, status: 'skipped', errorCode: 'no_user_id' }
  }

  // Dedup check
  if (await isDuplicate(event, ctx.appointmentId, channel)) {
    await logNotification({
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      userId: ctx.userId,
      eventType: event,
      channel,
      status: 'deduped',
    })
    return { channel, status: 'deduped' }
  }

  // Build default payload from context data if not provided
  const pushPayload = payload || {
    title: (ctx.data.pushTitle as string) || 'Notificación',
    body: (ctx.data.pushBody as string) || '',
    url: ctx.data.pushUrl as string | undefined,
    tag: ctx.appointmentId ? `${event}-${ctx.appointmentId}` : undefined,
  }

  try {
    const result = await sendPushToUser(ctx.userId, pushPayload)

    if (result.sent > 0) {
      await logNotification({
        businessId: ctx.businessId,
        appointmentId: ctx.appointmentId,
        userId: ctx.userId,
        eventType: event,
        channel,
        status: 'sent',
      })
      return { channel, status: 'sent' }
    }

    // No active subscriptions — skip (not a failure)
    if (result.sent === 0 && result.failed === 0) {
      await logNotification({
        businessId: ctx.businessId,
        appointmentId: ctx.appointmentId,
        userId: ctx.userId,
        eventType: event,
        channel,
        status: 'skipped',
        errorCode: 'no_subscriptions',
      })
      return { channel, status: 'skipped', errorCode: 'no_subscriptions' }
    }

    // All failed
    throw new Error(`Push failed: ${result.failed} subscription(s)`)
  } catch (err) {
    return await handleFailure(event, ctx, channel, err)
  }
}

async function sendEmailChannel(
  event: NotificationType,
  ctx: NotifyContext,
  payload?: EmailPayloadParams
): Promise<ChannelResult> {
  const channel: NotificationChannel = 'email'

  if (!ctx.recipientEmail) {
    return { channel, status: 'skipped', errorCode: 'no_email' }
  }

  // Dedup check
  if (await isDuplicate(event, ctx.appointmentId, channel)) {
    await logNotification({
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      userId: ctx.userId,
      eventType: event,
      channel,
      status: 'deduped',
    })
    return { channel, status: 'deduped' }
  }

  // Check business preferences for known notification types
  if (EMAIL_PREF_TYPES.has(event)) {
    const prefs = await getNotificationPreferences(ctx.businessId)
    if (prefs && prefs.channel === 'app') {
      await logNotification({
        businessId: ctx.businessId,
        appointmentId: ctx.appointmentId,
        userId: ctx.userId,
        eventType: event,
        channel,
        status: 'skipped',
        errorCode: 'email_disabled_by_prefs',
      })
      return { channel, status: 'skipped', errorCode: 'email_disabled_by_prefs' }
    }
  }

  if (!payload) {
    await logNotification({
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      userId: ctx.userId,
      eventType: event,
      channel,
      status: 'skipped',
      errorCode: 'no_email_payload',
    })
    return { channel, status: 'skipped', errorCode: 'no_email_payload' }
  }

  try {
    const result = await sendEmail({
      to: payload.to,
      subject: payload.subject,
      react: payload.react,
    })

    if (result.success) {
      await logNotification({
        businessId: ctx.businessId,
        appointmentId: ctx.appointmentId,
        userId: ctx.userId,
        eventType: event,
        channel,
        status: 'sent',
      })
      return { channel, status: 'sent' }
    }

    throw new Error(result.error || 'Email send returned failure')
  } catch (err) {
    return await handleFailure(event, ctx, channel, err)
  }
}

async function generateWhatsAppLink(
  event: NotificationType,
  ctx: NotifyContext,
  text: string
): Promise<ChannelResult> {
  const channel: NotificationChannel = 'whatsapp'

  if (!ctx.recipientPhone) {
    return { channel, status: 'skipped', errorCode: 'no_phone' }
  }

  // WhatsApp doesn't actually "send" — we generate a deep link.
  // Log as 'sent' since the link was successfully generated.
  const phone = ctx.recipientPhone.replace(/\D/g, '')
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

  // Store the generated link in data for the caller to use
  ctx.data._whatsappLink = link

  await logNotification({
    businessId: ctx.businessId,
    appointmentId: ctx.appointmentId,
    userId: ctx.userId,
    eventType: event,
    channel,
    status: 'sent',
  })

  return { channel, status: 'sent' }
}

// ─── Retry + Failure Handling ────────────────────────────────────────────────

async function handleFailure(
  event: NotificationType,
  ctx: NotifyContext,
  channel: NotificationChannel,
  err: unknown
): Promise<ChannelResult> {
  const errorMessage = err instanceof Error ? err.message : String(err)

  logger.error(
    {
      event,
      channel,
      businessId: ctx.businessId,
      appointmentId: ctx.appointmentId,
      err,
    },
    `notification-orchestrator: ${channel} delivery failed`
  )

  // Single retry for transient failures
  if (isTransient(err)) {
    try {
      // Wait 1s before retry
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let retrySuccess = false

      if (channel === 'push' && ctx.userId) {
        const payload = {
          title: (ctx.data.pushTitle as string) || 'Notificación',
          body: (ctx.data.pushBody as string) || '',
        }
        const result = await sendPushToUser(ctx.userId, payload)
        retrySuccess = result.sent > 0
      }
      // Email retry not attempted — Resend has internal retry

      if (retrySuccess) {
        await logNotification({
          businessId: ctx.businessId,
          appointmentId: ctx.appointmentId,
          userId: ctx.userId,
          eventType: event,
          channel,
          status: 'retried',
        })
        return { channel, status: 'retried' }
      }
    } catch (retryErr) {
      logger.error(
        { event, channel, err: retryErr },
        'notification-orchestrator: retry also failed'
      )
    }
  }

  await logNotification({
    businessId: ctx.businessId,
    appointmentId: ctx.appointmentId,
    userId: ctx.userId,
    eventType: event,
    channel,
    status: 'failed',
    errorCode: extractErrorCode(err),
    errorMessage,
  })

  return {
    channel,
    status: 'failed',
    errorCode: extractErrorCode(err),
    errorMessage,
  }
}

/**
 * Determine if an error is transient (network timeout, 5xx, etc.)
 * and worth retrying once.
 */
function isTransient(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return (
      msg.includes('timeout') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('socket hang up') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')
    )
  }
  return false
}

/**
 * Extract a machine-readable error code from an error.
 */
function extractErrorCode(err: unknown): string {
  if (err && typeof err === 'object') {
    if ('code' in err && typeof (err as { code: unknown }).code === 'string') {
      return (err as { code: string }).code
    }
    if ('statusCode' in err) {
      return `HTTP_${(err as { statusCode: number }).statusCode}`
    }
  }
  return 'UNKNOWN'
}
