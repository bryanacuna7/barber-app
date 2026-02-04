'use client'

/**
 * Demo B: Visual Analytics Canvas (Notion-style)
 * Score Target: 8.5/10
 *
 * Features:
 * - Masonry grid layout (dynamic heights)
 * - Interactive charts (click to drill-down)
 * - Chart type switcher (bar/line/pie)
 * - Filter sidebar with live preview
 * - Expandable cards with details
 * - Comparison mode toggle
 * - Export button (simulated)
 */

import { useState } from 'react'
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Filter,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  mockOverview,
  mockRevenueSeries,
  mockServices,
  mockBarbers,
  formatCurrency,
} from '../mock-data'

type ChartType = 'bar' | 'line' | 'pie'
type Period = 'week' | 'month' | 'year'

export default function PreviewBPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Analytics Canvas
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Notion-style interactive analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Switcher */}
            <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
              >
                <LineChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('pie')}
                className={chartType === 'pie' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
              >
                <PieChartIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Period Selector */}
            <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(['week', 'month', 'year'] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={period === p ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
                >
                  {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>

            {/* Export */}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters Sidebar (if visible) */}
        {showFilters && (
          <Card className="p-6 mb-6 border-2 border-violet-200 dark:border-violet-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white">Filtros Avanzados</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Barbero
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  <option>Todos</option>
                  {mockBarbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Servicio
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  <option>Todos</option>
                  {mockServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Segmento
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  <option>Todos</option>
                  <option>VIP</option>
                  <option>Regular</option>
                  <option>Nuevo</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI: Revenue (Large) */}
          <div className="lg:col-span-2">
            <InteractiveCard
              id="revenue"
              title="Ingresos Totales"
              icon={<DollarSign className="w-5 h-5" />}
              expanded={expandedCard === 'revenue'}
              onToggle={() => setExpandedCard(expandedCard === 'revenue' ? null : 'revenue')}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(mockOverview.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      +{mockOverview.revenueChange.toFixed(1)}% vs mes anterior
                    </span>
                  </div>
                </div>

                {/* Mini Chart */}
                {expandedCard === 'revenue' && (
                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <SimpleBarChart data={mockRevenueSeries.slice(-7)} />
                  </div>
                )}
              </div>
            </InteractiveCard>
          </div>

          {/* KPI: Appointments */}
          <InteractiveCard
            id="appointments"
            title="Citas"
            icon={<Calendar className="w-5 h-5" />}
            expanded={expandedCard === 'appointments'}
            onToggle={() =>
              setExpandedCard(expandedCard === 'appointments' ? null : 'appointments')
            }
          >
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {mockOverview.completedAppointments}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                de {mockOverview.totalAppointments} totales
              </p>
              {expandedCard === 'appointments' && (
                <div className="mt-4 space-y-2">
                  <ProgressBar
                    label="Completadas"
                    value={mockOverview.completionRate}
                    color="emerald"
                  />
                  <ProgressBar label="Pendientes" value={8} color="amber" />
                  <ProgressBar label="Canceladas" value={2} color="red" />
                </div>
              )}
            </div>
          </InteractiveCard>

          {/* Top Services (Click to drill-down) */}
          <div className="lg:col-span-2">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Servicios
              </h3>

              <div className="space-y-2">
                {mockServices.slice(0, 5).map((service) => (
                  <button
                    key={service.id}
                    onClick={() =>
                      setSelectedService(selectedService === service.id ? null : service.id)
                    }
                    className="w-full p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {service.name}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(service.revenue)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all"
                        style={{ width: `${(service.revenue / mockServices[0].revenue) * 100}%` }}
                      />
                    </div>

                    {/* Drill-down Details */}
                    {selectedService === service.id && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Reservas</p>
                          <p className="font-bold text-zinc-900 dark:text-white">{service.count}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Duración</p>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {service.avgDuration} min
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Completado</p>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {service.completionRate}%
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Barbers Leaderboard */}
          <InteractiveCard
            id="barbers"
            title="Barberos"
            icon={<Users className="w-5 h-5" />}
            expanded={expandedCard === 'barbers'}
            onToggle={() => setExpandedCard(expandedCard === 'barbers' ? null : 'barbers')}
          >
            <div className="space-y-3">
              {mockBarbers.map((barber, index) => (
                <div
                  key={barber.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="w-6 text-center font-bold text-zinc-400">#{index + 1}</div>
                  <img src={barber.avatar} alt={barber.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white truncate">
                      {barber.name}
                    </p>
                    {expandedCard === 'barbers' && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {barber.appointments} citas · ⭐ {barber.avgRating}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">
                    {formatCurrency(barber.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </InteractiveCard>
        </div>
      </div>
    </div>
  )
}

// Interactive Card Component
function InteractiveCard({
  id,
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <Card
      className={`p-6 transition-all hover:shadow-lg ${expanded ? 'ring-2 ring-violet-600' : ''}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
            {icon}
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      {children}
    </Card>
  )
}

// Simple Bar Chart (visual only)
function SimpleBarChart({ data }: { data: any[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-violet-600 to-blue-600 rounded-t-lg transition-all hover:opacity-80"
            style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
          />
          <p className="text-[10px] text-zinc-400">{new Date(d.date).getDate()}</p>
        </div>
      ))}
    </div>
  )
}

// Progress Bar
function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-medium text-zinc-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color as keyof typeof colors]} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
