'use client'

import { Card } from '@/components/ui/card'
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  conversionsByMonth: Array<{ month: string; conversions: number }>
  milestoneDistribution: Array<{ milestone: number; count: number }>
  statusBreakdown: { pending: number; active: number; expired: number }
  growthRate: string
}

interface ReferralAnalyticsChartsProps {
  analytics: AnalyticsData
}

const COLORS = {
  pending: '#eab308',
  active: '#22c55e',
  expired: '#ef4444',
  milestones: ['#64748b', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ec4899'],
}

export function ReferralAnalyticsCharts({ analytics }: ReferralAnalyticsChartsProps) {
  // Format status data for pie chart
  const statusData = [
    { name: 'Activos', value: analytics.statusBreakdown.active, color: COLORS.active },
    { name: 'Pendientes', value: analytics.statusBreakdown.pending, color: COLORS.pending },
    { name: 'Expirados', value: analytics.statusBreakdown.expired, color: COLORS.expired },
  ].filter((item) => item.value > 0)

  // Format milestone data with labels
  const milestoneData = analytics.milestoneDistribution.map((item) => ({
    ...item,
    label: `Milestone ${item.milestone}`,
  }))

  // Format month labels
  const conversionData = analytics.conversionsByMonth.map((item) => {
    const [year, month] = item.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return {
      month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      conversions: item.conversions,
    }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversions by Month - Line Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Conversiones por Mes
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-zinc-500">Tasa de crecimiento:</span>
            <span
              className={`text-sm font-semibold ${
                parseFloat(analytics.growthRate) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {analytics.growthRate}%
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={conversionData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversions"
              name="Conversiones"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Status Breakdown - Pie Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            Estado de Conversiones
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Total: {Object.values(analytics.statusBreakdown).reduce((a, b) => a + b, 0)}{' '}
            conversiones
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Milestone Distribution - Bar Chart */}
      <Card className="p-6 lg:col-span-2">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Distribución de Milestones
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Negocios por milestone alcanzado</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={milestoneData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="label" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Negocios" radius={[8, 8, 0, 0]}>
              {milestoneData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.milestones[entry.milestone]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
