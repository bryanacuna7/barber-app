import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { processAppointmentLoyalty } from '@/lib/gamification/loyalty-calculator-server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { logger, logRequest, logResponse, logBusiness, logSecurity } from '@/lib/logger'
import { sendEmail } from '@/lib/email/sender'
import { notify } from '@/lib/notifications/orchestrator'
import { evaluatePromo } from '@/lib/promo-engine'
import NewAppointmentEmail from '@/lib/email/templates/new-appointment'
import type { PromoRule } from '@/types/promo'
import type { BookingPricing } from '@/types/api'

// UUID pattern that accepts any UUID-formatted string (not just RFC 4122)
// This allows seed data UUIDs like aaaaaaaa-0001-0001-0001-000000000001
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const bookingSchema = z.object({
  service_id: z.string().regex(uuidPattern, 'Invalid UUID'),
  barber_id: z.string().regex(uuidPattern, 'Invalid UUID'),
  scheduled_at: z.string().datetime(),
  client_name: z.string().min(2),
  client_phone: z.string().min(8),
  client_email: z.string().email().optional(),
  notes: z.string().optional(),
  promo_rule_id: z.string().regex(uuidPattern, 'Invalid UUID').optional(),
  smart_token: z.string().regex(uuidPattern, 'Invalid UUID').optional(),
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

  const {
    service_id,
    barber_id,
    scheduled_at,
    client_name,
    client_phone,
    client_email,
    notes,
    promo_rule_id,
    smart_token,
  } = parsed.data

  const supabase = await createServiceClient()

  // Get business
  // Note: smart_duration_enabled/promotional_slots added in migrations 033/034, using `as any`
  const { data: business, error: businessError } = (await supabase
    .from('businesses')
    .select(
      'id, name, logo_url, brand_primary_color, owner_id, smart_duration_enabled, promotional_slots, timezone, advance_payment_enabled'
    )
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

  // Check if the booking is made by an authenticated user (optional — public endpoint)
  let authUserId: string | null = null
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (user) authUserId = user.id
  } catch {
    // Not authenticated — continue as public booking
  }

  // Find or create client
  let client

  // 1. If authenticated, check if user already has a client record in this business
  if (authUserId) {
    const { data: userClient } = (await supabase
      .from('clients')
      .select('id, user_id, claim_token')
      .eq('business_id', business.id)
      .eq('user_id', authUserId)
      .single()) as any

    if (userClient) {
      client = userClient
      // Update name/phone/email if changed
      await supabase
        .from('clients')
        .update({
          name: client_name,
          phone: client_phone,
          ...(client_email ? { email: client_email } : {}),
        } as any)
        .eq('id', userClient.id)
      logger.debug(
        { clientId: client.id, businessId: business.id, authUserId },
        'Authenticated user matched to existing client'
      )
    }
  }

  // 2. If no match by user_id, look up by phone (existing behavior)
  if (!client) {
    // claim_token/user_id not in generated types yet, cast with `as any`
    const { data: existingClient } = (await supabase
      .from('clients')
      .select('id, user_id, claim_token')
      .eq('business_id', business.id)
      .eq('phone', client_phone)
      .single()) as any

    if (existingClient) {
      client = existingClient
      // If authenticated and client is unclaimed, auto-claim it
      if (authUserId && !(existingClient as any).user_id) {
        await supabase
          .from('clients')
          .update({ user_id: authUserId } as any)
          .eq('id', existingClient.id)
        logger.debug(
          { clientId: client.id, businessId: business.id, authUserId },
          'Auto-claimed unclaimed client for authenticated user'
        )
      } else if (!(existingClient as any).user_id) {
        // Refresh claim token for unclaimed clients so they can create an account
        await supabase
          .from('clients')
          .update({
            claim_token: crypto.randomUUID(),
            claim_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          } as any)
          .eq('id', existingClient.id)
      }
      logger.debug(
        { clientId: client.id, businessId: business.id },
        'Existing client found for booking'
      )
    }
  }

  // 3. Create new client if no match found
  if (!client) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name: client_name,
        phone: client_phone,
        email: client_email || null,
        ...(authUserId ? { user_id: authUserId } : {}),
        claim_token: authUserId ? null : crypto.randomUUID(),
        claim_token_expires_at: authUserId
          ? null
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as any)
      .select('id, claim_token')
      .single()

    if (clientError) {
      logger.error({ businessId: business.id, error: clientError }, 'Failed to create client')
      logResponse(request, 500, Date.now() - startTime)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    client = newClient
    logBusiness('client_created', business.id, {
      clientId: client.id,
      clientPhone: client_phone,
      authUserId,
    })
  }

  // Smart duration: predict if enabled, otherwise use fixed service duration
  let durationMin = service.duration_minutes ?? 30
  if ((business as any).smart_duration_enabled) {
    const { getPredictedDuration } = await import('@/lib/utils/duration-predictor')
    durationMin = await getPredictedDuration(business.id, service_id, barber_id, durationMin)
  }

  // Evaluate promotional discount (shared engine — same as availability API)
  const promoRules: PromoRule[] = (business.promotional_slots as PromoRule[]) || []
  const tz = business.timezone || 'America/Costa_Rica'
  const promoEval = evaluatePromo(
    promoRules,
    new Date(scheduled_at),
    service_id,
    service.price ?? 0,
    tz
  )
  const finalPrice = promoEval.applied ? promoEval.final_price : (service.price ?? 0)

  const pricing: BookingPricing = {
    original_price: service.price ?? 0,
    final_price: finalPrice,
    discount_applied: promoEval.applied,
    discount_label: promoEval.rule?.label,
    discount_amount: promoEval.discount_amount,
    reason: promoEval.reason,
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
        price: finalPrice,
        status: 'pending',
        client_notes: notes || null,
        tracking_expires_at: trackingExpiresAt,
        source: 'web_booking',
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
    price: finalPrice,
    originalPrice: service.price,
    discountApplied: promoEval.applied,
    scheduledAt: scheduled_at,
  })

  // Consume smart attribution token when present (non-blocking, never blocks booking)
  if (smart_token) {
    consumeSmartAttributionToken({
      supabase,
      token: smart_token,
      businessId: business.id,
      clientId: client.id,
      appointmentId: appointment.id,
    }).catch((error) => {
      logger.warn(
        { error, token: smart_token, businessId: business.id, clientId: client.id },
        'Smart attribution token consume failed'
      )
    })
  }

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

  // Send notifications to business owner via orchestrator (async, non-blocking)
  ;(async () => {
    try {
      const { data: ownerData } = await supabase.auth.admin.getUserById(business.owner_id)
      const ownerEmail = ownerData?.user?.email

      const formattedPrice = new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
      }).format(finalPrice)

      await notify(
        'new_appointment',
        {
          businessId: business.id,
          appointmentId: appointment.id,
          userId: business.owner_id,
          recipientEmail: ownerEmail || undefined,
          data: {
            clientName: client_name,
            serviceName: service.name,
            barberName: barber.name,
            scheduledAt: scheduled_at,
            duration: service.duration_minutes ?? 30,
            price: formattedPrice,
          },
        },
        {
          inApp: {
            title: 'Nueva cita agendada',
            message: `${client_name} — ${service.name}`,
            referenceType: 'appointment',
          },
          push: {
            title: 'Nueva cita agendada',
            body: `${client_name} — ${service.name}`,
            url: '/citas',
            tag: `booking-${appointment.id}`,
          },
          email: ownerEmail
            ? {
                to: ownerEmail,
                subject: `Nueva cita: ${client_name} - ${service.name}`,
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
                }),
              }
            : undefined,
        }
      )
    } catch (error) {
      logger.error(
        { appointmentId: appointment.id, businessId: business.id, error },
        'Owner notification error (booking still successful)'
      )
    }
  })()

  // Send confirmation email to client with tracking link (async, non-blocking)
  if (client_email) {
    const trackingToken = (appointment as any).tracking_token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.barberapp.com'
    const trackingUrl = trackingToken ? `${appUrl}/track/${trackingToken}` : undefined
    const claimToken = (client as any).claim_token
    const claimUrl = claimToken ? `${appUrl}/mi-cuenta?claim=${claimToken}` : undefined

    const formattedPrice = new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(finalPrice)

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
    claim_token: (client as any).claim_token ?? null,
    pricing,
    advance_payment_enabled: !!business.advance_payment_enabled,
    message: 'Cita reservada exitosamente',
  })
}

async function consumeSmartAttributionToken({
  supabase,
  token,
  businessId,
  clientId,
  appointmentId,
}: {
  supabase: Awaited<ReturnType<typeof createServiceClient>>
  token: string
  businessId: string
  clientId: string
  appointmentId: string
}) {
  const nowIso = new Date().toISOString()

  const { data: attribution } = await (supabase as any)
    .from('smart_notification_attribution')
    .select('id')
    .eq('token', token)
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .is('consumed_at', null)
    .gt('expires_at', nowIso)
    .maybeSingle()

  if (!attribution) return

  await (supabase as any)
    .from('smart_notification_attribution')
    .update({
      consumed_at: nowIso,
      consumed_appointment_id: appointmentId,
    })
    .eq('id', attribution.id)
}
