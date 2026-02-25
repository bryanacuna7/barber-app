import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createServiceClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, address, phone, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, brand_secondary_color, logo_url'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  return NextResponse.json(business, { headers: PUBLIC_CACHE_HEADERS })
}
