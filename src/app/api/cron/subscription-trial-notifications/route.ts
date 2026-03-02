/**
 * GET /api/cron/subscription-trial-notifications
 *
 * Daily cron job:
 * - Sends owner notifications when trial is about to expire (3d / 1d).
 * - Forces trial expiration processing (degrade + follow-up notifications)
 *   even when business owners are not actively using the app.
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'
import { notify } from '@/lib/notifications/orchestrator'
import { getSubscriptionStatus } from '@/lib/subscription'
import TrialExpiringEmail from '@/lib/email/templates/trial-expiring'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds

const DAY_MS = 24 * 60 * 60 * 1000
const DEDUPE_WINDOW_MS = 20 * 60 * 60 * 1000
const TARGET_DAYS = new Set([3, 1])

type TrialSubscriptionRow = {
  business_id: string
  trial_ends_at: string | null
}

type BusinessRow = {
  id: string
  name: string
  owner_id: string
  logo_url: string | null
  brand_primary_color: string | null
}

function getDaysRemaining(trialEndsAt: string, now: Date): number {
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / DAY_MS))
}

async function hasRecentTrialExpiringNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: any,
  businessId: string,
  daysRemaining: number,
  now: Date
): Promise<boolean> {
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS).toISOString()
  const title = `Te quedan ${daysRemaining} días de prueba`

  const { data } = await serviceClient
    .from('notifications')
    .select('id')
    .eq('business_id', businessId)
    .eq('type', 'trial_expiring')
    .eq('title', title)
    .gte('created_at', since)
    .limit(1)

  return Array.isArray(data) && data.length > 0
}

async function hasRecentBulkAdminNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: any,
  adminUserId: string,
  now: Date
): Promise<boolean> {
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS).toISOString()
  const { data } = await serviceClient
    .from('notifications')
    .select('id')
    .eq('user_id', adminUserId)
    .eq('type', 'trials_expiring_bulk')
    .gte('created_at', since)
    .limit(1)

  return Array.isArray(data) && data.length > 0
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  const now = new Date()

  let remindersSent = 0
  let remindersSkippedDedupe = 0
  let remindersErrored = 0
  let expiringInThreeDays = 0
  let expiringInOneDay = 0
  let forcedExpirations = 0

  try {
    const lookahead = new Date(now.getTime() + 4 * DAY_MS).toISOString()

    const { data: trialSubs, error: trialError } = (await serviceClient
      .from('business_subscriptions')
      .select('business_id, trial_ends_at')
      .eq('status', 'trial')
      .not('trial_ends_at', 'is', null)
      .lte('trial_ends_at', lookahead)) as { data: TrialSubscriptionRow[] | null; error: unknown }

    if (trialError) {
      logger.error({ err: trialError }, 'Failed to query trial subscriptions for cron')
      return NextResponse.json({ error: 'Failed to load trial subscriptions' }, { status: 500 })
    }

    if (!trialSubs || trialSubs.length === 0) {
      return NextResponse.json({
        ok: true,
        remindersSent: 0,
        remindersSkippedDedupe: 0,
        remindersErrored: 0,
        expiringInThreeDays: 0,
        expiringInOneDay: 0,
        forcedExpirations: 0,
        timestamp: now.toISOString(),
      })
    }

    const businessIds = [...new Set(trialSubs.map((sub) => sub.business_id))]

    const { data: businesses } = (await serviceClient
      .from('businesses')
      .select('id, name, owner_id, logo_url, brand_primary_color')
      .in('id', businessIds)) as { data: BusinessRow[] | null }

    const businessById = new Map((businesses || []).map((b) => [b.id, b]))

    for (const sub of trialSubs) {
      if (!sub.trial_ends_at) continue
      const business = businessById.get(sub.business_id)
      if (!business) continue

      const trialEnd = new Date(sub.trial_ends_at)
      if (Number.isNaN(trialEnd.getTime())) continue

      if (trialEnd <= now) {
        // Force expiration handling without needing user traffic.
        await getSubscriptionStatus(serviceClient, sub.business_id)
        forcedExpirations++
        continue
      }

      const daysRemaining = getDaysRemaining(sub.trial_ends_at, now)
      if (!TARGET_DAYS.has(daysRemaining)) continue

      if (daysRemaining === 3) expiringInThreeDays++
      if (daysRemaining === 1) expiringInOneDay++

      const alreadyNotified = await hasRecentTrialExpiringNotification(
        serviceClient,
        sub.business_id,
        daysRemaining,
        now
      )
      if (alreadyNotified) {
        remindersSkippedDedupe++
        continue
      }

      try {
        const ownerLookup = await serviceClient.auth.admin.getUserById(business.owner_id)
        const ownerEmail = ownerLookup.data?.user?.email

        const result = await notify(
          'trial_expiring',
          {
            businessId: sub.business_id,
            userId: business.owner_id,
            recipientEmail: ownerEmail,
            data: {
              businessName: business.name,
              daysRemaining,
            },
          },
          {
            inApp: {
              title: `Te quedan ${daysRemaining} días de prueba`,
              message: 'Tu período de prueba Pro está por vencer. Reporta tu pago para continuar.',
              referenceType: 'subscription',
            },
            email: ownerEmail
              ? {
                  to: ownerEmail,
                  subject: `⏰ Te quedan ${daysRemaining} días de prueba Pro`,
                  react: TrialExpiringEmail({
                    businessName: business.name,
                    daysRemaining,
                    logoUrl: business.logo_url || undefined,
                    brandColor: business.brand_primary_color || undefined,
                  }),
                }
              : undefined,
          }
        )

        if (result.success) {
          remindersSent++
        } else {
          remindersErrored++
        }
      } catch (error) {
        remindersErrored++
        logger.error(
          { err: error, businessId: sub.business_id, daysRemaining },
          'Failed sending trial expiring notification'
        )
      }
    }

    const totalExpiringSoon = expiringInThreeDays + expiringInOneDay
    if (totalExpiringSoon > 0) {
      const { data: admins } = (await serviceClient.from('admin_users').select('user_id')) as {
        data: Array<{ user_id: string | null }> | null
      }

      for (const admin of admins || []) {
        if (!admin.user_id) continue

        const alreadySent = await hasRecentBulkAdminNotification(serviceClient, admin.user_id, now)
        if (alreadySent) continue

        await (serviceClient as any).rpc('create_notification', {
          p_user_id: admin.user_id,
          p_business_id: null,
          p_type: 'trials_expiring_bulk',
          p_title: `${totalExpiringSoon} trials por vencer`,
          p_message: `${expiringInOneDay} vencen en 1 día y ${expiringInThreeDays} en 3 días. Revisa seguimiento comercial.`,
          p_reference_type: 'subscription',
          p_reference_id: null,
          p_metadata: {
            source: 'trial_notifications_cron',
            expiring_in_one_day: expiringInOneDay,
            expiring_in_three_days: expiringInThreeDays,
          },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      remindersSent,
      remindersSkippedDedupe,
      remindersErrored,
      expiringInThreeDays,
      expiringInOneDay,
      forcedExpirations,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    logger.error({ err: error }, 'subscription-trial-notifications cron failed')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
