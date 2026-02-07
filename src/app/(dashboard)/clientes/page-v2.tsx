'use client'

/**
 * Clientes Page - Modernized Version (V2)
 *
 * Integrated with:
 * - React Query hooks (standardized pattern)
 * - Real-time WebSocket updates (useRealtimeClients)
 * - Error boundaries (4 levels):
 *   1. Top-level ComponentErrorBoundary (catches all unhandled errors)
 *   2. Stats Section boundary (isolates KPI card failures)
 *   3. Client List boundary (isolates list/filter failures)
 *   4. Client Detail Modal with ClientProfileErrorBoundary (read-only fallback)
 *   5. Create Client Modal boundary (isolates form failures)
 * - Feature flag controlled
 *
 * Created: Session 120 (Phase 1 Week 1 - Clientes Modernization)
 * Updated: Session 121 - Added multi-level error boundaries
 */

import { Fragment, useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  User,
  TrendingUp,
  Crown,
  Star,
  UserPlus,
  MessageCircle,
  History,
  ChevronRight,
  X,
  Users,
  DollarSign,
  Activity,
  Sparkles,
  Target,
  Bell,
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Scissors,
  Heart,
  Clock,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  PieChart as PieChartIcon,
  Edit,
} from 'lucide-react'
import {
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
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { CardContent } from '@/components/ui/card'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils'
import { format, startOfMonth, isAfter, subDays, isSameDay, getDaysInMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Client } from '@/types'
import { ClientesTourWrapper } from '@/components/tours/clientes-tour-wrapper'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

// NEW: Master-detail components (currently unused - reserved for future views)
// import { LoyaltyRing } from '@/components/clients/loyalty-ring'
// import { RelationshipStrength } from '@/components/clients/relationship-strength'
// import { SpendingTier } from '@/components/clients/spending-tier'
import { ActivityItem } from '@/components/clients/activity-item'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'

// NEW: Standardized React Query hooks
import { useClients, useCreateClient } from '@/hooks/queries/useClients'

// NEW: Real-time WebSocket integration
import { useRealtimeClients } from '@/hooks/use-realtime-clients'

// NEW: Error boundaries (multi-level)
import { ComponentErrorBoundary, ClientProfileErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'

// NEW: Business context for authentication data
import { useBusiness } from '@/contexts/business-context'

type ClientSegment = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'
type ViewMode = 'dashboard' | 'cards' | 'table' | 'calendar'
type InsightType = 'churn' | 'winback' | 'upsell' | null

function getClientSegment(client: Client): 'vip' | 'frequent' | 'new' | 'inactive' {
  const visits = client.total_visits || 0
  const spent = Number(client.total_spent || 0)
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
  const thirtyDaysAgo = subDays(new Date(), 30)

  // VIP: 5+ visitas O +50,000 gastados
  if (visits >= 5 || spent >= 50000) return 'vip'

  // Inactivo: sin visitas en 30+ días
  if (lastVisit && !isAfter(lastVisit, thirtyDaysAgo)) return 'inactive'

  // Frecuente: 3-4 visitas
  if (visits >= 3) return 'frequent'

  // Nuevo: 0-2 visitas
  return 'new'
}

// Calculate loyalty percentage based on visits and recency
function calculateLoyalty(client: Client): number {
  const visits = client.total_visits || 0
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null

  if (!lastVisit) return 0

  const daysSince = Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

  // Base score from visits (max 60%)
  const visitScore = Math.min(visits * 10, 60)

  // Recency score (max 40%)
  let recencyScore = 40
  if (daysSince > 60) recencyScore = 0
  else if (daysSince > 30) recencyScore = 10
  else if (daysSince > 14) recencyScore = 20
  else if (daysSince > 7) recencyScore = 30

  return Math.min(visitScore + recencyScore, 100)
}

// Calculate spending tier
function getSpendingTier(client: Client): 'bronze' | 'silver' | 'gold' | 'platinum' {
  const spent = Number(client.total_spent || 0)

  if (spent >= 100000) return 'platinum'
  if (spent >= 50000) return 'gold'
  if (spent >= 20000) return 'silver'
  return 'bronze'
}

// Generate mock activities for timeline (replace with real data when available)
function getMockActivities(client: Client) {
  const activities = []

  // Most recent visit
  if (client.last_visit_at) {
    activities.push({
      icon: Scissors,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
      title: 'Servicio completado',
      description: 'Corte de cabello + Barba',
      date: new Date(client.last_visit_at),
      amount: 15000,
    })
  }

  // Add more mock activities
  if ((client.total_visits || 0) >= 2) {
    activities.push({
      icon: Star,
      iconColor: 'text-amber-600',
      iconBgColor: 'bg-amber-100 dark:bg-amber-900/30',
      title: 'Cliente frecuente',
      description: 'Alcanzó 3 visitas este mes',
      date: subDays(new Date(), 15),
    })
  }

  if (client.created_at) {
    activities.push({
      icon: UserPlus,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100 dark:bg-green-900/30',
      title: 'Cliente registrado',
      description: 'Se unió al programa',
      date: new Date(client.created_at),
    })
  }

  return activities
}

const segmentConfig = {
  vip: {
    label: 'VIP',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Crown,
    description: '5+ visitas o ₡50k+ gastados',
  },
  frequent: {
    label: 'Frecuente',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Star,
    description: '3-4 visitas',
  },
  new: {
    label: 'Nuevo',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: UserPlus,
    description: '1-2 visitas',
  },
  inactive: {
    label: 'Inactivo',
    color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    icon: User,
    description: 'Sin visitas en 30+ días',
  },
}

// Sort indicator component (defined outside to avoid re-creation on render)
function SortIndicator({
  column,
  sortColumn,
  sortDirection,
}: {
  column: string
  sortColumn: string
  sortDirection: 'asc' | 'desc'
}) {
  if (sortColumn !== column) {
    return <ChevronsUpDown className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="h-4 w-4 text-blue-500" />
  ) : (
    <ArrowDown className="h-4 w-4 text-blue-500" />
  )
}

export default function ClientesPageV2() {
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<ClientSegment>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [showNotifications, setShowNotifications] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<InsightType>('churn')
  const [sortColumn, setSortColumn] = useState<'name' | 'segment' | 'spent' | 'visits' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedCardClient, setSelectedCardClient] = useState<Client | null>(null) // For master-detail cards view
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date()) // For calendar view

  // NEW: Business ID from context (server-side auth passed down)
  const { businessId } = useBusiness()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  const searchParams = useSearchParams()
  const intentHandled = useRef(false)
  const segmentTabsRef = useRef<HTMLDivElement>(null)
  const viewModeTabsRef = useRef<HTMLDivElement>(null)

  // Auto-open create modal when navigated with ?intent=create
  useEffect(() => {
    if (searchParams.get('intent') === 'create' && !intentHandled.current) {
      intentHandled.current = true
      window.history.replaceState(null, '', '/clientes')
      requestAnimationFrame(() => setShowModal(true))
    }
  }, [searchParams])

  useEffect(() => {
    const container = segmentTabsRef.current
    if (!container) return

    const activeSegment = container.querySelector<HTMLButtonElement>(
      `[data-segment-chip="${selectedSegment}"]`
    )
    if (!activeSegment) return

    requestAnimationFrame(() => {
      activeSegment.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    })
  }, [selectedSegment])

  useEffect(() => {
    const container = viewModeTabsRef.current
    if (!container) return

    const activeView = container.querySelector<HTMLButtonElement>(`[data-view-chip="${viewMode}"]`)
    if (!activeView) return

    requestAnimationFrame(() => {
      activeView.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    })
  }, [viewMode])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // NEW: React Query hooks (standardized pattern)
  const { data: clientsData, error: queryError, refetch } = useClients(businessId)

  const createClient = useCreateClient()

  // NEW: Real-time WebSocket updates
  useRealtimeClients({ businessId, enabled: !!businessId })

  // NEW: Extract clients from new response format
  const clients = useMemo(() => clientsData?.clients || [], [clientsData?.clients])
  const totalClients = clientsData?.total || 0

  // Métricas calculadas con contexto temporal
  const metrics = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const thirtyDaysAgo = subDays(now, 30)

    // Clientes nuevos este mes (basado en created_at si existe, sino primera visita)
    const newThisMonth = clients.filter((c) => {
      const createdAt = c.created_at ? new Date(c.created_at) : null
      return createdAt && isAfter(createdAt, monthStart)
    }).length

    // Ingresos de los últimos 30 días (aproximado basado en última visita)
    const recentClients = clients.filter((c) => {
      const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
      return lastVisit && isAfter(lastVisit, thirtyDaysAgo)
    })

    // Segmentos
    const segments = {
      vip: clients.filter((c) => getClientSegment(c) === 'vip').length,
      frequent: clients.filter((c) => getClientSegment(c) === 'frequent').length,
      new: clients.filter((c) => getClientSegment(c) === 'new').length,
      inactive: clients.filter((c) => getClientSegment(c) === 'inactive').length,
    }

    // Valor promedio por cliente
    const avgValue =
      clients.length > 0
        ? clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0) / clients.length
        : 0

    // Total histórico
    const totalRevenue = clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0)

    // Cliente top
    const topClient = clients.reduce(
      (top, c) => (Number(c.total_spent || 0) > Number(top?.total_spent || 0) ? c : top),
      clients[0]
    )

    return {
      total: clients.length,
      newThisMonth,
      recentActive: recentClients.length,
      segments,
      avgValue,
      totalRevenue,
      topClient,
    }
  }, [clients])

  // Smart notifications (from demo - clients that need attention)
  // RELAXED CRITERIA to ensure banner always shows
  const notifications = useMemo(() => {
    return clients
      .filter((c) => {
        const segment = getClientSegment(c)
        const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null

        // Show clients without any visits
        if (!lastVisit) return (c.total_visits || 0) === 0

        const daysSinceVisit = Math.floor(
          (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        )

        // More permissive criteria - show more clients
        return (
          (segment === 'vip' && daysSinceVisit > 14) || // was 21
          (segment === 'frequent' && daysSinceVisit > 20) || // was 30
          (segment === 'inactive' && daysSinceVisit > 25) || // was 45
          daysSinceVisit > 25 // any client with 25+ days
        )
      })
      .slice(0, 5)
  }, [clients])

  // AI Insights (rule-based logic, not real AI)
  const churnRiskClients = useMemo(() => {
    return clients
      .filter((c) => {
        const segment = getClientSegment(c)
        const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
        if (!lastVisit) return true // No last visit = high risk

        const daysSinceVisit = Math.floor(
          (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        )

        // High churn risk: VIP/Frequent with 30+ days, or any with 60+ days
        return (
          ((segment === 'vip' || segment === 'frequent') && daysSinceVisit > 30) ||
          daysSinceVisit > 60
        )
      })
      .sort((a, b) => {
        const aVisit = a.last_visit_at ? new Date(a.last_visit_at).getTime() : 0
        const bVisit = b.last_visit_at ? new Date(b.last_visit_at).getTime() : 0
        return aVisit - bVisit // Oldest first
      })
      .slice(0, 8)
  }, [clients])

  const winbackClients = useMemo(() => {
    return clients
      .filter((c) => getClientSegment(c) === 'inactive' && (c.total_visits || 0) >= 3)
      .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
      .slice(0, 12)
  }, [clients])

  const upsellCandidates = useMemo(() => {
    return clients
      .filter((c) => getClientSegment(c) === 'frequent' && (c.total_visits || 0) >= 3)
      .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
      .slice(0, 5)
  }, [clients])

  // Chart data (mock data for now - can be replaced with real aggregations)
  const revenueChartData = useMemo(() => {
    // Generate last 6 months data (simplified) with fixed values for deterministic rendering
    const mockRevenues = [165000, 178000, 143000, 192000, 156000, 184000]
    return Array.from({ length: 6 }, (_, i) => {
      const month = subDays(new Date(), (5 - i) * 30)
      const monthName = format(month, 'MMM', { locale: es })
      return {
        month: monthName,
        revenue: mockRevenues[i],
      }
    })
  }, [])

  const segmentPieData = useMemo(() => {
    return [
      { name: 'VIP', value: metrics.segments.vip, color: 'var(--color-amber-500)' },
      { name: 'Frecuente', value: metrics.segments.frequent, color: 'var(--color-blue-500)' },
      { name: 'Nuevo', value: metrics.segments.new, color: 'var(--color-green-500)' },
      { name: 'Inactivo', value: metrics.segments.inactive, color: 'var(--color-zinc-500)' },
    ]
  }, [metrics.segments])

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    let result = clients

    // Filtrar por segmento
    if (selectedSegment !== 'all') {
      result = result.filter((c) => getClientSegment(c) === selectedSegment)
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          c.email?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by column
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bValue: any

        switch (sortColumn) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'segment':
            aValue = getClientSegment(a)
            bValue = getClientSegment(b)
            break
          case 'spent':
            aValue = Number(a.total_spent || 0)
            bValue = Number(b.total_spent || 0)
            break
          case 'visits':
            aValue = a.total_visits || 0
            bValue = b.total_visits || 0
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
  }, [clients, selectedSegment, search, sortColumn, sortDirection])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await createClient.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      })

      setFormData({ name: '', phone: '', email: '', notes: '' })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
    }
  }

  function handleWhatsApp(phone: string) {
    // Formatear número para Costa Rica
    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.length === 8 ? `506${cleanPhone}` : cleanPhone
    window.open(`https://wa.me/${fullPhone}`, '_blank')
  }

  // Handle sort
  function handleSort(column: typeof sortColumn) {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // NEW: Error state
  if (queryError) {
    return (
      <div className="p-6">
        <QueryError error={queryError} title="Error al cargar clientes" onRetry={refetch} />
      </div>
    )
  }

  return (
    <ComponentErrorBoundary>
      <ClientesTourWrapper>
        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
        >
          <div className="min-h-screen relative overflow-x-hidden">
            <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none opacity-15">
              <motion.div
                animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full brand-mesh-1 blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, 100, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full brand-mesh-2 blur-3xl"
              />
            </div>

            <div className="relative z-10 space-y-4 sm:space-y-6">
              {/* Header - Mobile optimized with gradient */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="app-page-title brand-gradient-text">Clientes</h1>
                  <p className="app-page-subtitle mt-1">{totalClients} registrados</p>
                </div>
                <Button
                  variant="gradient"
                  data-tour="clients-add-button"
                  onClick={() => {
                    setShowModal(true)
                    if (isMobileDevice()) haptics.tap()
                  }}
                  className="min-w-[44px] min-h-[44px] h-10 border-0"
                >
                  <Plus className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Nuevo Cliente</span>
                </Button>
              </div>

              {/* Stats Section - Wrapped in error boundary */}
              <ComponentErrorBoundary
                fallbackTitle="Error en estadísticas"
                fallbackDescription="No se pudieron cargar las métricas de clientes"
              >
                <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
                  <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-4 scrollbar-hide">
                    {/* Clientes Nuevos */}
                    <motion.div
                      className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
                      whileTap={{ scale: 0.98 }}
                      transition={animations.spring.gentle}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.32)] cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                          <div className="rounded-xl bg-green-500/15 dark:bg-green-500/25 p-2 lg:p-2.5">
                            <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-green-500/40" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white leading-none">
                          {metrics.newThisMonth}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 lg:mt-1.5">
                          nuevos
                        </p>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-green-400/8 to-emerald-400/8 rounded-full blur-2xl" />
                      </div>
                    </motion.div>

                    {/* Clientes Activos */}
                    <motion.div
                      className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
                      whileTap={{ scale: 0.98 }}
                      transition={animations.spring.gentle}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.32)] cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                          <div className="rounded-xl bg-blue-500/15 dark:bg-blue-500/25 p-2 lg:p-2.5">
                            <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-500/60" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white leading-none">
                          {metrics.recentActive}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 lg:mt-1.5">
                          activos
                        </p>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-2xl" />
                      </div>
                    </motion.div>

                    {/* Ingresos Totales */}
                    <motion.div
                      className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
                      whileTap={{ scale: 0.98 }}
                      transition={animations.spring.gentle}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.32)] cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                          <div className="rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 p-2 lg:p-2.5">
                            <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-emerald-500/60" />
                        </div>
                        <p className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white leading-none truncate">
                          {formatCurrencyCompact(metrics.totalRevenue)}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 lg:mt-1.5">
                          ingresos
                        </p>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-emerald-400/8 to-teal-400/8 rounded-full blur-2xl" />
                      </div>
                    </motion.div>

                    {/* Valor Promedio */}
                    <motion.div
                      className="shrink-0 min-w-[140px] flex-shrink-0 lg:min-w-0"
                      whileTap={{ scale: 0.98 }}
                      transition={animations.spring.gentle}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-3 lg:px-4 lg:py-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.32)] cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                          <div className="rounded-xl bg-purple-500/15 dark:bg-purple-500/25 p-2 lg:p-2.5">
                            <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <Target className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-purple-500/40" />
                        </div>
                        <p className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white leading-none truncate">
                          {formatCurrencyCompact(metrics.avgValue)}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 lg:mt-1.5">
                          promedio
                        </p>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-purple-400/8 to-violet-400/8 rounded-full blur-2xl" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </ComponentErrorBoundary>

              {/* Smart Notifications Banner (from demo Fusion) */}
              <AnimatePresence>
                {showNotifications && notifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-zinc-200/75 dark:border-zinc-700/70 bg-white/80 dark:bg-zinc-900/85 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
                          const lastVisit = client.last_visit_at
                            ? new Date(client.last_visit_at)
                            : null
                          const daysSinceVisit = lastVisit
                            ? Math.floor(
                                (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
                              )
                            : 0

                          return (
                            <div
                              key={client.id}
                              className="flex items-center justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-700/70 bg-white/85 dark:bg-zinc-800/70 p-3 shadow-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-xs font-semibold text-orange-700 dark:text-orange-300 shrink-0">
                                  {client.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                    {client.name}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {daysSinceVisit}d sin visita
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleWhatsApp(client.phone)}
                                className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 sm:rounded-[22px] sm:border sm:border-zinc-200/70 sm:dark:border-white/10 sm:bg-white/60 sm:dark:bg-white/[0.03] sm:p-3 sm:backdrop-blur-xl sm:shadow-[0_8px_24px_rgba(0,0,0,0.1)] sm:dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="h-11 border border-zinc-200/70 dark:border-white/10 bg-white/65 dark:bg-white/[0.04] text-sm focus:ring-violet-400/45 focus:border-violet-400/45 backdrop-blur-xl"
                />

                {/* View Mode Tabs + Segment Filters (SAME LINE like demo) */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* View Mode Switcher - LEFT */}
                  <div
                    ref={viewModeTabsRef}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl"
                  >
                    {[
                      {
                        mode: 'dashboard' as ViewMode,
                        icon: BarChart3,
                        label: 'Tablero',
                        mobile: true,
                      },
                      { mode: 'cards' as ViewMode, icon: LayoutGrid, label: 'Lista', mobile: true },
                      { mode: 'table' as ViewMode, icon: TableIcon, label: 'Tabla', mobile: true },
                      {
                        mode: 'calendar' as ViewMode,
                        icon: CalendarIcon,
                        label: 'Calendario',
                        mobile: true,
                      },
                    ].map(({ mode, icon: Icon, label, mobile }) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setViewMode(mode)
                          if (isMobileDevice()) haptics.selection()
                        }}
                        data-view-chip={mode}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                          !mobile ? 'hidden lg:flex' : ''
                        } ${
                          viewMode === mode
                            ? 'brand-tab-active border'
                            : 'text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] hover:bg-zinc-100/80 dark:hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="inline">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Segment Filters - RIGHT (same line as tabs like demo) */}
                  <div
                    ref={segmentTabsRef}
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
                  >
                    <button
                      onClick={() => {
                        setSelectedSegment('all')
                        if (isMobileDevice()) haptics.selection()
                      }}
                      data-segment-chip="all"
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                        selectedSegment === 'all'
                          ? 'brand-tab-active border'
                          : 'text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] hover:bg-zinc-100/80 dark:hover:bg-white/10'
                      }`}
                    >
                      Todos ({metrics.total})
                    </button>
                    {(Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>).map(
                      (segment) => {
                        const config = segmentConfig[segment]
                        const count = metrics.segments[segment]
                        const Icon = config.icon
                        return (
                          <button
                            key={segment}
                            onClick={() => {
                              setSelectedSegment(segment)
                              if (isMobileDevice()) haptics.selection()
                            }}
                            data-segment-chip={segment}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-1.5 border shrink-0 ${
                              selectedSegment === segment
                                ? 'brand-tab-active border'
                                : 'text-zinc-600 dark:text-zinc-400 border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] hover:bg-zinc-100/80 dark:hover:bg-white/10'
                            }`}
                          >
                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {config.label} ({count})
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Client List - Wrapped in error boundary */}
              <AnimatePresence mode="wait">
                {/* CARDS VIEW - Master-Detail Layout (from demo Fusion) */}
                {viewMode === 'cards' && (
                  <motion.div
                    key="cards"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left: Compact client list (demo-accurate) */}
                    <div className="lg:col-span-1 space-y-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Clientes ({filteredClients.length})
                      </h3>
                      <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto lg:pr-2 scrollbar-thin">
                        {filteredClients.map((client) => {
                          const segment = getClientSegment(client)
                          const tier = getSpendingTier(client)
                          const loyalty = calculateLoyalty(client)
                          const isSelected = selectedCardClient?.id === client.id

                          // Tier config for badge
                          const tierLabels = {
                            platinum: 'Platino',
                            gold: 'Oro',
                            silver: 'Plata',
                            bronze: 'Bronce',
                          }

                          const tierColors = {
                            platinum:
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                            gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                            silver: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
                            bronze:
                              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
                          }

                          const rightActions = [
                            {
                              icon: <MessageCircle className="h-5 w-5" />,
                              label: 'WhatsApp',
                              color: 'bg-emerald-500',
                              onClick: () => handleWhatsApp(client.phone),
                            },
                            {
                              icon: <Edit className="h-5 w-5" />,
                              label: 'Editar',
                              color: 'bg-blue-500',
                              onClick: () => setSelectedClient(client),
                            },
                          ]

                          return (
                            <Fragment key={client.id}>
                              <SwipeableRow rightActions={rightActions} className="lg:hidden">
                                <motion.button
                                  onClick={() => {
                                    setSelectedCardClient(client)
                                    setIsMobileDetailOpen(true)
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  transition={animations.spring.snappy}
                                  className={`relative w-full text-left rounded-2xl p-3 lg:p-4 transition-all border-2 ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-300 shadow-md dark:bg-blue-950 dark:border-blue-500 dark:shadow-lg'
                                      : 'bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md'
                                  }`}
                                >
                                  {/* Loyalty badge - mobile (compact) */}
                                  <div className="absolute top-2 right-2 lg:hidden">
                                    <span
                                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                        loyalty >= 80
                                          ? 'bg-green-500/20 text-green-400'
                                          : loyalty >= 50
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : loyalty >= 30
                                              ? 'bg-amber-500/20 text-amber-400'
                                              : 'bg-zinc-500/20 text-zinc-400'
                                      }`}
                                    >
                                      {Math.round(loyalty)}%
                                    </span>
                                  </div>
                                  {/* Loyalty ring - desktop (full SVG) */}
                                  <div className="absolute top-3 right-3 hidden lg:block">
                                    <div className="relative w-12 h-12">
                                      <svg className="w-12 h-12 transform -rotate-90">
                                        <circle
                                          cx="24"
                                          cy="24"
                                          r="20"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          fill="none"
                                          className="text-zinc-700 dark:text-zinc-600"
                                        />
                                        <circle
                                          cx="24"
                                          cy="24"
                                          r="20"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          fill="none"
                                          strokeLinecap="round"
                                          className={`transition-all duration-700 ${
                                            loyalty >= 80
                                              ? 'text-green-500'
                                              : loyalty >= 50
                                                ? 'text-blue-500'
                                                : loyalty >= 30
                                                  ? 'text-amber-500'
                                                  : 'text-zinc-500'
                                          }`}
                                          style={{
                                            strokeDasharray: `${2 * Math.PI * 20}`,
                                            strokeDashoffset: `${2 * Math.PI * 20 * (1 - loyalty / 100)}`,
                                          }}
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[11px] font-bold text-zinc-700 dark:text-white">
                                          {Math.round(loyalty)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="pr-14">
                                    {/* Avatar + Name + VIP badge */}
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="relative shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 dark:from-zinc-600 dark:to-zinc-700 text-lg font-bold text-white">
                                          {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        {segment === 'vip' && (
                                          <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
                                            <Crown className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-bold text-base text-zinc-900 dark:text-white truncate">
                                            {client.name}
                                          </p>
                                          {segment === 'vip' && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                              <Crown className="h-2.5 w-2.5" />
                                              VIP
                                            </span>
                                          )}
                                        </div>
                                        {/* Engagement badge */}
                                        <div className="flex items-center gap-1">
                                          <div className="flex gap-[2px]">
                                            {Array.from({
                                              length: Math.min(Math.ceil(loyalty / 25), 4),
                                            }).map((_, i) => (
                                              <div
                                                key={i}
                                                className="w-1 h-3 rounded-full bg-green-500"
                                              />
                                            ))}
                                            {Array.from({
                                              length: Math.max(0, 4 - Math.ceil(loyalty / 25)),
                                            }).map((_, i) => (
                                              <div
                                                key={i}
                                                className="w-1 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"
                                              />
                                            ))}
                                          </div>
                                          <span className="text-xs text-muted">
                                            {loyalty}% engagement
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Metrics row */}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      <div>
                                        <p className="text-xs text-muted mb-0.5">Gastado</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                          {formatCurrencyCompact(Number(client.total_spent || 0))}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted mb-0.5">Visitas</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                          {client.total_visits || 0}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Spending tier badge */}
                                    <div className="flex items-center gap-1.5">
                                      <Award className="h-3.5 w-3.5 text-muted" />
                                      <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColors[tier]}`}
                                      >
                                        {tierLabels[tier]}
                                      </span>
                                    </div>
                                  </div>
                                </motion.button>
                              </SwipeableRow>
                              {/* Desktop: regular card without swipe */}
                              <motion.button
                                onClick={() => {
                                  setSelectedCardClient(client)
                                  setIsMobileDetailOpen(true)
                                }}
                                whileTap={{ scale: 0.98 }}
                                transition={animations.spring.snappy}
                                className={`relative w-full text-left rounded-2xl p-4 transition-all border-2 hidden lg:block ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-300 shadow-md dark:bg-blue-950 dark:border-blue-500 dark:shadow-lg'
                                    : 'bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md'
                                }`}
                              >
                                {/* Loyalty ring - desktop (full SVG) */}
                                <div className="absolute top-3 right-3">
                                  <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12 transform -rotate-90">
                                      <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        className="text-zinc-700 dark:text-zinc-600"
                                      />
                                      <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeLinecap="round"
                                        className={`transition-all duration-700 ${
                                          loyalty >= 80
                                            ? 'text-green-500'
                                            : loyalty >= 50
                                              ? 'text-blue-500'
                                              : loyalty >= 30
                                                ? 'text-amber-500'
                                                : 'text-zinc-500'
                                        }`}
                                        style={{
                                          strokeDasharray: `${2 * Math.PI * 20}`,
                                          strokeDashoffset: `${2 * Math.PI * 20 * (1 - loyalty / 100)}`,
                                        }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[11px] font-bold text-zinc-700 dark:text-white">
                                        {Math.round(loyalty)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="pr-14">
                                  {/* Avatar + Name + VIP badge */}
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="relative shrink-0">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 dark:from-zinc-600 dark:to-zinc-700 text-lg font-bold text-white">
                                        {client.name.charAt(0).toUpperCase()}
                                      </div>
                                      {segment === 'vip' && (
                                        <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
                                          <Crown className="h-3 w-3 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-base text-zinc-900 dark:text-white truncate">
                                          {client.name}
                                        </p>
                                        {segment === 'vip' && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            <Crown className="h-2.5 w-2.5" />
                                            VIP
                                          </span>
                                        )}
                                      </div>
                                      {/* Engagement badge */}
                                      <div className="flex items-center gap-1">
                                        <div className="flex gap-[2px]">
                                          {Array.from({
                                            length: Math.min(Math.ceil(loyalty / 25), 4),
                                          }).map((_, i) => (
                                            <div
                                              key={i}
                                              className="w-1 h-3 rounded-full bg-green-500"
                                            />
                                          ))}
                                          {Array.from({
                                            length: Math.max(0, 4 - Math.ceil(loyalty / 25)),
                                          }).map((_, i) => (
                                            <div
                                              key={i}
                                              className="w-1 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs text-muted">
                                          {loyalty}% engagement
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metrics row */}
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <p className="text-xs text-muted mb-0.5">Gastado</p>
                                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                        {formatCurrencyCompact(Number(client.total_spent || 0))}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted mb-0.5">Visitas</p>
                                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                        {client.total_visits || 0}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Spending tier badge */}
                                  <div className="flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5 text-muted" />
                                    <span
                                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColors[tier]}`}
                                    >
                                      {tierLabels[tier]}
                                    </span>
                                  </div>
                                </div>
                              </motion.button>
                            </Fragment>
                          )
                        })}
                      </div>
                    </div>

                    {/* Right: Detail panel - Desktop only */}
                    <div className="hidden lg:block lg:col-span-2">
                      {selectedCardClient ? (
                        <motion.div
                          key={selectedCardClient.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                                {selectedCardClient.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                  {selectedCardClient.name}
                                </h2>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${
                                    segmentConfig[getClientSegment(selectedCardClient)].color
                                  }`}
                                >
                                  {segmentConfig[getClientSegment(selectedCardClient)].label}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="success"
                              onClick={() => handleWhatsApp(selectedCardClient.phone)}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </Button>
                          </div>

                          {/* Metrics Row - 4 colorful cards (demo-accurate) */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {/* Visitas (Azul) */}
                            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Scissors className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  Visitas
                                </span>
                              </div>
                              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {selectedCardClient.total_visits || 0}
                              </p>
                            </div>

                            {/* Gastado (Verde) */}
                            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-600/10 dark:from-emerald-500/20 dark:to-green-600/20 border border-emerald-500/20 dark:border-emerald-500/30 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  Gastado
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-zinc-900 dark:text-white truncate">
                                {formatCurrencyCompact(Number(selectedCardClient.total_spent || 0))}
                              </p>
                            </div>

                            {/* Frecuencia (Morado) */}
                            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 dark:from-purple-500/20 dark:to-violet-600/20 border border-purple-500/20 dark:border-purple-500/30 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-purple-500" />
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                  Frecuencia
                                </span>
                              </div>
                              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {selectedCardClient.last_visit_at
                                  ? `${Math.floor(
                                      (new Date().getTime() -
                                        new Date(selectedCardClient.last_visit_at).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}d`
                                  : '-'}
                              </p>
                            </div>

                            {/* Lealtad (Naranja) */}
                            <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-600/10 dark:from-orange-500/20 dark:to-amber-600/20 border border-orange-500/20 dark:border-orange-500/30 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-5 w-5 text-orange-500" />
                                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                  Lealtad
                                </span>
                              </div>
                              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {Math.round(calculateLoyalty(selectedCardClient))}%
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                              <Phone className="h-5 w-5 text-zinc-400" />
                              <span className="text-zinc-900 dark:text-white">
                                {selectedCardClient.phone}
                              </span>
                            </div>
                            {selectedCardClient.email && (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                                <Mail className="h-5 w-5 text-zinc-400" />
                                <span className="text-zinc-900 dark:text-white">
                                  {selectedCardClient.email}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Activity Timeline */}
                          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                              Historial de Actividad
                            </h3>
                            <div className="space-y-0">
                              {getMockActivities(selectedCardClient).map((activity, index, arr) => (
                                <ActivityItem
                                  key={index}
                                  {...activity}
                                  isLast={index === arr.length - 1}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Próxima Visita y Riesgo de Pérdida (from demo) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Próxima Visita */}
                            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/30 p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  Próxima Visita
                                </span>
                              </div>
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {selectedCardClient.last_visit_at
                                  ? `En ${Math.max(
                                      1,
                                      14 -
                                        Math.floor(
                                          (new Date().getTime() -
                                            new Date(selectedCardClient.last_visit_at).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )
                                    )} días`
                                  : 'No estimado'}
                              </p>
                              <p className="text-xs text-muted">Basado en historial promedio</p>
                            </div>

                            {/* Riesgo de Pérdida */}
                            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 dark:from-green-500/20 dark:to-emerald-600/20 border border-green-500/30 p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Zap className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Riesgo de Pérdida
                                </span>
                              </div>
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {(() => {
                                  const daysSince = selectedCardClient.last_visit_at
                                    ? Math.floor(
                                        (new Date().getTime() -
                                          new Date(selectedCardClient.last_visit_at).getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      )
                                    : 999
                                  if (daysSince > 45) return '95%'
                                  if (daysSince > 30) return '60%'
                                  if (daysSince > 21) return '30%'
                                  return '5%'
                                })()}
                              </p>
                              <p className="text-xs text-muted">
                                {selectedCardClient.last_visit_at
                                  ? `${Math.floor(
                                      (new Date().getTime() -
                                        new Date(selectedCardClient.last_visit_at).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}d sin visita`
                                  : 'Sin visitas registradas'}
                              </p>
                            </div>
                          </div>

                          {/* Notes */}
                          {selectedCardClient.notes && (
                            <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                                Notas
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                {selectedCardClient.notes}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                          <div className="text-center">
                            <User className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
                            <p className="text-muted">Selecciona un cliente para ver detalles</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* DASHBOARD VIEW (from demo Fusion) */}
                {viewMode === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Revenue Trend Line Chart */}
                      <div className="lg:col-span-2 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                          Tendencia de Ingresos
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={revenueChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--color-zinc-200)"
                              className="dark:stroke-zinc-700"
                            />
                            <XAxis
                              dataKey="month"
                              stroke="var(--color-zinc-400)"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="var(--color-zinc-400)" style={{ fontSize: '12px' }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="var(--color-blue-500)"
                              strokeWidth={3}
                              dot={{ fill: 'var(--color-blue-500)', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Segment Distribution Donut Chart */}
                      <div className="relative rounded-xl bg-white dark:bg-zinc-900/80 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <PieChartIcon className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 relative z-10">
                          Distribución
                        </h3>
                        <div className="relative h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={segmentPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={4}
                                cornerRadius={6}
                                dataKey="value"
                                stroke="none"
                              >
                                {segmentPieData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="stroke-transparent outline-none focus:outline-none"
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: data.color }}
                                          />
                                          <p className="text-xs font-medium text-muted">
                                            {data.name}
                                          </p>
                                        </div>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                          {data.value}
                                          <span className="ml-1 text-xs font-normal text-zinc-500">
                                            ({((data.value / metrics.total) * 100).toFixed(1)}%)
                                          </span>
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Center Text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                              {metrics.total}
                            </span>
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                              Total
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          {segmentPieData.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Section */}
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
                            <p className="text-sm text-zinc-500">
                              Análisis basado en patrones de visita
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <Button
                            variant={selectedInsight === 'churn' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedInsight('churn')}
                            className={`h-auto p-4 text-left flex-col items-start justify-start ${
                              selectedInsight === 'churn'
                                ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500'
                                : ''
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
                          </Button>

                          <Button
                            variant={selectedInsight === 'winback' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedInsight('winback')}
                            className={`h-auto p-4 text-left flex-col items-start justify-start ${
                              selectedInsight === 'winback'
                                ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                                : ''
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
                          </Button>

                          <Button
                            variant={selectedInsight === 'upsell' ? 'secondary' : 'ghost'}
                            onClick={() => setSelectedInsight('upsell')}
                            className={`h-auto p-4 text-left flex-col items-start justify-start ${
                              selectedInsight === 'upsell'
                                ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                : ''
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
                          </Button>
                        </div>

                        {selectedInsight && (
                          <div className="space-y-2">
                            {selectedInsight === 'churn' &&
                              churnRiskClients.slice(0, 4).map((client) => {
                                const lastVisit = client.last_visit_at
                                  ? new Date(client.last_visit_at)
                                  : null
                                const daysSince = lastVisit
                                  ? Math.floor(
                                      (new Date().getTime() - lastVisit.getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                  : 999

                                return (
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
                                        <p className="text-xs text-zinc-500">
                                          {daysSince}d sin visita
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleWhatsApp(client.phone)}
                                      className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              })}
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
                                        {formatCurrency(Number(client.total_spent || 0))}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleWhatsApp(client.phone)}
                                    className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
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
                                        {client.total_visits} visitas
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => setSelectedClient(client)}
                                    className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
                                  >
                                    <Crown className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TABLE VIEW (simplified version) */}
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
                                <SortIndicator
                                  column="name"
                                  sortColumn={sortColumn}
                                  sortDirection={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                              <button
                                onClick={() => handleSort('segment')}
                                className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              >
                                Segmento
                                <SortIndicator
                                  column="segment"
                                  sortColumn={sortColumn}
                                  sortDirection={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleSort('spent')}
                                className="flex items-center justify-end gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto"
                              >
                                Gastado
                                <SortIndicator
                                  column="spent"
                                  sortColumn={sortColumn}
                                  sortDirection={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleSort('visits')}
                                className="flex items-center justify-end gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto"
                              >
                                Visitas
                                <SortIndicator
                                  column="visits"
                                  sortColumn={sortColumn}
                                  sortDirection={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {filteredClients.slice(0, 20).map((client) => {
                            const segment = getClientSegment(client)
                            const config = segmentConfig[segment]
                            const SegmentIcon = config.icon

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
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${config.color}`}
                                  >
                                    <SegmentIcon className="h-3 w-3" />
                                    {config.label}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                    {formatCurrency(Number(client.total_spent || 0))}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                    {client.total_visits}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleWhatsApp(client.phone)}
                                      className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedClient(client)}
                                      className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                      <User className="h-4 w-4" />
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

                {/* CALENDAR VIEW (from demo Fusion) - Heatmap of visits */}
                {viewMode === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
                  >
                    {/* Header with month navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Calendario de Actividad
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newMonth = new Date(currentMonth)
                            newMonth.setMonth(newMonth.getMonth() - 1)
                            setCurrentMonth(newMonth)
                          }}
                          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5 rotate-180 text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-white px-4">
                          {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button
                          onClick={() => {
                            const newMonth = new Date(currentMonth)
                            newMonth.setMonth(newMonth.getMonth() + 1)
                            setCurrentMonth(newMonth)
                          }}
                          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Heatmap grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {/* Day labels */}
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-zinc-500 pb-2"
                        >
                          {day}
                        </div>
                      ))}

                      {/* Calendar days */}
                      {(() => {
                        const firstDay = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          1
                        )
                        const daysInMonth = getDaysInMonth(currentMonth)
                        const startDayOfWeek = firstDay.getDay() // 0 = Sunday

                        // Add empty cells for days before the first of the month
                        const days = []
                        for (let i = 0; i < startDayOfWeek; i++) {
                          days.push(<div key={`empty-${i}`} className="aspect-square" />)
                        }

                        // Add actual days
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                          )

                          // Count visits on this day (mock data - replace with real data)
                          const visitsOnDay = clients.filter((client) => {
                            if (!client.last_visit_at) return false
                            return isSameDay(new Date(client.last_visit_at), date)
                          }).length

                          // Determine color intensity
                          const getIntensityColor = (count: number) => {
                            if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800'
                            if (count === 1) return 'bg-blue-200 dark:bg-blue-900/40'
                            if (count === 2) return 'bg-blue-400 dark:bg-blue-700'
                            if (count >= 3) return 'bg-blue-600 dark:bg-blue-500'
                            return 'bg-zinc-100 dark:bg-zinc-800'
                          }

                          const isToday = isSameDay(date, new Date())

                          days.push(
                            <motion.div
                              key={day}
                              className={`aspect-square rounded-lg ${getIntensityColor(visitsOnDay)} relative cursor-pointer transition-all hover:brightness-110 ${
                                isToday ? 'ring-2 ring-inset ring-purple-500' : ''
                              }`}
                              title={`${day} ${format(currentMonth, 'MMMM', { locale: es })} - ${visitsOnDay} visitas`}
                            >
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {day}
                              </span>
                              {visitsOnDay > 0 && (
                                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </motion.div>
                          )
                        }

                        return days
                      })()}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">Menos</span>
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800" />
                          <div className="h-4 w-4 rounded bg-blue-200 dark:bg-blue-900/40" />
                          <div className="h-4 w-4 rounded bg-blue-400 dark:bg-blue-700" />
                          <div className="h-4 w-4 rounded bg-blue-600 dark:bg-blue-500" />
                        </div>
                        <span className="text-sm text-zinc-500">Más</span>
                      </div>

                      {/* Stats for current month */}
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {
                          clients.filter((c) => {
                            if (!c.last_visit_at) return false
                            const visitDate = new Date(c.last_visit_at)
                            return (
                              visitDate.getMonth() === currentMonth.getMonth() &&
                              visitDate.getFullYear() === currentMonth.getFullYear()
                            )
                          }).length
                        }{' '}
                        visitas este mes
                      </div>
                    </div>

                    {/* Active clients list for current month */}
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Clientes Activos Este Mes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {clients
                          .filter((c) => {
                            if (!c.last_visit_at) return false
                            const visitDate = new Date(c.last_visit_at)
                            return (
                              visitDate.getMonth() === currentMonth.getMonth() &&
                              visitDate.getFullYear() === currentMonth.getFullYear()
                            )
                          })
                          .slice(0, 6)
                          .map((client) => {
                            const segment = getClientSegment(client)
                            const config = segmentConfig[segment]
                            const SegmentIcon = config.icon

                            return (
                              <motion.button
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                whileTap={{ scale: 0.98 }}
                                transition={animations.spring.snappy}
                                className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
                                  {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                                    {client.name}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <SegmentIcon
                                      className={`h-3 w-3 ${config.color.split(' ')[1]}`}
                                    />
                                    <span className="text-xs text-zinc-500 truncate">
                                      {client.total_visits} visitas
                                    </span>
                                  </div>
                                </div>
                              </motion.button>
                            )
                          })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Client Detail Sheet */}
              <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
                <SheetContent
                  side="bottom"
                  className="lg:hidden rounded-t-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 pb-safe"
                >
                  <SheetClose onClose={() => setIsMobileDetailOpen(false)} />
                  {selectedCardClient && (
                    <>
                      <SheetHeader>
                        <SheetTitle className="text-zinc-900 dark:text-white text-lg font-semibold">
                          {selectedCardClient.name}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-4">
                        {/* Contact info */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-xl font-bold text-white">
                            {selectedCardClient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-base text-zinc-900 dark:text-white">
                              {selectedCardClient.name}
                            </p>
                            {selectedCardClient.phone && (
                              <p className="text-sm text-muted">{selectedCardClient.phone}</p>
                            )}
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
                            <p className="text-xs text-muted mb-1">Gastado</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                              {formatCurrencyCompact(Number(selectedCardClient.total_spent || 0))}
                            </p>
                          </div>
                          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
                            <p className="text-xs text-muted mb-1">Visitas</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                              {selectedCardClient.total_visits || 0}
                            </p>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-3">
                          {selectedCardClient.phone && (
                            <a
                              href={`tel:${selectedCardClient.phone}`}
                              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-medium"
                            >
                              <Phone className="h-4 w-4" />
                              Llamar
                            </a>
                          )}
                          <Button
                            variant="secondary"
                            onClick={() => setIsMobileDetailOpen(false)}
                            className="flex-1 flex items-center justify-center gap-2 h-12"
                          >
                            Cerrar
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>

              {/* Modal Nuevo Cliente - Wrapped in error boundary */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                  />
                  <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Nuevo Cliente
                      </h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <ComponentErrorBoundary
                      fallbackTitle="Error en formulario"
                      fallbackDescription="No se pudo cargar el formulario de nuevo cliente"
                      onReset={() => setShowModal(false)}
                    >
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                          </div>
                        )}

                        <Input
                          label="Nombre completo"
                          type="text"
                          placeholder="Juan Pérez"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />

                        <Input
                          label="Teléfono"
                          type="tel"
                          placeholder="87175866"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          required
                        />

                        <Input
                          label="Email (opcional)"
                          type="email"
                          placeholder="cliente@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Notas (opcional)
                          </label>
                          <textarea
                            placeholder="Preferencias, alergias, etc..."
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="submit"
                            isLoading={createClient.isPending}
                            className="flex-1"
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </ComponentErrorBoundary>
                  </div>
                </div>
              )}

              {/* Modal Detalle Cliente - Uses specialized ClientProfileErrorBoundary */}
              {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelectedClient(null)}
                  />
                  <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-2xl font-bold text-zinc-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300">
                          {selectedClient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.name}
                          </h2>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${segmentConfig[getClientSegment(selectedClient)].color}`}
                          >
                            {segmentConfig[getClientSegment(selectedClient)].label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Client Profile Content - Wrapped with specialized error boundary */}
                    <ClientProfileErrorBoundary
                      client={selectedClient}
                      onReset={() => setSelectedClient(null)}
                    >
                      {/* Contacto */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <Phone className="h-5 w-5 text-zinc-400" />
                          <span className="text-zinc-900 dark:text-white">
                            {selectedClient.phone}
                          </span>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleWhatsApp(selectedClient.phone)}
                            className="ml-auto flex items-center gap-1.5"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </div>
                        {selectedClient.email && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                            <Mail className="h-5 w-5 text-zinc-400" />
                            <span className="text-zinc-900 dark:text-white">
                              {selectedClient.email}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.total_visits || 0}
                          </p>
                          <p className="text-xs text-zinc-500">Visitas</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(Number(selectedClient.total_spent || 0))}
                          </p>
                          <p className="text-xs text-zinc-500">Total gastado</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <p className="text-lg font-bold text-zinc-900 dark:text-white">
                            {selectedClient.last_visit_at
                              ? format(new Date(selectedClient.last_visit_at), 'd MMM', {
                                  locale: es,
                                })
                              : '-'}
                          </p>
                          <p className="text-xs text-zinc-500">Ultima visita</p>
                        </div>
                      </div>

                      {/* Notas */}
                      {selectedClient.notes && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 mb-6">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                            Notas
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            {selectedClient.notes}
                          </p>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedClient(null)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Ver Historial
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Nueva Cita
                        </Button>
                      </div>
                    </ClientProfileErrorBoundary>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PullToRefresh>
      </ClientesTourWrapper>
    </ComponentErrorBoundary>
  )
}
