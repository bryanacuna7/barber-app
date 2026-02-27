import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin'
import { logger } from '@/lib/logger'

/**
 * GET /api/admin/referrals/analytics?period=30
 * Admin-only: Analytics data for charts
 *
 * Returns: {
 *   conversionsByMonth: Array<{ month: string, conversions: number }>
 *   milestoneDistribution: Array<{ milestone: number, count: number }>
 *   statusBreakdown: { pending: number, active: number, expired: number }
 *   growthRate: string
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30', 10) // days

    // Verify admin access
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Use service client for admin queries
    const serviceClient = await createServiceClient()

    // Get conversions for the period
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - period)

    const { data: conversions } = await serviceClient
      .from('referral_conversions')
      .select('created_at, status')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true })

    // Get milestone distribution
    const { data: milestoneData } = await serviceClient
      .from('business_referrals')
      .select('current_milestone')

    // Conversions by month
    const conversionsByMonth: { [key: string]: number } = {}
    conversions?.forEach((conv) => {
      const date = new Date(conv.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      conversionsByMonth[monthKey] = (conversionsByMonth[monthKey] || 0) + 1
    })

    const sortedMonths = Object.keys(conversionsByMonth).sort()
    const conversionsByMonthArray = sortedMonths.map((month) => ({
      month,
      conversions: conversionsByMonth[month],
    }))

    // Milestone distribution
    const milestoneDistribution: { [key: number]: number } = {}
    milestoneData?.forEach((data) => {
      const milestone = data.current_milestone || 0
      milestoneDistribution[milestone] = (milestoneDistribution[milestone] || 0) + 1
    })

    const milestoneDistributionArray = Object.keys(milestoneDistribution)
      .map((milestone) => ({
        milestone: parseInt(milestone),
        count: milestoneDistribution[parseInt(milestone)],
      }))
      .sort((a, b) => a.milestone - b.milestone)

    // Status breakdown
    const statusBreakdown = {
      pending: conversions?.filter((c) => c.status === 'pending').length || 0,
      active: conversions?.filter((c) => c.status === 'active').length || 0,
      expired: conversions?.filter((c) => c.status === 'expired').length || 0,
    }

    // Calculate growth rate (compare first half vs second half of period)
    const midPoint = new Date(periodStart)
    midPoint.setDate(midPoint.getDate() + period / 2)

    const firstHalf = conversions?.filter((c) => new Date(c.created_at) < midPoint).length || 0
    const secondHalf = conversions?.filter((c) => new Date(c.created_at) >= midPoint).length || 0

    const growthRate =
      firstHalf > 0
        ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1)
        : secondHalf > 0
          ? '100.0'
          : '0.0'

    return NextResponse.json({
      conversionsByMonth: conversionsByMonthArray,
      milestoneDistribution: milestoneDistributionArray,
      statusBreakdown,
      growthRate,
      period,
      totalConversionsInPeriod: conversions?.length || 0,
    })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching referral analytics')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
