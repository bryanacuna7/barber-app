import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * Owner schema: can update all fields including custom_permissions.
 * Custom_permissions is a JSONB object with boolean values — validated
 * by the DB CHECK constraint (validate_custom_permissions function).
 */
const ownerBarberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
  is_active: z.boolean().optional(),
  custom_permissions: z.record(z.string(), z.boolean()).nullable().optional(),
})

/**
 * Barber self-update schema: can only edit bio and photo.
 * No custom_permissions — prevents self-escalation.
 */
const barberSelfUpdateSchema = z.object({
  bio: z.string().optional(),
  photo_url: z.string().optional(),
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

  // Check if user is the business owner
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const isOwner = !!business

  // Check if user is the barber themselves
  const { data: barberRecord } = await supabase
    .from('barbers')
    .select('id, business_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const isSelf = !!barberRecord

  // Must be either the owner or the barber themselves
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Use different schema based on role
  const schema = isOwner ? ownerBarberUpdateSchema : barberSelfUpdateSchema
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Determine the business_id for the query guard
  const businessId = isOwner ? business!.id : barberRecord!.business_id

  const { data: barber, error } = await (supabase as any)
    .from('barbers')
    .update(parsed.data)
    .eq('id', id)
    .eq('business_id', businessId)
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

  // Only owner can delete barbers
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
