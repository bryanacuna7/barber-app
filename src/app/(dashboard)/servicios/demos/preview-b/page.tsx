'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  Clock,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  ChevronRight,
  Filter,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import {
  mockServices,
  mockBarbers,
  getCategoryLabel,
  getCategoryColor,
  getStatusBadge,
  calculateGrowth,
  type MockService,
  type ServiceCategory,
} from '../mock-data'

export default function PreviewBVisualCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'revenue' | 'rating'>('popularity')

  // Filter and sort services
  let filteredServices =
    selectedCategory === 'all'
      ? mockServices
      : mockServices.filter((s) => s.category === selectedCategory)

  if (searchQuery) {
    filteredServices = filteredServices.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'popularity') return b.bookings_this_month - a.bookings_this_month
    if (sortBy === 'revenue') return b.revenue_this_month - a.revenue_this_month
    if (sortBy === 'rating') return b.avg_rating - a.avg_rating
    return 0
  })

  const categories: (ServiceCategory | 'all')[] = ['all', 'corte', 'barba', 'combo', 'facial']

  // Get barber avatar for ID
  const getBarberAvatar = (barberId: string) => {
    return mockBarbers.find((b) => b.id === barberId)?.avatar || '👨'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20 p-6">
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
                Demo B: Visual Service Catalog
              </h1>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
                Shopify-style: Rich Cards + Visual Hierarchy + Quick Actions
              </p>
            </div>
            <Button variant="outline" className="h-10">
              <ChevronRight className="mr-2 h-4 w-4" />
              Ver Todas las Demos
            </Button>
          </div>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="popularity">Popularidad</option>
              <option value="revenue">Revenue</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'all' ? 'Todos' : getCategoryLabel(cat as ServiceCategory)}
            </button>
          ))}
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-sm text-zinc-500"
        >
          Mostrando {sortedServices.length} servicios
        </motion.p>

        {/* Services Gallery Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {sortedServices.map((service, idx) => {
              const growth = calculateGrowth(
                service.bookings_this_month,
                service.bookings_last_month
              )
              const statusBadge = getStatusBadge(service.status)
              const categoryColor = getCategoryColor(service.category)

              // Calculate popularity percentage (max 100 bookings = 100%)
              const popularityPercentage = Math.min((service.bookings_this_month / 100) * 100, 100)

              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.05 * idx }}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: `var(--${service.color}-500)`,
                  }}
                >
                  {/* Gradient Overlay at Top */}
                  <div
                    className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br opacity-5 dark:opacity-10"
                    style={{
                      background: `linear-gradient(135deg, var(--${service.color}-400), var(--${service.color}-600))`,
                    }}
                  />

                  {/* Card Content */}
                  <div className="relative p-6">
                    {/* Header with Icon and Status */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Large Icon */}
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, var(--${service.color}-100), var(--${service.color}-200))`,
                          }}
                        >
                          {service.icon}
                        </div>
                      </div>

                      {/* More Actions Button */}
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Service Name and Category */}
                    <div className="mb-3">
                      <h3 className="mb-1 text-xl font-bold text-zinc-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${categoryColor.bg} ${categoryColor.text}`}
                      >
                        {getCategoryLabel(service.category)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {service.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {/* Bookings */}
                      <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Award className="h-4 w-4" />
                          <span className="text-xs font-medium">Reservas</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                          {service.bookings_this_month}
                        </p>
                        {growth !== 0 && (
                          <div className="mt-1 flex items-center gap-1">
                            <TrendingUp
                              className={`h-3 w-3 ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                            />
                            <span
                              className={`text-xs font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {growth > 0 ? '+' : ''}
                              {growth}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Revenue */}
                      <div className="rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Revenue</span>
                        </div>
                        <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                          ₡{(service.revenue_this_month / 1000).toFixed(0)}K
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">este mes</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                          {service.avg_rating}
                        </span>
                        <span className="text-sm text-zinc-500">
                          ({service.total_reviews} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Popularity Bar */}
                    <div className="mb-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Popularidad</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {Math.round(popularityPercentage)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${popularityPercentage}%` }}
                          transition={{ duration: 1, delay: 0.3 + idx * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Staff Avatars */}
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-medium text-zinc-500">Barberos disponibles</p>
                      <div className="flex -space-x-2">
                        {service.barber_ids.slice(0, 3).map((barberId, idx) => (
                          <div
                            key={barberId}
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-zinc-100 to-zinc-200 text-xl shadow-md dark:border-zinc-900 dark:from-zinc-700 dark:to-zinc-800"
                            title={service.barber_names[idx]}
                          >
                            {getBarberAvatar(barberId)}
                          </div>
                        ))}
                        {service.barber_ids.length > 3 && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-xs font-semibold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-400">
                            +{service.barber_ids.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Price and Duration */}
                    <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{service.duration_minutes} min</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge (if not active) */}
                    {service.status !== 'active' && (
                      <div className="mt-3">
                        <span
                          className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {sortedServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Search className="h-10 w-10 text-zinc-400" />
            </div>
            <p className="mt-5 text-lg font-medium text-zinc-900 dark:text-white">
              No se encontraron servicios
            </p>
            <p className="mt-1 text-sm text-zinc-500">Intenta con otros términos de búsqueda</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
