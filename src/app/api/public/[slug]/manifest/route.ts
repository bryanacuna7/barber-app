import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { darkenColor, getLuminance, hexToRgbValues } from '@/lib/utils/color'

function getSplashBackgroundColor(themeColor: string): string {
  const { r, g, b } = hexToRgbValues(themeColor)
  const luminance = getLuminance(r, g, b)

  // Android splash screens look harsh with very light colors; keep it deep and branded.
  if (luminance > 0.28) {
    return darkenColor(themeColor, 0.62)
  }

  return themeColor
}

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

  const themeColor = business.brand_primary_color || '#27272A'
  const splashBackgroundColor = getSplashBackgroundColor(themeColor)

  const manifest = {
    id: `/reservar/${business.slug}?source=pwa`,
    name: business.name,
    short_name: business.name.length > 12 ? business.name.slice(0, 12) : business.name,
    description: `Reserva tu cita en ${business.name}`,
    start_url: `/reservar/${business.slug}`,
    scope: `/reservar/${business.slug}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: splashBackgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: `/api/pwa/icon?size=192&slug=${encodeURIComponent(business.slug)}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/api/pwa/icon?size=192&slug=${encodeURIComponent(business.slug)}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `/api/pwa/icon?size=512&slug=${encodeURIComponent(business.slug)}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/api/pwa/icon?size=512&slug=${encodeURIComponent(business.slug)}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
