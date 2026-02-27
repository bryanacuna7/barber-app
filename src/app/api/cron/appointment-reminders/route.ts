/**
 * GET /api/cron/appointment-reminders
 *
 * Vercel Cron — runs daily (current schedule in vercel.json).
 * Sends reminder push + email to clients 24h and 1h before their appointment.
 * Also executes smart promo notifications for habitual client time slots.
 *
 * Security:
 * - Authenticated via CRON_SECRET Bearer token (Vercel auto-injects)
 * - Uses service client (bypasses RLS) for cross-tenant queries
 *
 * Dedup:
 * - reminder_sent_at is set after first send (24h reminder)
 * - 1h reminder only fires if reminder_sent_at was set >2h ago (i.e., was the 24h one)
 *
 * Side effects:
 * - Sets reminder_sent_at on appointment
 * - Sends push via sendPushToUser
 * - Sends email via sendEmail
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendPushToUser } from '@/lib/push/sender'
import { sendEmail } from '@/lib/email/sender'
import AppointmentReminderEmail from '@/lib/email/templates/appointment-reminder'
import { logger } from '@/lib/logger'
import { runSmartPromoNotifications } from '@/lib/smart-notifications/daily-job'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds

export async function GET(request: Request) {
  // 1. Authenticate cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  const now = new Date()
  let sent24h = 0
  let sent1h = 0
  let smartSent = 0
  let smartCandidates = 0
  let errors = 0

  try {
    // 2. 24h reminders: appointments between 23h and 25h from now, not yet reminded
    const from24h = new Date(now.getTime() + 23 * 60 * 60_000)
    const to24h = new Date(now.getTime() + 25 * 60 * 60_000)

    const { data: reminders24h } = (await serviceClient
      .from('appointments')
      .select(
        `id, scheduled_at, duration_minutes, price, tracking_token, client_id, business_id,
         client:clients!appointments_client_id_fkey(id, name, email, user_id),
         service:services!appointments_service_id_fkey(name),
         barber:barbers!appointments_barber_id_fkey(name),
         business:businesses!appointments_business_id_fkey(name, brand_primary_color, logo_url, slug)`
      )
      .in('status', ['pending', 'confirmed'])
      .is('reminder_sent_at', null)
      .gte('scheduled_at', from24h.toISOString())
      .lte('scheduled_at', to24h.toISOString())
      .limit(100)) as any

    for (const appt of reminders24h ?? []) {
      try {
        await sendReminder(serviceClient, appt, false)
        sent24h++
      } catch (err) {
        errors++
        logger.error({ err, appointmentId: appt.id }, 'Failed to send 24h reminder')
      }
    }

    // 3. 1h reminders: appointments between 45min and 75min from now.
    //    Two cases:
    //    a) reminder_sent_at was set >2h ago (= was 24h reminder, needs 1h follow-up)
    //    b) reminder_sent_at IS NULL (same-day booking that missed the 24h window)
    const from1h = new Date(now.getTime() + 45 * 60_000)
    const to1h = new Date(now.getTime() + 75 * 60_000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60_000)

    // Case a: had 24h reminder >2h ago
    const { data: reminders1hFollowUp } = (await serviceClient
      .from('appointments')
      .select(
        `id, scheduled_at, duration_minutes, price, tracking_token, client_id, business_id, reminder_sent_at,
         client:clients!appointments_client_id_fkey(id, name, email, user_id),
         service:services!appointments_service_id_fkey(name),
         barber:barbers!appointments_barber_id_fkey(name),
         business:businesses!appointments_business_id_fkey(name, brand_primary_color, logo_url, slug)`
      )
      .in('status', ['pending', 'confirmed'])
      .not('reminder_sent_at', 'is', null)
      .lt('reminder_sent_at', twoHoursAgo.toISOString())
      .gte('scheduled_at', from1h.toISOString())
      .lte('scheduled_at', to1h.toISOString())
      .limit(100)) as any

    // Case b: same-day bookings that never got 24h reminder
    const { data: reminders1hNew } = (await serviceClient
      .from('appointments')
      .select(
        `id, scheduled_at, duration_minutes, price, tracking_token, client_id, business_id, reminder_sent_at,
         client:clients!appointments_client_id_fkey(id, name, email, user_id),
         service:services!appointments_service_id_fkey(name),
         barber:barbers!appointments_barber_id_fkey(name),
         business:businesses!appointments_business_id_fkey(name, brand_primary_color, logo_url, slug)`
      )
      .in('status', ['pending', 'confirmed'])
      .is('reminder_sent_at', null)
      .gte('scheduled_at', from1h.toISOString())
      .lte('scheduled_at', to1h.toISOString())
      .limit(100)) as any

    const reminders1h = [...(reminders1hFollowUp ?? []), ...(reminders1hNew ?? [])]

    for (const appt of reminders1h ?? []) {
      try {
        await sendReminder(serviceClient, appt, true)
        sent1h++
      } catch (err) {
        errors++
        logger.error({ err, appointmentId: appt.id }, 'Failed to send 1h reminder')
      }
    }

    // 4. Smart promo notifications (daily window now..+28h due daily cron cadence)
    try {
      const smartStats = await runSmartPromoNotifications(serviceClient, now)
      smartSent = smartStats.sent
      smartCandidates = smartStats.candidatesFound
      errors += smartStats.errors
    } catch (err) {
      errors++
      logger.error({ err }, 'Failed smart promo notification job')
    }

    logger.info(
      { sent24h, sent1h, smartSent, smartCandidates, errors },
      'Appointment reminders cron completed'
    )

    // 5. Cleanup old payment proofs (30 days)
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const { data: oldProofs } = (await (serviceClient as any)
        .from('appointments')
        .select('id, advance_payment_proof_url')
        .in('advance_payment_status', ['verified', 'rejected'])
        .lt('verified_at', thirtyDaysAgo)
        .not('advance_payment_proof_url', 'is', null)
        .limit(50)) as { data: Array<{ id: string; advance_payment_proof_url: string }> | null }

      if (oldProofs?.length) {
        const paths = oldProofs.map((p: any) => p.advance_payment_proof_url).filter(Boolean)

        if (paths.length) {
          await serviceClient.storage.from('deposit-proofs').remove(paths)

          const ids = oldProofs.map((p: any) => p.id)
          await (serviceClient as any)
            .from('appointments')
            .update({ advance_payment_proof_url: null })
            .in('id', ids)
        }

        console.log(`Cleaned up ${paths.length} old payment proofs`)
      }
    } catch (err) {
      logger.error({ err }, 'Payment proof cleanup error')
    }

    return NextResponse.json({
      ok: true,
      sent24h,
      sent1h,
      smartSent,
      smartCandidates,
      errors,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    logger.error({ err: error }, 'Appointment reminders cron failed')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * Send push + email reminder for a single appointment, then mark reminder_sent_at.
 */
async function sendReminder(
  serviceClient: ReturnType<typeof createServiceClient>,
  appt: any,
  isOneHour: boolean
) {
  const client = appt.client
  const service = appt.service
  const barber = appt.barber
  const business = appt.business

  if (!client) return

  const serviceName = service?.name ?? 'Servicio'
  const barberName = barber?.name ?? 'Miembro del equipo'
  const businessName = business?.name ?? 'Barbería'
  const brandColor = business?.brand_primary_color ?? '#3b82f6'

  const title = isOneHour ? 'Tu cita es en 1 hora' : 'Recordatorio: Cita mañana'
  const body = `${serviceName} con ${barberName}`

  const trackingToken = appt.tracking_token
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.barberapp.com'
  const trackingUrl = trackingToken ? `${appUrl}/track/${trackingToken}` : undefined

  // Send push + email, await both before marking reminder_sent_at.
  // If both fail, we do NOT mark as sent — cron will retry next cycle.
  let anySent = false

  // Push notification (if client has a user_id with push subscription)
  if (client.user_id) {
    try {
      const result = await sendPushToUser(client.user_id, {
        title,
        body,
        url: trackingUrl ? `/track/${trackingToken}` : '/mi-cuenta',
        tag: `reminder-${isOneHour ? '1h' : '24h'}-${appt.id}`,
      })
      if (result.sent > 0) anySent = true
    } catch (err) {
      logger.error({ err, appointmentId: appt.id }, 'Push reminder failed')
    }
  }

  // Email (if client has email)
  if (client.email) {
    try {
      const priceStr = appt.price ? `₡${Number(appt.price).toLocaleString('es-CR')}` : ''
      const result = await sendEmail({
        to: client.email,
        subject: `${title} — ${businessName}`,
        react: AppointmentReminderEmail({
          businessName,
          clientName: client.name || 'Cliente',
          serviceName,
          barberName,
          appointmentDate: appt.scheduled_at,
          duration: appt.duration_minutes ?? 30,
          price: priceStr,
          trackingUrl,
          logoUrl: business?.logo_url ?? undefined,
          brandColor,
          isOneHour,
        }),
      })
      if (result.success) anySent = true
    } catch (err) {
      logger.error({ err, appointmentId: appt.id }, 'Email reminder failed')
    }
  }

  // Only mark as sent if at least one channel succeeded (prevents false dedup)
  if (anySent) {
    await serviceClient
      .from('appointments')
      .update({ reminder_sent_at: new Date().toISOString() } as any)
      .eq('id', appt.id)
  } else if (!client.user_id && !client.email) {
    // No contact method — mark as sent to avoid infinite retries
    await serviceClient
      .from('appointments')
      .update({ reminder_sent_at: new Date().toISOString() } as any)
      .eq('id', appt.id)
  }
}
