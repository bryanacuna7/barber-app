import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Validation schema for creating/updating appointments
const appointmentSchema = z.object({
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  client_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable()
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
})

// GET - Fetch appointments for the authenticated user's business
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user's business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      )
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `)
      .eq('business_id', business.id)
      .order('scheduled_at', { ascending: true })

    // Apply filters
    if (date) {
      const dayStart = `${date}T00:00:00`
      const dayEnd = `${date}T23:59:59`
      query = query.gte('scheduled_at', dayStart).lte('scheduled_at', dayEnd)
    } else if (startDate && endDate) {
      query = query.gte('scheduled_at', `${startDate}T00:00:00`).lte('scheduled_at', `${endDate}T23:59:59`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Error al obtener citas' },
        { status: 500 }
      )
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create a new appointment
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user's business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const result = appointmentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Get service details for duration and price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes, price')
      .eq('id', result.data.service_id)
      .eq('business_id', business.id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        business_id: business.id,
        client_id: result.data.client_id,
        service_id: result.data.service_id,
        scheduled_at: result.data.scheduled_at,
        duration_minutes: service.duration_minutes ?? 30,
        price: service.price,
        client_notes: result.data.client_notes,
        internal_notes: result.data.internal_notes,
        status: 'pending'
      })
      .select(`
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `)
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return NextResponse.json(
        { error: 'Error al crear la cita' },
        { status: 500 }
      )
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
