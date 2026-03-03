import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
    const { detectUserRole } = await import('@/lib/auth/roles')
    const roleInfo = await detectUserRole(supabase, user.id)
    const destination = roleInfo?.role === 'client' ? '/mi-cuenta' : '/dashboard'
    return NextResponse.redirect(new URL(destination, appUrl))
  }

  return NextResponse.redirect(new URL('/dashboard', appUrl))
}
