'use client'

/**
 * Revenue Chart Component
 * Line chart showing revenue over time
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue?: number
    value?: number
    appointments?: number
  }>
  period: 'week' | 'month' | 'year'
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <CardTitle>Ingresos</CardTitle>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {period === 'week' && 'Últimos 7 días'}
            {period === 'month' && 'Últimos 30 días'}
            {period === 'year' && 'Último año'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₡${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`₡${value.toLocaleString()}`, 'Ingresos']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Area
              type="monotone"
              dataKey={(item: any) => item.revenue ?? item.value ?? 0}
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
