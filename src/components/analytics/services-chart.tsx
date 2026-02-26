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

  // Memoize top 5 slice — avoids new array reference on every render
  const topServices = useMemo(() => data.slice(0, 5), [data])

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
