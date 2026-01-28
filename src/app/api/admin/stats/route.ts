import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { getSubscriptionStats } from '@/lib/subscription'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verify admin
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for full access
    const serviceClient = await createServiceClient()

    // Get total businesses count
    const { count: totalBusinesses } = await serviceClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })

    // Get active businesses count
    const { count: activeBusinesses } = await serviceClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get inactive businesses count
    const inactiveBusinesses = (totalBusinesses || 0) - (activeBusinesses || 0)

    // Get businesses registered this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: newThisMonth } = await serviceClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Get businesses registered this week
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { count: newThisWeek } = await serviceClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString())

    // Get recent businesses (last 5)
    const { data: recentBusinesses } = await serviceClient
      .from('businesses')
      .select('id, name, slug, created_at, is_active')
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate growth rate (compare this month to last month)
    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    const { count: lastMonthCount } = await serviceClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const growthRate = lastMonthCount && lastMonthCount > 0
      ? Math.round(((newThisMonth || 0) - lastMonthCount) / lastMonthCount * 100)
      : newThisMonth && newThisMonth > 0 ? 100 : 0

    // Get real subscription stats
    const subscriptionStats = await getSubscriptionStats(serviceClient)

    // Get pending payments count
    const { count: pendingPayments } = await serviceClient
      .from('payment_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return NextResponse.json({
      overview: {
        totalBusinesses: totalBusinesses || 0,
        activeBusinesses: activeBusinesses || 0,
        inactiveBusinesses,
        newThisMonth: newThisMonth || 0,
        newThisWeek: newThisWeek || 0,
        growthRate,
      },
      subscription: {
        mrr: subscriptionStats.mrr,
        trialsActive: subscriptionStats.trials_active,
        activeSubscriptions: subscriptionStats.active_subscriptions,
        conversionRate: subscriptionStats.conversion_rate,
      },
      pendingPayments: pendingPayments || 0,
      recentBusinesses: recentBusinesses || [],
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
