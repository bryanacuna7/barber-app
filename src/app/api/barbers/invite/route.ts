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

  const { name, email } = parsed.data

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

  // Check if barber email already exists in this business
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
    } as any)
    .select('id, name, email, phone, user_id, business_id, is_active, role, avatar_url, created_at')
    .single()

  if (barberError) {
    console.error('Barber record creation failed:', barberError)
    return NextResponse.json(
      { error: 'No se pudo crear el registro del barbero', details: barberError.message },
      { status: 500 }
    )
  }

  // Create invitation record (non-blocking)
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  supabase
    .from('barber_invitations')
    .insert({
      business_id: business.id,
      email,
      token,
      expires_at: expiresAt,
    } as any)
    .then(({ error: invError }) => {
      if (invError) console.error('Failed to create invitation record:', invError)
    })

  // Send invitation email (non-blocking)
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : 'https://app.barberapp.com/login'

  sendEmail({
    to: email,
    subject: `${business.name || 'Tu Barbería'} te ha invitado como barbero`,
    react: BarberInviteEmail({
      businessName: business.name || 'Tu Barbería',
      barberName: name,
      email,
      tempPassword,
      loginUrl,
    }),
  }).catch((err) => {
    console.error('Failed to send invite email:', err)
  })

  return NextResponse.json(barber)
})
