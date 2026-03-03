import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'

export async function GET(request: NextRequest) {
  const rawNonce = randomBytes(32).toString('base64url')
  const hashedNonce = createHash('sha256').update(rawNonce).digest('hex')

  const cookieStore = await cookies()
  cookieStore.set('google_auth_nonce', rawNonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 min
    path: '/',
  })

  // Build redirect_uri from request host so it works in both dev and prod
  const host = request.headers.get('host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectUri = `${protocol}://${host}/auth/callback/google`

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    nonce: hashedNonce,
    access_type: 'online',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
