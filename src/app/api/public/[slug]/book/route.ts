import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { processAppointmentLoyalty } from '@/lib/gamification/loyalty-calculator-server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { logger, logRequest, logResponse, logBusiness, logSecurity } from '@/lib/logger'

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  client_name: z.string().min(2),
  client_phone: z.string().min(8),
  client_email: z.string().email().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now()
  const { slug } = await params

  // Log incoming request
  logRequest(request, { slug, endpoint: 'public_booking' })

  // Rate limiting - prevent booking spam/abuse (30 requests per minute)
  const rateLimitResult = await rateLimit(request as any, RateLimitPresets.moderate)
  if (!rateLimitResult.success) {
    logSecurity('rate_limit', 'medium', { slug, endpoint: 'public_booking' })
    logResponse(request, 429, Date.now() - startTime)

    return NextResponse.json(
      { error: 'Too many booking requests. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }

  let body
  try {
    body = await request.json()
  } catch (error) {
    logger.warn({ slug, error }, 'Invalid JSON in booking request')
    logResponse(request, 400, Date.now() - startTime)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    logger.warn({ slug, errors: parsed.error.flatten() }, 'Invalid booking data')
    logResponse(request, 400, Date.now() - startTime)
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { service_id, barber_id, scheduled_at, client_name, client_phone, client_email, notes } =
    parsed.data

  const supabase = await createServiceClient()

  // Get business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (businessError || !business) {
    logger.warn({ slug, error: businessError }, 'Business not found for booking')
    logResponse(request, 404, Date.now() - startTime)
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, duration_minutes, price')
    .eq('id', service_id)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .single()

  if (serviceError || !service) {
    logger.warn(
      { slug, businessId: business.id, serviceId: service_id, error: serviceError },
      'Service not found'
    )
    logResponse(request, 404, Date.now() - startTime)
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // Validate barber exists and belongs to business
  const { data: barber, error: barberError } = await supabase
    .from('barbers')
    .select('id')
    .eq('id', barber_id)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .single()

  if (barberError || !barber) {
    logger.warn(
      { slug, businessId: business.id, barberId: barber_id, error: barberError },
      'Barber not found or inactive'
    )
    logResponse(request, 404, Date.now() - startTime)
    return NextResponse.json({ error: 'Barber not found or inactive' }, { status: 404 })
  }

  // Find or create client
  let client
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('business_id', business.id)
    .eq('phone', client_phone)
    .single()

  if (existingClient) {
    client = existingClient
    logger.debug(
      { clientId: client.id, businessId: business.id },
      'Existing client found for booking'
    )
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name: client_name,
        phone: client_phone,
        email: client_email || null,
      })
      .select('id')
      .single()

    if (clientError) {
      logger.error({ businessId: business.id, error: clientError }, 'Failed to create client')
      logResponse(request, 500, Date.now() - startTime)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    client = newClient
    logBusiness('client_created', business.id, { clientId: client.id, clientPhone: client_phone })
  }

  // Create appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      business_id: business.id,
      client_id: client.id,
      service_id: service.id,
      barber_id: barber_id,
      scheduled_at,
      duration_minutes: service.duration_minutes ?? 30,
      price: service.price,
      status: 'pending',
      client_notes: notes || null,
    })
    .select('id')
    .single()

  if (appointmentError) {
    logger.error(
      {
        businessId: business.id,
        clientId: client.id,
        serviceId: service.id,
        barberId: barber_id,
        error: appointmentError,
      },
      'Failed to create appointment'
    )
    logResponse(request, 500, Date.now() - startTime)
    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: appointmentError.message || 'Unknown error',
      },
      { status: 500 }
    )
  }

  // Log successful booking
  logBusiness('appointment_created', business.id, {
    appointmentId: appointment.id,
    clientId: client.id,
    serviceId: service.id,
    barberId: barber_id,
    price: service.price,
    scheduledAt: scheduled_at,
  })

  // Process loyalty points and rewards
  // Note: This runs asynchronously and doesn't block the booking response
  // If it fails, the booking is still successful
  processAppointmentLoyalty(appointment.id, client.id, business.id, service.price).catch(
    (error) => {
      logger.error(
        {
          appointmentId: appointment.id,
          clientId: client.id,
          businessId: business.id,
          error,
        },
        'Loyalty processing error (booking still successful)'
      )
    }
  )

  const duration = Date.now() - startTime
  logResponse(request, 200, duration, {
    appointmentId: appointment.id,
    clientId: client.id,
  })

  return NextResponse.json({
    success: true,
    appointment_id: appointment.id,
    client_id: client.id,
    client_email: client_email || null,
    message: 'Cita reservada exitosamente',
  })
}
