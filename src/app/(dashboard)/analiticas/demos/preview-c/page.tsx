'use client'

/**
 * Demo C: Executive Report (Linear-style)
 * Score Target: 8.0/10
 *
 * Features:
 * - Clean table-first view (sortable columns)
 * - Inline mini charts (sparklines)
 * - Export buttons prominent (PDF, CSV, Print)
 * - Comparison mode (compare 2 periods side-by-side)
 * - Professional print-ready layout
 * - Summary cards at top
 * - Minimal colors, maximum clarity
 */

import { useState } from 'react'
import {
  Download,
  FileText,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
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

type SortField = 'name' | 'count' | 'revenue' | 'rate'
type SortOrder = 'asc' | 'desc'

export default function PreviewCPage() {
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [dateRange, setDateRange] = useState('Enero 2026')

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
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                Reporte Ejecutivo
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {dateRange}
              </p>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap gap-2">
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
              <Button
                variant={comparisonMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setComparisonMode(!comparisonMode)}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Comparar
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards (Linear-style: minimal, data-focused) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Ingresos"
            value={formatCurrency(mockOverview.totalRevenue)}
            change={mockOverview.revenueChange}
            prevValue={comparisonMode ? formatCurrency(mockOverview.prevTotalRevenue) : undefined}
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Citas Completadas"
            value={mockOverview.completedAppointments.toString()}
            change={mockOverview.appointmentsChange}
            prevValue={
              comparisonMode ? mockOverview.prevCompletedAppointments.toString() : undefined
            }
          />
          <SummaryCard
            icon={<Target className="w-5 h-5" />}
            label="Promedio/Cita"
            value={formatCurrency(mockOverview.avgPerAppointment)}
            change={mockOverview.avgChange}
            prevValue={
              comparisonMode ? formatCurrency(mockOverview.prevAvgPerAppointment) : undefined
            }
          />
          <SummaryCard
            icon={<Users className="w-5 h-5" />}
            label="Tasa Completación"
            value={`${mockOverview.completionRate}%`}
            change={mockOverview.rateChange}
            prevValue={comparisonMode ? `${mockOverview.prevCompletionRate}%` : undefined}
          />
        </div>

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

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
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
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
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

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
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
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
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

        {/* Footer Notes */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Reporte generado el{' '}
            {new Date().toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · Datos del período: {dateRange}
          </p>
        </div>
      </div>
    </div>
  )
}

// Summary Card (Linear-style: minimal, clean)
function SummaryCard({
  icon,
  label,
  value,
  change,
  prevValue,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: number
  prevValue?: string
}) {
  const positive = change >= 0

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-lg">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? '+' : ''}
          {change.toFixed(1)}%
        </div>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{value}</p>

      {prevValue && <p className="text-xs text-zinc-500 dark:text-zinc-400">vs {prevValue}</p>}
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
