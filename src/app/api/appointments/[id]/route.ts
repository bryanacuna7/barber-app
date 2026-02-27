import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, notFoundResponse, errorResponse } from '@/lib/api/middleware'
import { logger } from '@/lib/logger'

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
    logger.error({ err: error }, 'Error fetching appointment')
    return errorResponse('Error interno del servidor')
  }
})

// PATCH - Update appointment
export const PATCH = withAuth(async (request, { params }, { business, supabase }) => {
  try {
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const result = updateAppointmentSchema.safeParse(body)

    if (!result.success) {
      logger.error({ details: result.error.flatten() }, 'API validation failed')
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
      logger.error(
        { message: error.message, details: error.details, hint: error.hint, code: error.code },
        'Error updating appointment'
      )
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
      logger.error('Appointment not found after update')
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // TODO: Update client stats when appointment completed
    // This will be implemented when we add the increment_client_stats RPC function

    return NextResponse.json(appointment)
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error updating appointment')
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
      logger.error({ err: error }, 'Error deleting appointment')
      return errorResponse('Error al eliminar la cita')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error deleting appointment')
    return errorResponse('Error interno del servidor')
  }
})
