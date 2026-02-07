'use client'

/**
 * Analytics Dashboard Page
 * Shows comprehensive analytics with charts and metrics
 */

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Calendar, DollarSign, Users, Scissors } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

// Lazy load chart components (they're heavy with Recharts)
const RevenueChart = dynamic(
  () =>
    import('@/components/analytics/revenue-chart').then((mod) => ({ default: mod.RevenueChart })),
  {
    loading: () => (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
        </div>
      </Card>
    ),
    ssr: false,
  }
)

const ServicesChart = dynamic(
  () =>
    import('@/components/analytics/services-chart').then((mod) => ({ default: mod.ServicesChart })),
  {
    loading: () => (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
        </div>
      </Card>
    ),
    ssr: false,
  }
)

const BarbersLeaderboard = dynamic(
  () =>
    import('@/components/analytics/barbers-leaderboard').then((mod) => ({
      default: mod.BarbersLeaderboard,
    })),
  {
    loading: () => (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
        </div>
      </Card>
    ),
    ssr: false,
  }
)

type Period = 'week' | 'month' | 'year'

interface OverviewMetrics {
  totalAppointments: number
  completedAppointments: number
  totalRevenue: number
  avgPerAppointment: number
  completionRate: number
}

export default function AnaliticasPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)
  const [activeChartTab, setActiveChartTab] = useState('revenue')

  // Data states
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [revenueSeries, setRevenueSeries] = useState<Array<{ date: string; value: number }>>([])
  const [services, setServices] = useState<Array<{ name: string; value: number }>>([])
  const [barbers, setBarbers] = useState<Array<{ name: string; value: number; avatar?: string }>>(
    []
  )

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    setLoading(true)
    try {
      // Load all analytics in parallel
      const [overviewRes, revenueRes, servicesRes, barbersRes] = await Promise.all([
        fetch(`/api/analytics/overview?period=${period}`),
        fetch(`/api/analytics/revenue-series?period=${period}`),
        fetch(`/api/analytics/services?period=${period}`),
        fetch(`/api/analytics/barbers?period=${period}`),
      ])

      if (!overviewRes.ok || !revenueRes.ok || !servicesRes.ok || !barbersRes.ok) {
        throw new Error('Failed to load analytics')
      }

      const [overviewData, revenueData, servicesData, barbersData] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        servicesRes.json(),
        barbersRes.json(),
      ])

      setOverview(overviewData.metrics)
      setRevenueSeries(revenueData.series)
      setServices(servicesData.services)
      setBarbers(barbersData.barbers)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 dark:from-violet-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              Analíticas
            </h1>
            <p className="text-sm sm:text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
              Visualiza el rendimiento de tu barbería
            </p>
          </div>

          {/* Period Selector */}
          <div className="relative overflow-hidden flex items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-violet-200/60 dark:border-violet-400/20 bg-gradient-to-br from-violet-50/80 via-white/75 to-blue-50/80 dark:from-violet-950/30 dark:via-zinc-950/70 dark:to-blue-950/30 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            {[
              { value: 'week' as Period, label: 'Semana', meta: '7d' },
              { value: 'month' as Period, label: 'Mes', meta: '30d' },
              { value: 'year' as Period, label: 'Año', meta: '12m' },
            ].map((option) => {
              const isActive = period === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPeriod(option.value)
                    if (isMobileDevice()) haptics.selection()
                  }}
                  className={`min-h-[48px] min-w-[88px] rounded-xl px-3 py-1.5 text-left border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white border-violet-400/50 shadow-[0_10px_24px_rgba(79,70,229,0.35)]'
                      : 'text-zinc-700 dark:text-zinc-300 border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex flex-col leading-none">
                    <span className="text-[13px] sm:text-sm font-semibold">{option.label}</span>
                    <span
                      className={`mt-1 text-[10px] ${
                        isActive ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {option.meta}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </FadeInUp>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Cargando analíticas...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards - Compact on mobile, expanded on desktop */}
          {overview && (
            <>
              {/* Mobile: Compact 2x2 Grid */}
              <FadeInUp className="md:hidden">
                <CompactKPISummary overview={overview} />
              </FadeInUp>

              {/* Desktop: Full KPI Cards */}
              <StaggeredList className="hidden md:block">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StaggeredItem index={0}>
                    <div className="h-full">
                      <KPICard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Ingresos Totales"
                        value={`₡${overview.totalRevenue.toLocaleString()}`}
                        color="blue"
                      />
                    </div>
                  </StaggeredItem>
                  <StaggeredItem index={1}>
                    <div className="h-full">
                      <KPICard
                        icon={<Calendar className="w-5 h-5" />}
                        label="Citas Completadas"
                        value={overview.completedAppointments.toString()}
                        subtitle={`${overview.totalAppointments} totales`}
                        color="green"
                      />
                    </div>
                  </StaggeredItem>
                  <StaggeredItem index={2}>
                    <div className="h-full">
                      <KPICard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Promedio por Cita"
                        value={`₡${overview.avgPerAppointment.toLocaleString()}`}
                        color="amber"
                      />
                    </div>
                  </StaggeredItem>
                  <StaggeredItem index={3}>
                    <div className="h-full">
                      <KPICard
                        icon={<Users className="w-5 h-5" />}
                        label="Tasa de Completación"
                        value={`${overview.completionRate}%`}
                        color="purple"
                      />
                    </div>
                  </StaggeredItem>
                </div>
              </StaggeredList>
            </>
          )}

          {/* Charts - Tabs on mobile, Grid on desktop */}

          {/* Mobile: Tabbed Charts */}
          <div className="md:hidden">
            <Tabs value={activeChartTab} onValueChange={setActiveChartTab}>
              <TabsList className="mb-4 flex w-full items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <TabsTrigger
                  value="revenue"
                  icon={<TrendingUp className="h-4 w-4" />}
                  className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
                >
                  Ingresos
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  icon={<Scissors className="h-4 w-4" />}
                  className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
                >
                  Servicios
                </TabsTrigger>
                <TabsTrigger
                  value="barbers"
                  icon={<Users className="h-4 w-4" />}
                  className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
                >
                  Barberos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="revenue">
                <RevenueChart data={revenueSeries} period={period} />
              </TabsContent>

              <TabsContent value="services">
                <ServicesChart data={services} period={period} />
              </TabsContent>

              <TabsContent value="barbers">
                <BarbersLeaderboard data={barbers} period={period} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop: Original Layout */}
          <div className="hidden md:block space-y-6">
            <FadeInUp delay={0.2}>
              <RevenueChart data={revenueSeries} period={period} />
            </FadeInUp>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FadeInUp delay={0.3}>
                <ServicesChart data={services} period={period} />
              </FadeInUp>
              <FadeInUp delay={0.4}>
                <BarbersLeaderboard data={barbers} period={period} />
              </FadeInUp>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact KPI Summary for Mobile (2x2 grid)
function CompactKPISummary({ overview }: { overview: OverviewMetrics }) {
  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000) return `₡${Math.round(amount / 1000)}k`
    return `₡${amount.toLocaleString()}`
  }

  const kpis = [
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Ingresos',
      value: formatCompactCurrency(overview.totalRevenue),
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
      value: formatCompactCurrency(overview.avgPerAppointment),
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
    <div className="grid grid-cols-2 gap-3">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 min-h-[108px] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className={`p-2.5 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none text-right truncate">
              {kpi.label}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight tabular-nums text-zinc-900 dark:text-white leading-none">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {kpi.fullValue}
            </p>
          </div>
        </div>
      ))}
    </div>
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
    <Card className="h-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
