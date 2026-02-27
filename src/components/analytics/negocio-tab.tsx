'use client'

/**
 * NegocioTab — Business charts section for Analytics
 *
 * Extracted from analiticas/page-v2.tsx charts section.
 * Mobile: tabs Ingresos | Servicios (key: analytics_negocio_chart)
 * Desktop: RevenueChart + ServicesChart stacked
 * DurationInsights always visible below charts.
 */

import dynamic from 'next/dynamic'
import { TrendingUp, Scissors } from 'lucide-react'
import { usePreference } from '@/lib/preferences'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FadeInUp } from '@/components/ui/motion'
import { AnalyticsErrorBoundary } from '@/components/error-boundaries/AnalyticsErrorBoundary'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsPeriod, BusinessAnalytics } from '@/hooks/queries/useAnalytics'

// Lazy load chart components (heavy with Recharts)
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

const DurationInsights = dynamic(
  () =>
    import('@/components/analytics/duration-insights').then((mod) => ({
      default: mod.DurationInsights,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

interface DurationData {
  smartDurationEnabled: boolean
  overall: {
    completedWithDuration: number
    avgScheduledMinutes: number
    avgActualMinutes: number
    totalRecoveredMinutes: number
    avgRecoveredPerAppointment: number
  }
  services: Array<{
    serviceId: string
    serviceName: string
    completedCount: number
    avgScheduled: number
    avgActual: number
    recoveredMinutes: number
  }>
}

interface NegocioTabProps {
  analytics: BusinessAnalytics
  durationData: DurationData | null | undefined
  durationLoading: boolean
  period: AnalyticsPeriod
}

function ChartSkeleton() {
  return (
    <Card className="p-6 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="h-[300px]" />
    </Card>
  )
}

export function NegocioTab({ analytics, durationData, durationLoading, period }: NegocioTabProps) {
  const [chartTab, setChartTab] = usePreference<string>('analytics_negocio_chart', 'revenue', [
    'revenue',
    'services',
  ])

  return (
    <div className="space-y-6">
      <AnalyticsErrorBoundary>
        {/* Mobile: Tabbed Charts (revenue | services) */}
        <div className="md:hidden">
          <Tabs value={chartTab} onValueChange={setChartTab}>
            <TabsList className="mb-4 flex w-full items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
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
            </TabsList>

            <TabsContent value="revenue">
              <RevenueChart data={analytics.revenueSeries} period={period} height={200} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesChart data={analytics.services} period={period} height={200} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Stacked Charts */}
        <div className="hidden md:block space-y-6">
          <FadeInUp delay={0.2}>
            <RevenueChart data={analytics.revenueSeries} period={period} height={300} />
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <ServicesChart data={analytics.services} period={period} height={300} />
          </FadeInUp>
        </div>
      </AnalyticsErrorBoundary>

      {/* Duration Insights */}
      <ComponentErrorBoundary
        fallbackTitle="Error al cargar duración"
        fallbackDescription="No pudimos cargar los datos de duración."
        showReset
      >
        <DurationInsights data={durationData ?? null} isLoading={durationLoading} />
      </ComponentErrorBoundary>
    </div>
  )
}
