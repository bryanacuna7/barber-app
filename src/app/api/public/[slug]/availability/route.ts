import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateAvailableSlots } from '@/lib/utils/availability'
import { startOfDay, endOfDay } from 'date-fns'
import type { OperatingHours } from '@/types'

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

  // Get business with smart duration flag
  // Note: smart_duration_enabled added in migration 033, using `as any` until types regenerated
  const { data: business, error: businessError } = (await supabase
    .from('businesses')
    .select('id, operating_hours, booking_buffer_minutes, smart_duration_enabled')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()) as any

  if (businessError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get service duration
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .eq('business_id', business.id)
    .single()

  if (serviceError || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // Smart duration: predict if enabled, otherwise use fixed service duration
  let serviceDuration = service.duration_minutes ?? 30
  if ((business as any).smart_duration_enabled) {
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

  // Calculate available slots
  const operatingHours = business.operating_hours
    ? (business.operating_hours as unknown as OperatingHours)
    : ({} as OperatingHours)

  const slots = calculateAvailableSlots({
    date,
    operatingHours,
    existingAppointments: appointments || [],
    serviceDuration,
    bufferMinutes: business.booking_buffer_minutes ?? 15,
  })

  return NextResponse.json(slots)
}
