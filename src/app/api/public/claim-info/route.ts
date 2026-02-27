/**
 * GET /api/public/claim-info?token=UUID
 *
 * Public endpoint — no auth required.
 * Returns minimal, non-sensitive info for a valid claim token so the
 * /activar-cuenta page can pre-fill the registration form.
 *
 * Rate limited: 5 req / 15 min per IP.
 *
 * Response (200):
 *   { email, clientName, businessName, businessId, businessSlug }
 *
 * Error responses:
 *   400 — Missing or invalid token format
 *   401 — Token invalid, expired, or already claimed
 *   429 — Rate limit exceeded
 *   500 — Server error
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { logSecurity } from '@/lib/logger'

const CLAIM_INFO_RATE_LIMIT = {
  interval: 15 * 60 * 1000,
  maxRequests: 5,
} as const

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting
  const rl = await rateLimit(request, CLAIM_INFO_RATE_LIMIT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Demasiados intentos.' },
      { status: 429, headers: rl.headers }
    )
  }

  // 2. Read and validate token from query
  const token = request.nextUrl.searchParams.get('token')

  if (!token || !UUID_REGEX.test(token)) {
    return NextResponse.json({ error: 'Token inválido o faltante.' }, { status: 400 })
  }

  // 3. Look up client by claim_token (service role to bypass RLS)
  const serviceClient = await createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error } = (await (serviceClient as any)
    .from('clients')
    .select('id, email, name, business_id')
    .eq('claim_token', token)
    .gt('claim_token_expires_at', new Date().toISOString())
    .is('user_id', null)
    .maybeSingle()) as {
    data: { id: string; email: string | null; name: string | null; business_id: string } | null
    error: unknown
  }

  if (error) {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }

  if (!client) {
    logSecurity('unauthorized', 'low', {
      path: '/api/public/claim-info',
      reason: 'invalid_or_expired_token',
    })
    return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 })
  }

  // 4. Fetch business name and slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = (await (serviceClient as any)
    .from('businesses')
    .select('id, name, slug')
    .eq('id', client.business_id)
    .single()) as {
    data: { id: string; name: string; slug: string } | null
    error: unknown
  }

  return NextResponse.json({
    email: client.email,
    clientName: client.name,
    businessName: business?.name ?? null,
    businessId: client.business_id,
    businessSlug: business?.slug ?? null,
  })
}
