import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let targetBarberId = barberId

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

    const { data: allAchievements, error: achievementsError } = await supabase
      .from('barber_achievements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (achievementsError) {
      throw achievementsError
    }

    const { data: earnedAchievements, error: earnedError } = await supabase
      .from('barber_earned_achievements')
      .select('*, achievement:barber_achievements(*)')
      .eq('barber_id', targetBarberId)

    if (earnedError) {
      throw earnedError
    }

    const { data: stats } = await supabase
      .from('barber_stats')
      .select('*')
      .eq('barber_id', targetBarberId)
      .single()

    const achievementsWithProgress = allAchievements.map((achievement) => {
      const earned = earnedAchievements?.find((e) => e.achievement_id === achievement.id)

      const unlockConditions =
        typeof achievement.unlock_conditions === 'string'
          ? JSON.parse(achievement.unlock_conditions)
          : achievement.unlock_conditions

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
        unlock_conditions: unlockConditions,
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
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
