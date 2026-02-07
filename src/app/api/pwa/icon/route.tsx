import { ImageResponse } from 'next/og'
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

function getInitial(name: string | null | undefined): string {
  const candidate = (name ?? '').trim()
  return candidate.length > 0 ? candidate.charAt(0).toUpperCase() : 'B'
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
      name: data?.name ?? 'BarberShop Pro',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { logoUrl: null, name: 'BarberShop Pro' }
  }

  const { data } = await supabase
    .from('businesses')
    .select('name, logo_url')
    .eq('owner_id', user.id)
    .maybeSingle()

  return {
    logoUrl: data?.logo_url ?? null,
    name: data?.name ?? 'BarberShop Pro',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseSize(searchParams.get('size'))
  const slug = searchParams.get('slug')

  const { logoUrl, name } = await getBusinessBranding(slug)
  const initial = getInitial(name)
  const hasLogo = Boolean(logoUrl)
  const ringSize = Math.round(size * 0.8)
  const logoSize = Math.round(size * 0.58)
  const poleWidth = Math.round(size * 0.24)
  const poleHeight = Math.round(size * 0.44)
  const stripeHeight = Math.max(8, Math.round(size * 0.08))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: Math.round(size * 0.22),
        overflow: 'hidden',
        background: hasLogo
          ? 'radial-gradient(circle at 20% 20%, #3B82F6 0%, #2563EB 40%, #1D4ED8 65%, #0F172A 100%)'
          : 'radial-gradient(circle at 20% 20%, #27272A 0%, #18181B 60%, #09090B 100%)',
      }}
    >
      {!hasLogo && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            opacity: 0.16,
            transform: 'rotate(-16deg) scale(1.2)',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i % 2 === 0 ? '#DC2626' : '#2563EB',
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          width: Math.round(size * 0.9),
          height: Math.round(size * 0.9),
          borderRadius: Math.round(size * 0.24),
          border: hasLogo
            ? `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255,255,255,0.22)`
            : `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255,255,255,0.18)`,
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
            width: ringSize,
            height: ringSize,
            borderRadius: Math.round(size * 0.2),
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(size * 0.04),
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255,255,255,0.25)`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: poleWidth,
              height: poleHeight,
              borderRadius: Math.round(size * 0.12),
              background: '#F8FAFC',
              overflow: 'hidden',
              border: `${Math.max(2, Math.round(size * 0.008))}px solid rgba(255,255,255,0.95)`,
              boxShadow: 'inset 0 0 0 1px rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '-40%',
                  top: Math.round(i * stripeHeight - stripeHeight * 0.3),
                  width: '180%',
                  height: stripeHeight,
                  background: i % 2 === 0 ? '#DC2626' : '#2563EB',
                  transform: 'rotate(-33deg)',
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                top: -Math.round(size * 0.015),
                width: Math.round(poleWidth * 0.72),
                height: Math.max(5, Math.round(size * 0.025)),
                borderRadius: 999,
                background: '#E2E8F0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -Math.round(size * 0.015),
                width: Math.round(poleWidth * 0.72),
                height: Math.max(5, Math.round(size * 0.025)),
                borderRadius: 999,
                background: '#E2E8F0',
              }}
            />
          </div>

          <div
            style={{
              width: Math.round(size * 0.14),
              height: Math.round(size * 0.14),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.16)',
              border: `${Math.max(1, Math.round(size * 0.004))}px solid rgba(255,255,255,0.22)`,
              color: '#FFFFFF',
              fontSize: Math.round(size * 0.07),
              fontWeight: 700,
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
              lineHeight: 1,
            }}
          >
            {initial}
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
