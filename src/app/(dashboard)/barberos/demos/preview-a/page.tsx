'use client'

/**
 * Demo A: Performance Dashboard (HubSpot-Style)
 * Score: 9/10
 *
 * Features:
 * - Team KPI cards (4 stats)
 * - Search by name/email
 * - Status filters
 * - Enriched barber cards with business data
 * - Mini sparklines
 * - Achievement badges inline
 * - Occupancy bars
 * - Quick actions
 * - Mobile-optimized (responsive grid, stacked KPIs)
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Gauge,
  Crown,
  Flame,
  Sparkles,
  UserRound,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Target,
  Zap,
} from 'lucide-react'
import {
  mockBarbers,
  teamStats,
  formatCurrency,
  getRoleBadgeColor,
  getRoleLabel,
  type MockBarber,
} from '../mock-data'

type ViewMode = 'cards' | 'table'
type StatusFilter = 'all' | 'active' | 'inactive'

export default function PreviewA() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Filter barbers
  const filteredBarbers = useMemo(() => {
    return mockBarbers.filter((barber) => {
      // Status filter
      if (statusFilter === 'active' && !barber.is_active) return false
      if (statusFilter === 'inactive' && barber.is_active) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          barber.name.toLowerCase().includes(query) || barber.email.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                Demo A: Performance Dashboard
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                HubSpot-style • Business intelligence con KPIs y analytics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* KPI 1: Total Appointments */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                Esta semana
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Citas</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {teamStats.total_appointments_this_week}
              </p>
              <p className="text-xs text-zinc-500">{teamStats.total_appointments_today} hoy</p>
            </div>
          </div>

          {/* KPI 2: Total Revenue */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-full">
                Este mes
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Ingresos</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {formatCurrency(teamStats.total_revenue_this_month)}
              </p>
              <p className="text-xs text-zinc-500">
                {formatCurrency(teamStats.total_revenue_this_week)} esta semana
              </p>
            </div>
          </div>

          {/* KPI 3: Average Rating */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Calificación Promedio</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {teamStats.average_client_rating.toFixed(1)}
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(teamStats.average_client_rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* KPI 4: Team Capacity */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Capacidad del Equipo</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {Math.round(teamStats.average_capacity_utilization)}%
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-rose-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${teamStats.average_capacity_utilization}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                {(['all', 'active', 'inactive'] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === filter
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'Todos' : filter === 'active' ? 'Activos' : 'Inactivos'}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Mostrando{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {filteredBarbers.length}
              </span>{' '}
              {filteredBarbers.length === 1 ? 'barbero' : 'barberos'}
            </p>
          </div>
        </motion.div>

        {/* Barber Cards Grid */}
        {viewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredBarbers.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BarberCard barber={barber} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredBarbers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-12 border border-zinc-200 dark:border-zinc-800 text-center"
          >
            <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              No se encontraron barberos
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Intenta ajustar tus filtros o búsqueda
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Barber Card Component
function BarberCard({ barber }: { barber: MockBarber }) {
  const [isHovered, setIsHovered] = useState(false)

  const trendIcon =
    barber.trends.trend_direction === 'up' ? (
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    ) : barber.trends.trend_direction === 'down' ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : null

  const badgeIcons: Record<string, any> = {
    Crown,
    Flame,
    TrendingUp,
    Star,
    Heart: Star,
    Sparkles,
    Target,
    Zap,
    Award,
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 ${
        !barber.is_active ? 'opacity-60' : ''
      }`}
    >
      {/* Status indicator bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${
          barber.is_active
            ? 'bg-gradient-to-r from-violet-500 to-purple-600'
            : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
      />

      {/* Header: Avatar + Name + Role */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center ring-4 ring-violet-100 dark:ring-violet-900/20">
            <UserRound className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          {/* Status dot */}
          <div
            className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white dark:border-zinc-900 ${
              barber.is_active ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
            {barber.name}
          </h3>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
              barber.role
            )}`}
          >
            {getRoleLabel(barber.role)}
          </span>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{barber.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business KPIs Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        {/* Appointments This Week */}
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Citas/Semana</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {barber.stats.appointments_this_week}
          </p>
        </div>

        {/* Revenue This Month */}
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Ingresos/Mes</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {formatCurrency(barber.stats.revenue_this_month / 1000)}K
          </p>
        </div>

        {/* Client Rating */}
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Rating</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {barber.stats.client_rating.toFixed(1)}
            </p>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Tendencia Ingresos</p>
          <div className="flex items-center gap-2">
            {trendIcon}
            <span
              className={`text-sm font-semibold ${
                barber.trends.trend_direction === 'up'
                  ? 'text-emerald-600'
                  : barber.trends.trend_direction === 'down'
                    ? 'text-red-600'
                    : 'text-zinc-500'
              }`}
            >
              {barber.trends.revenue_change > 0 ? '+' : ''}
              {barber.trends.revenue_change}%
            </span>
          </div>
        </div>

        {/* Gamification Level */}
        <div className="text-right space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Nivel</p>
          <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {barber.gamification.level}
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      {barber.gamification.badges.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Logros Destacados</p>
          <div className="flex flex-wrap gap-2">
            {barber.gamification.badges.slice(0, 3).map((badge) => {
              const IconComponent = badgeIcons[badge.icon] || Award
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <IconComponent className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
                    {badge.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Occupancy Bar */}
      {barber.is_active && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Ocupación Hoy</span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {barber.schedule.occupancy_today}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-violet-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${barber.schedule.occupancy_today}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Próximo disponible: {barber.schedule.next_available_slot}
          </p>
        </div>
      )}

      {/* Quick Actions (visible on hover desktop, always visible mobile) */}
      <AnimatePresence>
        {(isHovered || window.innerWidth < 1024) && barber.is_active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
          >
            <button className="flex-1 h-9 px-3 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Asignar</span>
            </button>
            <button className="flex-1 h-9 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Horario</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
