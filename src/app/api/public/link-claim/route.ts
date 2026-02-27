/**
 * POST /api/public/link-claim
 *
 * Authenticated endpoint — requires valid JWT session.
 * Links an existing auth user to a client record via a one-time claim_token.
 *
 * Use case: Client books anonymously → email already registered (409 from
 * claim-account) → logs in client-side → calls this endpoint to link the
 * orphaned client record to their existing auth user.
 *
 * Security model:
 * - Requires valid Supabase session (JWT in cookies).
 * - claim_token is the credential — proves the caller owns the booking.
 * - Idempotent: if client.user_id already matches the caller, returns 200.
 * - Duplicate guard: rejects if another client in the same business already
 *   belongs to this user (prevents duplicate client records).
 * - Rate limited: 5 req / 15 min per IP.
 * - claim_token is burned (set to NULL) after successful link.
 *
 * Request body:
 *   { claim_token: string }
 *
 * Happy-path response (200):
 *   { success: true }
 *   { success: true, already_linked: true }  (idempotent retry)
 *
 * Error responses:
 *   400 — Validation error
 *   401 — Not authenticated, or token invalid/expired
 *   409 — Duplicate client in same business
 *   429 — Rate limit exceeded
 *   500 — Server error
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { logger, logSecurity } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LINK_RATE_LIMIT = {
  interval: 15 * 60 * 1000,
  maxRequests: 5,
} as const

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const LinkClaimSchema = z.object({
  claim_token: z
    .string()
    .min(1, 'claim_token es requerido')
    .regex(UUID_REGEX, 'claim_token tiene formato inválido'),
})

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

interface ClientRow {
  id: string
  business_id: string
  email: string | null
  user_id: string | null
}

interface LoyaltyProgramRow {
  id: string
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()

  // 1. Rate limiting
  const rl = await rateLimit(request, LINK_RATE_LIMIT)
  if (!rl.success) {
    logSecurity('rate_limit', 'medium', { path: '/api/public/link-claim' })
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera 15 minutos.' },
      { status: 429, headers: rl.headers }
    )
  }

  // 2. Authenticate caller
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // 3. Parse request body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = LinkClaimSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { claim_token } = parsed.data

  // 4. Look up client record by claim_token (service role to bypass RLS)
  const serviceClient = await createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error: lookupError } = (await (serviceClient as any)
    .from('clients')
    .select('id, business_id, email, user_id')
    .eq('claim_token', claim_token)
    .gt('claim_token_expires_at', new Date().toISOString())
    .maybeSingle()) as { data: ClientRow | null; error: unknown }

  if (lookupError) {
    logger.error(
      { err: lookupError, path: '/api/public/link-claim' },
      'link-claim: DB lookup error'
    )
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }

  if (!client) {
    logSecurity('unauthorized', 'medium', {
      path: '/api/public/link-claim',
      reason: 'invalid_or_expired_token',
    })
    return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 })
  }

  // 5. Idempotency: already linked to this same user → 200
  if (client.user_id === user.id) {
    return NextResponse.json({ success: true, already_linked: true })
  }

  // 6. Conflict: client already linked to a DIFFERENT user
  if (client.user_id !== null) {
    logSecurity('unauthorized', 'medium', {
      path: '/api/public/link-claim',
      reason: 'token_already_claimed_by_other',
      client_id: client.id,
    })
    return NextResponse.json(
      { error: 'Este registro ya fue vinculado a otra cuenta.' },
      { status: 409 }
    )
  }

  // 7. Duplicate check: does this user already have a client record in the same business?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingClient } = (await (serviceClient as any)
    .from('clients')
    .select('id')
    .eq('business_id', client.business_id)
    .eq('user_id', user.id)
    .maybeSingle()) as { data: { id: string } | null; error: unknown }

  if (existingClient) {
    return NextResponse.json(
      {
        error: 'Ya tienes una cuenta en este negocio.',
        hint: 'duplicate_client',
      },
      { status: 409 }
    )
  }

  // 8. Email guard: if client has email, it should match the auth user's email
  if (client.email && client.email.toLowerCase() !== user.email?.toLowerCase()) {
    logSecurity('unauthorized', 'high', {
      path: '/api/public/link-claim',
      reason: 'email_mismatch',
      client_id: client.id,
    })
    return NextResponse.json(
      { error: 'El email de tu cuenta no coincide con el de la reserva.' },
      { status: 401 }
    )
  }

  // 9. Link: set user_id, burn token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: linkError } = await (serviceClient as any)
    .from('clients')
    .update({
      user_id: user.id,
      claim_token: null,
      claim_token_expires_at: null,
    })
    .eq('id', client.id)
    .is('user_id', null) // double-write guard

  if (linkError) {
    logger.error(
      { err: linkError, client_id: client.id, auth_user_id: user.id },
      'link-claim: failed to link client'
    )
    return NextResponse.json({ error: 'Error al vincular cuenta.' }, { status: 500 })
  }

  // 10. Create loyalty status if applicable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loyaltyProgram } = (await (serviceClient as any)
    .from('loyalty_programs')
    .select('id')
    .eq('business_id', client.business_id)
    .eq('enabled', true)
    .maybeSingle()) as { data: LoyaltyProgramRow | null; error: unknown }

  if (loyaltyProgram) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (serviceClient as any)
      .from('client_loyalty_status')
      .insert({
        client_id: client.id,
        business_id: client.business_id,
        user_id: user.id,
        points_balance: 0,
        lifetime_points: 0,
        visit_count: 0,
        current_tier: 'bronze',
      })
      .onConflict('client_id')
      .ignore()
  }

  // 11. Audit
  logger.info(
    {
      event: 'link_claim',
      auth_user_id: user.id,
      client_id: client.id,
      business_id: client.business_id,
      duration_ms: Date.now() - startedAt,
    },
    'link-claim: client record linked successfully'
  )

  return NextResponse.json({ success: true })
}
