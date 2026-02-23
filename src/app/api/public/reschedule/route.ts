/**
 * POST /api/public/reschedule
 *
 * Public reschedule endpoint — token-based auth (no login required).
 * Allows clients to reschedule their own appointment using the tracking token.
 * Cancels the original appointment and creates a new one with the updated time.
 *
 * Security:
 * - Rate limited: 5 req/min per IP
 * - Validates tracking_token UUID format
 * - Enforces cancellation policy (enabled + allow_reschedule + deadline)
 * - Max 2 reschedules per appointment
 * - Uses service client to bypass RLS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit } from '@/lib/rate-limit'
import { createNotification } from '@/lib/notifications'
import { sendPushToBusinessOwner } from '@/lib/push/sender'
import { sendNotificationEmail, sendEmail } from '@/lib/email/sender'
import NewAppointmentEmail from '@/lib/email/templates/new-appointment'
import { evaluatePromo } from '@/lib/promo-engine'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CancellationPolicy } from '@/types'
import type { PromoRule } from '@/types/promo'

// Custom rate limit: 5 requests/min (same as cancel — reschedules should be rare)
const RESCHEDULE_RATE_LIMIT = { interval: 60_000, maxRequests: 5 }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface AppointmentRow {
  id: string
  status: string
  scheduled_at: string
  service_id: string | null
  barber_id: string | null
  business_id: string
  client_id: string | null
  notes: string | null
  reschedule_count: number | null
  duration_minutes: number | null
  client: { name: string | null; phone: string | null; email: string | null } | null
}

interface BusinessRow {
  id: string
  name: string
  owner_id: string
  slug: string
  cancellation_policy: CancellationPolicy | null
  promotional_slots: unknown
  timezone: string | null
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const rl = await rateLimit(request, RESCHEDULE_RATE_LIMIT)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un momento.' },
        { status: 429, headers: rl.headers }
      )
    }

    // 2. Parse and validate body
    let body: { token?: string; new_scheduled_at?: string; new_barber_id?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { token, new_scheduled_at, new_barber_id } = body

    if (!token || !new_scheduled_at) {
      return NextResponse.json({ error: 'Se requieren token y new_scheduled_at' }, { status: 400 })
    }

    // 3. Validate UUID format for token
    if (!UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    // 4. Validate new_scheduled_at is a valid ISO date in the future
    const newScheduledAt = new Date(new_scheduled_at)
    if (Number.isNaN(newScheduledAt.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
    }
    if (newScheduledAt <= new Date()) {
      return NextResponse.json({ error: 'La nueva fecha debe ser en el futuro' }, { status: 400 })
    }

    // 4b. Validate new_barber_id UUID format if provided
    if (new_barber_id !== undefined && new_barber_id !== null) {
      if (!UUID_REGEX.test(new_barber_id)) {
        return NextResponse.json({ error: 'new_barber_id inválido' }, { status: 400 })
      }
    }

    const serviceClient = createServiceClient()

    // 5. Lookup appointment by tracking_token
    const { data: appointment, error: apptError } = (await (serviceClient as any)
      .from('appointments')
      .select(
        'id, status, scheduled_at, service_id, barber_id, business_id, client_id, notes, reschedule_count, duration_minutes, client:clients(name, phone, email)'
      )
      .eq('tracking_token', token)
      .single()) as { data: AppointmentRow | null; error: unknown }

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 6. Guard: must be in 'pending' or 'confirmed' status
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return NextResponse.json({ error: 'La cita ya no puede ser reagendada' }, { status: 400 })
    }

    // 7. Guard: max 2 reschedules
    const currentRescheduleCount = (appointment as any).reschedule_count ?? 0
    if (currentRescheduleCount >= 2) {
      return NextResponse.json({ error: 'Máximo 2 reagendamientos por cita' }, { status: 400 })
    }

    // 8. Lookup business
    const { data: business, error: bizError } = (await (serviceClient as any)
      .from('businesses')
      .select('id, cancellation_policy, name, owner_id, slug, promotional_slots, timezone')
      .eq('id', appointment.business_id)
      .single()) as { data: BusinessRow | null; error: unknown }

    if (bizError || !business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const policy: CancellationPolicy = (business.cancellation_policy as CancellationPolicy) ?? {
      enabled: false,
      deadline_hours: 24,
      allow_reschedule: false,
    }

    // 9. Guard: policy must be enabled and allow_reschedule must be true
    if (!policy.enabled) {
      return NextResponse.json(
        { error: 'Esta barbería no permite cancelaciones/reagendamientos online' },
        { status: 403 }
      )
    }

    if (!policy.allow_reschedule) {
      return NextResponse.json(
        { error: 'Esta barbería no permite reagendamientos online' },
        { status: 403 }
      )
    }

    // 10. Guard: deadline check (same logic as cancel)
    const originalScheduledAt = new Date(appointment.scheduled_at)
    const deadlineMs = policy.deadline_hours * 60 * 60 * 1000
    const deadline = new Date(originalScheduledAt.getTime() - deadlineMs)

    if (new Date() > deadline) {
      return NextResponse.json(
        { error: 'El tiempo límite para reagendar ya pasó' },
        { status: 400 }
      )
    }

    // 11. Determine barber_id: use new_barber_id if provided, otherwise keep original
    const barberId: string = new_barber_id ?? (appointment.barber_id as string)

    // 12. Check slot availability
    const durationMin = (appointment as any).duration_minutes ?? 30
    const endTime = new Date(newScheduledAt.getTime() + durationMin * 60_000)

    const { data: conflicts } = await (serviceClient as any)
      .from('appointments')
      .select('id')
      .eq('barber_id', barberId)
      .neq('status', 'cancelled')
      .neq('status', 'no_show')
      .gte('scheduled_at', newScheduledAt.toISOString())
      .lt('scheduled_at', endTime.toISOString())

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'El horario seleccionado no está disponible' },
        { status: 409 }
      )
    }

    // 13. Cancel the original appointment
    const { error: cancelError } = await (serviceClient as any)
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_by: 'client',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointment.id)

    if (cancelError) {
      console.error('Reschedule: cancel original appointment error:', cancelError)
      return NextResponse.json({ error: 'Error al reagendar la cita' }, { status: 500 })
    }

    // 14. Calculate tracking token expiry for new appointment
    const trackingExpiresAt = new Date(
      newScheduledAt.getTime() + (durationMin + 120) * 60_000
    ).toISOString()

    // 15. Evaluate promo for new slot (optional)
    const promoRules: PromoRule[] = (business.promotional_slots as PromoRule[]) || []
    let promoEval = null
    let finalPrice: number | null = null

    if (promoRules.length > 0 && appointment.service_id) {
      // Lookup service price
      const { data: service } = await serviceClient
        .from('services')
        .select('price')
        .eq('id', appointment.service_id)
        .single()

      if (service && service.price !== null) {
        const tz = business.timezone || 'America/Costa_Rica'
        promoEval = evaluatePromo(
          promoRules,
          newScheduledAt,
          appointment.service_id,
          service.price,
          tz
        )
        finalPrice = promoEval.applied ? promoEval.final_price : service.price
      }
    }

    // 16. Create new appointment
    const newAppointmentPayload: Record<string, unknown> = {
      service_id: appointment.service_id,
      barber_id: barberId,
      business_id: appointment.business_id,
      scheduled_at: newScheduledAt.toISOString(),
      duration_minutes: durationMin,
      status: 'pending',
      client_id: appointment.client_id,
      notes: appointment.notes,
      rescheduled_from: appointment.id,
      reschedule_count: currentRescheduleCount + 1,
      tracking_expires_at: trackingExpiresAt,
    }

    // Attach promo data if applied
    if (promoEval?.applied && promoEval.rule) {
      newAppointmentPayload.promo_rule_id = promoEval.rule.id
      if (finalPrice !== null) {
        newAppointmentPayload.final_price = finalPrice
      }
    }

    const { data: newAppointment, error: insertError } = await (serviceClient as any)
      .from('appointments')
      .insert(newAppointmentPayload as any)
      .select('id, tracking_token')
      .single()

    if (insertError || !newAppointment) {
      console.error('Reschedule: create new appointment error:', insertError)
      return NextResponse.json({ error: 'Error al crear la nueva cita' }, { status: 500 })
    }

    // 17. Build tracking URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://barber-app-gray.vercel.app'
    const trackingToken = (newAppointment as any).tracking_token
    const trackingUrl = trackingToken ? `${appUrl}/track/${trackingToken}` : null

    // 18. Format dates for notification messages (CR timezone)
    const formattedOldDate = format(originalScheduledAt, "EEEE d 'de' MMMM 'a las' h:mm a", {
      locale: es,
    })
    const formattedNewDate = format(newScheduledAt, "EEEE d 'de' MMMM 'a las' h:mm a", {
      locale: es,
    })

    const clientName = appointment.client?.name ?? 'Cliente'
    const clientEmail = appointment.client?.email ?? null

    // 18a. In-app notification for business owner (non-blocking)
    createNotification(serviceClient as any, {
      business_id: business.id,
      user_id: business.owner_id,
      type: 'new_appointment',
      title: 'Cita reagendada por cliente',
      message: `${clientName} reagendó su cita: ${formattedOldDate} → ${formattedNewDate}`,
      reference_type: 'appointment',
      reference_id: (newAppointment as any).id,
    }).catch((err: unknown) => {
      console.error('Reschedule: createNotification error:', err)
    })

    // 18b. Push notification to business owner (non-blocking)
    sendPushToBusinessOwner(business.id, {
      title: 'Cita reagendada',
      body: `${clientName} reagendó su cita`,
      url: '/citas',
    }).catch((err: unknown) => {
      console.error('Reschedule: sendPushToBusinessOwner error:', err)
    })

    // 18c. Email notification to business owner (non-blocking)
    ;(async () => {
      try {
        const { data: owner } = await serviceClient.auth.admin.getUserById(business.owner_id)
        const ownerEmail = owner?.user?.email
        if (ownerEmail) {
          await sendNotificationEmail({
            businessId: business.id,
            notificationType: 'new_appointment',
            to: ownerEmail,
            subject: `Cita reagendada — ${clientName}`,
            react: NewAppointmentEmail({
              businessName: business.name,
              clientName,
              serviceName: 'Cita reagendada',
              appointmentDate: newScheduledAt.toISOString(),
              duration: durationMin,
              price: '',
            }),
          })
        }
      } catch (err) {
        console.error('Reschedule: owner email error:', err)
      }
    })()

    // 18d. Confirmation email to client with new tracking link (non-blocking)
    if (clientEmail && trackingUrl) {
      sendEmail({
        to: clientEmail,
        subject: `Tu cita en ${business.name} ha sido reagendada`,
        react: NewAppointmentEmail({
          businessName: business.name,
          clientName,
          serviceName: 'Cita reagendada',
          appointmentDate: newScheduledAt.toISOString(),
          duration: durationMin,
          price: '',
          trackingUrl,
        }),
      }).catch((err: unknown) => {
        console.error('Reschedule: client email error:', err)
      })
    }

    // 19. Return success
    return NextResponse.json({
      success: true,
      message: 'Cita reagendada exitosamente',
      appointment_id: (newAppointment as any).id,
      tracking_token: trackingToken ?? null,
      tracking_url: trackingUrl,
      scheduled_at: newScheduledAt.toISOString(),
      discount: promoEval ?? null,
    })
  } catch (error) {
    console.error('Public reschedule API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
