import { NextResponse } from 'next/server'
import {
  withAuthAndRateLimit,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'
import { logger, logSecurity } from '@/lib/logger'
import { canModifyBarberAppointments } from '@/lib/rbac'
import { sendPushToBusinessOwner } from '@/lib/push/sender'

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
 * PATCH /api/appointments/[id]/no-show
 *
 * Mark an appointment as no-show (client didn't arrive).
 * Used by barbers in the "Mi Dia" staff view.
 *
 * Security (IDOR Protection):
 * - Appointment must exist and belong to the business
 * - MANDATORY: Validates barber ownership via authenticated user's email
 * - Business owners can mark any appointment as no-show
 * - Barbers can ONLY mark their own appointments as no-show
 * - Appointment must be in 'pending' or 'confirmed' status to mark as no-show
 *
 * Rate Limiting:
 * - 10 requests per minute per user
 * - Prevents accidental double-clicks or abuse
 */
export const PATCH = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    try {
      const { id: appointmentId } = await params

      // 1. Fetch the appointment with barber info
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select(
          `
        id,
        status,
        barber_id,
        business_id,
        barber:barbers!appointments_barber_id_fkey(id, name)
      `
        )
        .eq('id', appointmentId)
        .eq('business_id', business.id)
        .single()

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
          endpoint: '/api/appointments/[id]/no-show',
          action: 'mark_no_show',
        })
        return unauthorizedResponse('No tienes permiso para marcar esta cita como no-show')
      }

      // 3. Validate current status - only pending or confirmed can be marked as no-show
      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        return NextResponse.json(
          {
            error: 'Estado invalido',
            message: `No se puede marcar como no-show una cita con estado "${appointment.status}". Solo citas pendientes o confirmadas pueden marcarse como no-show.`,
          },
          { status: 400 }
        )
      }

      // 4. Update status to no_show
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'no_show' })
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
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
        )
        .single()

      if (updateError) {
        logger.error({ err: updateError }, 'Error updating appointment status')
        return errorResponse('Error al actualizar el estado de la cita')
      }

      logger.info({ appointmentId, status: 'no_show' }, 'Appointment marked as no-show')

      // Push to business owner (async, non-blocking)
      sendPushToBusinessOwner(business.id, {
        title: 'No show',
        body: `${(updatedAppointment as any)?.client?.name || 'Cliente'} no se presentó`,
        url: '/citas',
        tag: `noshow-${appointmentId}`,
      }).catch((err) => logger.error({ err, appointmentId }, 'Push error on no-show'))

      return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
    } catch (error) {
      logger.error({ err: error }, 'Unexpected error in PATCH /api/appointments/[id]/no-show')
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
  }
)
