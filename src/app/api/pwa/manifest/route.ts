import { NextResponse } from 'next/server'
import { detectUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_NAME = 'BarberApp'
const DEFAULT_SHORT_NAME = 'BarberApp'

function toShortName(name: string): string {
  if (name.length <= 12) return name
  return name.slice(0, 12)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let appName = DEFAULT_NAME

  if (user) {
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
    theme_color: '#10141b',
    orientation: 'portrait',
    categories: ['business', 'lifestyle'],
    icons: [
      {
        src: '/api/pwa/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/pwa/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa/icon?size=512',
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
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Clientes',
        short_name: 'Clientes',
        url: '/clientes',
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Servicios',
        short_name: 'Servicios',
        url: '/servicios',
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
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
