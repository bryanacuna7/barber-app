import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateAvailableSlots } from '@/lib/utils/availability'
import { startOfDay, endOfDay } from 'date-fns'
import { evaluatePromo } from '@/lib/promo-engine'
import type { OperatingHours } from '@/types'
import type { PromoRule } from '@/types/promo'
import type { SlotDiscount, EnrichedTimeSlot } from '@/types/api'

type BusinessAvailabilityConfig = {
  id: string
  operating_hours: unknown
  booking_buffer_minutes: number | null
  smart_duration_enabled?: boolean | null
  promotional_slots?: unknown
  timezone?: string | null
}

type SupabaseQueryError = {
  code?: string
} | null

type BusinessQueryResult = {
  data: BusinessAvailabilityConfig | null
  error: SupabaseQueryError
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const barberId = searchParams.get('barber_id')

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: 'date and service_id are required' }, { status: 400 })
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Try full schema first, then fall back to legacy schema if optional columns are not present.
  const baseBusinessSelect = 'id, operating_hours, booking_buffer_minutes'
  const fullBusinessSelect = `${baseBusinessSelect}, smart_duration_enabled, promotional_slots, timezone`

  const fullBusinessResult = (await supabase
    .from('businesses')
    .select(fullBusinessSelect)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()) as unknown as BusinessQueryResult

  let business = fullBusinessResult.data
  let businessError = fullBusinessResult.error

  if (businessError || !business) {
    const fallbackBusinessResult = (await supabase
      .from('businesses')
      .select(baseBusinessSelect)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()) as unknown as BusinessQueryResult

    if (!fallbackBusinessResult.error && fallbackBusinessResult.data) {
      business = {
        ...fallbackBusinessResult.data,
        smart_duration_enabled: false,
        promotional_slots: [],
        timezone: null,
      }
      businessError = null
    } else {
      businessError = fallbackBusinessResult.error || businessError
    }
  }

  if (businessError || !business) {
    const isNotFound = businessError?.code === 'PGRST116'
    return NextResponse.json(
      { error: isNotFound ? 'Business not found' : 'Failed to load business settings' },
      { status: isNotFound ? 404 : 500 }
    )
  }

  // Get service duration + price (price needed for promo evaluation)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration_minutes, price')
    .eq('id', serviceId)
    .eq('business_id', business.id)
    .single()

  if (serviceError || !service) {
    const isNotFound = serviceError?.code === 'PGRST116' || !service
    return NextResponse.json(
      { error: isNotFound ? 'Service not found' : 'Failed to load service' },
      { status: isNotFound ? 404 : 500 }
    )
  }

  // Smart duration: predict if enabled, otherwise use fixed service duration
  let serviceDuration = service.duration_minutes ?? 30
  if (business.smart_duration_enabled) {
    const { getPredictedDuration } = await import('@/lib/utils/duration-predictor')
    serviceDuration = await getPredictedDuration(
      business.id,
      serviceId,
      barberId ?? undefined,
      serviceDuration
    )
  }

  // Get existing appointments for this date (filter by barber if provided)
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  let query = supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('business_id', business.id)
    .gte('scheduled_at', dayStart.toISOString())
    .lte('scheduled_at', dayEnd.toISOString())
    .in('status', ['pending', 'confirmed'])

  if (barberId) {
    query = query.eq('barber_id', barberId)
  }

  const { data: appointments } = await query

  // Fetch barber blocks that overlap the requested date
  let blocksQuery = (supabase as any)
    .from('barber_blocks')
    .select('start_time, end_time, all_day')
    .eq('business_id', business.id)
    .lte('start_time', dayEnd.toISOString())
    .gte('end_time', dayStart.toISOString())

  if (barberId) {
    blocksQuery = blocksQuery.eq('barber_id', barberId)
  }

  const { data: blocks } = await blocksQuery

  // Convert blocks to synthetic appointments so the existing overlap logic handles them
  const blockAppointments = (blocks || []).map((b: any) => {
    const start = new Date(b.start_time)
    const end = new Date(b.end_time)
    // For all-day blocks, ensure they cover the entire business day
    if (b.all_day) {
      return {
        scheduled_at: dayStart.toISOString(),
        duration_minutes: 24 * 60, // full day
      }
    }
    return {
      scheduled_at: b.start_time,
      duration_minutes: Math.ceil((end.getTime() - start.getTime()) / 60000),
    }
  })

  const allBlockers = [...(appointments || []), ...blockAppointments]

  // Calculate available slots
  const operatingHours = business.operating_hours
    ? (business.operating_hours as unknown as OperatingHours)
    : ({} as OperatingHours)

  const slots = calculateAvailableSlots({
    date,
    operatingHours,
    existingAppointments: allBlockers,
    serviceDuration,
    bufferMinutes: business.booking_buffer_minutes ?? 15,
  })

  // Enrich slots with promotional discount info
  const promoRules: PromoRule[] = (business.promotional_slots as PromoRule[]) || []
  const servicePrice = service.price ?? 0
  const tz = business.timezone || 'America/Costa_Rica'

  const enrichedSlots: EnrichedTimeSlot[] = slots.map((slot) => {
    if (!slot.available || promoRules.length === 0) {
      return { ...slot, discount: null }
    }

    const slotDate = new Date(slot.datetime)
    const evaluation = evaluatePromo(promoRules, slotDate, serviceId, servicePrice, tz)

    if (!evaluation.applied || !evaluation.rule) {
      return { ...slot, discount: null }
    }

    const discount: SlotDiscount = {
      type: evaluation.rule.discount_type,
      value: evaluation.rule.discount_value,
      label: evaluation.rule.label,
      ruleId: evaluation.rule.id,
    }

    return { ...slot, discount }
  })

  return NextResponse.json(enrichedSlots)
}
