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
  type TooltipProps,
} from 'recharts'
import { type NameType, type ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ChartTooltip } from '@/components/analytics/chart-tooltip'
import { formatCurrencyCompactMillions } from '@/lib/utils'

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
  const [colors, setColors] = useState({
    accent: '#6d7cff',
    grid: '#e5e7eb',
    axis: '#9ca3af',
    tooltipBg: 'rgba(18, 22, 30, 0.86)',
    tooltipBorder: 'rgba(163, 175, 196, 0.16)',
    tooltipText: '#f5f7fb',
  })
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
        tooltipBg: isDarkTheme ? 'rgba(18, 22, 30, 0.86)' : 'rgba(255, 255, 255, 0.96)',
        tooltipBorder: isDarkTheme ? 'rgba(163, 175, 196, 0.16)' : 'rgba(15, 23, 42, 0.12)',
        tooltipText: isDarkTheme ? '#f5f7fb' : '#0f172a',
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

function RevenueTooltip(
  props: TooltipProps<ValueType, NameType> & {
    tone: { bg: string; border: string; text: string }
  }
) {
  const { active, payload, label, tone } = props as {
    active?: boolean
    payload?: Array<{ value?: ValueType }>
    label?: string
    tone: { bg: string; border: string; text: string }
  }
  if (!active || !payload?.length) return null

  const rawValue = payload[0]?.value
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0)
  const formatted = `₡${value.toLocaleString()}`
  const resolvedLabel = typeof label === 'string' ? label : String(label ?? '')

  return <ChartTooltip label={resolvedLabel} metricLabel="Ingresos" value={formatted} tone={tone} />
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
    if (isMobile) return formatCurrencyCompactMillions(value)
    return `₡${value.toLocaleString('es-CR')}`
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
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
                tick={{ fontSize: 11, className: 'text-xs' }}
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
                minTickGap={16}
              />
              <YAxis
                stroke={chart.axis}
                fontSize={11}
                tick={{ fontSize: 11, className: 'text-xs' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, true)}
                width={52}
              />
              <Tooltip
                content={
                  <RevenueTooltip
                    tone={{
                      bg: chart.tooltipBg,
                      border: chart.tooltipBorder,
                      text: chart.tooltipText,
                    }}
                  />
                }
                labelFormatter={(
                  label: string,
                  payload: readonly { payload?: { desktopLabel?: string } }[]
                ) => {
                  const datum = payload?.[0]?.payload
                  return datum?.desktopLabel ?? label
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
        </div>
      </CardContent>
    </Card>
  )
}
