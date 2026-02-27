'use client'

/**
 * EquipoTab — Team/Barbers section for Analytics
 *
 * Wrapper around BarbersLeaderboard for the Equipo tab.
 */

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import type { AnalyticsPeriod, BarberData } from '@/hooks/queries/useAnalytics'

const BarbersLeaderboard = dynamic(
  () =>
    import('@/components/analytics/barbers-leaderboard').then((mod) => ({
      default: mod.BarbersLeaderboard,
    })),
  {
    loading: () => (
      <Card className="p-6 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-[300px]" />
      </Card>
    ),
    ssr: false,
  }
)

interface EquipoTabProps {
  barbers: BarberData[]
  period: AnalyticsPeriod
}

export function EquipoTab({ barbers, period }: EquipoTabProps) {
  return (
    <ComponentErrorBoundary
      fallbackTitle="Error al cargar equipo"
      fallbackDescription="No pudimos cargar los datos del equipo."
      showReset
    >
      <BarbersLeaderboard data={barbers} period={period} />
    </ComponentErrorBoundary>
  )
}
