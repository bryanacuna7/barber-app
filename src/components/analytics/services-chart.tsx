'use client'

/**
 * Services Chart Component
 * Horizontal bar chart showing top performing services
 * Optimized for mobile-first touch interaction
 */

import { useMemo } from 'react'
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
import { useChartColors } from '@/components/analytics/use-chart-colors'
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
  const chartHeight = height ?? 280

  // Memoize top 5 slice — avoids new array reference on every render
  const topServices = useMemo(() => data.slice(0, 5), [data])
  const chartData = useMemo(
    () =>
      topServices.map((service) => ({
        ...service,
        shortName: service.name.length > 14 ? `${service.name.slice(0, 14)}…` : service.name,
      })),
    [topServices]
  )

  // Brand-derived rank colors (monochromatic, decreasing intensity)
  const barOpacities = [1, 0.75, 0.55, 0.4, 0.28]

  // Format currency for mobile
  const formatCurrency = (value: number, isMobile: boolean = false) => {
    if (isMobile) return formatCurrencyCompactMillions(value)
    return `₡${value.toLocaleString('es-CR')}`
  }

  const topService = topServices[0] ?? null
  const topServiceShare = useMemo(() => {
    if (!topService) return 0
    const totalRevenue = topServices.reduce((sum, item) => sum + (item.revenue ?? 0), 0)
    if (totalRevenue <= 0) return 0
    return Math.round(((topService.revenue ?? 0) / totalRevenue) * 100)
  }, [topService, topServices])

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
        {topService && (
          <div className="mt-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-800/40">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Insight principal
            </span>
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              {topService.name} concentra {topServiceShare}% del ingreso del top 5.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        {topServices.length === 0 ? (
          <div className="text-center py-8 text-muted">No hay datos para este período</div>
        ) : (
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barCategoryGap={10}>
                <CartesianGrid
                  strokeDasharray="2 5"
                  stroke={chart.grid}
                  opacity={0.42}
                  className="hidden lg:block"
                />
                <XAxis
                  type="number"
                  stroke={chart.axis}
                  fontSize={10}
                  tick={{ fontSize: 10, className: 'text-[10px]' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value, true)}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  stroke={chart.axis}
                  fontSize={10}
                  tick={{ fontSize: 10, className: 'text-[10px]' }}
                  width={74}
                  className="lg:!w-[124px]"
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
                  labelFormatter={(
                    label: string,
                    payload: readonly { payload?: { name?: string } }[]
                  ) => payload?.[0]?.payload?.name ?? label}
                  cursor={{ fill: `${chart.accent}1f` }}
                />
                <Bar dataKey="revenue" radius={[0, 9, 9, 0]} barSize={22}>
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
                    {formatCurrency(service.revenue ?? 0, false)}
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
