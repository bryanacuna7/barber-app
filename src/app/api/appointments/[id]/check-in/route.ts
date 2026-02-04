import { NextResponse } from 'next/server'
import {
  withAuthAndRateLimit,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'
import { logger, logSecurity } from '@/lib/logger'
import { canModifyBarberAppointments } from '@/lib/rbac'

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
 * PATCH /api/appointments/[id]/check-in
 *
 * Mark an appointment as checked in (status: confirmed).
 * Used by barbers in the "Mi Dia" staff view.
 *
 * Security (IDOR Protection):
 * - Appointment must exist and belong to the business
 * - MANDATORY: Validates barber ownership via authenticated user's email
 * - Business owners can check-in any appointment
 * - Barbers can ONLY check-in their own appointments
 * - Appointment must be in 'pending' status to check in
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
          endpoint: '/api/appointments/[id]/check-in',
          action: 'check_in_appointment',
        })
        return unauthorizedResponse('No tienes permiso para hacer check-in de esta cita')
      }

      // 3. Validate current status - only pending appointments can be checked in
      if (appointment.status !== 'pending') {
        return NextResponse.json(
          {
            error: 'Estado invalido',
            message: `No se puede hacer check-in de una cita con estado "${appointment.status}". Solo citas pendientes pueden hacer check-in.`,
          },
          { status: 400 }
        )
      }

      // 4. Update status to confirmed
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
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
        console.error('Error updating appointment status:', updateError)
        return errorResponse('Error al actualizar el estado de la cita')
      }

      logger.info({ appointmentId, status: 'confirmed' }, 'Appointment checked in successfully')

      return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
    } catch (error) {
      console.error('Unexpected error in PATCH /api/appointments/[id]/check-in:', error)
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
  }
)
