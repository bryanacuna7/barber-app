import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { BarberStats } from '@/lib/gamification/barber-gamification'
import { getBarberIdFromUserId } from '@/lib/rbac'
import { logger } from '@/lib/logger'

/**
 * GET /api/gamification/barber/stats
 *
 * Get barber statistics for gamification
 * Query params:
 *  - barberId (optional): specific barber, defaults to current user's barber
 *  - businessId (required): business context
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let targetBarberId = barberId

    // If no barberId provided, find barber by user_id
    if (!targetBarberId) {
      targetBarberId = await getBarberIdFromUserId(supabase, user.id, businessId)

      if (!targetBarberId) {
        return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
      }
    }

    // Get stats
    const { data: stats, error: statsError } = await supabase
      .from('barber_stats')
      .select('*')
      .eq('barber_id', targetBarberId)
      .single()

    if (statsError) {
      // If stats don't exist, create them
      if (statsError.code === 'PGRST116') {
        const { data: barber } = await supabase
          .from('barbers')
          .select('business_id')
          .eq('id', targetBarberId)
          .single()

        if (!barber) {
          return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
        }

        const { data: newStats, error: createError } = await supabase
          .from('barber_stats')
          .insert({
            barber_id: targetBarberId,
            business_id: barber.business_id,
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return NextResponse.json({ stats: newStats })
      }

      throw statsError
    }

    return NextResponse.json({ stats })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching barber stats')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
