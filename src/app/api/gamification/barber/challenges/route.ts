import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/gamification/barber/challenges
 *
 * Get active challenges for a business
 * Query params:
 *  - businessId (required): business context
 *  - activeOnly (optional): filter only active challenges (default: true)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

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

    // Build query
    let query = supabase
      .from('barber_challenges')
      .select(
        '*, participants:barber_challenge_participants(*, barber:barbers(id, name, photo_url))'
      )
      .eq('business_id', businessId)

    if (activeOnly) {
      const now = new Date().toISOString()
      query = query.eq('is_active', true).lte('starts_at', now).gte('ends_at', now)
    }

    query = query.order('starts_at', { ascending: false })

    const { data: challenges, error: challengesError } = await query

    if (challengesError) {
      throw challengesError
    }

    return NextResponse.json({ challenges })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching barber challenges')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/gamification/barber/challenges
 *
 * Create a new challenge (owner only)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      businessId,
      name,
      description,
      challengeType,
      targetValue,
      targetMetric,
      rewardDescription,
      rewardAmount,
      startsAt,
      endsAt,
    } = body

    if (!businessId || !name || !challengeType || !targetValue || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is owner of the business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 })
    }

    // Validate dates
    const starts = new Date(startsAt)
    const ends = new Date(endsAt)

    if (starts >= ends) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 })
    }

    // Create challenge
    const { data: challenge, error: createError } = await supabase
      .from('barber_challenges')
      .insert({
        business_id: businessId,
        name,
        description,
        challenge_type: challengeType,
        target_value: targetValue,
        target_metric: targetMetric || challengeType,
        reward_description: rewardDescription || null,
        reward_amount: rewardAmount || null,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Auto-enroll all active barbers in this business
    const { data: barbers } = await supabase
      .from('barbers')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (barbers && barbers.length > 0) {
      const participants = barbers.map((barber) => ({
        challenge_id: challenge.id,
        barber_id: barber.id,
        current_value: 0,
        target_value: targetValue,
      }))

      await supabase.from('barber_challenge_participants').insert(participants)
    }

    return NextResponse.json({ challenge }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error creating challenge')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
