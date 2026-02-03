// @ts-nocheck
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { processAppointmentLoyalty } from '@/lib/gamification/loyalty-calculator-server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

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
  const { slug } = await params

  // Rate limiting - prevent booking spam/abuse (30 requests per minute)
  const rateLimitResult = await rateLimit(request as any, RateLimitPresets.moderate)
  if (!rateLimitResult.success) {
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
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
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
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    client = newClient
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
    console.error('[Book API] Appointment creation error:', appointmentError)
    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: appointmentError.message || 'Unknown error',
      },
      { status: 500 }
    )
  }

  // Process loyalty points and rewards
  // Note: This runs asynchronously and doesn't block the booking response
  // If it fails, the booking is still successful
  processAppointmentLoyalty(appointment.id, client.id, business.id, service.price).catch(
    (error) => {
      console.error('[Book API] Loyalty processing error:', error)
      // Log error but don't fail the booking
    }
  )

  return NextResponse.json({
    success: true,
    appointment_id: appointment.id,
    client_id: client.id,
    client_email: client_email || null,
    message: 'Cita reservada exitosamente',
  })
}
