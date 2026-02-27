import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/referrals/stats?businessId=xxx
 * Obtiene estadísticas completas del programa de referencias
 *
 * Returns: {
 *   totalReferrals, successfulReferrals, currentMilestone,
 *   nextMilestone, pointsBalance, earnedBadges, conversionRate,
 *   conversions, milestones, referralCode, qrCodeUrl, signupUrl
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId query parameter is required' }, { status: 400 })
    }

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 404 })
    }

    // Get referral stats
    const { data: referralStats } = await supabase
      .from('business_referrals')
      .select('*')
      .eq('business_id', businessId)
      .single()

    // Get all milestones
    const { data: milestones } = await supabase
      .from('referral_milestones')
      .select('*')
      .eq('is_active', true)
      .order('milestone_number', { ascending: true })

    // Get earned badges (rewards claimed)
    const { data: claimedRewards } = await supabase
      .from('referral_rewards_claimed')
      .select(
        `
        id,
        claimed_at,
        applied_at,
        expires_at,
        milestone:referral_milestones(
          milestone_number,
          badge_name,
          badge_icon,
          tier,
          reward_description
        )
      `
      )
      .eq('business_id', businessId)
      .order('claimed_at', { ascending: false })

    // Get conversions (referidos)
    const { data: conversions } = await supabase
      .from('referral_conversions')
      .select(
        `
        id,
        referral_code,
        status,
        created_at,
        converted_at,
        referred_business:businesses!referral_conversions_referred_business_id_fkey(
          id,
          name,
          slug
        )
      `
      )
      .eq('referrer_business_id', businessId)
      .order('created_at', { ascending: false })

    // Calculate stats
    const currentSuccessful = referralStats?.successful_referrals || 0
    const totalReferrals = referralStats?.total_referrals || 0

    // Find next milestone
    const nextMilestone = milestones?.find((m) => m.referrals_required > currentSuccessful)

    // Calculate conversion rate
    const conversionRate =
      totalReferrals > 0 ? ((currentSuccessful / totalReferrals) * 100).toFixed(1) : '0.0'

    // Calculate progress to next milestone
    const progressToNext = nextMilestone
      ? {
          number: nextMilestone.milestone_number,
          referralsRequired: nextMilestone.referrals_required,
          remaining: nextMilestone.referrals_required - currentSuccessful,
          reward: nextMilestone.reward_description,
          percentage: Math.min(
            100,
            (currentSuccessful / nextMilestone.referrals_required) * 100
          ).toFixed(1),
        }
      : null

    return NextResponse.json({
      // Core stats
      totalReferrals,
      successfulReferrals: currentSuccessful,
      currentMilestone: referralStats?.current_milestone || 0,
      pointsBalance: referralStats?.points_balance || 0,
      conversionRate,

      // Referral code info
      referralCode: referralStats?.referral_code || null,
      qrCodeUrl: referralStats?.qr_code_url || null,
      signupUrl: referralStats?.referral_code
        ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralStats.referral_code}`
        : null,

      // Progress
      nextMilestone: progressToNext,

      // Details
      earnedBadges: claimedRewards || [],
      conversions: conversions || [],
      milestones: milestones || [],

      // Business info
      businessName: business.name,
    })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching referral stats')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
