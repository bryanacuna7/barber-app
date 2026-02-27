'use client'

/**
 * Analytics Dashboard Page - Modernized (v2)
 *
 * 3-tab structure: Negocio | Clientes | Equipo
 * Designed as D-ready (tabs → sub-routes evolution).
 *
 * Integrated with:
 * - React Query: useBusinessAnalytics hook
 * - Real-time: WebSocket updates via useRealtimeAppointments
 * - Error Boundaries: 3-level protection (page, stats, charts)
 *
 * Created: Session 117 - Phase 0 Week 5-6
 * Updated: Analytics refactor — 3-tab system
 */

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ChevronDown,
  Building2,
  UserCheck,
} from 'lucide-react'
import { cn, formatCurrencyCompactMillions } from '@/lib/utils'
import { usePreference } from '@/lib/preferences'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import {
  useBusinessAnalytics,
  useDurationAnalytics,
  type AnalyticsPeriod,
  type OverviewMetrics,
} from '@/hooks/queries/useAnalytics'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { useBusiness } from '@/contexts/business-context'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

// Lazy load tab components
const NegocioTab = dynamic(
  () => import('@/components/analytics/negocio-tab').then((mod) => ({ default: mod.NegocioTab })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  }
)

const ClientesTab = dynamic(
  () => import('@/components/analytics/clientes-tab').then((mod) => ({ default: mod.ClientesTab })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  }
)

const EquipoTab = dynamic(
  () => import('@/components/analytics/equipo-tab').then((mod) => ({ default: mod.EquipoTab })),
  {
    loading: () => <TabSkeleton />,
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

type SectionTab = 'negocio' | 'clientes' | 'equipo'

function AnalyticsContent() {
  const { businessId } = useBusiness()
  const [period, setPeriod] = usePreference<AnalyticsPeriod>('analytics_period', 'month', [
    'week',
    'month',
    'year',
  ])
  const [activeSection, setActiveSection] = usePreference<SectionTab>(
    'analytics_section',
    'negocio',
    ['negocio', 'clientes', 'equipo']
  )
  const [statsExpanded, setStatsExpanded] = useState(false)

  // React Query: Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch,
  } = useBusinessAnalytics(period)

  // Duration analytics (separate query, loads independently)
  const { data: durationData, isLoading: durationLoading } = useDurationAnalytics(period)

  // Real-time: Subscribe to appointment changes
  useRealtimeAppointments({
    businessId,
    enabled: !!businessId,
  })

  if (!businessId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No se encontró el contexto del negocio para ver analíticas.</p>
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
        <p className="text-muted">No hay datos de analíticas disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="app-page-title brand-gradient-text">Analíticas</h1>
            <p className="app-page-subtitle mt-1 lg:hidden">
              Visualiza el rendimiento de tu barbería
            </p>
          </div>

          {/* Period Selector */}
          <div className="relative overflow-hidden flex w-full sm:w-auto items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-3 top-0 hidden h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent lg:block" />
            {[
              { value: 'week' as AnalyticsPeriod, label: 'Semana' },
              { value: 'month' as AnalyticsPeriod, label: 'Mes' },
              { value: 'year' as AnalyticsPeriod, label: 'Año' },
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
                  className={`flex flex-1 sm:flex-none min-h-[44px] items-center justify-center rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap border transition-colors ${
                    isActive
                      ? 'brand-tab-active'
                      : 'text-muted border-zinc-200/70 dark:border-zinc-800/80 bg-white/55 dark:bg-white/[0.03] hover:bg-zinc-100/80 dark:hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </FadeInUp>

      {/* Business KPI Cards — always visible */}
      <ComponentErrorBoundary
        fallbackTitle="Error al cargar estadísticas"
        fallbackDescription="No pudimos cargar las métricas KPI."
        showReset
      >
        {/* Mobile: Collapsible KPI Stats */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between w-full px-1 py-2"
            aria-expanded={statsExpanded}
          >
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Métricas Resumen
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted transition-transform duration-200',
                statsExpanded && 'rotate-180'
              )}
            />
          </button>
          <div className={cn(statsExpanded ? '' : 'hidden')}>
            <FadeInUp>
              <CompactKPISummary overview={analytics.overview} />
            </FadeInUp>
          </div>
        </div>

        {/* Desktop: Full KPI Cards */}
        <StaggeredList className="hidden lg:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggeredItem key={0}>
              <div className="h-full">
                <KPICard
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Ingresos Totales"
                  value={`₡${analytics.overview.totalRevenue.toLocaleString()}`}
                  color="blue"
                />
              </div>
            </StaggeredItem>
            <StaggeredItem key={1}>
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
            <StaggeredItem key={2}>
              <div className="h-full">
                <KPICard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Promedio por Cita"
                  value={`₡${analytics.overview.avgPerAppointment.toLocaleString()}`}
                  color="amber"
                />
              </div>
            </StaggeredItem>
            <StaggeredItem key={3}>
              <div className="h-full">
                <KPICard
                  icon={<Users className="w-5 h-5" />}
                  label="Tasa de Completación"
                  value={`${analytics.overview.completionRate}%`}
                  subtitle={`${analytics.overview.completedAppointments} de ${analytics.overview.totalAppointments}`}
                  color="purple"
                />
              </div>
            </StaggeredItem>
          </div>
        </StaggeredList>
      </ComponentErrorBoundary>

      {/* Section Tabs: Negocio | Clientes | Equipo */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SectionTab)}>
        <TabsList className="flex w-full items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <TabsTrigger
            value="negocio"
            icon={<Building2 className="h-4 w-4" />}
            className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
          >
            Negocio
          </TabsTrigger>
          <TabsTrigger
            value="clientes"
            icon={<Users className="h-4 w-4" />}
            className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
          >
            Clientes
          </TabsTrigger>
          <TabsTrigger
            value="equipo"
            icon={<UserCheck className="h-4 w-4" />}
            className="min-h-[44px] shrink-0 rounded-xl px-3 text-sm"
          >
            Equipo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="negocio">
          <NegocioTab
            analytics={analytics}
            durationData={durationData}
            durationLoading={durationLoading}
            period={period}
          />
        </TabsContent>

        <TabsContent value="clientes">
          <ClientesTab />
        </TabsContent>

        <TabsContent value="equipo">
          <EquipoTab barbers={analytics.barbers} period={period} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Compact KPI Summary for Mobile (2x2 grid)
function CompactKPISummary({ overview }: { overview: OverviewMetrics }) {
  const formatCompactCurrency = (amount: number) => {
    return formatCurrencyCompactMillions(amount)
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
            <p className="text-[11px] text-muted leading-none text-right truncate">{kpi.label}</p>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight tabular-nums text-zinc-900 dark:text-white leading-none">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-muted truncate">{kpi.fullValue}</p>
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
      <CardContent className="p-4 lg:p-5 h-full flex items-center">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-muted mb-1.5">{label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Tab Loading Skeleton
function TabSkeleton() {
  return (
    <div className="space-y-6 mt-4">
      <Card className="p-6 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-[300px]" />
      </Card>
    </div>
  )
}

// Full Page Loading Skeleton
function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Tabs Skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Charts Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-[300px]" />
      </Card>
    </div>
  )
}
