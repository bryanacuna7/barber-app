import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { logger } from '@/lib/logger'

// Validation schema for creating/updating appointments
const appointmentSchema = z.object({
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  client_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
})

// GET - Fetch appointments for the authenticated user's business
export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    // Parse query params for filtering
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10)
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 500)
    const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset

    // Build query with pagination
    let query = supabase
      .from('appointments')
      .select(
        'id, business_id, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, status, payment_method, source, client_notes, started_at, actual_duration_minutes, advance_payment_status, advance_payment_proof_url, client:clients!appointments_client_id_fkey(id, name, phone, email), service:services!appointments_service_id_fkey(id, name, duration_minutes, price)',
        { count: 'exact' }
      )
      .eq('business_id', business.id)
      .order('scheduled_at', { ascending: true })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (date) {
      const dayStart = `${date}T00:00:00`
      const dayEnd = `${date}T23:59:59`
      query = query.gte('scheduled_at', dayStart).lte('scheduled_at', dayEnd)
    } else if (startDate && endDate) {
      query = query
        .gte('scheduled_at', `${startDate}T00:00:00`)
        .lte('scheduled_at', `${endDate}T23:59:59`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const clientId = searchParams.get('client_id')
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data: appointments, error, count } = await query

    if (error) {
      logger.error({ err: error }, 'Error fetching appointments')
      return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 })
    }

    // Return with pagination metadata (backward compatible - returns array directly when no pagination params)
    if (searchParams.get('limit')) {
      return NextResponse.json({
        data: appointments,
        pagination: {
          total: count || 0,
          offset,
          limit,
          hasMore: count ? offset + limit < count : false,
        },
      })
    }

    // Backward compatible: return array directly for existing consumers
    return NextResponse.json(appointments)
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error in GET /api/appointments')
    return errorResponse('Error interno del servidor')
  }
})

// POST - Create a new appointment
export const POST = withAuth(async (request, context, { business, supabase }) => {
  try {
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
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Create appointment
    const { data: appointment, error } = await (supabase as any)
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
        status: 'pending',
        source: 'owner_created',
      })
      .select(
        `
        *,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
      )
      .single()

    if (error) {
      logger.error({ err: error }, 'Error creating appointment')
      return NextResponse.json({ error: 'Error al crear la cita' }, { status: 500 })
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error in POST /api/appointments')
    return errorResponse('Error interno del servidor')
  }
})
