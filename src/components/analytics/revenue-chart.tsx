'use client'

/**
 * Revenue Chart Component
 * Line chart showing revenue over time
 * Optimized for mobile-first touch interaction
 */

import { useState, useMemo, useEffect } from 'react'
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

function useChartColors() {
  const [colors, setColors] = useState({ accent: '#6d7cff', grid: '#e5e7eb', axis: '#9ca3af' })
  useEffect(() => {
    const update = () => {
      const root = document.documentElement
      const s = getComputedStyle(document.documentElement)
      const isDarkTheme =
        root.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches
      const readableAccent = (
        isDarkTheme
          ? s.getPropertyValue('--brand-primary-on-dark')
          : s.getPropertyValue('--brand-primary-on-light')
      ).trim()

      setColors({
        accent: readableAccent || s.getPropertyValue('--brand-primary').trim() || '#6d7cff',
        grid: s.getPropertyValue('--chart-grid').trim() || '#e5e7eb',
        axis: s.getPropertyValue('--chart-axis').trim() || '#9ca3af',
      })
    }

    update()
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })
    mq.addEventListener('change', update)
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [])
  return colors
}

export function RevenueChart({ data, period, height }: RevenueChartProps) {
  const chart = useChartColors()

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
            <TrendingUp className="w-5 h-5" style={{ color: chart.accent }} />
            <CardTitle className="text-base lg:text-lg">Ingresos</CardTitle>
          </div>
          <div className="text-[11px] lg:text-sm text-muted">
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="8%" stopColor={chart.accent} stopOpacity={0.46} />
                <stop offset="92%" stopColor={chart.accent} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 5"
              stroke={chart.grid}
              opacity={0.42}
              className="hidden lg:block"
            />
            <XAxis
              dataKey="mobileLabel"
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={xAxisInterval}
              minTickGap={16}
            />
            <YAxis
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, true)}
              width={52}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, false), 'Ingresos']}
              labelFormatter={(
                label: string,
                payload: readonly { payload?: { desktopLabel?: string } }[]
              ) => {
                const datum = payload?.[0]?.payload
                return datum?.desktopLabel ?? label
              }}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                border: '1px solid var(--chart-tooltip-border)',
                borderRadius: '10px',
                fontSize: '13px',
                padding: '10px 12px',
                color: 'var(--chart-tooltip-text)',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
              }}
              labelStyle={{
                color: 'var(--chart-tooltip-text)',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: 'var(--chart-tooltip-text)',
                fontSize: '13px',
                fontWeight: 500,
              }}
              cursor={{
                stroke: chart.accent,
                strokeWidth: 1.5,
                strokeDasharray: '4 4',
                strokeOpacity: 0.75,
              }}
            />
            <Area
              type="monotone"
              dataKey="chartValue"
              stroke={chart.accent}
              strokeWidth={2.75}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{
                r: 5,
                fill: chart.accent,
                stroke: 'var(--chart-tooltip-bg)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
