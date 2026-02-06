'use client'

/**
 * Demo Fusion: Intelligence Report (A + C Combined)
 * Score Target: 9.5/10
 *
 * Combines:
 * - Demo A: Hero KPI, AI insights, alerts, premium gradients
 * - Demo C: Professional tables, export, comparison mode, sparklines
 *
 * Features:
 * - Hero KPI card (2x) with sparkline
 * - AI-powered insights section
 * - Alert banners for anomalies
 * - Export buttons (PDF, CSV, Print)
 * - Comparison mode toggle
 * - 2 Professional tables (Services + Barbers)
 * - Sortable columns with inline sparklines
 * - Premium gradients + clean tables
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
  Download,
  FileText,
  Printer,
  ArrowUpDown,
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
type SortField = 'name' | 'count' | 'revenue' | 'rate'
type SortOrder = 'asc' | 'desc'

export default function PreviewFusionPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Calculate sparkline data (last 7 days)
  const sparklineData = mockRevenueSeries.slice(-7)
  const maxRevenue = Math.max(...sparklineData.map((d) => d.revenue))

  // Sort services
  const sortedServices = [...mockServices].sort((a, b) => {
    const aVal =
      sortField === 'name'
        ? a.name
        : sortField === 'count'
          ? a.count
          : sortField === 'revenue'
            ? a.revenue
            : a.completionRate
    const bVal =
      sortField === 'name'
        ? b.name
        : sortField === 'count'
          ? b.count
          : sortField === 'revenue'
            ? b.revenue
            : b.completionRate

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return sortOrder === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 md:p-8 relative overflow-hidden">
      {/* Subtle Mesh Gradients (15% opacity) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-violet-400 to-blue-400 rounded-full blur-3xl"
          style={{
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
          style={{
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Intelligence Report
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Fusion: Premium insights + Professional tables
            </p>
          </div>

          {/* Export + Period Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Export Buttons */}
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>

            {/* Comparison Toggle */}
            <Button
              variant={comparisonMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
              className={
                comparisonMode ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' : ''
              }
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Comparar
            </Button>

            {/* Period Selector */}
            <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(['week', 'month', 'year'] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={
                    period === p ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' : ''
                  }
                >
                  {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {mockAlerts
          .filter((a) => a.impact === 'high')
          .map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}

        {/* Bento Grid: Hero KPI + Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HERO: Revenue Card (2x size on desktop) */}
          <div className="md:col-span-2">
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

                  {/* Comparison Mode: Show Previous */}
                  {comparisonMode && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-white/70 text-xs mb-1">Mes Anterior</p>
                      <p className="text-white text-2xl font-bold">
                        {formatCurrency(mockOverview.prevTotalRevenue)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary KPIs */}
          <div className="space-y-6">
            <KPICardSecondary
              icon={<Calendar className="w-6 h-6" />}
              label="Citas Completadas"
              value={mockOverview.completedAppointments}
              subtitle={`${mockOverview.totalAppointments} totales`}
              change={mockOverview.appointmentsChange}
              gradient="from-emerald-500 to-green-600"
              prevValue={comparisonMode ? mockOverview.prevCompletedAppointments : undefined}
            />

            <KPICardSecondary
              icon={<Target className="w-6 h-6" />}
              label="Promedio por Cita"
              value={formatCurrency(mockOverview.avgPerAppointment)}
              subtitle={`${mockOverview.completionRate}% completado`}
              change={mockOverview.avgChange}
              gradient="from-amber-500 to-orange-600"
              prevValue={
                comparisonMode ? formatCurrency(mockOverview.prevAvgPerAppointment) : undefined
              }
            />
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Professional Tables Section */}

        {/* Services Performance Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Rendimiento de Servicios
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {mockServices.length} servicios · Click para ordenar
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <SortButton
                      label="Servicio"
                      active={sortField === 'name'}
                      order={sortOrder}
                      onClick={() => handleSort('name')}
                    />
                  </th>
                  <th className="px-6 py-3 text-right">
                    <SortButton
                      label="Reservas"
                      active={sortField === 'count'}
                      order={sortOrder}
                      onClick={() => handleSort('count')}
                    />
                  </th>
                  <th className="px-6 py-3 text-right">
                    <SortButton
                      label="Ingresos"
                      active={sortField === 'revenue'}
                      order={sortOrder}
                      onClick={() => handleSort('revenue')}
                    />
                  </th>
                  <th className="px-6 py-3 text-right hidden md:table-cell">Duración Prom.</th>
                  <th className="px-6 py-3 text-right">
                    <SortButton
                      label="Completado"
                      active={sortField === 'rate'}
                      order={sortOrder}
                      onClick={() => handleSort('rate')}
                    />
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell">Tendencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sortedServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 dark:text-white">{service.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-white">
                      {service.count}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(service.revenue)}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {service.avgDuration} min
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          service.completionRate >= 90
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {service.completionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <MiniSparkline data={generateMockTrend()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Barbers Performance Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Rendimiento de Barberos
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {mockBarbers.length} barberos activos
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Barbero
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Citas
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-700 dark:text-zinc-300 hidden md:table-cell">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300 hidden lg:table-cell">
                    Tendencia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {mockBarbers.map((barber, index) => (
                  <tr
                    key={barber.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={barber.avatar}
                            alt={barber.name}
                            className="w-10 h-10 rounded-full"
                          />
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                              👑
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{barber.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {barber.completionRate}% completado
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-white">
                      {barber.appointments}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(barber.revenue)}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {formatCurrency(Math.round(barber.revenue / barber.appointments))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        ⭐ {barber.avgRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <MiniSparkline data={generateMockTrend()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  data: any[]
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
  prevValue,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle: string
  change: number
  gradient: string
  prevValue?: string | number
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
          <ComparisonBadge
            value={change}
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
          />
        </div>

        <p className="text-white/80 text-sm mb-2">{label}</p>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-white/70 text-sm">{subtitle}</p>

        {prevValue && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/70 text-xs mb-1">Mes Anterior</p>
            <p className="text-white text-lg font-bold">{prevValue}</p>
          </div>
        )}
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

// Sort Button
function SortButton({
  label,
  active,
  order,
  onClick,
}: {
  label: string
  active: boolean
  order: SortOrder
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`w-4 h-4 transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}
      />
    </button>
  )
}

// Mini Sparkline (inline chart)
function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 15
      return `${x},${y}`
    })
    .join(' ')

  const trend = data[data.length - 1] > data[0]

  return (
    <div className="flex items-center justify-center">
      <svg width="60" height="20" className="opacity-60">
        <polyline
          points={points}
          fill="none"
          stroke={trend ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// Generate mock trend data
function generateMockTrend(): number[] {
  return Array.from({ length: 7 }, () => Math.random() * 100 + 50)
}
