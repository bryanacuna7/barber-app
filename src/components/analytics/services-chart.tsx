'use client'

/**
 * Services Chart Component
 * Horizontal bar chart showing top performing services
 */

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
}

export function ServicesChart({ data, period }: ServicesChartProps) {
  // Show top 5 services
  const topServices = data.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-green-500" />
            <CardTitle>Top Servicios</CardTitle>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Por ingresos</div>
        </div>
      </CardHeader>
      <CardContent>
        {topServices.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay datos para este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topServices} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `₡${value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                width={120}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [`₡${value.toLocaleString()}`, 'Ingresos']
                  return [value, 'Reservas']
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Service Stats */}
        {topServices.length > 0 && (
          <div className="mt-6 space-y-2">
            {topServices.map((service, idx) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{service.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {service.bookings} reservas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    ₡{service.revenue.toLocaleString()}
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
