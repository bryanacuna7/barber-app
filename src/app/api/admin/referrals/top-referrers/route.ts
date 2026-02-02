import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/referrals/top-referrers?limit=10
 * Admin-only: Top referrers ranking
 *
 * Returns: Array<{
 *   businessId: string
 *   businessName: string
 *   referralCode: string
 *   totalReferrals: number
 *   successfulReferrals: number
 *   currentMilestone: number
 *   conversionRate: string
 *   pointsBalance: number
 *   createdAt: string
 * }>
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Auth check - verify user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (exists in admin_users table)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Use service client for admin queries
    const serviceClient = await createServiceClient()

    // Get top referrers with business info
    const { data: topReferrers } = await serviceClient
      .from('business_referrals')
      .select(
        `
        business_id,
        referral_code,
        total_referrals,
        successful_referrals,
        current_milestone,
        points_balance,
        created_at,
        business:businesses!business_referrals_business_id_fkey(
          id,
          name,
          slug
        )
      `
      )
      .order('total_referrals', { ascending: false })
      .limit(limit)

    // Format response
    const formattedReferrers = topReferrers?.map((referrer) => {
      const conversionRate =
        referrer.total_referrals > 0
          ? ((referrer.successful_referrals / referrer.total_referrals) * 100).toFixed(1)
          : '0.0'

      return {
        businessId: referrer.business_id,
        businessName: (referrer.business as any)?.name || 'Unknown',
        businessSlug: (referrer.business as any)?.slug || '',
        referralCode: referrer.referral_code,
        totalReferrals: referrer.total_referrals,
        successfulReferrals: referrer.successful_referrals,
        currentMilestone: referrer.current_milestone,
        conversionRate,
        pointsBalance: referrer.points_balance,
        createdAt: referrer.created_at,
      }
    })

    return NextResponse.json({
      topReferrers: formattedReferrers || [],
      count: formattedReferrers?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching top referrers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
