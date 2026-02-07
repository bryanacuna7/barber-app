'use client'

/**
 * Analytics Dashboard Page - Modernized (v2)
 *
 * Integrated with:
 * - React Query: useBusinessAnalytics hook
 * - Real-time: WebSocket updates via useRealtimeAppointments
 * - Error Boundaries: 3-level protection (page, stats, charts)
 * - Feature Flags: Instant rollback via NEXT_PUBLIC_FF_NEW_ANALYTICS
 *
 * Created: Session 117 - Phase 0 Week 5-6
 */

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { AnalyticsErrorBoundary } from '@/components/error-boundaries/AnalyticsErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import {
  useBusinessAnalytics,
  type AnalyticsPeriod,
  type OverviewMetrics,
} from '@/hooks/queries/useAnalytics'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Lazy load chart components (they're heavy with Recharts)
const RevenueChart = dynamic(
  () =>
    import('@/components/analytics/revenue-chart').then((mod) => ({ default: mod.RevenueChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

const ServicesChart = dynamic(
  () =>
    import('@/components/analytics/services-chart').then((mod) => ({ default: mod.ServicesChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

const BarbersLeaderboard = dynamic(
  () =>
    import('@/components/analytics/barbers-leaderboard').then((mod) => ({
      default: mod.BarbersLeaderboard,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

export default function AnaliticasPageV2() {
  return (
    <ComponentErrorBoundary
      fallbackTitle="Error al cargar Analíticas"
      fallbackDescription="No pudimos cargar la página de analíticas. Por favor, recarga la página."
    >
      <Suspense fallback={<AnalyticsPageSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </ComponentErrorBoundary>
  )
}

function AnalyticsContent() {
  const router = useRouter()
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const [activeChartTab, setActiveChartTab] = useState('revenue')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Authenticate and get business_id on mount
  useEffect(() => {
    async function authenticateUser() {
      try {
        const supabase = createClient()

        // 1. Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          setAuthError('No estás autenticado')
          router.push('/login')
          return
        }

        // 2. Get business from owner relationship
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (businessError || !business) {
          // Try to get business from barber relationship
          const { data: barber, error: barberError } = await supabase
            .from('barbers')
            .select('business_id')
            .eq('user_id', user.id)
            .single()

          if (barberError || !barber) {
            setAuthError('No se encontró tu negocio')
            setAuthLoading(false)
            return
          }

          setBusinessId(barber.business_id)
        } else {
          setBusinessId(business.id)
        }
      } catch (error) {
        console.error('Error authenticating user:', error)
        setAuthError('Error de autenticación')
      } finally {
        setAuthLoading(false)
      }
    }

    authenticateUser()
  }, [router])

  // React Query: Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch,
  } = useBusinessAnalytics(period)

  // Real-time: Subscribe to appointment changes
  useRealtimeAppointments({
    businessId: businessId || '',
    enabled: !!businessId,
  })

  // Loading states
  if (authLoading) {
    return <AnalyticsPageSkeleton />
  }

  if (authError || !businessId) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          {authError || 'Necesitas estar autenticado para ver las analíticas'}
        </p>
      </div>
    )
  }

  if (analyticsLoading) {
    return <AnalyticsPageSkeleton />
  }

  if (analyticsError) {
    return (
      <QueryError error={analyticsError} onRetry={refetch} title="Error al cargar analíticas" />
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">No hay datos de analíticas disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Analíticas
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1 hidden sm:block">
              Visualiza el rendimiento de tu barbería
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 sm:gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <Button
              variant={period === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('week')}
              className="text-[13px] sm:text-sm min-h-[44px]"
            >
              Semana
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('month')}
              className="text-[13px] sm:text-sm min-h-[44px]"
            >
              Mes
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('year')}
              className="text-[13px] sm:text-sm min-h-[44px]"
            >
              Año
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* KPI Cards - Wrapped in Error Boundary */}
      <ComponentErrorBoundary
        fallbackTitle="Error al cargar estadísticas"
        fallbackDescription="No pudimos cargar las métricas KPI."
        showReset
      >
        {/* Mobile: Compact 2x2 Grid */}
        <FadeInUp className="md:hidden">
          <CompactKPISummary overview={analytics.overview} />
        </FadeInUp>

        {/* Desktop: Full KPI Cards */}
        <StaggeredList className="hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggeredItem index={0}>
              <div className="h-full">
                <KPICard
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Ingresos Totales"
                  value={`₡${analytics.overview.totalRevenue.toLocaleString()}`}
                  color="blue"
                />
              </div>
            </StaggeredItem>
            <StaggeredItem index={1}>
              <div className="h-full">
                <KPICard
                  icon={<Calendar className="w-5 h-5" />}
                  label="Citas Completadas"
                  value={analytics.overview.completedAppointments.toString()}
                  subtitle={`${analytics.overview.totalAppointments} totales`}
                  color="green"
                />
              </div>
            </StaggeredItem>
            <StaggeredItem index={2}>
              <div className="h-full">
                <KPICard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Promedio por Cita"
                  value={`₡${analytics.overview.avgPerAppointment.toLocaleString()}`}
                  color="amber"
                />
              </div>
            </StaggeredItem>
            <StaggeredItem index={3}>
              <div className="h-full">
                <KPICard
                  icon={<Users className="w-5 h-5" />}
                  label="Tasa de Completación"
                  value={`${analytics.overview.completionRate}%`}
                  color="purple"
                />
              </div>
            </StaggeredItem>
          </div>
        </StaggeredList>
      </ComponentErrorBoundary>

      {/* Charts - Wrapped in Error Boundary */}
      <AnalyticsErrorBoundary>
        {/* Mobile: Tabbed Charts */}
        <div className="md:hidden">
          <Tabs value={activeChartTab} onValueChange={setActiveChartTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="revenue">Ingresos</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="barbers">Barberos</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <RevenueChart data={analytics.revenueSeries} period={period} height={200} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesChart data={analytics.services} period={period} height={200} />
            </TabsContent>

            <TabsContent value="barbers">
              <BarbersLeaderboard data={analytics.barbers} period={period} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Original Layout */}
        <div className="hidden md:block space-y-6">
          <FadeInUp delay={0.2}>
            <RevenueChart data={analytics.revenueSeries} period={period} height={300} />
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeInUp delay={0.3}>
              <ServicesChart data={analytics.services} period={period} height={300} />
            </FadeInUp>
            <FadeInUp delay={0.4}>
              <BarbersLeaderboard data={analytics.barbers} period={period} />
            </FadeInUp>
          </div>
        </div>
      </AnalyticsErrorBoundary>
    </div>
  )
}

// Compact KPI Summary for Mobile (2x2 grid)
function CompactKPISummary({ overview }: { overview: OverviewMetrics }) {
  const kpis = [
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Ingresos',
      value: `₡${Math.round(overview.totalRevenue / 1000)}k`,
      fullValue: `₡${overview.totalRevenue.toLocaleString()}`,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Citas',
      value: overview.completedAppointments.toString(),
      fullValue: `${overview.completedAppointments} / ${overview.totalAppointments}`,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Promedio',
      value: `₡${Math.round(overview.avgPerAppointment / 1000)}k`,
      fullValue: `₡${overview.avgPerAppointment.toLocaleString()}`,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Tasa',
      value: `${overview.completionRate}%`,
      fullValue: `${overview.completionRate}% completadas`,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className={`p-2 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none">
                  {kpi.label}
                </p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1 leading-none">
                  {kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// KPI Card Component
function KPICard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  color: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full flex items-center">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 min-h-[80px] flex flex-col justify-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Chart Loading Skeleton
function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
      </div>
    </Card>
  )
}

// Full Page Loading Skeleton
function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mt-2" />
        </div>
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <ChartSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}
