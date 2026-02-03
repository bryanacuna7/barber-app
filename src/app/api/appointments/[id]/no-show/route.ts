import { NextResponse } from 'next/server'
import {
  withAuth,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'

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
 * Validations:
 * - Appointment must exist and belong to the business
 * - Optionally validates barber ownership (if barberId provided in body)
 * - Appointment must be in 'pending' or 'confirmed' status to mark as no-show
 */
export const PATCH = withAuth<RouteParams>(async (request, { params }, { business, supabase }) => {
  try {
    const { id: appointmentId } = await params

    // Parse optional body for barber validation
    let barberId: string | undefined
    try {
      const body = await request.json()
      barberId = body.barberId
    } catch {
      // No body provided, which is fine
    }

    // 1. Fetch the appointment
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, barber_id, business_id')
      .eq('id', appointmentId)
      .eq('business_id', business.id)
      .single()

    if (fetchError || !appointment) {
      return notFoundResponse('Cita no encontrada')
    }

    // 2. Validate barber ownership if barberId provided
    if (barberId && appointment.barber_id !== barberId) {
      return unauthorizedResponse('Esta cita no pertenece a este barbero')
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
      console.error('Error updating appointment status:', updateError)
      return errorResponse('Error al actualizar el estado de la cita')
    }

    console.log(`No-show: Appointment ${appointmentId} status changed to no_show`)

    return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/appointments/[id]/no-show:', error)
    return errorResponse('Error interno del servidor')
  }
})
