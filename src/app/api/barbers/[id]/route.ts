// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const barberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = barberSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { data: barber, error } = await supabase
    .from('barbers')
    .update(parsed.data)
    .eq('id', id)
    .eq('business_id', business.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update barber' }, { status: 500 })
  }

  return NextResponse.json(barber)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { error } = await supabase
    .from('barbers')
    .delete()
    .eq('id', id)
    .eq('business_id', business.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete barber' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
