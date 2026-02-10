import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalStatsCards } from '@/components/admin/referrals/global-stats-cards'
import { TopReferrersTable } from '@/components/admin/referrals/top-referrers-table'
import { ConversionsTimeline } from '@/components/admin/referrals/conversions-timeline'
import { ReferralAnalyticsCharts } from '@/components/admin/referrals/referral-analytics-charts'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Shield, AlertTriangle } from 'lucide-react'

/**
 * Admin Dashboard para Sistema de Referencias
 * Vista global del programa con métricas, rankings y analytics
 */
export default async function AdminReferralsPage() {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin (exists in admin_users table)
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Esta página es solo para super administradores. No tienes permisos para acceder.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors font-medium text-sm"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Fetch data directly using service client
  const serviceClient = await createServiceClient()

  try {
    // Get overview stats
    const { data: allReferrals } = await serviceClient
      .from('business_referrals')
      .select('total_referrals, successful_referrals, current_milestone')

    const { data: allConversions } = await serviceClient
      .from('referral_conversions')
      .select('status, created_at')

    const { data: claimedRewards } = await serviceClient
      .from('referral_rewards_claimed')
      .select('id')

    const totalReferrals =
      allReferrals?.reduce((sum, br) => sum + (br.total_referrals || 0), 0) || 0
    const successfulReferrals =
      allReferrals?.reduce((sum, br) => sum + (br.successful_referrals || 0), 0) || 0
    const activeConversions = allConversions?.filter((c) => c.status === 'active').length || 0
    const conversionRate =
      totalReferrals > 0 ? ((activeConversions / totalReferrals) * 100).toFixed(1) : '0.0'
    const avgReferralsPerUser =
      allReferrals && allReferrals.length > 0
        ? (totalReferrals / allReferrals.length).toFixed(1)
        : '0.0'
    const revenueImpact = activeConversions * 50

    // Get top referrers
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
        business:businesses!business_referrals_business_id_fkey(id, name, slug)
      `
      )
      .order('total_referrals', { ascending: false })
      .limit(10)

    const formattedReferrers =
      topReferrers?.map((referrer) => ({
        businessId: referrer.business_id,
        businessName: (referrer.business as any)?.name || 'Unknown',
        businessSlug: (referrer.business as any)?.slug || '',
        referralCode: referrer.referral_code,
        totalReferrals: referrer.total_referrals,
        successfulReferrals: referrer.successful_referrals,
        currentMilestone: referrer.current_milestone,
        conversionRate:
          referrer.total_referrals > 0
            ? ((referrer.successful_referrals / referrer.total_referrals) * 100).toFixed(1)
            : '0.0',
        pointsBalance: referrer.points_balance,
        createdAt: referrer.created_at,
      })) || []

    // Get recent conversions
    const { data: conversions } = await serviceClient
      .from('referral_conversions')
      .select(
        `
        id, referral_code, status, created_at, converted_at,
        referrer_business:businesses!referral_conversions_referrer_business_id_fkey(id, name, slug),
        referred_business:businesses!referral_conversions_referred_business_id_fkey(id, name, slug)
      `
      )
      .order('created_at', { ascending: false })
      .limit(20)

    const formattedConversions =
      conversions?.map((c) => ({
        id: c.id,
        referralCode: c.referral_code,
        status: c.status as 'pending' | 'active' | 'expired',
        createdAt: c.created_at,
        convertedAt: c.converted_at,
        referrerBusiness: {
          id: (c.referrer_business as any)?.id || '',
          name: (c.referrer_business as any)?.name || 'Unknown',
          slug: (c.referrer_business as any)?.slug || '',
        },
        referredBusiness: {
          id: (c.referred_business as any)?.id || '',
          name: (c.referred_business as any)?.name || 'Unknown',
          slug: (c.referred_business as any)?.slug || '',
        },
      })) || []

    // Get analytics
    const period = 90
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - period)

    const { data: periodConversions } = await serviceClient
      .from('referral_conversions')
      .select('created_at, status')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true })

    const { data: milestoneData } = await serviceClient
      .from('business_referrals')
      .select('current_milestone')

    // Process analytics data
    const conversionsByMonth: { [key: string]: number } = {}
    periodConversions?.forEach((conv) => {
      const date = new Date(conv.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      conversionsByMonth[monthKey] = (conversionsByMonth[monthKey] || 0) + 1
    })

    const milestoneDistribution: { [key: number]: number } = {}
    milestoneData?.forEach((data) => {
      const milestone = data.current_milestone || 0
      milestoneDistribution[milestone] = (milestoneDistribution[milestone] || 0) + 1
    })

    const statusBreakdown = {
      pending: periodConversions?.filter((c) => c.status === 'pending').length || 0,
      active: periodConversions?.filter((c) => c.status === 'active').length || 0,
      expired: periodConversions?.filter((c) => c.status === 'expired').length || 0,
    }

    const midPoint = new Date(periodStart)
    midPoint.setDate(midPoint.getDate() + period / 2)
    const firstHalf =
      periodConversions?.filter((c) => new Date(c.created_at) < midPoint).length || 0
    const secondHalf =
      periodConversions?.filter((c) => new Date(c.created_at) >= midPoint).length || 0
    const growthRate =
      firstHalf > 0
        ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1)
        : secondHalf > 0
          ? '100.0'
          : '0.0'

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-zinc-900 dark:text-white" />
                <h1 className="app-page-title">Admin - Sistema de Referencias</h1>
              </div>
              <p className="text-muted">
                Vista global del programa de referencias y métricas de rendimiento
              </p>
            </div>
          </div>

          {/* Global Stats */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Métricas Globales
            </h2>
            <GlobalStatsCards
              totalReferrals={totalReferrals}
              activeConversions={activeConversions}
              conversionRate={conversionRate}
              totalRewardsClaimed={claimedRewards?.length || 0}
              avgReferralsPerUser={avgReferralsPerUser}
              revenueImpact={revenueImpact}
            />
          </section>

          {/* Top Referrers — collapsible on mobile */}
          <CollapsibleSection title="Ranking de Referrers" badge={formattedReferrers.length}>
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 hidden lg:block">
                Ranking de Referrers
              </h2>
              <TopReferrersTable referrers={formattedReferrers} />
            </section>
          </CollapsibleSection>

          {/* Analytics Charts — collapsible on mobile */}
          <CollapsibleSection title="Analytics y Tendencias">
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 hidden lg:block">
                Analytics y Tendencias
              </h2>
              <ReferralAnalyticsCharts
                analytics={{
                  conversionsByMonth: Object.keys(conversionsByMonth)
                    .sort()
                    .map((month) => ({ month, conversions: conversionsByMonth[month] })),
                  milestoneDistribution: Object.keys(milestoneDistribution)
                    .map((m) => ({
                      milestone: parseInt(m),
                      count: milestoneDistribution[parseInt(m)],
                    }))
                    .sort((a, b) => a.milestone - b.milestone),
                  statusBreakdown,
                  growthRate,
                }}
              />
            </section>
          </CollapsibleSection>

          {/* Recent Conversions — collapsible on mobile */}
          <CollapsibleSection title="Conversiones Recientes" badge={formattedConversions.length}>
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 hidden lg:block">
                Conversiones Recientes
              </h2>
              <ConversionsTimeline conversions={formattedConversions} />
            </section>
          </CollapsibleSection>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Error al cargar datos
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Hubo un problema al cargar los datos del dashboard. Por favor intenta de nuevo.
          </p>
          <a
            href="/admin/referencias"
            className="inline-block px-6 py-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors font-medium text-sm"
          >
            Reintentar
          </a>
        </div>
      </div>
    )
  }
}
