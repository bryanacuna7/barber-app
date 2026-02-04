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

      // 1. Fetch the appointment with barber info
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select(
          `
        id,
        status,
        barber_id,
        business_id,
        client_id,
        price,
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

      // 4. Update status to completed
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
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

      // 5. Update client stats atomically to prevent race conditions (CWE-915)
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

      // 6. Update barber stats if gamification is enabled
      // Note: This is handled by database triggers in migration 018_barber_gamification.sql
      // The trigger automatically updates barber_stats when appointment status changes to 'completed'

      logger.info({ appointmentId, status: 'completed' }, 'Appointment status changed to completed')

      return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
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
