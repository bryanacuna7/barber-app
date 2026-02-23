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
import { createNotification } from '@/lib/notifications'
import { sendPushToBusinessOwner } from '@/lib/push/sender'
import { sendNotificationEmail, sendEmail } from '@/lib/email/sender'
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
  client_name: string | null
  client_phone: string | null
  client_email: string | null
  cancelled_by: string | null
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
        'id, status, scheduled_at, service_id, barber_id, business_id, client_name, client_phone, client_email, cancelled_by'
      )
      .eq('tracking_token', token)
      .single()) as { data: AppointmentRow | null; error: unknown }

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 5. Guard: must be in 'scheduled' status
    if (appointment.status !== 'scheduled') {
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
      console.error('Cancel appointment update error:', updateError)
      return NextResponse.json({ error: 'Error al cancelar la cita' }, { status: 500 })
    }

    // 10. Format date for notifications
    const formattedDate = format(scheduledAt, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })

    const clientName = appointment.client_name ?? 'Cliente'

    // 11. Fire notifications (non-blocking)

    // In-app notification for business owner
    createNotification(serviceClient as any, {
      business_id: business.id,
      user_id: business.owner_id,
      type: 'appointment_cancelled',
      title: 'Cita cancelada por cliente',
      message: `${clientName} canceló su cita del ${formattedDate}`,
      reference_type: 'appointment',
      reference_id: appointment.id,
    }).catch((err) => {
      console.error('Cancel: createNotification error:', err)
    })

    // Push notification to business owner
    sendPushToBusinessOwner(business.id, {
      title: 'Cita cancelada',
      body: `${clientName} canceló su cita`,
      url: '/citas',
    }).catch((err) => {
      console.error('Cancel: sendPushToBusinessOwner error:', err)
    })

    // Email to business owner (respects notification preferences)
    ;(async () => {
      try {
        const { data: owner } = await serviceClient.auth.admin.getUserById(business.owner_id)
        const ownerEmail = owner?.user?.email
        if (ownerEmail) {
          await sendNotificationEmail({
            businessId: business.id,
            notificationType: 'appointment_cancelled',
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
          })
        }
      } catch (err) {
        console.error('Cancel: owner email error:', err)
      }
    })()

    // Confirmation email to client (if email exists)
    if (appointment.client_email) {
      sendEmail({
        to: appointment.client_email,
        subject: `Tu cita en ${business.name} ha sido cancelada`,
        react: AppointmentCancelledEmail({
          businessName: business.name,
          clientName,
          appointmentDate: appointment.scheduled_at,
        }),
      }).catch((err) => {
        console.error('Cancel: client email error:', err)
      })
    }

    // 12. Return success
    return NextResponse.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      refund_eligible: false,
    })
  } catch (error) {
    console.error('Public cancel API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
