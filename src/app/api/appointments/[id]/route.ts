// @ts-nocheck
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, notFoundResponse, errorResponse } from '@/lib/api/middleware'

// Validation schemas
const updateAppointmentSchema = z.object({
  client_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  client_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single appointment
export const GET = withAuth(async (request, { params }, { business, supabase }) => {
  try {
    const { id } = await params

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
      )
      .eq('id', id)
      .eq('business_id', business.id)
      .single()

    if (error || !appointment) {
      return notFoundResponse('Cita no encontrada')
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error:', error)
    return errorResponse('Error interno del servidor')
  }
})

// PATCH - Update appointment
export const PATCH = withAuth(async (request, { params }, { business, supabase }) => {
  try {
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    console.log('📍 API: Update appointment request:', { id, body })
    const result = updateAppointmentSchema.safeParse(body)

    if (!result.success) {
      console.error('❌ API: Validation failed:', result.error.flatten())
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (result.data.client_id) updateData.client_id = result.data.client_id
    if (result.data.scheduled_at) updateData.scheduled_at = result.data.scheduled_at
    if (result.data.status) updateData.status = result.data.status
    if (result.data.client_notes !== undefined) updateData.client_notes = result.data.client_notes
    if (result.data.internal_notes !== undefined)
      updateData.internal_notes = result.data.internal_notes

    console.log('📍 API: Update data:', updateData)

    // If service changed, update duration and price
    if (result.data.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes, price')
        .eq('id', result.data.service_id)
        .eq('business_id', business.id)
        .single()

      if (service) {
        updateData.service_id = result.data.service_id
        updateData.duration_minutes = service.duration_minutes ?? 30
        updateData.price = service.price
      }
    }

    // Update appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .eq('business_id', business.id)
      .select(
        `
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
      )
      .single()

    if (error) {
      console.error('❌ API: Error updating appointment:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full: error,
      })
      return NextResponse.json(
        {
          error: 'Error al actualizar la cita',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    if (!appointment) {
      console.error('❌ API: Appointment not found after update')
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    console.log(
      '✅ API: Appointment updated successfully:',
      appointment.id,
      'status:',
      appointment.status
    )

    // TODO: Update client stats when appointment completed
    // This will be implemented when we add the increment_client_stats RPC function

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Error interno del servidor')
  }
})

// DELETE - Delete appointment
export const DELETE = withAuth(async (request, { params }, { business, supabase }) => {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id)

    if (error) {
      console.error('Error deleting appointment:', error)
      return errorResponse('Error al eliminar la cita')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Error interno del servidor')
  }
})
