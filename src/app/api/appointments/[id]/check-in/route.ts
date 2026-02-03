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
 * PATCH /api/appointments/[id]/check-in
 *
 * Mark an appointment as checked in (status: confirmed).
 * Used by barbers in the "Mi Dia" staff view.
 *
 * Validations:
 * - Appointment must exist and belong to the business
 * - Optionally validates barber ownership (if barberId provided in body)
 * - Appointment must be in 'pending' status to check in
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

    console.log(`Check-in: Appointment ${appointmentId} status changed to confirmed`)

    return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/appointments/[id]/check-in:', error)
    return errorResponse('Error interno del servidor')
  }
})
