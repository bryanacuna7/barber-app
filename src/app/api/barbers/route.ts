import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const barberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch barbers' },
      { status: 500 },
    )
  }

  return NextResponse.json(barbers)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's business
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({
      error: 'Business not found',
      debug: { userId: user.id, bizError: bizError?.message }
    }, { status: 404 })
  }

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
      { status: 400 },
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
      { status: 500 },
    )
  }

  // Create invitation for the barber to register
  const { error: inviteError } = await supabase
    .from('barber_invitations')
    .insert({
      business_id: business.id,
      email: parsed.data.email,
    })

  if (inviteError) {
    console.error('Failed to create invitation:', inviteError)
    // We don't fail the whole request because the barber was created
  }

  return NextResponse.json(barber)
}
