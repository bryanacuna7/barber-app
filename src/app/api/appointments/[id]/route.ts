import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Validation schemas
const updateAppointmentSchema = z.object({
  client_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  client_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single appointment
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Get appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `)
      .eq('id', id)
      .eq('business_id', business.id)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Update appointment
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const result = updateAppointmentSchema.safeParse(body)

    if (!result.success) {
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
    if (result.data.internal_notes !== undefined) updateData.internal_notes = result.data.internal_notes

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
      .select(`
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `)
      .single()

    if (error) {
      console.error('Error updating appointment:', error)
      return NextResponse.json({ error: 'Error al actualizar la cita' }, { status: 500 })
    }

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // TODO: Update client stats when appointment completed
    // This will be implemented when we add the increment_client_stats RPC function

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Delete appointment
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Delete appointment
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id)

    if (error) {
      console.error('Error deleting appointment:', error)
      return NextResponse.json({ error: 'Error al eliminar la cita' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
