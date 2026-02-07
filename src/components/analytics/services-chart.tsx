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
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Scissors } from 'lucide-react'

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

function useChartColors() {
  const [colors, setColors] = useState({
    accent: '#6d7cff',
    grid: '#e5e7eb',
    axis: '#9ca3af',
    winner: '#f59e0b',
    bars: ['#808899', '#727b8d', '#656f82', '#596376'],
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
        winner: s.getPropertyValue('--color-warning').trim() || '#f59e0b',
        bars: isDarkTheme
          ? ['#8a93a5', '#7c8699', '#6f798d', '#626d82']
          : ['#6f7a8f', '#7f8a9f', '#8f9aae', '#9fa9bc'],
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

export function ServicesChart({ data, period, height }: ServicesChartProps) {
  void period
  const chart = useChartColors()

  // Show top 5 services
  const topServices = data.slice(0, 5)

  // Brand-derived rank colors (monochromatic, decreasing intensity)
  const barOpacities = [1, 0.75, 0.55, 0.4, 0.28]

  // Format currency for mobile
  const formatCurrency = (value: number, isMobile: boolean = false) => {
    if (isMobile && value >= 1000) {
      return `₡${Math.round(value / 1000)}k`
    }
    return `₡${value.toLocaleString()}`
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
          <ResponsiveContainer width="100%" height={height || 200}>
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
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, true)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={chart.axis}
                fontSize={11}
                width={80}
                className="lg:!w-[120px]"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value, false), 'Ingresos']
                  return [value, 'Reservas']
                }}
                contentStyle={{
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-tooltip-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  padding: '10px 12px',
                  color: 'var(--chart-tooltip-text)',
                }}
                cursor={{ fill: `${chart.accent}1f` }}
              />
              <Bar dataKey="revenue" radius={[0, 9, 9, 0]}>
                {topServices.map((_, idx) => (
                  <Cell
                    key={`service-bar-${idx}`}
                    fill={idx === 0 ? chart.winner : (chart.bars[idx - 1] ?? chart.axis)}
                    fillOpacity={idx === 0 ? 0.95 : 0.82}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
                          ? 'rgba(245, 158, 11, 0.18)'
                          : `rgba(var(--brand-primary-rgb), ${(barOpacities[idx] ?? 0.2) * 0.15})`,
                      color:
                        idx === 0
                          ? 'rgb(245, 158, 11)'
                          : `rgba(var(--brand-primary-rgb), ${barOpacities[idx] ?? 0.2})`,
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
