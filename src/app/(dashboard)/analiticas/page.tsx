'use client'

/**
 * Analytics Dashboard Page
 * Shows comprehensive analytics with charts and metrics
 */

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { ServicesChart } from '@/components/analytics/services-chart'
import { BarbersLeaderboard } from '@/components/analytics/barbers-leaderboard'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'

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
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Analíticas</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Visualiza el rendimiento de tu barbería
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <Button
              variant={period === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              Semana
            </Button>
            <Button
              variant={period === 'month' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Mes
            </Button>
            <Button
              variant={period === 'year' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Año
            </Button>
          </div>
        </div>
      </FadeInUp>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Cargando analíticas...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {overview && (
            <StaggeredList>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          )}

          {/* Revenue Chart */}
          <FadeInUp delay={0.2}>
            <RevenueChart data={revenueSeries} period={period} />
          </FadeInUp>

          {/* Services & Barbers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeInUp delay={0.3}>
              <ServicesChart data={services} period={period} />
            </FadeInUp>
            <FadeInUp delay={0.4}>
              <BarbersLeaderboard data={barbers} period={period} />
            </FadeInUp>
          </div>
        </>
      )}
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
