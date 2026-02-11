import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { processAppointmentLoyalty } from '@/lib/gamification/loyalty-calculator-server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { logger, logRequest, logResponse, logBusiness, logSecurity } from '@/lib/logger'
import { sendNotificationEmail, sendEmail } from '@/lib/email/sender'
import { sendPushToBusinessOwner } from '@/lib/push/sender'
import NewAppointmentEmail from '@/lib/email/templates/new-appointment'

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
  // Note: smart_duration_enabled added in migration 033, using `as any` until types regenerated
  const { data: business, error: businessError } = (await supabase
    .from('businesses')
    .select('id, name, logo_url, brand_primary_color, owner_id, smart_duration_enabled')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()) as any

  if (businessError || !business) {
    logger.warn({ slug, error: businessError }, 'Business not found for booking')
    logResponse(request, 404, Date.now() - startTime)
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
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
    .select('id, name')
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

  // Smart duration: predict if enabled, otherwise use fixed service duration
  let durationMin = service.duration_minutes ?? 30
  if ((business as any).smart_duration_enabled) {
    const { getPredictedDuration } = await import('@/lib/utils/duration-predictor')
    durationMin = await getPredictedDuration(business.id, service_id, barber_id, durationMin)
  }

  // Calculate tracking expiry (scheduled_at + duration + 2h)
  const trackingExpiresAt = new Date(
    new Date(scheduled_at).getTime() + (durationMin + 120) * 60_000
  ).toISOString()

  // Create appointment (as any: tracking_expires_at not in generated types yet)
  const { data: appointment, error: appointmentError } = (await (
    supabase
      .from('appointments')
      .insert({
        business_id: business.id,
        client_id: client.id,
        service_id: service.id,
        barber_id: barber_id,
        scheduled_at,
        duration_minutes: durationMin,
        price: service.price,
        status: 'pending',
        client_notes: notes || null,
        tracking_expires_at: trackingExpiresAt,
      } as any)
      .select('id, tracking_token') as any
  ).single()) as any

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

  // Send email notification to business owner (async, non-blocking)
  // If email fails, the booking is still successful
  sendBookingNotification({
    businessId: business.id,
    businessName: business.name,
    logoUrl: business.logo_url,
    brandColor: business.brand_primary_color,
    ownerId: business.owner_id,
    clientName: client_name,
    serviceName: service.name,
    barberName: barber.name,
    scheduledAt: scheduled_at,
    duration: service.duration_minutes ?? 30,
    price: service.price,
    supabase,
  }).catch((error) => {
    logger.error(
      {
        appointmentId: appointment.id,
        businessId: business.id,
        error,
      },
      'Email notification error (booking still successful)'
    )
  })

  // Send push notification to business owner (async, non-blocking)
  sendPushToBusinessOwner(business.id, {
    title: 'Nueva cita agendada',
    body: `${client_name} — ${service.name}`,
    url: '/citas',
    tag: `booking-${appointment.id}`,
  }).catch((error) => {
    logger.error({ appointmentId: appointment.id, error }, 'Push notification error')
  })

  // Send confirmation email to client with tracking link (async, non-blocking)
  if (client_email) {
    const trackingToken = (appointment as any).tracking_token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.barberapp.com'
    const trackingUrl = trackingToken ? `${appUrl}/track/${trackingToken}` : undefined

    const formattedPrice = new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(service.price)

    sendEmail({
      to: client_email,
      subject: `Cita confirmada — ${business.name}`,
      react: NewAppointmentEmail({
        businessName: business.name,
        clientName: client_name,
        serviceName: service.name,
        barberName: barber.name,
        appointmentDate: scheduled_at,
        duration: service.duration_minutes ?? 30,
        price: formattedPrice,
        logoUrl: business.logo_url || undefined,
        brandColor: business.brand_primary_color || undefined,
        trackingUrl,
      }),
    }).catch((error) => {
      logger.error({ appointmentId: appointment.id, error }, 'Client confirmation email error')
    })
  }

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
    tracking_token: (appointment as any).tracking_token ?? null,
    message: 'Cita reservada exitosamente',
  })
}

/**
 * Send email + in-app notification to business owner when a booking is made.
 * Runs async — failures are logged but never block the booking.
 */
async function sendBookingNotification({
  businessId,
  businessName,
  logoUrl,
  brandColor,
  ownerId,
  clientName,
  serviceName,
  barberName,
  scheduledAt,
  duration,
  price,
  supabase,
}: {
  businessId: string
  businessName: string
  logoUrl: string | null
  brandColor: string | null
  ownerId: string
  clientName: string
  serviceName: string
  barberName: string
  scheduledAt: string
  duration: number
  price: number
  supabase: Awaited<ReturnType<typeof createServiceClient>>
}) {
  // Get owner email
  const { data: owner } = await supabase.auth.admin.getUserById(ownerId)
  const ownerEmail = owner?.user?.email
  if (!ownerEmail) return

  const formattedPrice = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
  }).format(price)

  // Send email (respects notification preferences)
  await sendNotificationEmail({
    businessId,
    notificationType: 'new_appointment',
    to: ownerEmail,
    subject: `Nueva cita: ${clientName} - ${serviceName}`,
    react: NewAppointmentEmail({
      businessName,
      clientName,
      serviceName,
      barberName,
      appointmentDate: scheduledAt,
      duration,
      price: formattedPrice,
      logoUrl: logoUrl || undefined,
      brandColor: brandColor || undefined,
    }),
  })

  // Create in-app notification
  await supabase.from('notifications').insert({
    business_id: businessId,
    type: 'new_appointment',
    title: 'Nueva cita agendada',
    message: `${clientName} - ${serviceName}`,
    reference_type: 'appointment',
    is_read: false,
  })
}
