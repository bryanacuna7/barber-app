import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { logger } from '@/lib/logger'
// canAddBarber uses getSubscriptionStatus which is heavy — use lightweight check instead
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendEmail } from '@/lib/email/sender'
import BarberInviteEmail from '@/lib/email/templates/barber-invite'

const inviteSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido'),
  mode: z.enum(['add', 'invite']).optional().default('add'),
})

export const POST = withAuth(async (request, context, { business, supabase }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, mode } = parsed.data
  const email = parsed.data.email.trim().toLowerCase()

  // Lightweight subscription limit check (avoids slow getSubscriptionStatus)
  const [subResult, barberCountResult] = await Promise.all([
    supabase
      .from('business_subscriptions')
      .select('status, plan:subscription_plans(max_barbers, display_name)')
      .eq('business_id', business.id)
      .single(),
    supabase
      .from('barbers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id),
  ])

  if (subResult.data) {
    const plan = subResult.data.plan as any
    const maxBarbers = plan?.max_barbers
    const currentCount = barberCountResult.count || 0
    if (maxBarbers !== null && currentCount >= maxBarbers) {
      return NextResponse.json(
        {
          error: 'Límite de plan alcanzado',
          message: `Has alcanzado el límite de ${maxBarbers} miembros del equipo en tu plan ${plan?.display_name || ''}. Actualiza a Pro para agregar más.`,
          current: currentCount,
          max: maxBarbers,
          upgrade_required: true,
        },
        { status: 403 }
      )
    }
  }

  // Check if barber email already exists in this business (normalized)
  const { data: existingBarber } = await supabase
    .from('barbers')
    .select('id')
    .eq('business_id', business.id)
    .eq('email', email)
    .maybeSingle()

  if (existingBarber) {
    return NextResponse.json(
      { error: 'Ya existe un miembro del equipo con ese email en tu negocio' },
      { status: 400 }
    )
  }

  // Generate temp password (16 hex chars)
  const tempPassword = crypto.randomBytes(8).toString('hex')

  // Create Supabase auth user via service client
  const serviceClient = createServiceClient()
  let authUserId: string

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) {
    // If user already exists, look up their ID via paginated search
    if (authError.message?.includes('already') || authError.message?.includes('exists')) {
      let foundUserId: string | null = null
      // Search through pages (50 users per page) until we find the match
      for (let page = 1; page <= 10 && !foundUserId; page++) {
        const { data: listData } = await serviceClient.auth.admin.listUsers({
          page,
          perPage: 50,
        })
        const match = (listData?.users ?? []).find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        )
        if (match) foundUserId = match.id
        if (!listData?.users?.length || listData.users.length < 50) break
      }

      if (foundUserId) {
        authUserId = foundUserId
      } else {
        logger.error({ err: authError }, 'Auth user creation failed')
        return errorResponse('No se pudo crear la cuenta del miembro del equipo', 500)
      }
    } else {
      logger.error({ err: authError }, 'Auth user creation failed')
      return errorResponse('No se pudo crear la cuenta del miembro del equipo', 500)
    }
  } else {
    authUserId = authData.user.id
  }

  // Create barber record linked to auth user
  const { data: barber, error: barberError } = await supabase
    .from('barbers')
    .insert({
      business_id: business.id,
      name,
      email,
      role: 'barber',
      is_active: true,
      user_id: authUserId,
    })
    .select('id, name, email, phone, user_id, business_id, is_active, role, avatar_url, created_at')
    .single()

  if (barberError) {
    logger.error({ err: barberError }, 'Barber record creation failed')
    return NextResponse.json(
      {
        error: 'No se pudo crear el registro del miembro del equipo',
        details: barberError.message,
      },
      { status: 500 }
    )
  }

  // Generate password setup link using token_hash approach.
  // admin.generateLink uses implicit flow, so instead of relying on
  // Supabase redirect (requires URL allowlist config), we extract the
  // hashed_token and build a direct URL to /reset-password.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.barberapp.com'
  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  if (linkError) {
    logger.error({ err: linkError }, 'Failed to generate password setup link')
  }

  const tokenHash = linkData?.properties?.hashed_token
  const setPasswordUrl = tokenHash
    ? `${appUrl}/reset-password?token_hash=${encodeURIComponent(tokenHash)}`
    : null

  // Keep invite mode available without making it the default flow.
  if (mode === 'invite') {
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: inviteError } = await supabase.from('barber_invitations').upsert(
      {
        business_id: business.id,
        email,
        token,
        expires_at: expiresAt,
        used_at: null,
      },
      {
        onConflict: 'business_id,email',
      }
    )

    if (inviteError) {
      logger.error({ err: inviteError }, 'Failed to upsert invitation record')
    }
  }

  // Send onboarding email (non-blocking — don't hold the response)
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : 'https://app.barberapp.com/login'

  sendEmail({
    to: email,
    subject:
      mode === 'add'
        ? `${business.name || 'Tu Barbería'} te agregó como miembro del equipo`
        : `${business.name || 'Tu Barbería'} te invitó como miembro del equipo`,
    react: BarberInviteEmail({
      businessName: business.name || 'Tu Barbería',
      barberName: name,
      email,
      setPasswordUrl,
      loginUrl,
      mode,
    }),
  }).catch((err) => logger.error({ err }, 'Failed to send barber invite email'))

  return NextResponse.json({
    barber,
    mode,
    setup_url: setPasswordUrl || null,
  })
})
