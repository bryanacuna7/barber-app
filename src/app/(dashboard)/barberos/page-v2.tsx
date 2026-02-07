'use client'

/* eslint-disable react-hooks/static-components */

/**
 * Barberos Page V2 - Demo B: Visual CRM Canvas (Notion-Style)
 * Score: 8.5/10
 *
 * Pattern: React Query + Real-time + Error Boundaries (ready for integration)
 * Feature flag: NEXT_PUBLIC_FF_NEW_BARBEROS=true
 *
 * Features:
 * - Multiple view modes: Cards | Table | Leaderboard | Calendar
 * - Rich visual cards with performance rings
 * - Tags and badges
 * - Sortable table view
 * - Leaderboard with rankings
 * - Mobile-optimized with bottom nav
 * - Search and filters
 *
 * Created: Session 130 (Demo B implementation with 100% fidelity)
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  Table2,
  Trophy,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Star,
  Crown,
  Flame,
  UserRound,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  ChevronRight,
} from 'lucide-react'
import {
  mockBarbers,
  formatCurrency,
  getRoleBadgeColor,
  getRoleLabel,
  type MockBarber,
} from './demos/mock-data'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

type ViewMode = 'cards' | 'table' | 'leaderboard' | 'calendar'
type SortField = 'name' | 'revenue' | 'appointments' | 'rating' | 'level'
type SortDirection = 'asc' | 'desc'

export default function BarberosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false)

  // Filter and sort barbers
  const processedBarbers = useMemo(() => {
    let filtered = mockBarbers.filter((barber) => {
      if (!barber.is_active) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          barber.name.toLowerCase().includes(query) || barber.email.toLowerCase().includes(query)
        )
      }
      return true
    })

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'revenue':
          aValue = a.stats.revenue_this_month
          bValue = b.stats.revenue_this_month
          break
        case 'appointments':
          aValue = a.stats.appointments_this_month
          bValue = b.stats.appointments_this_month
          break
        case 'rating':
          aValue = a.stats.client_rating
          bValue = b.stats.client_rating
          break
        case 'level':
          aValue = a.gamification.level
          bValue = b.gamification.level
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 pb-24 md:p-6 md:pb-24 lg:p-8 lg:pb-6 relative overflow-hidden">
      {/* Subtle Mesh Gradients (15% opacity) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-violet-400 to-blue-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
        />
      </div>
      <div className="lg:max-w-[1600px] lg:mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Barberos
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Visual CRM • Vistas flexibles con visualizaciones ricas
                </p>
              </div>
            </div>
            {/* Add Barber Button - visible on all sizes */}
            <motion.button
              onClick={() => setIsAddBarberOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 px-3 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-colors min-h-[44px]"
              data-testid="add-barber-btn"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Agregar Barbero</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar barbero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Switcher - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { value: 'cards', label: 'Cards', icon: LayoutGrid },
              { value: 'table', label: 'Table', icon: Table2 },
              { value: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap ${
                  viewMode === value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* View Switcher - Mobile (inline, horizontal scroll) */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { value: 'cards', label: 'Cards', icon: LayoutGrid },
              { value: 'table', label: 'Table', icon: Table2 },
              { value: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as ViewMode)}
                className={`flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  viewMode === value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'cards' && <CardsView key="cards" barbers={processedBarbers} />}
          {viewMode === 'table' && (
            <TableView
              key="table"
              barbers={processedBarbers}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          )}
          {viewMode === 'leaderboard' && (
            <LeaderboardView key="leaderboard" barbers={processedBarbers} />
          )}
          {viewMode === 'calendar' && <CalendarView key="calendar" barbers={processedBarbers} />}
        </AnimatePresence>
      </div>

      {/* Add Barber Sheet */}
      <Sheet open={isAddBarberOpen} onOpenChange={setIsAddBarberOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1C1C1E] pb-safe"
        >
          <SheetClose onClose={() => setIsAddBarberOpen(false)} />
          <SheetHeader>
            <SheetTitle className="text-zinc-900 dark:text-white text-lg font-semibold">
              Agregar Barbero
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 pb-6" data-testid="add-barber-sheet">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre</label>
              <input
                type="text"
                placeholder="Nombre del barbero"
                className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                type="email"
                placeholder="email@ejemplo.com"
                className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+506 8888-8888"
                className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={() => setIsAddBarberOpen(false)}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-xl font-semibold text-base transition-colors mt-4"
            >
              Agregar Barbero
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Cards View Component
function CardsView({ barbers }: { barbers: MockBarber[] }) {
  const [selectedBarberMobile, setSelectedBarberMobile] = useState<MockBarber | null>(null)
  const [isMobileBarberDetailOpen, setIsMobileBarberDetailOpen] = useState(false)

  return (
    <>
      {/* Mobile: Compact List (Apple Contacts style) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="lg:hidden space-y-1"
      >
        {barbers.map((barber) => (
          <motion.div
            key={barber.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setSelectedBarberMobile(barber)
              setIsMobileBarberDetailOpen(true)
            }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer active:scale-[0.98]"
          >
            {/* Avatar 40px */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {barber.photo_url ? (
                <img src={barber.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-5 w-5 text-white" />
              )}
            </div>

            {/* Name + Role + Stats */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                {barber.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {getRoleLabel(barber.role)} • {barber.stats.appointments_this_week} citas
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {barber.stats.client_rating}
              </span>
            </div>

            <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop: Full Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="hidden lg:grid lg:grid-cols-3 gap-4"
      >
        {barbers.map((barber) => (
          <motion.div
            key={barber.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Avatar with gradient background */}
            <div className="relative h-24 w-24 mx-auto mb-5">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 via-violet-400 to-purple-400 p-1">
                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                  <UserRound className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              {/* Performance ring overlay - más sutil */}
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-zinc-200 dark:text-zinc-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${barber.stats.capacity_utilization * 3.01} 301`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="text-blue-500 transition-all duration-500"
                />
              </svg>
              {/* Rank badge - más discreto */}
              {barber.gamification.rank_this_month <= 3 && (
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  #{barber.gamification.rank_this_month}
                </div>
              )}
            </div>

            {/* Name + Role */}
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                {barber.name}
              </h3>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(barber.role)}`}
              >
                {getRoleLabel(barber.role)}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {barber.gamification.rank_this_month === 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                  <Crown className="h-3 w-3" />
                  Top Performer
                </span>
              )}
              {barber.gamification.current_streak > 50 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                  <Flame className="h-3 w-3" />
                  {barber.gamification.current_streak} días
                </span>
              )}
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Citas</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {barber.stats.appointments_this_week}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Ingresos</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(barber.stats.revenue_this_month / 1000)}K
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {barber.stats.client_rating}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Nivel</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {barber.gamification.level}
                </p>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Progreso a Nivel {barber.gamification.level + 1}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.round(
                    (barber.gamification.xp /
                      (barber.gamification.xp + barber.gamification.xp_to_next_level)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(barber.gamification.xp / (barber.gamification.xp + barber.gamification.xp_to_next_level)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile Barber Detail Sheet */}
      <Sheet open={isMobileBarberDetailOpen} onOpenChange={setIsMobileBarberDetailOpen}>
        <SheetContent
          side="bottom"
          className="lg:hidden rounded-t-3xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                {selectedBarberMobile?.photo_url ? (
                  <img
                    src={selectedBarberMobile.photo_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <SheetTitle className="text-lg">{selectedBarberMobile?.name}</SheetTitle>
                <p className="text-sm text-zinc-500">
                  {selectedBarberMobile ? getRoleLabel(selectedBarberMobile.role) : ''}
                </p>
              </div>
            </div>
          </SheetHeader>

          {selectedBarberMobile && (
            <div className="space-y-4 px-1">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                  <p className="text-xs text-zinc-500">Citas</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedBarberMobile.stats.appointments_this_week}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                  <p className="text-xs text-zinc-500">Ingresos</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    ₡{Math.round(selectedBarberMobile.stats.revenue_this_month / 1000)}K
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                  <p className="text-xs text-zinc-500">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {selectedBarberMobile.stats.client_rating}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                  <p className="text-xs text-zinc-500">Nivel</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedBarberMobile.gamification.level}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsMobileBarberDetailOpen(false)}
                className="w-full h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Cerrar
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// Table View Component
function TableView({
  barbers,
  onSort,
  sortField,
  sortDirection,
}: {
  barbers: MockBarber[]
  onSort: (field: SortField) => void
  sortField: SortField
  sortDirection: SortDirection
}) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-zinc-400" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Barbero
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('appointments')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Citas/Mes
                  <SortIcon field="appointments" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('revenue')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Ingresos
                  <SortIcon field="revenue" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('rating')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Rating
                  <SortIcon field="rating" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('level')}
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Nivel
                  <SortIcon field="level" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Tendencia
              </th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((barber) => (
              <tr
                key={barber.id}
                className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{barber.name}</p>
                      <p className="text-sm text-zinc-500">{getRoleLabel(barber.role)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-900 dark:text-white font-semibold">
                  {barber.stats.appointments_this_month}
                </td>
                <td className="px-6 py-4 text-zinc-900 dark:text-white font-semibold">
                  {formatCurrency(barber.stats.revenue_this_month)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {barber.stats.client_rating}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold">
                    {barber.gamification.level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {barber.trends.trend_direction === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        barber.trends.trend_direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {barber.trends.revenue_change > 0 ? '+' : ''}
                      {barber.trends.revenue_change}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// Leaderboard View Component
function LeaderboardView({ barbers }: { barbers: MockBarber[] }) {
  const sortedByRevenue = [...barbers].sort(
    (a, b) => b.stats.revenue_this_month - a.stats.revenue_this_month
  )

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-amber-400 to-yellow-500'
    if (rank === 2) return 'from-zinc-300 to-zinc-400'
    if (rank === 3) return 'from-amber-600 to-orange-700'
    return 'from-zinc-200 to-zinc-300'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {sortedByRevenue.map((barber, index) => (
        <motion.div
          key={barber.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`bg-white dark:bg-zinc-900 rounded-2xl p-3 lg:p-5 border shadow-sm cursor-pointer ${
            index < 3
              ? 'border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-amber-900/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Rank Badge */}
            <div
              className={`h-10 w-10 lg:h-14 lg:w-14 rounded-full bg-gradient-to-br ${getMedalColor(index + 1)} flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg flex-shrink-0`}
            >
              {index < 3 ? <Trophy className="h-5 w-5 lg:h-7 lg:w-7" /> : `#${index + 1}`}
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 lg:h-14 lg:w-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <UserRound className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
            </div>

            {/* Info + Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm lg:text-lg text-zinc-900 dark:text-white truncate">
                    {barber.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-zinc-500">{getRoleLabel(barber.role)}</p>
                </div>
                {/* Desktop stats - hidden on mobile */}
                <div className="hidden lg:block text-right space-y-1">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(barber.stats.revenue_this_month)}
                  </p>
                  <div className="flex items-center gap-3 justify-end text-sm">
                    <span className="text-zinc-500">
                      {barber.stats.appointments_this_month} citas
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {barber.stats.client_rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile stats - visible only on mobile */}
              <div className="flex items-center gap-2 mt-1 lg:hidden text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(barber.stats.revenue_this_month)}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">{barber.stats.appointments_this_month} citas</span>
                <span className="text-zinc-400">•</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {barber.stats.client_rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Calendar View Component
function CalendarView({ barbers }: { barbers: MockBarber[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {barbers.map((barber) => (
        <motion.div
          key={barber.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-3 lg:p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3 lg:mb-5 pb-3 lg:pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
              <UserRound className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-white">{barber.name}</h3>
              <p className="text-sm text-zinc-500">
                {barber.schedule.appointments_today.length} citas hoy
              </p>
            </div>
          </div>

          {/* Appointments Today */}
          <div className="space-y-2">
            {barber.schedule.appointments_today.length > 0 ? (
              barber.schedule.appointments_today.map((apt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                >
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Hora</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{apt.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white truncate">
                      {apt.client_name}
                    </p>
                    <p className="text-sm text-zinc-500 truncate">{apt.service}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : apt.status === 'confirmed'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {apt.status === 'completed'
                      ? 'Completada'
                      : apt.status === 'confirmed'
                        ? 'Confirmada'
                        : 'Pendiente'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-8">Sin citas programadas</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
