'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  Crown,
  Star,
  UserPlus,
  User,
  Users,
  Phone,
  Mail,
  MessageCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
  DollarSign,
} from 'lucide-react'
import { mockClients, mockStats, type MockClient } from '../mock-data'
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

type ViewMode = 'cards' | 'table' | 'calendar' | 'stats'

const segmentConfig = {
  vip: {
    label: 'VIP',
    color: '#F59E0B',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: Crown,
  },
  frequent: {
    label: 'Frecuente',
    color: '#3B82F6',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: Star,
  },
  new: {
    label: 'Nuevo',
    color: '#22C55E',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-600 dark:text-green-400',
    icon: UserPlus,
  },
  inactive: {
    label: 'Inactivo',
    color: '#6B7280',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/20',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
    textColor: 'text-zinc-500',
    icon: User,
  },
}

// Loyalty progress ring component
function LoyaltyRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 16
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={
            progress >= 80 ? 'text-green-500' : progress >= 50 ? 'text-blue-500' : 'text-orange-500'
          }
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-zinc-900 dark:text-white">{progress}%</span>
      </div>
    </div>
  )
}

// Spending tier badge
function SpendingTier({ amount }: { amount: number }) {
  let tier = 'Bronce'
  let color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'

  if (amount >= 100000) {
    tier = 'Platino'
    color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  } else if (amount >= 50000) {
    tier = 'Oro'
    color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  } else if (amount >= 25000) {
    tier = 'Plata'
    color = 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/30 dark:text-zinc-400'
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      <Award className="h-3 w-3" />
      {tier}
    </div>
  )
}

export default function PreviewBPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedSegment, setSelectedSegment] = useState<
    'all' | 'vip' | 'frequent' | 'new' | 'inactive'
  >('all')

  const filteredClients =
    selectedSegment === 'all'
      ? mockClients
      : mockClients.filter((c) => c.segment === selectedSegment)

  // Calendar data - visits per day this month
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const visitsPerDay = daysInMonth.map((day) => {
    const count = mockClients.filter((client) => {
      const lastVisit = new Date(client.last_visit_at)
      return format(lastVisit, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    }).length
    return { date: day, count }
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Clientes Canvas
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Demo B: Visual CRM Canvas (Notion-style)</p>
          </div>
        </div>

        {/* View Switcher + Segment Filter */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* View Mode */}
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-sm border border-zinc-200 dark:border-zinc-800">
            {[
              { mode: 'cards' as ViewMode, icon: LayoutGrid, label: 'Cards' },
              { mode: 'table' as ViewMode, icon: TableIcon, label: 'Table' },
              {
                mode: 'calendar' as ViewMode,
                icon: CalendarIcon,
                label: 'Calendar',
              },
              { mode: 'stats' as ViewMode, icon: BarChart3, label: 'Stats' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSegment('all')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedSegment === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Todos ({mockStats.totalClients})
            </button>
            {Object.entries(segmentConfig).map(([key, config]) => {
              const Icon = config.icon
              const count = mockStats.segments[key as keyof typeof mockStats.segments]
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSegment(key as typeof selectedSegment)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                    selectedSegment === key
                      ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span>({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {/* Cards View */}
          {viewMode === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredClients.slice(0, 12).map((client) => {
                const config = segmentConfig[client.segment]
                const Icon = config.icon
                return (
                  <motion.div
                    key={client.id}
                    layout
                    className={`group relative overflow-hidden rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                  >
                    {/* Drag indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-0.5">
                        <div className="h-0.5 w-4 rounded-full bg-zinc-400" />
                        <div className="h-0.5 w-4 rounded-full bg-zinc-400" />
                        <div className="h-0.5 w-4 rounded-full bg-zinc-400" />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Avatar + Loyalty Ring */}
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-lg font-bold text-zinc-600 dark:text-zinc-300">
                          {client.name.charAt(0)}
                        </div>
                        {client.segment === 'vip' && (
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                          {client.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Icon className="h-3 w-3" />
                          <span className="text-xs text-zinc-500">{config.label}</span>
                        </div>
                      </div>

                      {/* Loyalty Progress */}
                      <LoyaltyRing progress={client.loyalty_progress || 0} />
                    </div>

                    {/* Stats Row */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-zinc-500">Total Gastado</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(client.total_spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Visitas</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {client.total_visits}
                        </p>
                      </div>
                    </div>

                    {/* Spending Tier */}
                    <div className="mt-3">
                      <SpendingTier amount={client.total_spent} />
                    </div>

                    {/* Contact */}
                    <div className="mt-3 flex items-center gap-2">
                      <a
                        href={`tel:${client.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        Llamar
                      </a>
                      <button className="flex items-center justify-center rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Last Visit Badge */}
                    <div className="mt-3 text-xs text-zinc-500">
                      Última visita:{' '}
                      {format(new Date(client.last_visit_at), 'dd MMM', {
                        locale: es,
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Segmento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Tier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Lealtad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Gastado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Visitas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Última Visita
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredClients.slice(0, 20).map((client) => {
                      const config = segmentConfig[client.segment]
                      const Icon = config.icon
                      return (
                        <tr
                          key={client.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white text-sm">
                                  {client.name}
                                </p>
                                <p className="text-xs text-zinc-500">{client.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
                            >
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <SpendingTier amount={client.total_spent} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    (client.loyalty_progress || 0) >= 80
                                      ? 'bg-green-500'
                                      : (client.loyalty_progress || 0) >= 50
                                        ? 'bg-blue-500'
                                        : 'bg-orange-500'
                                  }`}
                                  style={{
                                    width: `${client.loyalty_progress || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 w-8 text-right">
                                {client.loyalty_progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {formatCurrency(client.total_spent)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {client.total_visits}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {format(new Date(client.last_visit_at), 'dd MMM', {
                                locale: es,
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <Phone className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Heatmap de Visitas - {format(today, 'MMMM yyyy', { locale: es })}
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-zinc-500 pb-2">
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {visitsPerDay.map(({ date, count }) => {
                  const intensity =
                    count === 0
                      ? 'bg-zinc-100 dark:bg-zinc-800'
                      : count <= 2
                        ? 'bg-green-200 dark:bg-green-900/40'
                        : count <= 5
                          ? 'bg-green-400 dark:bg-green-700/60'
                          : 'bg-green-600 dark:bg-green-500'
                  return (
                    <div
                      key={date.toISOString()}
                      className={`aspect-square rounded-lg ${intensity} flex items-center justify-center text-xs font-medium text-zinc-900 dark:text-white hover:ring-2 hover:ring-inset hover:ring-blue-500 hover:brightness-110 transition-all cursor-pointer`}
                      title={`${format(date, 'dd MMM', { locale: es })}: ${count} visitas`}
                    >
                      {format(date, 'd')}
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-zinc-500">Menos</span>
                <div className="flex gap-1">
                  {[
                    'bg-zinc-100 dark:bg-zinc-800',
                    'bg-green-200 dark:bg-green-900/40',
                    'bg-green-400 dark:bg-green-700/60',
                    'bg-green-600 dark:bg-green-500',
                  ].map((color, i) => (
                    <div key={i} className={`h-4 w-4 rounded ${color}`} />
                  ))}
                </div>
                <span className="text-sm text-zinc-500">Más</span>
              </div>
            </motion.div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Clientes',
                    value: mockStats.totalClients,
                    icon: Users,
                    color: 'blue',
                  },
                  {
                    label: 'Ingresos Totales',
                    value: formatCurrency(mockStats.totalRevenue),
                    icon: DollarSign,
                    color: 'green',
                  },
                  {
                    label: 'Valor Promedio',
                    value: formatCurrency(mockStats.avgValue),
                    icon: Target,
                    color: 'purple',
                  },
                  {
                    label: 'Activos (30d)',
                    value: mockStats.activeClients,
                    icon: Zap,
                    color: 'orange',
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={i}
                      className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl bg-${stat.color}-500/10 p-3`}>
                          <Icon
                            className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">{stat.label}</p>
                          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Segments Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(segmentConfig).map(([key, config]) => {
                  const Icon = config.icon
                  const count = mockStats.segments[key as keyof typeof mockStats.segments]
                  const percentage = Math.round((count / mockStats.totalClients) * 100)
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-6 shadow-sm`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className={`h-6 w-6 ${config.textColor}`} />
                        <h4 className="font-semibold text-zinc-900 dark:text-white">
                          {config.label}
                        </h4>
                      </div>
                      <p className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                        {count}
                      </p>
                      <p className="text-sm text-zinc-500">{percentage}% del total</p>
                      <div className="mt-4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full`}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
