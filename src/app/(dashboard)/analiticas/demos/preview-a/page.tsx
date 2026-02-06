'use client'

/**
 * Demo A: Dashboard Intelligence (HubSpot-style)
 * Score Target: 9.0/10
 *
 * Features:
 * - Hero KPI card (2x size) with sparkline
 * - Secondary KPIs with gradient backgrounds
 * - AI-powered insights section
 * - Comparison badges (% vs previous period)
 * - Alert cards for anomalies
 * - Bento grid layout
 * - Interactive hover states
 */

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  mockOverview,
  mockRevenueSeries,
  mockServices,
  mockBarbers,
  mockAlerts,
  formatCurrency,
  type Alert,
} from '../mock-data'

type Period = 'week' | 'month' | 'year'

// ========== Helper Components (defined before main component for react-hooks/static-components rule) ==========

// Comparison Badge Component
function ComparisonBadge({ value, className = '' }: { value: number; className?: string }) {
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>
        {positive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

// Sparkline Component
function Sparkline({
  data,
  maxValue,
  color = 'violet',
}: {
  data: { date: string; revenue: number }[]
  maxValue: number
  color?: string
}) {
  const width = 200
  const height = 40
  const padding = 4

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding
      const y = height - (d.revenue / maxValue) * (height - padding * 2) - padding
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Secondary KPI Card
function KPICardSecondary({
  icon,
  label,
  value,
  subtitle,
  change,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle: string
  change: number | null
  gradient: string
}) {
  return (
    <Card
      className={`p-6 bg-gradient-to-br ${gradient} border-0 shadow-xl text-white relative overflow-hidden group hover:scale-[1.02] transition-transform`}
    >
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white rounded-full blur-[60px]" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">{icon}</div>
          {change !== null && (
            <ComparisonBadge
              value={change}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
            />
          )}
        </div>

        <p className="text-white/80 text-sm mb-2">{label}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-white/70 text-sm">{subtitle}</p>
      </div>
    </Card>
  )
}

// Alert Banner
function AlertBanner({ alert }: { alert: Alert }) {
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success:
      'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100',
    warning:
      'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100',
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100',
  }

  const Icon = icons[alert.type]

  return (
    <div className={`p-4 rounded-2xl border ${colors[alert.type]} flex items-start gap-3`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{alert.title}</p>
        <p className="text-sm opacity-80 mt-1">{alert.description}</p>
      </div>
    </div>
  )
}

// Insight Card
function InsightCard({
  title,
  description,
  type,
}: {
  title: string
  description: string
  type: 'success' | 'warning' | 'info'
}) {
  const colors = {
    success:
      'border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
    warning:
      'border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    info: 'border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
  }

  return (
    <Card className={`p-5 border-2 ${colors[type]} hover:scale-[1.02] transition-transform`}>
      <h4 className="font-bold text-zinc-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
    </Card>
  )
}

// Service Row
function ServiceRow({
  service,
  rank,
}: {
  service: { id: string; name: string; count: number; revenue: number; completionRate: number }
  rank: number
}) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="w-8 text-center text-lg font-bold text-zinc-400">
        {rank <= 3 ? medals[rank - 1] : rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 dark:text-white truncate">{service.name}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{service.count} reservas</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-zinc-900 dark:text-white">{formatCurrency(service.revenue)}</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {service.completionRate}% completado
        </p>
      </div>
    </div>
  )
}

// Barber Row
function BarberRow({
  barber,
  rank,
}: {
  barber: {
    id: string
    name: string
    avatar?: string
    appointments: number
    revenue: number
    avgRating: number
  }
  rank: number
}) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="w-8 text-center text-lg font-bold text-zinc-400">
        {rank <= 3 ? medals[rank - 1] : rank}
      </div>
      {barber.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={barber.avatar} alt={barber.name} className="w-10 h-10 rounded-full" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 dark:text-white truncate">{barber.name}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{barber.appointments} citas</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-zinc-900 dark:text-white">{formatCurrency(barber.revenue)}</p>
        <p className="text-xs text-amber-600 dark:text-amber-400">⭐ {barber.avgRating}</p>
      </div>
    </div>
  )
}

// ========== Main Component ==========

export default function PreviewAPage() {
  const [period, setPeriod] = useState<Period>('month')

  // Calculate sparkline data (last 7 days)
  const sparklineData = mockRevenueSeries.slice(-7)
  const maxRevenue = Math.max(...sparklineData.map((d) => d.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white bg-clip-text text-transparent">
              Dashboard Intelligence
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              HubSpot-style analytics with AI insights
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-lg shadow-zinc-900/5 dark:shadow-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
            {(['week', 'month', 'year'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className={
                  period === p
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                    : ''
                }
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
              </Button>
            ))}
          </div>
        </div>

        {/* Alert Banner (if any high impact alerts) */}
        {mockAlerts
          .filter((a) => a.impact === 'high')
          .map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HERO: Revenue Card (2x size on desktop) */}
          <div className="md:col-span-2 md:row-span-2">
            <Card className="h-full bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 border-0 shadow-2xl shadow-violet-500/20 dark:shadow-violet-500/30 overflow-hidden relative">
              {/* Mesh Gradient Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-400 rounded-full blur-[100px]" />
              </div>

              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>

                  {/* Comparison Badge */}
                  <ComparisonBadge
                    value={mockOverview.revenueChange}
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-white/80 text-sm font-medium mb-2">Ingresos Totales</p>
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                    {formatCurrency(mockOverview.totalRevenue)}
                  </h2>

                  {/* Sparkline */}
                  <div className="mb-6">
                    <Sparkline data={sparklineData} maxValue={maxRevenue} color="white" />
                  </div>

                  {/* Comparison Text */}
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {formatCurrency(mockOverview.totalRevenue - mockOverview.prevTotalRevenue)}{' '}
                      más que el mes anterior
                    </span>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Promedio por Cita</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(mockOverview.avgPerAppointment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Tasa de Completación</p>
                    <p className="text-white text-xl font-bold">{mockOverview.completionRate}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary KPI: Appointments */}
          <KPICardSecondary
            icon={<Calendar className="w-6 h-6" />}
            label="Citas Completadas"
            value={mockOverview.completedAppointments}
            subtitle={`${mockOverview.totalAppointments} totales`}
            change={mockOverview.appointmentsChange}
            gradient="from-emerald-500 to-green-600"
          />

          {/* Secondary KPI: Avg Rating */}
          <KPICardSecondary
            icon={<Target className="w-6 h-6" />}
            label="Mejor Barbero"
            value={mockBarbers[0].name}
            subtitle={`${mockBarbers[0].appointments} citas`}
            change={null}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* AI Insights Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Insights Automáticos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              title="Crecimiento Sostenido"
              description="Tus ingresos han crecido consistentemente por 3 meses consecutivos. El promedio de crecimiento es 10.8%."
              type="success"
            />
            <InsightCard
              title="Oportunidad: Domingos"
              description="Los domingos tienen 18% menos reservas. Considera promociones para este día."
              type="warning"
            />
            <InsightCard
              title="Servicio Estrella"
              description="Corte + Barba genera el 31% de tus ingresos con alta satisfacción (4.9/5)."
              type="info"
            />
          </div>
        </div>

        {/* Top Services & Barbers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Top Servicios</h3>
            <div className="space-y-3">
              {mockServices.slice(0, 5).map((service, index) => (
                <ServiceRow key={service.id} service={service} rank={index + 1} />
              ))}
            </div>
          </Card>

          {/* Top Barbers */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              Leaderboard de Barberos
            </h3>
            <div className="space-y-3">
              {mockBarbers.map((barber, index) => (
                <BarberRow key={barber.id} barber={barber} rank={index + 1} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
