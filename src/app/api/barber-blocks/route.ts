import { NextResponse } from 'next/server'
import { withAuthAndRateLimit, errorResponse } from '@/lib/api/middleware'
import { z } from 'zod'

const createBlockSchema = z.object({
  barber_id: z.string().uuid(),
  block_type: z.enum(['break', 'vacation', 'personal', 'other']),
  title: z.string().max(200).optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  all_day: z.boolean().default(false),
  recurrence_rule: z.string().max(500).optional(),
})

export const GET = withAuthAndRateLimit(
  async (request, _params, { business, supabase }) => {
    try {
      const url = new URL(request.url)
      const barberId = url.searchParams.get('barber_id')
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')

      let query = (supabase as any)
        .from('barber_blocks')
        .select('*')
        .eq('business_id', business.id)
        .order('start_time', { ascending: true })

      if (barberId) query = query.eq('barber_id', barberId)
      if (from) query = query.gte('start_time', from)
      if (to) query = query.lte('start_time', to)

      const { data, error } = await query
      if (error) return errorResponse('Error al obtener bloques')

      return NextResponse.json(data || [])
    } catch {
      return errorResponse('Error interno')
    }
  },
  { interval: 60_000, maxRequests: 30 }
)

export const POST = withAuthAndRateLimit(
  async (request, _params, { business, supabase }) => {
    try {
      const body = await request.json()
      const parsed = createBlockSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Datos invalidos', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { barber_id, block_type, title, start_time, end_time, all_day, recurrence_rule } =
        parsed.data

      // Validate barber belongs to business
      const { data: barber } = await supabase
        .from('barbers')
        .select('id')
        .eq('id', barber_id)
        .eq('business_id', business.id)
        .single()

      if (!barber) {
        return NextResponse.json({ error: 'Barbero no encontrado' }, { status: 404 })
      }

      // Validate start_time is not in the past (5 min tolerance)
      const fiveMinAgo = new Date(Date.now() - 5 * 60_000)
      if (new Date(start_time) < fiveMinAgo) {
        return NextResponse.json(
          { error: 'No se pueden crear bloques en el pasado' },
          { status: 400 }
        )
      }

      const { data, error } = await (supabase as any)
        .from('barber_blocks')
        .insert({
          business_id: business.id,
          barber_id,
          block_type,
          title: title || null,
          start_time,
          end_time,
          all_day,
          recurrence_rule: recurrence_rule || null,
        })
        .select('*')
        .single()

      if (error) {
        return errorResponse('Error al crear bloque')
      }

      return NextResponse.json(data, { status: 201 })
    } catch {
      return errorResponse('Error interno')
    }
  },
  { interval: 60_000, maxRequests: 10 }
)
