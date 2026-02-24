'use client'

/**
 * Services Chart Component
 * Horizontal bar chart showing top performing services
 * Optimized for mobile-first touch interaction
 */

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  type TooltipProps,
} from 'recharts'
import { type NameType, type ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Scissors } from 'lucide-react'
import { ChartTooltip } from '@/components/analytics/chart-tooltip'
import { formatCurrencyCompactMillions } from '@/lib/utils'

interface ServicesChartProps {
  data: Array<{
    id?: string
    name: string
    bookings?: number
    revenue?: number
    value?: number
  }>
  period: 'week' | 'month' | 'year'
  height?: number
}

function toRgbChannels(color: string, fallback: string): string {
  const hex = color.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hex) {
    return `${parseInt(hex[1], 16)}, ${parseInt(hex[2], 16)}, ${parseInt(hex[3], 16)}`
  }

  const rgb = color
    .trim()
    .match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,\/]+[\d.]+)?\s*\)$/i)
  if (rgb) {
    return `${rgb[1]}, ${rgb[2]}, ${rgb[3]}`
  }

  return fallback
}

function useChartColors() {
  const [colors, setColors] = useState({
    accent: '#6d7cff',
    grid: '#e5e7eb',
    axis: '#9ca3af',
    winner: '#f59e0b',
    winnerRgb: '245, 158, 11',
    bars: [
      'rgba(109, 124, 255, 0.72)',
      'rgba(109, 124, 255, 0.56)',
      'rgba(109, 124, 255, 0.42)',
      'rgba(109, 124, 255, 0.32)',
    ],
    tooltipBg: 'rgba(18, 22, 30, 0.76)',
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
      const brandRgb = s.getPropertyValue('--brand-primary-rgb').trim() || '109, 124, 255'
      const winner = s.getPropertyValue('--color-warning').trim() || '#f59e0b'

      setColors({
        accent: readableAccent || s.getPropertyValue('--brand-primary').trim() || '#6d7cff',
        grid: s.getPropertyValue('--chart-grid').trim() || '#e5e7eb',
        axis: s.getPropertyValue('--chart-axis').trim() || '#9ca3af',
        winner,
        winnerRgb: toRgbChannels(winner, '245, 158, 11'),
        bars: [
          `rgba(${brandRgb}, 0.72)`,
          `rgba(${brandRgb}, 0.56)`,
          `rgba(${brandRgb}, 0.42)`,
          `rgba(${brandRgb}, 0.32)`,
        ],
        tooltipBg: isDarkTheme ? 'rgba(18, 22, 30, 0.76)' : 'rgba(255, 255, 255, 0.9)',
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

function ServicesTooltip(
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

export function ServicesChart({ data, period, height }: ServicesChartProps) {
  void period
  const chart = useChartColors()

  // Show top 5 services
  const topServices = data.slice(0, 5)

  // Brand-derived rank colors (monochromatic, decreasing intensity)
  const barOpacities = [1, 0.75, 0.55, 0.4, 0.28]

  // Format currency for mobile
  const formatCurrency = (value: number, isMobile: boolean = false) => {
    if (isMobile) return formatCurrencyCompactMillions(value)
    return `₡${value.toLocaleString('es-CR')}`
  }

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 backdrop-blur-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5" style={{ color: chart.accent }} />
            <CardTitle className="text-base lg:text-lg">Top Servicios</CardTitle>
          </div>
          <div className="text-xs lg:text-sm text-muted">Por ingresos</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        {topServices.length === 0 ? (
          <div className="text-center py-8 text-muted">No hay datos para este período</div>
        ) : (
          <div className="h-[200px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices} layout="vertical">
                <CartesianGrid
                  strokeDasharray="2 5"
                  stroke={chart.grid}
                  opacity={0.42}
                  className="hidden lg:block"
                />
                <XAxis
                  type="number"
                  stroke={chart.axis}
                  fontSize={11}
                  tick={{ fontSize: 11, className: 'text-xs' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value, true)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={chart.axis}
                  fontSize={11}
                  tick={{ fontSize: 11, className: 'text-xs' }}
                  width={80}
                  className="lg:!w-[120px]"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={
                    <ServicesTooltip
                      tone={{
                        bg: chart.tooltipBg,
                        border: chart.tooltipBorder,
                        text: chart.tooltipText,
                      }}
                    />
                  }
                  cursor={{ fill: `${chart.accent}1f` }}
                />
                <Bar dataKey="revenue" radius={[0, 9, 9, 0]}>
                  {topServices.map((_, idx) => (
                    <Cell
                      key={`service-bar-${idx}`}
                      fill={idx === 0 ? chart.winner : (chart.bars[idx - 1] ?? chart.accent)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Service Stats */}
        {topServices.length > 0 && (
          <div className="mt-6 space-y-2">
            {topServices.map((service, idx) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? `rgba(${chart.winnerRgb}, 0.18)`
                          : `rgba(var(--brand-primary-rgb), ${(barOpacities[idx] ?? 0.2) * 0.15})`,
                      color:
                        idx === 0
                          ? chart.winner
                          : `rgba(var(--brand-primary-rgb), ${barOpacities[idx] ?? 0.2})`,
                      border: idx === 0 ? `1px solid rgba(${chart.winnerRgb}, 0.36)` : 'none',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm lg:text-base truncate">
                      {service.name}
                    </p>
                    <p className="text-xs lg:text-sm text-muted">{service.bookings} reservas</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm lg:text-base">
                    {formatCurrency(service.revenue, false)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
