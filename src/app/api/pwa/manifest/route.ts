import { NextResponse } from 'next/server'
import { detectUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_NAME = 'BarberApp'
const DEFAULT_SHORT_NAME = 'BarberApp'
const FALLBACK_THEME_COLOR = '#10141b'

function toShortName(name: string): string {
  if (name.length <= 12) return name
  return name.slice(0, 12)
}

function normalizeName(raw: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  return value.slice(0, 60)
}

function normalizeSlug(raw: string | null): string | null {
  const value = raw?.trim().toLowerCase()
  if (!value) return null
  return /^[a-z0-9-]+$/.test(value) ? value : null
}

function iconPath(size: number, businessSlug: string | null): string {
  if (!businessSlug) return `/api/pwa/icon?size=${size}`
  return `/api/pwa/icon?size=${size}&slug=${encodeURIComponent(businessSlug)}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedName = normalizeName(searchParams.get('businessName'))
  const requestedSlug = normalizeSlug(searchParams.get('businessSlug'))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let appName = requestedName ?? DEFAULT_NAME

  if (!requestedName && user) {
    const roleInfo = await detectUserRole(supabase, user.id)

    if (roleInfo?.businessId) {
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', roleInfo.businessId)
        .maybeSingle()

      if (business?.name) {
        appName = business.name
      }
    }
  }

  const manifest = {
    id: '/?source=pwa',
    name: appName,
    short_name: appName === DEFAULT_NAME ? DEFAULT_SHORT_NAME : toShortName(appName),
    description: `Sistema de gestión de citas para ${appName}.`,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f7f9',
    theme_color: FALLBACK_THEME_COLOR,
    orientation: 'portrait',
    categories: ['business', 'lifestyle'],
    icons: [
      {
        src: iconPath(192, requestedSlug),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconPath(192, requestedSlug),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: iconPath(512, requestedSlug),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconPath(512, requestedSlug),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Nueva Cita',
        short_name: 'Cita',
        url: '/citas?intent=create',
        icons: [{ src: iconPath(96, requestedSlug), sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Clientes',
        short_name: 'Clientes',
        url: '/clientes',
        icons: [{ src: iconPath(96, requestedSlug), sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Servicios',
        short_name: 'Servicios',
        url: '/servicios',
        icons: [{ src: iconPath(96, requestedSlug), sizes: '96x96', type: 'image/png' }],
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
