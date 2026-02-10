import { ImageResponse } from 'next/og'
import { detectUserRole } from '@/lib/auth/roles'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const DEFAULT_SIZE = 512
const MIN_SIZE = 64
const MAX_SIZE = 1024

function parseSize(input: string | null): number {
  const parsed = Number(input ?? DEFAULT_SIZE)
  if (!Number.isFinite(parsed)) return DEFAULT_SIZE
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(parsed)))
}

async function getBusinessBranding(
  slug: string | null
): Promise<{ logoUrl: string | null; name: string }> {
  if (slug) {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('businesses')
      .select('name, logo_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    return {
      logoUrl: data?.logo_url ?? null,
      name: data?.name ?? 'BarberApp',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { logoUrl: null, name: 'BarberApp' }
  }

  const roleInfo = await detectUserRole(supabase, user.id)

  if (!roleInfo?.businessId) {
    return { logoUrl: null, name: 'BarberApp' }
  }

  const { data } = await supabase
    .from('businesses')
    .select('name, logo_url')
    .eq('id', roleInfo.businessId)
    .maybeSingle()

  return {
    logoUrl: data?.logo_url ?? null,
    name: data?.name ?? 'BarberApp',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseSize(searchParams.get('size'))
  const slug = searchParams.get('slug')

  const { logoUrl, name } = await getBusinessBranding(slug)
  const hasLogo = Boolean(logoUrl)
  const ringSize = Math.round(size * 0.8)
  const logoSize = Math.round(size * 0.58)
  const poleWidth = Math.round(size * 0.32)
  const poleHeight = Math.round(size * 0.8)
  const stripeThickness = Math.max(6, Math.round(size * 0.082))
  const stripeGap = Math.max(10, Math.round(size * 0.16))
  const stripePeriod = stripeThickness + stripeGap
  const stripeCount = 5
  const stripeStartOffset = Math.round(poleHeight * 0.24)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: hasLogo
          ? 'radial-gradient(circle at 20% 20%, #3B82F6 0%, #2563EB 40%, #1D4ED8 65%, #0F172A 100%)'
          : '#000000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: Math.round(size * 0.9),
          height: Math.round(size * 0.9),
          borderRadius: Math.round(size * 0.24),
          border: hasLogo
            ? `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255,255,255,0.22)`
            : 'none',
        }}
      />

      {logoUrl ? (
        <div
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: Math.round(size * 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={name}
            width={logoSize}
            height={logoSize}
            style={{
              objectFit: 'contain',
              borderRadius: Math.round(size * 0.08),
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Negative-space barber pole: white stripes, black gaps = the pole */}
          <div
            style={{
              position: 'relative',
              width: poleWidth,
              height: poleHeight,
              display: 'flex',
              overflow: 'hidden',
              borderRadius: Math.round(poleWidth / 2),
              background: 'transparent',
            }}
          >
            {Array.from({ length: stripeCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '-95%',
                  top: Math.round(i * stripePeriod - stripeStartOffset),
                  width: '320%',
                  height: stripeThickness,
                  borderRadius: Math.round(stripeThickness / 2),
                  background: '#FFFFFF',
                  transform: 'rotate(-30deg)',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    {
      width: size,
      height: size,
      headers: {
        'Content-Type': 'image/png',
        // Keep it short so icon updates propagate when the business changes logo.
        'Cache-Control': slug ? 'public, max-age=300' : 'private, max-age=300',
      },
    }
  )
}
