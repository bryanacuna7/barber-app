import { NextResponse } from 'next/server'
import { z } from 'zod'
import { canAddService } from '@/lib/subscription'
import { withAuth, errorResponse } from '@/lib/api/middleware'

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['corte', 'barba', 'combo', 'facial']).default('corte'),
  duration_minutes: z.number().min(5).max(480),
  price: z.number().min(0),
})

export const GET = withAuth(async (request, context, { business, supabase }) => {
  const { data: services, error } = await supabase
    .from('services')
    .select(
      'id, name, description, category, duration_minutes, price, display_order, is_active, business_id'
    )
    .eq('business_id', business.id)
    .order('display_order', { ascending: true })

  if (error) {
    return errorResponse('Failed to fetch services')
  }

  return NextResponse.json(services)
})

export const POST = withAuth(async (request, context, { business, supabase }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Check subscription limits
  const limitCheck = await canAddService(supabase, business.id)
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

  const { data: service, error } = await supabase
    .from('services')
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      duration_minutes: parsed.data.duration_minutes,
      price: parsed.data.price,
    })
    .select()
    .single()

  if (error) {
    return errorResponse('Failed to create service')
  }

  return NextResponse.json(service)
})
