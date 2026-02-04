'use client'

/* eslint-disable react-hooks/static-components */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  X,
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  Crown,
  Star,
  UserPlus,
  User,
  Phone,
  Mail,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Target,
  Sparkles,
  ChevronRight,
  Scissors,
  Heart,
  Clock,
  Zap,
  Activity,
  Award,
  CheckCircle2,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from 'lucide-react'
import {
  mockClients,
  mockStats,
  mockRevenueData,
  mockVisitFrequency,
  type MockClient,
} from '../mock-data'
import { formatCurrency } from '@/lib/utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  formatDistanceToNow,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type ViewMode = 'dashboard' | 'cards' | 'table' | 'calendar'
type SegmentType = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'
type InsightType = 'churn' | 'winback' | 'upsell'

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

// Loyalty Ring Component (from B)
function LoyaltyRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 16
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-200 dark:text-zinc-700"
        />
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

// Relationship Strength (from C)
function RelationshipStrength({ score }: { score: number }) {
  const bars = Math.ceil(score / 25)
  return (
    <div className="flex items-center gap-1">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`h-4 w-1 rounded-full ${
            i < bars
              ? score >= 75
                ? 'bg-green-500'
                : score >= 50
                  ? 'bg-blue-500'
                  : score >= 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
              : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

// Spending Tier (from B)
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

// Activity Item (from C)
function ActivityItem({
  type,
  date,
  details,
}: {
  type: 'visit' | 'message' | 'note'
  date: Date
  details: string
}) {
  const icons = {
    visit: { icon: Scissors, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    message: {
      icon: MessageCircle,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    note: { icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  }
  const Icon = icons[type].icon
  return (
    <div className="flex gap-3">
      <div className={`rounded-full ${icons[type].bg} p-2 shrink-0`}>
        <Icon className={`h-4 w-4 ${icons[type].color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-zinc-900 dark:text-white">{details}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {formatDistanceToNow(date, { addSuffix: true, locale: es })}
        </p>
      </div>
    </div>
  )
}

export default function PreviewFusionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedSegment, setSelectedSegment] = useState<SegmentType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(true)
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<InsightType | null>('churn')
  const [sortColumn, setSortColumn] = useState<
    'name' | 'segment' | 'tier' | 'loyalty' | 'spent' | 'visits' | null
  >(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Smart notifications (from C)
  const notifications = mockClients
    .filter((c) => {
      const daysSinceVisit = Math.floor(
        (new Date().getTime() - new Date(c.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      return (
        (c.segment === 'vip' && daysSinceVisit > 21) ||
        (c.segment === 'frequent' && daysSinceVisit > 30) ||
        (c.segment === 'inactive' && daysSinceVisit > 45 && c.total_visits >= 3)
      )
    })
    .slice(0, 5)

  // AI Insights (from A)
  const churnRiskClients = mockClients
    .filter((c) => (c.churn_risk || 0) >= 50)
    .sort((a, b) => (b.churn_risk || 0) - (a.churn_risk || 0))
    .slice(0, 8)

  const winbackClients = mockClients
    .filter((c) => c.segment === 'inactive' && c.total_visits >= 3)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 12)

  const upsellCandidates = mockClients
    .filter((c) => c.segment === 'frequent' && c.total_visits >= 3)
    .sort((a, b) => b.total_visits - a.total_visits)
    .slice(0, 5)

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    let result = [...mockClients]

    // Filter by segment
    if (selectedSegment !== 'all') {
      result = result.filter((c) => c.segment === selectedSegment)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email?.toLowerCase().includes(query)
      )
    }

    // Sort by column
    if (sortColumn) {
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortColumn) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'segment':
            aValue = a.segment
            bValue = b.segment
            break
          case 'tier':
            aValue = a.total_spent
            bValue = b.total_spent
            break
          case 'loyalty':
            aValue = a.loyalty_progress || 0
            bValue = b.loyalty_progress || 0
            break
          case 'spent':
            aValue = a.total_spent
            bValue = b.total_spent
            break
          case 'visits':
            aValue = a.total_visits
            bValue = b.total_visits
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [selectedSegment, searchQuery, sortColumn, sortDirection])

  // Segment pie data (from A)
  const segmentPieData = [
    { name: 'VIP', value: mockStats.segments.vip, color: '#F59E0B' },
    { name: 'Frecuente', value: mockStats.segments.frequent, color: '#3B82F6' },
    { name: 'Nuevo', value: mockStats.segments.new, color: '#22C55E' },
    { name: 'Inactivo', value: mockStats.segments.inactive, color: '#6B7280' },
  ]

  // Calendar data (from B)
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

  // Generate timeline (from C)
  const generateTimeline = (client: MockClient) => {
    const timeline = []
    const lastVisit = new Date(client.last_visit_at)
    timeline.push({
      type: 'visit' as const,
      date: lastVisit,
      details: `Servicio: ${client.favorite_service || 'Corte Regular'} - ${formatCurrency(8000)}`,
    })
    if (client.total_visits >= 2) {
      timeline.push({
        type: 'visit' as const,
        date: subDays(lastVisit, client.avg_days_between_visits || 14),
        details: `Servicio: ${client.favorite_service || 'Corte Simple'} - ${formatCurrency(7500)}`,
      })
    }
    if (client.notes) {
      timeline.push({
        type: 'note' as const,
        date: subDays(lastVisit, 60),
        details: `Nota agregada: "${client.notes}"`,
      })
    }
    return timeline
  }

  // Handle sort
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort indicator component
  const SortIndicator = ({ column }: { column: typeof sortColumn }) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-500" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-500" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Clientes</h1>
              <p className="text-xs text-zinc-500">Demo Fusion (A+B+C)</p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notifications.length}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6">
        {/* Smart Notifications Banner (from C) */}
        <AnimatePresence>
          {showNotifications && notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Acciones Sugeridas
                    </h3>
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      {notifications.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {notifications.slice(0, 3).map((client) => {
                    const daysSinceVisit = Math.floor(
                      (new Date().getTime() - new Date(client.last_visit_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-xs font-semibold text-orange-700 dark:text-orange-300 shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-zinc-500">{daysSinceVisit}d sin visita</p>
                          </div>
                        </div>
                        <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors shrink-0">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Switcher + Segment Filter (from B) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-sm border border-zinc-200 dark:border-zinc-800">
            {[
              { mode: 'dashboard' as ViewMode, icon: BarChart3, label: 'Dashboard' },
              { mode: 'cards' as ViewMode, icon: LayoutGrid, label: 'Cards' },
              { mode: 'table' as ViewMode, icon: TableIcon, label: 'Table' },
              { mode: 'calendar' as ViewMode, icon: CalendarIcon, label: 'Calendar' },
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
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
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
                  onClick={() => setSelectedSegment(key as SegmentType)}
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

        {/* Dynamic Content Based on View Mode */}
        <AnimatePresence mode="wait">
          {/* DASHBOARD VIEW (from A) */}
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Ingresos Totales
                      </p>
                      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(mockStats.totalRevenue)}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          +12.5%
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-green-500/10 p-3">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Clientes Activos
                      </p>
                      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                        {mockStats.activeClients}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">+8</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-blue-500/10 p-3">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Riesgo Alto
                      </p>
                      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                        {mockStats.churnRisk.high}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          Acción requerida
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-orange-500/10 p-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Valor Promedio
                      </p>
                      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(mockStats.avgValue)}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-red-600 dark:text-red-400">-3.2%</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-purple-500/10 p-3">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                    Tendencia de Ingresos
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Segment Distribution */}
                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                    Distribución
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={segmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {segmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {segmentPieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visit Frequency Chart */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Frecuencia de Visitas
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={mockVisitFrequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="range" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {mockVisitFrequency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insights Section (Expandible) */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                <div className="rounded-xl bg-white dark:bg-zinc-900 p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Insights Inteligentes
                      </h3>
                      <p className="text-sm text-zinc-500">Acciones recomendadas por IA</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedInsight('churn')}
                      className={`rounded-xl p-4 text-left transition-all ${
                        selectedInsight === 'churn'
                          ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500'
                          : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          Riesgo de Pérdida
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {churnRiskClients.length}
                      </p>
                      <p className="text-xs text-zinc-500">clientes en riesgo</p>
                    </button>

                    <button
                      onClick={() => setSelectedInsight('winback')}
                      className={`rounded-xl p-4 text-left transition-all ${
                        selectedInsight === 'winback'
                          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                          : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          Recuperación
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {winbackClients.length}
                      </p>
                      <p className="text-xs text-zinc-500">recuperables</p>
                    </button>

                    <button
                      onClick={() => setSelectedInsight('upsell')}
                      className={`rounded-xl p-4 text-left transition-all ${
                        selectedInsight === 'upsell'
                          ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                          : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          Upsell VIP
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {upsellCandidates.length}
                      </p>
                      <p className="text-xs text-zinc-500">candidatos</p>
                    </button>
                  </div>

                  {selectedInsight && (
                    <div className="space-y-2">
                      {selectedInsight === 'churn' &&
                        churnRiskClients.slice(0, 4).map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-sm font-semibold text-orange-700 dark:text-orange-300">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                  {client.name}
                                </p>
                                <p className="text-xs text-zinc-500">{client.churn_risk}% riesgo</p>
                              </div>
                            </div>
                            <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      {selectedInsight === 'winback' &&
                        winbackClients.slice(0, 4).map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white text-sm">
                                  {client.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {formatCurrency(client.total_spent)}
                                </p>
                              </div>
                            </div>
                            <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      {selectedInsight === 'upsell' &&
                        upsellCandidates.map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-sm font-semibold text-green-700 dark:text-green-300">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                  {client.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {client.total_visits} visitas • {client.loyalty_progress}% lealtad
                                </p>
                              </div>
                            </div>
                            <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                              <Crown className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CARDS VIEW (from B + C) - Master-Detail */}
          {viewMode === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Client List */}
              <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredClients.slice(0, 20).map((client) => {
                  const config = segmentConfig[client.segment]
                  const Icon = config.icon
                  const isSelected = selectedClient?.id === client.id
                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : `${config.borderColor} ${config.bgColor} hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-lg font-bold text-zinc-600 dark:text-zinc-300">
                            {client.name.charAt(0)}
                          </div>
                          {client.segment === 'vip' && (
                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-1">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-zinc-900 dark:text-white truncate">
                              {client.name}
                            </p>
                            <RelationshipStrength score={client.loyalty_progress || 0} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon className="h-3 w-3" style={{ color: config.color }} />
                            <span className="text-xs text-zinc-500">{config.label}</span>
                          </div>
                        </div>
                        <LoyaltyRing progress={client.loyalty_progress || 0} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-zinc-500">Gastado</p>
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
                      <div className="mt-2">
                        <SpendingTier amount={client.total_spent} />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Detail Panel (from C) */}
              <div className="lg:col-span-2">
                {selectedClient ? (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                              {selectedClient.name.charAt(0)}
                            </div>
                            {selectedClient.segment === 'vip' && (
                              <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1.5">
                                <Crown className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                              {selectedClient.name}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                              <div
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: `${
                                    segmentConfig[selectedClient.segment].color
                                  }15`,
                                  color: segmentConfig[selectedClient.segment].color,
                                }}
                              >
                                {segmentConfig[selectedClient.segment].label}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-zinc-500">
                                <RelationshipStrength
                                  score={selectedClient.loyalty_progress || 0}
                                />
                                <span className="ml-1">
                                  {selectedClient.loyalty_progress || 0}% engagement
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            <Phone className="h-5 w-5" />
                          </button>
                          <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                            <MessageCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Scissors className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Visitas
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.total_visits}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                              Gastado
                            </p>
                          </div>
                          <p className="text-lg font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(selectedClient.total_spent)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              Frecuencia
                            </p>
                          </div>
                          <p className="text-xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.avg_days_between_visits || 'N/A'}d
                          </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              Lealtad
                            </p>
                          </div>
                          <p className="text-xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.loyalty_progress || 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          Historial de Actividad
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {generateTimeline(selectedClient).map((item, i) => (
                          <ActivityItem key={i} {...item} />
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-zinc-900 dark:text-white">
                            Próxima Visita
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedClient.avg_days_between_visits
                            ? `En ${Math.max(
                                0,
                                selectedClient.avg_days_between_visits -
                                  Math.floor(
                                    (new Date().getTime() -
                                      new Date(selectedClient.last_visit_at).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )
                              )} días`
                            : 'Datos insuficientes'}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-4 border ${
                          (selectedClient.churn_risk || 0) >= 50
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap
                            className={`h-5 w-5 ${
                              (selectedClient.churn_risk || 0) >= 50
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          />
                          <h4 className="font-semibold text-zinc-900 dark:text-white">
                            Riesgo de Pérdida
                          </h4>
                        </div>
                        <p
                          className={`text-2xl font-bold ${
                            (selectedClient.churn_risk || 0) >= 50
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {selectedClient.churn_risk || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-center">
                      <User className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                      <p className="mt-4 text-zinc-500">Selecciona un cliente para ver su perfil</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TABLE VIEW (from B) */}
          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          Cliente
                          <SortIndicator column="name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('segment')}
                          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          Segmento
                          <SortIndicator column="segment" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('tier')}
                          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          Tier
                          <SortIndicator column="tier" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('loyalty')}
                          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          Lealtad
                          <SortIndicator column="loyalty" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSort('spent')}
                          className="flex items-center justify-end gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto"
                        >
                          Gastado
                          <SortIndicator column="spent" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSort('visits')}
                          className="flex items-center justify-end gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto"
                        >
                          Visitas
                          <SortIndicator column="visits" />
                        </button>
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
                              <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden max-w-[100px]">
                                <div
                                  className={`h-full rounded-full ${
                                    (client.loyalty_progress || 0) >= 80
                                      ? 'bg-green-500'
                                      : (client.loyalty_progress || 0) >= 50
                                        ? 'bg-blue-500'
                                        : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${client.loyalty_progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
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

          {/* CALENDAR VIEW (from B) */}
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
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-zinc-500 pb-2">
                    {day}
                  </div>
                ))}
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
                      className={`aspect-square rounded-lg ${intensity} flex items-center justify-center text-xs font-medium text-zinc-900 dark:text-white hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer`}
                      title={`${format(date, 'dd MMM', {
                        locale: es,
                      })}: ${count} visitas`}
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
        </AnimatePresence>
      </div>
    </div>
  )
}
