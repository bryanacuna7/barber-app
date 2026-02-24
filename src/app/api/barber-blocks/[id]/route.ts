import { NextResponse } from 'next/server'
import { withAuthAndRateLimit, errorResponse, notFoundResponse } from '@/lib/api/middleware'
import { z } from 'zod'

type RouteParams = { params: Promise<{ id: string }> }

const updateBlockSchema = z.object({
  block_type: z.enum(['break', 'vacation', 'personal', 'other']).optional(),
  title: z.string().max(200).optional().nullable(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  all_day: z.boolean().optional(),
  recurrence_rule: z.string().max(500).optional().nullable(),
})

export const PATCH = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { business, supabase }) => {
    try {
      const { id } = await params

      const body = await request.json()
      const parsed = updateBlockSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Datos invalidos', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      // Verify the block belongs to this business
      const { data: existing } = await (supabase as any)
        .from('barber_blocks')
        .select('id')
        .eq('id', id)
        .eq('business_id', business.id)
        .single()

      if (!existing) {
        return notFoundResponse('Bloque no encontrado')
      }

      const { data, error } = await (supabase as any)
        .from('barber_blocks')
        .update(parsed.data)
        .eq('id', id)
        .eq('business_id', business.id)
        .select('*')
        .single()

      if (error) {
        return errorResponse('Error al actualizar bloque')
      }

      return NextResponse.json(data)
    } catch {
      return errorResponse('Error interno')
    }
  },
  { interval: 60_000, maxRequests: 10 }
)

export const DELETE = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { business, supabase }) => {
    try {
      const { id } = await params

      // Verify the block belongs to this business
      const { data: existing } = await (supabase as any)
        .from('barber_blocks')
        .select('id')
        .eq('id', id)
        .eq('business_id', business.id)
        .single()

      if (!existing) {
        return notFoundResponse('Bloque no encontrado')
      }

      const { error } = await (supabase as any)
        .from('barber_blocks')
        .delete()
        .eq('id', id)
        .eq('business_id', business.id)

      if (error) {
        return errorResponse('Error al eliminar bloque')
      }

      return NextResponse.json({ success: true })
    } catch {
      return errorResponse('Error interno')
    }
  },
  { interval: 60_000, maxRequests: 10 }
)
