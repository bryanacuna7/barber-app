'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  Star,
  TrendingUp,
  Award,
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Scissors,
  Sparkles,
  Zap,
  Users,
  Wind,
  Waves,
  Flame,
  Gift,
  Crown,
  CircleDot,
  Sparkle,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  mockServices,
  getCategoryLabel,
  getCategoryColor,
  calculateGrowth,
  getActiveServices,
  type MockService,
  type ServiceCategory,
} from '../mock-data'

type SortField = 'name' | 'category' | 'bookings' | 'price' | 'duration'
type SortDirection = 'asc' | 'desc'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Sparkles,
  Zap,
  Users,
  Wind,
  Waves,
  Flame,
  Gift,
  Crown,
  CircleDot,
  Sparkle,
  Star,
}

// Service Icon Component
function ServiceIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = iconMap[iconName] || Scissors
  return <Icon className={className} />
}

export default function PreviewDSimplifiedHybrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('bookings')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter and sort services
  let filteredServices =
    selectedCategory === 'all'
      ? mockServices
      : mockServices.filter((s) => s.category === selectedCategory)

  if (searchQuery) {
    filteredServices = filteredServices.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'bookings':
          comparison = a.bookings_this_month - b.bookings_this_month
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'duration':
          comparison = a.duration_minutes - b.duration_minutes
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredServices, sortField, sortDirection])

  const categories: (ServiceCategory | 'all')[] = ['all', 'corte', 'barba', 'combo', 'facial']

  // Calculate quick stats
  const activeServices = getActiveServices()
  const totalServices = activeServices.length
  const topService = activeServices.reduce((top, s) =>
    s.bookings_this_month > top.bookings_this_month ? s : top
  )

  // Top 5 for mini chart
  const top5Services = [...activeServices]
    .sort((a, b) => b.bookings_this_month - a.bookings_this_month)
    .slice(0, 5)
  const maxBookings = top5Services[0]?.bookings_this_month || 100

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Demo D: Simplified Hybrid
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                CRUD-first con insights sidebar: Simple, balanced, practical
              </p>
            </div>
            <Button className="h-10 bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Servicio
            </Button>
          </div>
        </motion.div>

        {/* Main Layout: Content + Sidebar */}
        <div className="flex gap-6">
          {/* Main Content Area (Left) */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : getCategoryLabel(cat as ServiceCategory)}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Header */}
                  <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <tr>
                      {/* Service Name */}
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Servicio
                          {getSortIcon('name')}
                        </button>
                      </th>

                      {/* Category */}
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('category')}
                          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Categoría
                          {getSortIcon('category')}
                        </button>
                      </th>

                      {/* Bookings */}
                      <th className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSort('bookings')}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Reservas
                          {getSortIcon('bookings')}
                        </button>
                      </th>

                      {/* Duration */}
                      <th className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSort('duration')}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Duración
                          {getSortIcon('duration')}
                        </button>
                      </th>

                      {/* Price */}
                      <th className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSort('price')}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Precio
                          {getSortIcon('price')}
                        </button>
                      </th>

                      {/* Rating */}
                      <th className="px-4 py-3 text-right">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                          Rating
                        </span>
                      </th>

                      {/* Actions */}
                      <th className="w-24 px-4 py-3 text-right">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                          Acciones
                        </span>
                      </th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {sortedServices.map((service) => {
                      const categoryColor = getCategoryColor(service.category)
                      const growth = calculateGrowth(
                        service.bookings_this_month,
                        service.bookings_last_month
                      )

                      return (
                        <tr
                          key={service.id}
                          className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                        >
                          {/* Service Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{service.icon}</span>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                  {service.name}
                                </p>
                                <p className="text-xs text-zinc-500 line-clamp-1">
                                  {service.barber_names.length} barberos
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}
                            >
                              {getCategoryLabel(service.category)}
                            </span>
                          </td>

                          {/* Bookings */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {service.bookings_this_month}
                              </span>
                              {growth !== 0 && (
                                <span
                                  className={`text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                  ({growth > 0 ? '+' : ''}
                                  {growth}%)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {service.duration_minutes} min
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {formatCurrency(service.price)}
                            </span>
                          </td>

                          {/* Rating */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                {service.avg_rating}
                              </span>
                            </div>
                          </td>

                          {/* Actions - Always visible */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                title="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {sortedServices.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-zinc-400" />
                  <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
                    No se encontraron servicios
                  </p>
                </div>
              )}
            </motion.div>

            {/* Results count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-xs text-zinc-500 text-center"
            >
              Mostrando {sortedServices.length} de {mockServices.length} servicios
            </motion.p>
          </div>

          {/* Sidebar (Right) - Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-[320px] shrink-0 space-y-4"
          >
            {/* Quick Stats */}
            <div className="space-y-3">
              {/* Total Services */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Servicios Activos
                    </p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                      {totalServices}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Top Service */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Más Popular
                    </p>
                    <p className="mt-1 text-base font-bold text-zinc-900 dark:text-white truncate">
                      {topService.icon} {topService.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {topService.bookings_this_month} reservas
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Average Rating */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Rating Promedio
                    </p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                      {(
                        activeServices.reduce((sum, s) => sum + s.avg_rating, 0) /
                        activeServices.length
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {activeServices.reduce((sum, s) => sum + s.total_reviews, 0)} reviews
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Top 5 Servicios
              </h3>
              <div className="space-y-3">
                {top5Services.map((service, idx) => {
                  const percentage = (service.bookings_this_month / maxBookings) * 100
                  const categoryColor = getCategoryColor(service.category)

                  return (
                    <div key={service.id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-base">{service.icon}</span>
                          <span className="font-medium text-zinc-900 dark:text-white truncate">
                            {service.name}
                          </span>
                        </div>
                        <span className="ml-2 shrink-0 text-xs text-zinc-500">
                          {service.bookings_this_month}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                          className={`h-full rounded-full ${categoryColor.bg}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
