/**
 * POST /api/public/cancel
 *
 * Public cancel endpoint — token-based auth (no login required).
 * Allows clients to cancel their own appointment using the tracking token.
 *
 * Security:
 * - Rate limited: 5 req/min per IP
 * - Validates tracking_token UUID format
 * - Enforces cancellation policy (enabled flag + deadline)
 * - Uses service client to bypass RLS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { notify } from '@/lib/notifications/orchestrator'
import { sendEmail } from '@/lib/email/sender'
import NewAppointmentEmail from '@/lib/email/templates/new-appointment'
import AppointmentCancelledEmail from '@/lib/email/templates/appointment-cancelled'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CancellationPolicy } from '@/types'

// Custom rate limit: 5 requests/min (strict — cancellations should be rare)
const CANCEL_RATE_LIMIT = { interval: 60_000, maxRequests: 5 }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface AppointmentRow {
  id: string
  status: string
  scheduled_at: string
  service_id: string | null
  barber_id: string | null
  business_id: string
  cancelled_by: string | null
  client: { name: string | null; phone: string | null; email: string | null } | null
}

interface BusinessRow {
  id: string
  name: string
  owner_id: string
  cancellation_policy: CancellationPolicy | null
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const rl = await rateLimit(request, CANCEL_RATE_LIMIT)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un momento.' },
        { status: 429, headers: rl.headers }
      )
    }

    // 2. Parse and validate body
    let body: { token?: string; reason?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    // 3. Validate UUID format
    if (!UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // 4. Lookup appointment by tracking_token
    const { data: appointment, error: apptError } = (await (serviceClient as any)
      .from('appointments')
      .select(
        'id, status, scheduled_at, service_id, barber_id, business_id, cancelled_by, client:clients(name, phone, email)'
      )
      .eq('tracking_token', token)
      .single()) as { data: AppointmentRow | null; error: unknown }

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 5. Guard: must be in 'pending' or 'confirmed' status
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return NextResponse.json({ error: 'La cita ya no puede ser cancelada' }, { status: 400 })
    }

    // 6. Lookup business + cancellation policy
    const { data: business, error: bizError } = (await (serviceClient as any)
      .from('businesses')
      .select('id, cancellation_policy, name, owner_id')
      .eq('id', appointment.business_id)
      .single()) as { data: BusinessRow | null; error: unknown }

    if (bizError || !business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const policy: CancellationPolicy = business.cancellation_policy ?? {
      enabled: false,
      deadline_hours: 24,
      allow_reschedule: false,
    }

    // 7. Guard: cancellations must be enabled
    if (!policy.enabled) {
      return NextResponse.json(
        { error: 'Esta barbería no permite cancelaciones online' },
        { status: 403 }
      )
    }

    // 8. Guard: deadline check
    const scheduledAt = new Date(appointment.scheduled_at)
    const deadlineMs = policy.deadline_hours * 60 * 60 * 1000
    const deadline = new Date(scheduledAt.getTime() - deadlineMs)

    if (new Date() > deadline) {
      return NextResponse.json({ error: 'El tiempo límite para cancelar ya pasó' }, { status: 400 })
    }

    // 9. Cancel the appointment
    const { error: updateError } = await (serviceClient as any)
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_by: 'client',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointment.id)

    if (updateError) {
      logger.error({ err: updateError }, 'Cancel appointment update error')
      return NextResponse.json({ error: 'Error al cancelar la cita' }, { status: 500 })
    }

    // 10. Format date for notifications
    const formattedDate = format(scheduledAt, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })

    const clientName = appointment.client?.name ?? 'Cliente'

    // 11. Fire notifications (non-blocking)

    // Notify business owner: in-app + push + email
    ;(async () => {
      try {
        const { data: owner } = await serviceClient.auth.admin.getUserById(business.owner_id)
        const ownerEmail = owner?.user?.email

        await notify(
          'appointment_cancelled',
          {
            businessId: business.id,
            appointmentId: appointment.id,
            userId: business.owner_id,
            recipientEmail: ownerEmail || undefined,
            data: {
              clientName,
              formattedDate,
              pushTitle: 'Cita cancelada',
              pushBody: `${clientName} canceló su cita`,
              pushUrl: '/citas',
            },
          },
          {
            inApp: {
              title: 'Cita cancelada por cliente',
              message: `${clientName} canceló su cita del ${formattedDate}`,
              referenceType: 'appointment',
              referenceId: appointment.id,
            },
            push: {
              title: 'Cita cancelada',
              body: `${clientName} canceló su cita`,
              url: '/citas',
            },
            email: ownerEmail
              ? {
                  to: ownerEmail,
                  subject: `Cita cancelada — ${clientName}`,
                  react: NewAppointmentEmail({
                    businessName: business.name,
                    clientName,
                    serviceName: 'Cita cancelada',
                    appointmentDate: appointment.scheduled_at,
                    duration: 0,
                    price: '',
                  }),
                }
              : undefined,
          }
        )
      } catch (err) {
        logger.error({ err }, 'Cancel: owner notification error')
      }
    })()

    // Confirmation email to client (if email exists)
    if (appointment.client?.email) {
      sendEmail({
        to: appointment.client.email,
        subject: `Tu cita en ${business.name} ha sido cancelada`,
        react: AppointmentCancelledEmail({
          businessName: business.name,
          clientName,
          appointmentDate: appointment.scheduled_at,
        }),
      }).catch((err) => {
        logger.error({ err }, 'Cancel: client email error')
      })
    }

    // 12. Return success
    return NextResponse.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      refund_eligible: false,
    })
  } catch (error) {
    logger.error({ err: error }, 'Public cancel API error')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
