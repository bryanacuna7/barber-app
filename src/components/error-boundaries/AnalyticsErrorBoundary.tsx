'use client'

import React from 'react'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Minus } from 'lucide-react'

interface AnalyticsErrorBoundaryProps {
  children: React.ReactNode
  stats?: {
    totalRevenue?: number
    totalAppointments?: number
    totalClients?: number
    averageRating?: number
    revenueChange?: number
    appointmentsChange?: number
    clientsChange?: number
  }
  onReset?: () => void
}

/**
 * Analytics Error Boundary with Basic Stats Table Fallback
 *
 * When chart rendering fails (heavy Recharts components),
 * falls back to simple stat cards without complex visualizations.
 *
 * Reason: Chart components can fail due to data issues or Recharts errors
 */
function AnalyticsFallback({
  stats,
  onRetry,
}: {
  stats?: AnalyticsErrorBoundaryProps['stats']
  onRetry?: () => void
}) {
  const metrics = [
    {
      label: 'Ingresos Totales',
      value: stats?.totalRevenue
        ? new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(
            stats.totalRevenue
          )
        : '₡0',
      change: stats?.revenueChange,
      icon: TrendingUp,
    },
    {
      label: 'Citas Completadas',
      value: stats?.totalAppointments?.toString() || '0',
      change: stats?.appointmentsChange,
      icon: BarChart3,
    },
    {
      label: 'Clientes Activos',
      value: stats?.totalClients?.toString() || '0',
      change: stats?.clientsChange,
      icon: TrendingUp,
    },
    {
      label: 'Calificación Promedio',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5.0` : 'N/A',
      change: undefined,
      icon: TrendingUp,
    },
  ]

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-gray-600 dark:text-gray-400'
    if (change > 0) return 'text-green-600 dark:text-green-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estadísticas Básicas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los gráficos detallados no están disponibles temporalmente
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar gráficos
            </Button>
          )}
        </div>

        {/* Simple Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <div
                key={metric.label}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>

                  {metric.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-sm ${getTrendColor(metric.change)}`}
                    >
                      {getTrendIcon(metric.change)}
                      <span>{Math.abs(metric.change)}%</span>
                      <span className="text-gray-500">vs mes anterior</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Message */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Nota:</strong> Los gráficos de tendencias y análisis detallados se mostrarán
            cuando el sistema esté disponible. Las estadísticas básicas arriba están actualizadas.
          </p>
        </div>
      </div>
    </Card>
  )
}

export function AnalyticsErrorBoundary({ children, stats, onReset }: AnalyticsErrorBoundaryProps) {
  return (
    <ComponentErrorBoundary
      fallback={<AnalyticsFallback stats={stats} onRetry={onReset} />}
      fallbackTitle="Error en analíticas"
      fallbackDescription="No se pudieron cargar los gráficos de analíticas"
      showReset={false} // Custom reset button in fallback
      onReset={onReset}
      onError={(error) => {
        console.error('[AnalyticsErrorBoundary] Analytics rendering failed:', error)
      }}
    >
      {children}
    </ComponentErrorBoundary>
  )
}

export default AnalyticsErrorBoundary
