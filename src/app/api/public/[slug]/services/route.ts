// @ts-nocheck
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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
    .select('id, name, description, duration_minutes, price')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }

  return NextResponse.json(services || [])
}
