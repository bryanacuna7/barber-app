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
 * PATCH /api/appointments/[id]/complete
 *
 * Mark an appointment as completed.
 * Used by barbers in the "Mi Dia" staff view.
 *
 * Validations:
 * - Appointment must exist and belong to the business
 * - Optionally validates barber ownership (if barberId provided in body)
 * - Appointment must be in 'pending' or 'confirmed' status to complete
 *
 * Side effects:
 * - Updates client stats (total_visits, total_spent, last_visit_at)
 * - Updates barber stats if gamification is enabled
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

    // 1. Fetch the appointment with client info
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, barber_id, business_id, client_id, price')
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

    // 5. Update client stats (total_visits, total_spent, last_visit_at)
    if (appointment.client_id) {
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({
          total_visits: supabase.rpc('increment', { x: 1 }) as unknown as number,
          total_spent: supabase.rpc('increment', {
            x: appointment.price || 0,
          }) as unknown as number,
          last_visit_at: new Date().toISOString(),
        })
        .eq('id', appointment.client_id)

      // Use raw SQL update as fallback if RPC doesn't exist
      if (clientUpdateError) {
        // Fallback: fetch current values and increment manually
        const { data: client } = await supabase
          .from('clients')
          .select('total_visits, total_spent')
          .eq('id', appointment.client_id)
          .single()

        if (client) {
          await supabase
            .from('clients')
            .update({
              total_visits: (client.total_visits || 0) + 1,
              total_spent: (client.total_spent || 0) + (appointment.price || 0),
              last_visit_at: new Date().toISOString(),
            })
            .eq('id', appointment.client_id)
        }
      }
    }

    // 6. Update barber stats if gamification is enabled
    // Note: This is handled by database triggers in migration 018_barber_gamification.sql
    // The trigger automatically updates barber_stats when appointment status changes to 'completed'

    console.log(`Complete: Appointment ${appointmentId} status changed to completed`)

    return NextResponse.json(updatedAppointment as AppointmentStatusUpdateResponse)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/appointments/[id]/complete:', error)
    return errorResponse('Error interno del servidor')
  }
})
