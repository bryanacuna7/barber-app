/**
 * Web Push notification sender
 * Parallel to src/lib/email/sender.ts — handles all push sending logic.
 * Uses service client (bypasses RLS) since this runs server-side in API routes.
 *
 * Pattern: async .catch() — push failures never block main operations.
 */

import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'

// Configure VAPID once at module load
const isConfigured = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)

if (isConfigured) {
  webpush.setVapidDetails(
    'mailto:noreply@barberapp.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

export const isPushConfigured = () => isConfigured

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Send push notification to all active subscriptions for a user.
 * Handles 410 Gone (expired) and consecutive failure deactivation.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isConfigured) {
    return { sent: 0, failed: 0 }
  }

  const supabase = createServiceClient()
  const { data: subs, error } = await supabase
    .from('push_subscriptions' as any)
    .select('id, endpoint, p256dh, auth, failed_count')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error || !subs?.length) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const sub of subs as any[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
      sent++

      // Reset fail count on success (if it was > 0)
      if (sub.failed_count > 0) {
        await supabase
          .from('push_subscriptions' as any)
          .update({ failed_count: 0 } as any)
          .eq('id', sub.id)
      }
    } catch (err: any) {
      failed++

      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired — browser unsubscribed
        await supabase
          .from('push_subscriptions' as any)
          .update({ is_active: false } as any)
          .eq('id', sub.id)
        logger.info({ subId: sub.id }, 'Push subscription expired (410), deactivated')
      } else {
        // Increment fail count, deactivate after 5 consecutive failures
        const newCount = (sub.failed_count || 0) + 1
        await supabase
          .from('push_subscriptions' as any)
          .update({
            failed_count: newCount,
            is_active: newCount < 5,
          } as any)
          .eq('id', sub.id)
        logger.error(
          { subId: sub.id, statusCode: err.statusCode, error: err.message },
          'Push send failed'
        )
      }
    }
  }

  if (sent > 0) {
    logger.info({ userId, sent, failed }, 'Push notifications sent')
  }

  return { sent, failed }
}

/**
 * Send push notification to the business owner.
 */
export async function sendPushToBusinessOwner(
  businessId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isConfigured) {
    return { sent: 0, failed: 0 }
  }

  const supabase = createServiceClient()
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', businessId)
    .single()

  if (!biz) {
    return { sent: 0, failed: 0 }
  }

  return sendPushToUser(biz.owner_id, payload)
}
