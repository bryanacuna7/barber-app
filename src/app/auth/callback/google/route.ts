import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const lowered = trimmed.toLowerCase()
  if (lowered === 'null' || lowered === 'undefined') return undefined

  return trimmed
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const host = request.headers.get('host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const appUrl = `${protocol}://${host}`

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=google_cancelled', appUrl))
  }

  const cookieStore = await cookies()
  const rawNonce = cookieStore.get('google_auth_nonce')?.value

  if (!rawNonce) {
    return NextResponse.redirect(new URL('/login?error=nonce_expired', appUrl))
  }

  cookieStore.delete('google_auth_nonce')

  // Exchange authorization code for Google tokens
  const redirectUri = `${appUrl}/auth/callback/google`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=google_token', appUrl))
  }

  const { id_token } = await tokenRes.json()

  // Sign in with Supabase using the Google ID token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { error: authError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: id_token,
    nonce: rawNonce,
  })

  if (authError) {
    return NextResponse.redirect(new URL('/login?error=google_auth', appUrl))
  }

  // Detect role and redirect
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Sync Google profile data into user_metadata when local metadata is missing.
    // This avoids broken avatar placeholders for accounts originally created with email/password.
    const googleIdentity = user.identities?.find((identity) => identity.provider === 'google')
    const identityData = (googleIdentity?.identity_data ?? {}) as Record<string, unknown>

    const googleAvatar =
      normalizeOptionalText(identityData.avatar_url) || normalizeOptionalText(identityData.picture)
    const googleName =
      normalizeOptionalText(identityData.full_name) || normalizeOptionalText(identityData.name)

    const currentAvatar =
      normalizeOptionalText(user.user_metadata?.avatar_url) ||
      normalizeOptionalText(user.user_metadata?.picture)
    const currentName =
      normalizeOptionalText(user.user_metadata?.full_name) ||
      normalizeOptionalText(user.user_metadata?.name)

    const metadataPatch: Record<string, string> = {}
    if (!currentAvatar && googleAvatar) {
      metadataPatch.avatar_url = googleAvatar
      metadataPatch.picture = googleAvatar
    }
    if (!currentName && googleName) {
      metadataPatch.full_name = googleName
      metadataPatch.name = googleName
    }

    if (Object.keys(metadataPatch).length > 0) {
      await supabase.auth
        .updateUser({
          data: {
            ...(user.user_metadata ?? {}),
            ...metadataPatch,
          },
        })
        .catch(() => {})
    }

    const { detectUserRole } = await import('@/lib/auth/roles')
    const roleInfo = await detectUserRole(supabase, user.id)
    const destination = roleInfo?.role === 'client' ? '/mi-cuenta' : '/dashboard'
    return NextResponse.redirect(new URL(destination, appUrl))
  }

  return NextResponse.redirect(new URL('/dashboard', appUrl))
}
