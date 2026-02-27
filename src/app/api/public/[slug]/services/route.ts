import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createServiceClient()

  // First get the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (businessError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get services
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, description, category, icon, duration_minutes, price')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }

  return NextResponse.json(services || [], { headers: PUBLIC_CACHE_HEADERS })
}
