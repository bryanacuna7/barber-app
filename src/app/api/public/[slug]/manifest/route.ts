import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createServiceClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug, brand_primary_color')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const themeColor = business.brand_primary_color || '#007AFF'

  const manifest = {
    name: business.name,
    short_name: business.name.length > 12 ? business.name.slice(0, 12) : business.name,
    description: `Reserva tu cita en ${business.name}`,
    start_url: `/reservar/${business.slug}`,
    display: 'standalone',
    background_color: '#F2F2F7',
    theme_color: themeColor,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
