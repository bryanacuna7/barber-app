/**
 * POST /api/public/claim-account
 *
 * Public endpoint — token-based auth (no login required).
 * Allows a client to create an auth account and securely link it to
 * their existing client record via a one-time claim_token.
 *
 * Security model:
 * - The claim_token is a server-generated UUID stored on the clients row.
 *   It is delivered out-of-band (SMS/email/WhatsApp) and expires after a
 *   configurable window. The raw client UUID is NEVER accepted from the
 *   browser — this eliminates the IDOR vulnerability present in the
 *   previous client-side flow inside client-account-modal.tsx.
 * - Rate limited: 5 req / 15 min per IP (same as the `strict` preset).
 * - Uses service-role client to bypass RLS for the token lookup and the
 *   atomic claim update. No other tables are written without explicit
 *   business-context guards.
 * - claim_token is cleared to NULL after a successful claim, making the
 *   token single-use even if the HTTP response is replayed.
 * - Password minimum is 8 characters (NIST SP 800-63B §5.1.1).
 *
 * Request body:
 *   { claim_token: string, email: string, password: string, name?: string }
 *
 * Happy-path response (200):
 *   { success: true, message: 'Cuenta creada exitosamente' }
 *
 * Error responses:
 *   400 — Validation error (body shape, short password, etc.)
 *   401 — Token inválido/expirado, or email mismatch
 *   409 — Email already registered (suggest login mode)
 *   429 — Rate limit exceeded
 *   500 — Unexpected server error
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit } from '@/lib/rate-limit'
import { logger, logAuth, logSecurity } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 5 requests per 15 minutes matches the `strict` preset used for auth ops. */
const CLAIM_RATE_LIMIT = {
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
} as const

/** NIST SP 800-63B §5.1.1 minimum. The front-end enforced 6 chars — server
 *  enforces 8 chars to align with modern guidelines. */
const PASSWORD_MIN_LENGTH = 8

// UUID v4 regex — validates claim_token format before hitting the DB.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const ClaimAccountSchema = z.object({
  /**
   * One-time UUID token stored on the clients row.
   * Must be a valid UUID v4 format.
   */
  claim_token: z
    .string()
    .min(1, 'claim_token es requerido')
    .regex(UUID_REGEX, 'claim_token tiene formato inválido'),

  /**
   * The email address the client wants to register with.
   * If the client record already has an email set it must match exactly
   * (case-insensitive) to prevent account hijacking.
   */
  email: z
    .string()
    .min(1, 'email es requerido')
    .email('email tiene formato inválido')
    .max(254, 'email demasiado largo'),

  /**
   * Plaintext password — Supabase hashes it server-side with bcrypt.
   * Minimum 8 chars per NIST SP 800-63B.
   */
  password: z
    .string()
    .min(1, 'password es requerido')
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(72, 'La contraseña es demasiado larga'), // bcrypt max input length

  /**
   * Optional display name. If omitted the existing clients.name is kept.
   * Stripped of leading/trailing whitespace.
   */
  name: z
    .string()
    .trim()
    .min(1, 'El nombre no puede estar vacío')
    .max(100, 'El nombre es demasiado largo')
    .optional(),
})

// ---------------------------------------------------------------------------
// Database row types (narrowed projections — only what this route reads)
// ---------------------------------------------------------------------------

interface ClientRow {
  id: string
  business_id: string
  name: string | null
  email: string | null
  user_id: string | null
  claim_token: string | null
  claim_token_expires_at: string | null
}

interface LoyaltyProgramRow {
  id: string
  business_id: string
  enabled: boolean
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()

  // -------------------------------------------------------------------------
  // 1. Rate limiting — keyed to IP + pathname to isolate this endpoint.
  // -------------------------------------------------------------------------
  const rl = await rateLimit(request, CLAIM_RATE_LIMIT)
  if (!rl.success) {
    logSecurity('rate_limit', 'medium', {
      path: '/api/public/claim-account',
      remaining: rl.remaining,
    })
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera 15 minutos antes de volver a intentar.' },
      { status: 429, headers: rl.headers }
    )
  }

  // -------------------------------------------------------------------------
  // 2. Parse + validate request body.
  // -------------------------------------------------------------------------
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de solicitud inválido. Se esperaba JSON.' },
      { status: 400 }
    )
  }

  const parsed = ClaimAccountSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { claim_token, email, password, name } = parsed.data

  // -------------------------------------------------------------------------
  // 3. Look up the client record by claim_token.
  //    Conditions enforced in the query:
  //      • claim_token matches exactly
  //      • claim_token_expires_at > NOW()  (not expired)
  //      • user_id IS NULL                 (not already claimed)
  //    We use the service-role client to bypass RLS — the token itself
  //    is the credential; no session is needed.
  // -------------------------------------------------------------------------
  const serviceClient = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error: clientLookupError } = (await (serviceClient as any)
    .from('clients')
    .select('id, business_id, name, email, user_id, claim_token, claim_token_expires_at')
    .eq('claim_token', claim_token)
    .gt('claim_token_expires_at', new Date().toISOString())
    .is('user_id', null)
    .maybeSingle()) as { data: ClientRow | null; error: unknown }

  if (clientLookupError) {
    logger.error(
      { err: clientLookupError, path: '/api/public/claim-account' },
      'claim-account: DB error during client lookup'
    )
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 })
  }

  // Token not found, expired, or record already claimed — return a generic
  // 401 to avoid confirming whether the token ever existed (timing-safe).
  if (!client) {
    logSecurity('unauthorized', 'medium', {
      path: '/api/public/claim-account',
      reason: 'invalid_or_expired_token',
    })
    return NextResponse.json(
      { error: 'Token inválido o expirado. Solicita un nuevo enlace de registro.' },
      { status: 401 }
    )
  }

  // -------------------------------------------------------------------------
  // 4. Email guard — if the client record already has an email on file,
  //    the supplied email must match (case-insensitive).
  //    This prevents one person from claiming another person's record by
  //    knowing only the token (e.g., token leaked via shared SMS preview).
  // -------------------------------------------------------------------------
  if (client.email && client.email.toLowerCase() !== email.toLowerCase()) {
    logSecurity('unauthorized', 'high', {
      path: '/api/public/claim-account',
      reason: 'email_mismatch',
      client_id: client.id,
    })
    return NextResponse.json(
      {
        error:
          'El email proporcionado no coincide con el registrado para este cliente. ' +
          'Usa el mismo email con el que realizaste tu reserva.',
      },
      { status: 401 }
    )
  }

  // -------------------------------------------------------------------------
  // 5. Create the Supabase auth user.
  //    • email_confirm: true  — skip the confirmation email; the claim_token
  //      already proves the client controls the delivery channel.
  //    • user_metadata — safe context for downstream triggers/webhooks.
  //    • NEVER include client_id in a way that a client can tamper with;
  //      here it is written server-side only.
  // -------------------------------------------------------------------------
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      signup_source: 'claim_token',
      client_id: client.id,
      business_id: client.business_id,
      full_name: name ?? client.name ?? undefined,
    },
  })

  if (authError) {
    // Supabase returns "User already registered" or similar when the email
    // exists. Surface this as a 409 so the front-end can switch to login mode.
    const msg = authError.message?.toLowerCase() ?? ''
    if (
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('email address is already')
    ) {
      logger.info(
        { email, path: '/api/public/claim-account' },
        'claim-account: email already registered, suggesting login'
      )
      return NextResponse.json(
        {
          error:
            'Este email ya está registrado. Inicia sesión con tu cuenta existente ' +
            'y luego vincula tu perfil desde el panel de cliente.',
          hint: 'use_login',
        },
        { status: 409 }
      )
    }

    logger.error(
      { err: authError, path: '/api/public/claim-account' },
      'claim-account: auth.admin.createUser failed'
    )
    return NextResponse.json(
      { error: 'No se pudo crear la cuenta. Intenta de nuevo más tarde.' },
      { status: 500 }
    )
  }

  const authUser = authData.user
  if (!authUser) {
    logger.error(
      { path: '/api/public/claim-account' },
      'claim-account: auth.admin.createUser returned no user'
    )
    return NextResponse.json({ error: 'Error interno al crear cuenta.' }, { status: 500 })
  }

  // -------------------------------------------------------------------------
  // 6. Atomically link the client record and burn the token.
  //    Setting claim_token = NULL ensures this token cannot be replayed even
  //    if the network request is retried or the response was cached.
  // -------------------------------------------------------------------------
  const clientUpdatePayload: Record<string, unknown> = {
    user_id: authUser.id,
    claim_token: null,
    claim_token_expires_at: null,
  }

  // Optionally update the display name if the caller supplied one and
  // the existing name is blank (avoids overwriting richer data).
  if (name && !client.name) {
    clientUpdatePayload.name = name
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: linkError } = await (serviceClient as any)
    .from('clients')
    .update(clientUpdatePayload)
    .eq('id', client.id)
    .is('user_id', null) // double-write guard: abort if another request won the race

  if (linkError) {
    // The most likely cause is a concurrent claim that set user_id first.
    // Either way, we cannot safely proceed — the newly created auth user
    // will be orphaned. Attempt best-effort cleanup.
    logger.error(
      { err: linkError, client_id: client.id, auth_user_id: authUser.id },
      'claim-account: failed to link client → user_id; attempting auth user cleanup'
    )

    await serviceClient.auth.admin.deleteUser(authUser.id).catch((cleanupErr: unknown) => {
      logger.error(
        { err: cleanupErr, auth_user_id: authUser.id },
        'claim-account: auth user cleanup also failed — orphaned user may exist'
      )
    })

    return NextResponse.json(
      {
        error:
          'La cuenta no pudo ser vinculada. Es posible que ya haya sido reclamada. ' +
          'Si el problema persiste, contacta al negocio.',
      },
      { status: 409 }
    )
  }

  // -------------------------------------------------------------------------
  // 7. Conditionally create initial loyalty_status row.
  //    Only created when the business has an active loyalty program.
  //    Uses ON CONFLICT DO NOTHING so a retry is safe.
  // -------------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loyaltyProgram } = (await (serviceClient as any)
    .from('loyalty_programs')
    .select('id, business_id, enabled')
    .eq('business_id', client.business_id)
    .eq('enabled', true)
    .maybeSingle()) as { data: LoyaltyProgramRow | null; error: unknown }

  if (loyaltyProgram) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: loyaltyError } = await (serviceClient as any)
      .from('client_loyalty_status')
      .insert({
        client_id: client.id,
        business_id: client.business_id,
        user_id: authUser.id,
        points_balance: 0,
        lifetime_points: 0,
        visit_count: 0,
        current_tier: 'bronze',
      })
      .onConflict('client_id') // UNIQUE(client_id) in migration 014
      .ignore()

    if (loyaltyError) {
      // Non-fatal: the account and link are already committed. Log and continue.
      logger.warn(
        { err: loyaltyError, client_id: client.id },
        'claim-account: failed to create loyalty_status (non-fatal)'
      )
    }
  }

  // -------------------------------------------------------------------------
  // 8. Audit log.
  // -------------------------------------------------------------------------
  logAuth('signup', authUser.id, {
    source: 'claim_token',
    client_id: client.id,
    business_id: client.business_id,
    duration_ms: Date.now() - startedAt,
  })

  logger.info(
    {
      client_id: client.id,
      auth_user_id: authUser.id,
      business_id: client.business_id,
      loyalty_enrolled: loyaltyProgram !== null,
      duration_ms: Date.now() - startedAt,
    },
    'claim-account: client account claimed successfully'
  )

  return NextResponse.json({
    success: true,
    message: 'Cuenta creada exitosamente',
  })
}
