'use client'

import { Clock, TrendingDown, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FadeInUp } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

interface DurationInsightsProps {
  data: {
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
  } | null
  isLoading: boolean
}

export function DurationInsights({ data, isLoading }: DurationInsightsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-muted" />
          <h3 className="text-lg font-semibold">Duración</h3>
        </div>
        <p className="text-muted text-sm">No hay datos de duración disponibles.</p>
      </Card>
    )
  }

  const { smartDurationEnabled, overall, services } = data

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${Math.round(minutes)} min`
  }

  const formatRecovered = (minutes: number): string => {
    const abs = Math.abs(minutes)
    if (abs >= 60) {
      const hours = Math.floor(abs / 60)
      const mins = Math.round(abs % 60)
      const formatted = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      return minutes < 0 ? `-${formatted}` : formatted
    }
    return minutes < 0 ? `-${Math.round(abs)} min` : `${Math.round(minutes)} min`
  }

  return (
    <FadeInUp>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted" />
            <h3 className="text-lg font-semibold">Duración</h3>
          </div>
          <div
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              smartDurationEnabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            {smartDurationEnabled ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Recovered Time */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-muted">Tiempo recuperado</p>
            </div>
            <p className="text-2xl font-bold">{formatRecovered(overall.totalRecoveredMinutes)}</p>
            {overall.completedWithDuration > 0 && (
              <p className="text-xs text-subtle mt-1">
                ~{formatRecovered(overall.avgRecoveredPerAppointment)}/cita
              </p>
            )}
          </div>

          {/* Average Duration */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted" />
              <p className="text-xs text-muted">Duración promedio</p>
            </div>
            <p className="text-2xl font-bold">{formatDuration(overall.avgActualMinutes)}</p>
            <p className="text-xs text-subtle mt-1">
              vs {formatDuration(overall.avgScheduledMinutes)} programado
            </p>
          </div>

          {/* Analyzed Count */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-muted" />
              <p className="text-xs text-muted">Citas analizadas</p>
            </div>
            <p className="text-2xl font-bold">{overall.completedWithDuration}</p>
            <p className="text-xs text-subtle mt-1">con duración registrada</p>
          </div>
        </div>

        {/* Per-Service Breakdown */}
        {services.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Por servicio</h4>
            <div className="space-y-2">
              {services.map((service) => {
                const isRecovered = service.recoveredMinutes > 0
                const isOverrun = service.recoveredMinutes < 0

                return (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{service.serviceName}</p>
                      <p className="text-xs text-muted">
                        {service.completedCount} {service.completedCount === 1 ? 'cita' : 'citas'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round(service.avgActual)} / {Math.round(service.avgScheduled)} min
                      </p>
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isRecovered && 'text-emerald-600 dark:text-emerald-400',
                          isOverrun && 'text-red-600 dark:text-red-400',
                          !isRecovered && !isOverrun && 'text-muted'
                        )}
                      >
                        {isRecovered && '+'}
                        {formatRecovered(service.recoveredMinutes)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </FadeInUp>
  )
}
