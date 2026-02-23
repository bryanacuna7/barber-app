import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { canAddBarber } from '@/lib/subscription'
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

  // Check subscription limits
  const limitCheck = await canAddBarber(supabase, business.id)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Límite de plan alcanzado',
        message: limitCheck.reason,
        current: limitCheck.current,
        max: limitCheck.max,
        upgrade_required: true,
      },
      { status: 403 }
    )
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
      { error: 'Ya existe un barbero con ese email en tu negocio' },
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
    // If user already exists, try to find their ID
    if (authError.message?.includes('already') || authError.message?.includes('exists')) {
      // Use perPage: 1000 to avoid pagination issues (default is 50)
      const { data: listData } = await serviceClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      const existingUser = (listData?.users ?? []).find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingUser) {
        authUserId = existingUser.id
      } else {
        console.error('Auth user creation failed:', authError)
        return errorResponse('No se pudo crear la cuenta del barbero', 500)
      }
    } else {
      console.error('Auth user creation failed:', authError)
      return errorResponse('No se pudo crear la cuenta del barbero', 500)
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
    console.error('Barber record creation failed:', barberError)
    return NextResponse.json(
      { error: 'No se pudo crear el registro del barbero', details: barberError.message },
      { status: 500 }
    )
  }

  // Generate password setup link (preferred over sending temp password)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.barberapp.com'
  const redirectTo = `${appUrl}/reset-password`
  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  })

  if (linkError) {
    console.error('Failed to generate password setup link:', linkError)
  }

  const setPasswordUrl = linkData?.properties?.action_link

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
      console.error('Failed to upsert invitation record:', inviteError)
    }
  }

  // Send onboarding email
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : 'https://app.barberapp.com/login'

  const emailResult = await sendEmail({
    to: email,
    subject:
      mode === 'add'
        ? `${business.name || 'Tu Barbería'} te agregó como barbero`
        : `${business.name || 'Tu Barbería'} te invitó como barbero`,
    react: BarberInviteEmail({
      businessName: business.name || 'Tu Barbería',
      barberName: name,
      email,
      setPasswordUrl,
      loginUrl,
      mode,
    }),
  })

  if (!emailResult.success) {
    return NextResponse.json({
      barber,
      mode,
      email_sent: false,
      warning:
        'Barbero agregado, pero no pudimos enviar el correo. Pídele usar "Olvidé mi contraseña".',
    })
  }

  return NextResponse.json({
    barber,
    mode,
    email_sent: true,
  })
})
