import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/gamification/barber/achievements
 *
 * Get achievements for a barber (earned + available)
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
      const { data: barber } = await supabase
        .from('barbers')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single()

      if (!barber) {
        return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
      }

      targetBarberId = barber.id
    }

    // Get all active achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('barber_achievements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (achievementsError) {
      throw achievementsError
    }

    // Get earned achievements for this barber
    const { data: earnedAchievements, error: earnedError } = await supabase
      .from('barber_earned_achievements')
      .select('*, achievement:barber_achievements(*)')
      .eq('barber_id', targetBarberId)

    if (earnedError) {
      throw earnedError
    }

    // Get barber stats for progress calculation
    const { data: stats } = await supabase
      .from('barber_stats')
      .select('*')
      .eq('barber_id', targetBarberId)
      .single()

    // Merge earned status with all achievements
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const earned = earnedAchievements?.find((e) => e.achievement_id === achievement.id)

      // Parse unlock_conditions if it's a string (JSONB from Supabase)
      const unlockConditions =
        typeof achievement.unlock_conditions === 'string'
          ? JSON.parse(achievement.unlock_conditions)
          : achievement.unlock_conditions

      // Calculate progress
      let progress = 0
      let current = 0
      const threshold = unlockConditions.threshold || 0

      if (stats) {
        switch (unlockConditions.type) {
          case 'revenue':
            current = stats.total_revenue
            break
          case 'appointments':
            current = stats.total_appointments
            break
          case 'clients':
            current = stats.total_clients
            break
          case 'streak':
            current = stats.current_streak_days
            break
        }
        progress = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0
      }

      return {
        ...achievement,
        unlock_conditions: unlockConditions, // Ensure it's an object
        is_earned: !!earned,
        earned_at: earned?.earned_at || null,
        progress,
        current,
        threshold,
      }
    })

    return NextResponse.json({
      achievements: achievementsWithProgress,
      total: allAchievements.length,
      earned: earnedAchievements?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching barber achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
