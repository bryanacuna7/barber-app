'use client'

/**
 * Revenue Chart Component
 * Line chart showing revenue over time
 * Optimized for mobile-first touch interaction
 */

import { useState, useMemo } from 'react'
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
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue?: number
    value?: number
    appointments?: number
  }>
  period: 'week' | 'month' | 'year'
  height?: number
}

export function RevenueChart({ data, period, height }: RevenueChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Calculate trend vs previous period
  const trend = useMemo(() => {
    if (data.length < 2) return null

    const midPoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midPoint)
    const secondHalf = data.slice(midPoint)

    const firstTotal = firstHalf.reduce((sum, item) => sum + (item.revenue ?? item.value ?? 0), 0)
    const secondTotal = secondHalf.reduce((sum, item) => sum + (item.revenue ?? item.value ?? 0), 0)

    if (firstTotal === 0) return null

    const percentChange = ((secondTotal - firstTotal) / firstTotal) * 100

    return {
      value: Math.abs(Math.round(percentChange)),
      isPositive: percentChange > 0,
    }
  }, [data])

  // Format currency for mobile - shorter format
  const formatCurrency = (value: number, isMobile: boolean = false) => {
    if (isMobile && value >= 1000) {
      return `₡${Math.round(value / 1000)}k`
    }
    return `₡${value.toLocaleString()}`
  }

  // Prevent label overlap on small screens.
  const chartData = useMemo(
    () =>
      data.map((item) => {
        const [first = '', second = ''] = item.date.split(' ')
        const chartValue = item.revenue ?? item.value ?? 0
        return {
          ...item,
          chartValue,
          mobileLabel: period === 'year' ? first : first,
          desktopLabel: period === 'year' && second ? `${first} ${second}` : item.date,
        }
      }),
    [data, period]
  )

  const xAxisInterval = period === 'week' ? 0 : period === 'month' ? 4 : 1

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 backdrop-blur-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base lg:text-lg">Ingresos</CardTitle>
          </div>
          <div className="text-[11px] lg:text-sm text-zinc-500 dark:text-zinc-400">
            {period === 'week' && 'Últimos 7 días'}
            {period === 'month' && 'Últimos 30 días'}
            {period === 'year' && 'Último año'}
          </div>
        </div>

        {/* Trend Insight */}
        {trend && (
          <div className="mt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                trend.isPositive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {trend.isPositive ? '+' : '-'}
                {trend.value}% vs período anterior
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        <ResponsiveContainer width="100%" height={height || 200}>
          <AreaChart
            data={chartData}
            onClick={(e) => {
              if (e && e.activeTooltipIndex !== undefined) {
                setActiveIndex(
                  e.activeTooltipIndex === activeIndex ? null : Number(e.activeTooltipIndex)
                )
              }
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Hide grid on mobile, show on desktop */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
              className="hidden lg:block"
            />
            <XAxis
              dataKey="mobileLabel"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={xAxisInterval}
              minTickGap={16}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, true)}
              width={45}
            />
            <Tooltip
              active={activeIndex !== null}
              formatter={(value: number) => [formatCurrency(value, false), 'Ingresos']}
              labelFormatter={(
                label: string,
                payload: Array<{ payload?: { desktopLabel?: string } }>
              ) => {
                const datum = payload?.[0]?.payload
                return datum?.desktopLabel ?? label
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px',
              }}
              cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="chartValue"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, onClick: () => {} }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
