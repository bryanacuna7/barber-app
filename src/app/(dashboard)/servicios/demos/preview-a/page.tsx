'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Star,
  Clock,
  Users,
  ChevronRight,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  mockServices,
  getTotalRevenue,
  getTotalBookings,
  getAveragePrice,
  getTopService,
  getCategoryLabel,
  getCategoryColor,
  getStatusBadge,
  calculateGrowth,
  type MockService,
  type ServiceCategory,
} from '../mock-data'

export default function PreviewADashboardIntelligence() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')

  // Calculate KPIs
  const totalRevenue = getTotalRevenue()
  const totalBookings = getTotalBookings()
  const avgPrice = getAveragePrice()
  const topService = getTopService()

  const totalRevenueLastMonth = mockServices.reduce(
    (sum, s) => sum + s.bookings_last_month * s.price,
    0
  )
  const totalBookingsLastMonth = mockServices.reduce((sum, s) => sum + s.bookings_last_month, 0)

  const revenueGrowth = calculateGrowth(totalRevenue, totalRevenueLastMonth)
  const bookingsGrowth = calculateGrowth(totalBookings, totalBookingsLastMonth)

  // Chart data
  const bookingsChartData = mockServices
    .sort((a, b) => b.bookings_this_month - a.bookings_this_month)
    .slice(0, 6) // Top 6 services
    .map((s) => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
      bookings: s.bookings_this_month,
      fill: `var(--${s.color}-500)`,
    }))

  const categoryChartData = [
    {
      name: 'Corte',
      value: mockServices.filter((s) => s.category === 'corte').length,
      fill: '#3b82f6',
    },
    {
      name: 'Barba',
      value: mockServices.filter((s) => s.category === 'barba').length,
      fill: '#f59e0b',
    },
    {
      name: 'Combo',
      value: mockServices.filter((s) => s.category === 'combo').length,
      fill: '#a855f7',
    },
    {
      name: 'Facial',
      value: mockServices.filter((s) => s.category === 'facial').length,
      fill: '#10b981',
    },
  ]

  // Mock revenue trend (last 7 days)
  const revenueTrendData = [
    { day: 'Lun', revenue: 145000 },
    { day: 'Mar', revenue: 168000 },
    { day: 'Mié', revenue: 152000 },
    { day: 'Jue', revenue: 189000 },
    { day: 'Vie', revenue: 203000 },
    { day: 'Sáb', revenue: 234000 },
    { day: 'Dom', revenue: 121000 },
  ]

  // Filter services
  const filteredServices =
    selectedCategory === 'all'
      ? mockServices
      : mockServices.filter((s) => s.category === selectedCategory)

  const categories: (ServiceCategory | 'all')[] = ['all', 'corte', 'barba', 'combo', 'facial']

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Demo A: Dashboard Intelligence
              </h1>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
                HubSpot-style: KPIs + Charts + Business Insights
              </p>
            </div>
            <Button variant="outline" className="h-10">
              <ChevronRight className="mr-2 h-4 w-4" />
              Ver Todas las Demos
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Total Revenue */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Revenue Total
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  {revenueGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">+{revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">{revenueGrowth}%</span>
                    </>
                  )}
                  <span className="text-zinc-500">vs mes pasado</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Reservas Totales
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {totalBookings}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  {bookingsGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">+{bookingsGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">{bookingsGrowth}%</span>
                    </>
                  )}
                  <span className="text-zinc-500">vs mes pasado</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Average Price */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Precio Promedio
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(avgPrice)}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Package className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-500">{mockServices.length} servicios</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Top Service */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Más Rentable</p>
                <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-white truncate">
                  {topService.name}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <span className="font-medium text-green-600">
                    {formatCurrency(topService.revenue_this_month)}
                  </span>
                  <span className="text-zinc-500">este mes</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <span className="text-2xl">{topService.icon}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid gap-6 lg:grid-cols-3"
        >
          {/* Service Popularity Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Servicios Más Reservados
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="bookings" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Distribución por Categoría
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Revenue Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.1} />
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₡${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'all' ? 'Todos' : getCategoryLabel(cat as ServiceCategory)}
            </button>
          ))}
        </motion.div>

        {/* Services Grid with Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Service Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-2xl dark:from-zinc-800 dark:to-zinc-700">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{service.name}</h3>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(service.category).bg} ${getCategoryColor(service.category).text}`}
                    >
                      {getCategoryLabel(service.category)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Reservas este mes</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {service.bookings_this_month}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Revenue</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(service.revenue_this_month)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Rating
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {service.avg_rating} ({service.total_reviews})
                  </span>
                </div>
              </div>

              {/* Price & Duration */}
              <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <Clock className="h-4 w-4" />
                  {service.duration_minutes} min
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(service.price)}
                </p>
              </div>

              {/* Staff */}
              <div className="mt-3 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs text-zinc-500 truncate">{service.barber_names.join(', ')}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
