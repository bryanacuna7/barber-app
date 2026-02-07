'use client'

/**
 * Services Chart Component
 * Horizontal bar chart showing top performing services
 * Optimized for mobile-first touch interaction
 */

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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

export function ServicesChart({ data, period, height }: ServicesChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Show top 5 services
  const topServices = data.slice(0, 5)

  // Vibrant, distinct colors for bars
  const barColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

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
            <Scissors className="w-5 h-5 text-green-500" />
            <CardTitle className="text-base lg:text-lg">Top Servicios</CardTitle>
          </div>
          <div className="text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">Por ingresos</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        {topServices.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay datos para este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height || 200}>
            <BarChart
              data={topServices}
              layout="vertical"
              onClick={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setActiveIndex(
                    e.activeTooltipIndex === activeIndex ? null : Number(e.activeTooltipIndex)
                  )
                }
              }}
            >
              {/* Hide grid on mobile, show on desktop */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.5}
                className="hidden lg:block"
              />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={11}
                tickFormatter={(value) => formatCurrency(value, true)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                width={80}
                className="lg:!w-[120px]"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                active={activeIndex !== null}
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value, false), 'Ingresos']
                  return [value, 'Reservas']
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  padding: '12px',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} onClick={() => {}} />
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
                      backgroundColor: `${barColors[idx]}20`,
                      color: barColors[idx],
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm lg:text-base truncate">
                      {service.name}
                    </p>
                    <p className="text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">
                      {service.bookings} reservas
                    </p>
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
