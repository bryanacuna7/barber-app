import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = await createServiceClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, slug, address, phone, operating_hours, booking_buffer_minutes, advance_booking_days')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !business) {
    return NextResponse.json(
      { error: 'Business not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(business)
}
