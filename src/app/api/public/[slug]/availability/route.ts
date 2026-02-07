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

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: 'date and service_id are required' }, { status: 400 })
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Get business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, operating_hours, booking_buffer_minutes')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

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

  // Get existing appointments for this date
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('business_id', business.id)
    .gte('scheduled_at', dayStart.toISOString())
    .lte('scheduled_at', dayEnd.toISOString())
    .in('status', ['pending', 'confirmed'])

  // Calculate available slots
  const operatingHours = business.operating_hours
    ? (business.operating_hours as unknown as OperatingHours)
    : ({} as OperatingHours)

  const slots = calculateAvailableSlots({
    date,
    operatingHours,
    existingAppointments: appointments || [],
    serviceDuration: service.duration_minutes ?? 30,
    bufferMinutes: business.booking_buffer_minutes ?? 15,
  })

  return NextResponse.json(slots)
}
