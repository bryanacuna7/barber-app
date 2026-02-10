import { NextResponse } from 'next/server'
import {
  withAuthAndRateLimit,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'
import { logger, logSecurity } from '@/lib/logger'
import { canModifyBarberAppointments } from '@/lib/rbac'
import { sendPushToBusinessOwner, sendPushToUser } from '@/lib/push/sender'
import { createServiceClient } from '@/lib/supabase/service-client'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Response type for appointment status update
 */
export interface AppointmentStatusUpdateResponse {
  id: string
  status: string
  scheduled_at: string
  duration_minutes: number
  price: number
  client_notes: string | null
  internal_notes: string | null
  client: {
    id: string
    name: string
    phone: string | null
    email: string | null
  } | null
  service: {
    id: string
    name: string
    duration_minutes: number
    price: number
  } | null
}

/**
 * PATCH /api/appointments/[id]/complete
 *
 * Mark an appointment as completed.
 * Used by barbers in the "Mi Dia" staff view.
 *
 * Security (IDOR Protection):
 * - Appointment must exist and belong to the business
 * - MANDATORY: Validates barber ownership via authenticated user's email
 * - Business owners can complete any appointment
 * - Barbers can ONLY complete their own appointments
 * - Appointment must be in 'pending' or 'confirmed' status to complete
 *
 * Rate Limiting:
 * - 10 requests per minute per user
 * - Prevents accidental double-clicks or abuse
 *
 * Side effects:
 * - Updates client stats (total_visits, total_spent, last_visit_at)
 * - Updates barber stats if gamification is enabled
 */
export const PATCH = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    try {
      const { id: appointmentId } = await params

      // Parse request body for payment_method
      let paymentMethod: string | null = null
      try {
        const body = await request.json()
        if (body.payment_method && ['cash', 'sinpe', 'card'].includes(body.payment_method)) {
          paymentMethod = body.payment_method
        }
      } catch {
        // No body or invalid JSON — payment_method stays null (backwards compatible)
      }

      // 1. Fetch the appointment with barber info
      const { data: appointment, error: fetchError } = (await supabase
        .from('appointments')
        .select(
          `
        id,
        status,
        barber_id,
        business_id,
        client_id,
        price,
        started_at,
        barber:barbers!appointments_barber_id_fkey(id, name)
      `
        )
        .eq('id', appointmentId)
        .eq('business_id', business.id)
        .single()) as any

      if (fetchError || !appointment) {
        return notFoundResponse('Cita no encontrada')
      }

      // 2. IDOR PROTECTION: Verify authenticated user can modify this appointment
      // Uses RBAC system to check:
      // - Business owner (can modify all)
      // - User has write_all_appointments permission (admin, recepcionista)
      // - User is the barber themselves with write_own_appointments permission
      const canModify = await canModifyBarberAppointments(
        supabase,
        user.id,
        appointment.barber_id,
        business.id,
        business.owner_id
      )

      if (!canModify) {
        logSecurity('unauthorized', 'high', {
          userId: user.id,
          userEmail: user.email,
          requestedBarberId: appointment.barber_id,
          barberName: (appointment.barber as any)?.name,
          appointmentId,
          businessId: business.id,
          endpoint: '/api/appointments/[id]/complete',
          action: 'complete_appointment',
        })
        return unauthorizedResponse('No tienes permiso para completar esta cita')
      }

      // 3. Validate current status - only pending or confirmed can be completed
      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        return NextResponse.json(
          {
            error: 'Estado invalido',
            message: `No se puede completar una cita con estado "${appointment.status}". Solo citas pendientes o confirmadas pueden completarse.`,
          },
          { status: 400 }
        )
      }

      // 4. Calculate actual duration if started_at exists
      let actualDurationMinutes: number | null = null
      if (appointment.started_at) {
        const startedAt = new Date(appointment.started_at)
        const now = new Date()
        actualDurationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000)
        // Sanity check: if duration is negative or unreasonably long (>8h), set null
        if (actualDurationMinutes < 0 || actualDurationMinutes > 480) {
          actualDurationMinutes = null
        }
      }

      // 5. Update status to completed with payment + duration data
      const updateData: Record<string, unknown> = { status: 'completed' }
      if (paymentMethod) updateData.payment_method = paymentMethod
      if (actualDurationMinutes !== null) updateData.actual_duration_minutes = actualDurationMinutes

      // Note: started_at, actual_duration_minutes, payment_method columns exist after migration 025
      // Using `as any` until Supabase types are regenerated
      const { data: updatedAppointment, error: updateError } = (await supabase
        .from('appointments')
        .update(updateData as any)
        .eq('id', appointmentId)
        .eq('business_id', business.id)
        .select(
          `
        id,
        status,
        scheduled_at,
        duration_minutes,
        price,
        client_notes,
        internal_notes,
        started_at,
        actual_duration_minutes,
        payment_method,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
        )
        .single()) as any

      if (updateError) {
        console.error('Error updating appointment status:', updateError)
        return errorResponse('Error al actualizar el estado de la cita')
      }

      // 6. Update client stats atomically to prevent race conditions (CWE-915)
      // Using atomic database function instead of fetch-then-update pattern
      if (appointment.client_id) {
        const { error: statsError } = await supabase.rpc('increment_client_stats', {
          p_client_id: appointment.client_id,
          p_visits_increment: 1,
          p_spent_increment: appointment.price || 0,
          p_last_visit_timestamp: new Date().toISOString(),
        })

        if (statsError) {
          // Log error but don't fail the appointment completion
          // Stats can be recalculated later if needed
          console.error(
            `Failed to update client stats for client ${appointment.client_id}:`,
            statsError
          )
          // Note: We don't return error response here because the appointment
          // was already marked as completed. Stats inconsistency is less critical
          // than losing the completion status.
        }
      }

      // 7. Update barber stats if gamification is enabled
      // Note: This is handled by database triggers in migration 018_barber_gamification.sql
      // The trigger automatically updates barber_stats when appointment status changes to 'completed'

      logger.info({ appointmentId, status: 'completed' }, 'Appointment status changed to completed')

      // Push to business owner (async, non-blocking)
      const clientName = (updatedAppointment as any).client?.name || 'Cliente'
      const durationStr = actualDurationMinutes ? `${actualDurationMinutes}min` : ''
      const paymentLabels: Record<string, string> = {
        cash: 'Efectivo',
        sinpe: 'SINPE',
        card: 'Tarjeta',
      }
      const paymentStr = paymentMethod ? paymentLabels[paymentMethod] || '' : ''
      const pushBody = [clientName, durationStr, paymentStr].filter(Boolean).join(' · ')

      sendPushToBusinessOwner(business.id, {
        title: 'Cita completada',
        body: pushBody,
        url: '/citas',
        tag: `complete-${appointmentId}`,
      }).catch((err) => logger.error({ err, appointmentId }, 'Push error on complete'))

      // 8. Push "arrive early" to next client if their appointment is within 60 min
      // Uses service client to bypass RLS for cross-client lookup
      const serviceClient = createServiceClient()
      const now = new Date()
      const sixtyMinFromNow = new Date(now.getTime() + 60 * 60_000)

      const { data: nextAppt } = (await serviceClient
        .from('appointments')
        .select(
          'id, client_id, scheduled_at, tracking_token, barber_id, service:services!appointments_service_id_fkey(name)'
        )
        .eq('barber_id', appointment.barber_id)
        .eq('business_id', business.id)
        .in('status', ['pending', 'confirmed'])
        .neq('id', appointmentId)
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', sixtyMinFromNow.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()) as any

      if (nextAppt?.client_id) {
        const { data: nextClient } = await serviceClient
          .from('clients')
          .select('user_id')
          .eq('id', nextAppt.client_id)
          .single()

        if (nextClient?.user_id) {
          const barberName = (appointment.barber as any)?.name || 'Tu barbero'
          const trackingPath = nextAppt.tracking_token
            ? `/track/${nextAppt.tracking_token}`
            : '/mi-cuenta'

          sendPushToUser(nextClient.user_id, {
            title: `${barberName} ya está disponible`,
            body: `Terminó antes de lo esperado. Podés llegar ya!`,
            url: trackingPath,
            tag: `arrive-early-${nextAppt.id}`,
          }).catch((err) =>
            logger.error({ err, nextApptId: nextAppt.id }, 'Push arrive-early failed')
          )
        }
      }

      return NextResponse.json(updatedAppointment)
    } catch (error) {
      console.error('Unexpected error in PATCH /api/appointments/[id]/complete:', error)
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
  }
)
