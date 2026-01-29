// @ts-nocheck
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { canAddClient } from '@/lib/subscription'

// Validation schema for creating clients
const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// GET - Fetch clients for the authenticated user's business
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query with pagination
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('business_id', business.id)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: clients, error, count } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
    }

    return NextResponse.json({
      data: clients,
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create a new client
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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
    const result = clientSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Check subscription limits
    const limitCheck = await canAddClient(supabase, business.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Límite de plan alcanzado',
          message: limitCheck.reason,
          current: limitCheck.current,
          max: limitCheck.max,
          upgrade_required: true,
        },
        { status: 403 }
      )
    }

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        notes: result.data.notes,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate phone
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un cliente con ese teléfono' },
          { status: 409 }
        )
      }
      console.error('Error creating client:', error)
      return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
