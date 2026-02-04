import { NextResponse } from 'next/server'
import { z } from 'zod'
import { canAddBarber } from '@/lib/subscription'
import { withAuth, errorResponse } from '@/lib/api/middleware'

const barberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
})

export const GET = withAuth(async (request, context, { business, supabase }) => {
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

  if (error) {
    return errorResponse('Failed to fetch barbers')
  }

  return NextResponse.json(barbers)
})

export const POST = withAuth(async (request, context, { business, supabase }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = barberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

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

  // Create barber record
  const { data: barber, error } = await supabase
    .from('barbers')
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      email: parsed.data.email,
      bio: parsed.data.bio || null,
      photo_url: parsed.data.photo_url || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating barber:', error)
    return NextResponse.json(
      { error: 'Failed to create barber', details: error.message },
      { status: 500 }
    )
  }

  // Create invitation for the barber to register
  const { error: inviteError } = await supabase.from('barber_invitations').insert({
    business_id: business.id,
    email: parsed.data.email,
  })

  if (inviteError) {
    console.error('Failed to create invitation:', inviteError)
    // We don't fail the whole request because the barber was created
  }

  return NextResponse.json(barber)
})
