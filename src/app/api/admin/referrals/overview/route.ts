import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin'

/**
 * GET /api/admin/referrals/overview
 * Admin-only: Global stats del programa de referencias
 *
 * Returns: {
 *   totalReferrals: number
 *   activeConversions: number
 *   conversionRate: string
 *   totalRewardsClaimed: number
 *   avgReferralsPerUser: string
 *   topMilestoneReached: number
 *   revenueImpact: number
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verify admin access
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Use service client for admin queries
    const serviceClient = await createServiceClient()

    // Get total referrals across all businesses
    const { data: allReferrals } = await serviceClient
      .from('business_referrals')
      .select('total_referrals, successful_referrals, current_milestone')

    // Get all conversions
    const { data: allConversions } = await serviceClient
      .from('referral_conversions')
      .select('status, created_at')

    // Get claimed rewards
    const { data: claimedRewards } = await serviceClient
      .from('referral_rewards_claimed')
      .select('id')

    // Calculate stats
    const totalReferrals =
      allReferrals?.reduce((sum, br) => sum + (br.total_referrals || 0), 0) || 0
    const successfulReferrals =
      allReferrals?.reduce((sum, br) => sum + (br.successful_referrals || 0), 0) || 0

    const activeConversions = allConversions?.filter((c) => c.status === 'active').length || 0
    const pendingConversions = allConversions?.filter((c) => c.status === 'pending').length || 0

    const conversionRate =
      totalReferrals > 0 ? ((activeConversions / totalReferrals) * 100).toFixed(1) : '0.0'

    const avgReferralsPerUser =
      allReferrals && allReferrals.length > 0
        ? (totalReferrals / allReferrals.length).toFixed(1)
        : '0.0'

    const topMilestoneReached =
      allReferrals?.reduce((max, br) => Math.max(max, br.current_milestone || 0), 0) || 0

    // Calculate revenue impact (assuming $50 discount per active referral)
    const revenueImpact = activeConversions * 50

    return NextResponse.json({
      totalReferrals,
      activeConversions,
      pendingConversions,
      conversionRate,
      totalRewardsClaimed: claimedRewards?.length || 0,
      avgReferralsPerUser,
      topMilestoneReached,
      revenueImpact,
      totalBusinesses: allReferrals?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching admin referral overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
