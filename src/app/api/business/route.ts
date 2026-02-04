import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth, errorResponse, notFoundResponse } from '@/lib/api/middleware'

// GET - Fetch business for authenticated user
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH - Update business settings
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()

  // Get existing business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // Build update payload
  const updateData: Record<string, unknown> = {
    name: body.name,
    phone: body.phone || null,
    whatsapp: body.whatsapp || null,
    address: body.address || null,
    timezone: body.timezone || 'America/Costa_Rica',
    operating_hours: body.operating_hours,
    booking_buffer_minutes: body.booking_buffer_minutes || 15,
    advance_booking_days: body.advance_booking_days || 14,
    updated_at: new Date().toISOString(),
  }

  // Include brand fields if provided
  if (body.brand_primary_color !== undefined) {
    updateData.brand_primary_color = body.brand_primary_color
  }
  if (body.brand_secondary_color !== undefined) {
    updateData.brand_secondary_color = body.brand_secondary_color || null
  }

  // Update business
  const { data, error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', business.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }

  return NextResponse.json(data)
}
