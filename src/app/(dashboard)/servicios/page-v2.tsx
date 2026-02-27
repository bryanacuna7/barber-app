/**
 * Servicios Page V2 - Demo D: Simplified Hybrid
 *
 * Pattern: React Query + Real-time + Error Boundaries
 * Design: Table view + insights sidebar (320px) + CRUD-first
 * Feature flag: NEXT_PUBLIC_FF_NEW_SERVICIOS=true
 */

'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Award,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Scissors,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'
import { Input } from '@/components/ui/input'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { formatCurrency } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/queries/useServices'
import { useBusiness } from '@/contexts/business-context'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtimeServices } from '@/hooks/use-realtime-services'
import {
  DEFAULT_ICON_BY_CATEGORY,
  SERVICE_ICON_LABELS,
  SERVICE_ICON_NAMES,
  isServiceCategory,
  resolveServiceIcon,
  type ServiceCategory,
  type ServiceIconName,
} from '@/lib/services/icons'
import { SERVICE_ICON_MAP } from '@/lib/services/icon-components'

// ============================================================================
// MOCK DATA (Demo D - For UI exploration)
// ============================================================================

type CategoryFilter = 'all' | ServiceCategory
type SortField = 'name' | 'bookings' | 'price' | 'duration'
type SortDirection = 'asc' | 'desc'

interface MockService {
  id: string
  name: string
  description: string
  category: ServiceCategory
  duration_minutes: number
  price: number
  bookings_this_month: number
  bookings_last_month: number
  revenue_this_month: number
  avg_rating: number
  total_reviews: number
  barber_names: string[]
  iconName: ServiceIconName
  color: string
  is_active: boolean
}

const mockServices: MockService[] = [
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con máquina y tijera',
    category: 'corte',
    duration_minutes: 30,
    price: 8000,
    bookings_this_month: 87,
    bookings_last_month: 79,
    revenue_this_month: 696000,
    avg_rating: 4.8,
    total_reviews: 234,
    barber_names: ['Juan', 'Carlos', 'Roberto'],
    iconName: 'Scissors',
    color: 'blue',
    is_active: true,
  },
  {
    id: '2',
    name: 'Corte Premium',
    description: 'Corte personalizado con asesoría de estilo',
    category: 'corte',
    duration_minutes: 45,
    price: 12000,
    bookings_this_month: 52,
    bookings_last_month: 48,
    revenue_this_month: 624000,
    avg_rating: 4.9,
    total_reviews: 156,
    barber_names: ['Juan', 'Roberto'],
    iconName: 'Sparkles',
    color: 'purple',
    is_active: true,
  },
  {
    id: '3',
    name: 'Fade Moderno',
    description: 'Degradado profesional con línea definida',
    category: 'corte',
    duration_minutes: 40,
    price: 10000,
    bookings_this_month: 64,
    bookings_last_month: 58,
    revenue_this_month: 640000,
    avg_rating: 4.7,
    total_reviews: 189,
    barber_names: ['Roberto', 'Carlos'],
    iconName: 'Zap',
    color: 'amber',
    is_active: true,
  },
  {
    id: '4',
    name: 'Barba Completa',
    description: 'Perfilado y arreglo de barba profesional',
    category: 'barba',
    duration_minutes: 25,
    price: 6000,
    bookings_this_month: 45,
    bookings_last_month: 42,
    revenue_this_month: 270000,
    avg_rating: 4.6,
    total_reviews: 145,
    barber_names: ['Carlos', 'Miguel'],
    iconName: 'Flame',
    color: 'red',
    is_active: true,
  },
  {
    id: '5',
    name: 'Afeitado Clásico',
    description: 'Afeitado con navaja y toalla caliente',
    category: 'barba',
    duration_minutes: 30,
    price: 8000,
    bookings_this_month: 38,
    bookings_last_month: 35,
    revenue_this_month: 304000,
    avg_rating: 4.9,
    total_reviews: 98,
    barber_names: ['Carlos'],
    iconName: 'Waves',
    color: 'cyan',
    is_active: true,
  },
  {
    id: '6',
    name: 'Combo VIP',
    description: 'Corte + Barba + Tratamiento capilar',
    category: 'combo',
    duration_minutes: 60,
    price: 18000,
    bookings_this_month: 29,
    bookings_last_month: 25,
    revenue_this_month: 522000,
    avg_rating: 5.0,
    total_reviews: 67,
    barber_names: ['Juan', 'Roberto'],
    iconName: 'Crown',
    color: 'gold',
    is_active: true,
  },
  {
    id: '7',
    name: 'Combo Rápido',
    description: 'Corte + Barba express',
    category: 'combo',
    duration_minutes: 45,
    price: 14000,
    bookings_this_month: 41,
    bookings_last_month: 38,
    revenue_this_month: 574000,
    avg_rating: 4.7,
    total_reviews: 112,
    barber_names: ['Todos'],
    iconName: 'Gift',
    color: 'emerald',
    is_active: true,
  },
  {
    id: '8',
    name: 'Facial Hidratante',
    description: 'Limpieza facial + hidratación profunda',
    category: 'facial',
    duration_minutes: 50,
    price: 15000,
    bookings_this_month: 22,
    bookings_last_month: 19,
    revenue_this_month: 330000,
    avg_rating: 4.8,
    total_reviews: 54,
    barber_names: ['Miguel'],
    iconName: 'Sparkle',
    color: 'green',
    is_active: true,
  },
  {
    id: '9',
    name: 'Corte Niño',
    description: 'Corte especial para niños menores de 12 años',
    category: 'corte',
    duration_minutes: 20,
    price: 6000,
    bookings_this_month: 56,
    bookings_last_month: 52,
    revenue_this_month: 336000,
    avg_rating: 4.5,
    total_reviews: 178,
    barber_names: ['Juan', 'Miguel'],
    iconName: 'Users',
    color: 'blue',
    is_active: true,
  },
  {
    id: '10',
    name: 'Cejas',
    description: 'Perfilado y arreglo de cejas',
    category: 'facial',
    duration_minutes: 15,
    price: 3000,
    bookings_this_month: 34,
    bookings_last_month: 31,
    revenue_this_month: 102000,
    avg_rating: 4.4,
    total_reviews: 89,
    barber_names: ['Miguel', 'Carlos'],
    iconName: 'CircleDot',
    color: 'zinc',
    is_active: true,
  },
]

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  corte: 'Corte',
  barba: 'Barba',
  combo: 'Combo',
  facial: 'Facial',
}

function ServiceIcon({
  iconName,
  className,
}: {
  iconName: MockService['iconName']
  className: string
}) {
  const Icon = SERVICE_ICON_MAP[iconName] || Scissors
  return <Icon className={className} aria-hidden="true" />
}

// Helper functions
function getCategoryColor(category: ServiceCategory) {
  const colors: Record<
    ServiceCategory,
    { bg: string; text: string; ring: string; gradient: string }
  > = {
    corte: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      ring: 'ring-blue-500',
      gradient: 'from-blue-500 to-cyan-600',
    },
    barba: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      ring: 'ring-amber-500',
      gradient: 'from-amber-500 to-orange-600',
    },
    combo: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      ring: 'ring-purple-500',
      gradient: 'from-purple-500 to-pink-600',
    },
    facial: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      ring: 'ring-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
    },
  }
  return colors[category]
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function inferCategory(name: string, description?: string): ServiceCategory {
  const haystack = `${name} ${description ?? ''}`.toLowerCase()
  if (haystack.includes('barba') || haystack.includes('afeitado')) return 'barba'
  if (haystack.includes('combo') || haystack.includes('+')) return 'combo'
  if (
    haystack.includes('facial') ||
    haystack.includes('ceja') ||
    haystack.includes('piel') ||
    haystack.includes('masaje')
  ) {
    return 'facial'
  }
  return 'corte'
}

function resolveCategory(
  category: string | null | undefined,
  name: string,
  description?: string
): ServiceCategory {
  if (isServiceCategory(category)) return category
  return inferCategory(name, description)
}

function iconNameForCategory(category: ServiceCategory): ServiceIconName {
  return DEFAULT_ICON_BY_CATEGORY[category]
}

function colorForCategory(category: ServiceCategory): string {
  if (category === 'barba') return 'amber'
  if (category === 'combo') return 'purple'
  if (category === 'facial') return 'emerald'
  return 'blue'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ServiciosContent() {
  const { businessId } = useBusiness()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [sortField, setSortField] = useState<SortField>('bookings')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingService, setEditingService] = useState<{ id: string } | null>(null)
  const [deleteService, setDeleteService] = useState<MockService | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'corte' as ServiceCategory,
    icon: iconNameForCategory('corte') as ServiceIconName,
    duration: 30,
    price: 0,
    business_id: businessId,
  })

  const searchParamsHook = useSearchParams()
  const intentHandled = useRef(false)
  const hasMountedFilterTransition = useRef(false)
  const listTransitionControls = useAnimationControls()
  const prefersReducedMotion = useReducedMotion()

  // Auto-open create form when navigated with ?intent=create
  useEffect(() => {
    if (searchParamsHook.get('intent') === 'create' && !intentHandled.current) {
      intentHandled.current = true
      window.history.replaceState(null, '', '/servicios')
      requestAnimationFrame(() => setShowForm(true))
    }
  }, [searchParamsHook])

  useEffect(() => {
    if (prefersReducedMotion) return
    if (!hasMountedFilterTransition.current) {
      hasMountedFilterTransition.current = true
      return
    }

    listTransitionControls.start({
      opacity: [0.93, 1],
      y: [2, 0],
      transition: { duration: 0.18, ease: 'easeOut' },
    })
  }, [searchQuery, selectedCategory, prefersReducedMotion, listTransitionControls])

  // React Query hooks
  const {
    data: servicesData = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useServices(businessId)
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteServiceMutation = useDeleteService()

  // Real-time WebSocket subscription
  useRealtimeServices({
    businessId,
    enabled: !!businessId,
  })

  const isServicesDemoMode = process.env.NEXT_PUBLIC_SERVICES_DEMO === 'true'
  const sourceServices = useMemo<MockService[]>(() => {
    if (isServicesDemoMode) {
      return mockServices
    }

    return servicesData.map((service) => {
      const category = resolveCategory(service.category, service.name, service.description)
      const iconName = resolveServiceIcon(
        service.icon,
        service.category,
        service.name,
        service.description
      )
      const bookings = service.bookings ?? 0
      return {
        id: service.id,
        name: service.name,
        description: service.description ?? '',
        category,
        duration_minutes: service.duration,
        price: service.price,
        bookings_this_month: bookings,
        bookings_last_month: bookings,
        revenue_this_month: service.revenue ?? 0,
        avg_rating: service.avgRating ?? 0,
        total_reviews: 0,
        barber_names: [],
        iconName,
        color: colorForCategory(category),
        is_active: service.isActive,
      }
    })
  }, [servicesData, isServicesDemoMode])

  // Filter and sort services
  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return sourceServices.filter((service) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery)
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, sourceServices])

  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
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

  // Calculate quick stats
  const activeServices = useMemo(() => sourceServices.filter((s) => s.is_active), [sourceServices])
  const totalServices = sourceServices.length
  const topService = useMemo(() => {
    const base = activeServices.length > 0 ? activeServices : sourceServices
    if (base.length === 0) return null
    return base.reduce((top, s) => (s.bookings_this_month > top.bookings_this_month ? s : top))
  }, [activeServices, sourceServices])

  // Top 5 for mini chart
  const top5Services = [...(activeServices.length > 0 ? activeServices : sourceServices)]
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
      <ChevronUp className="h-3.5 w-3.5 text-violet-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-violet-600" />
    )
  }

  // Form handlers
  function openCreateServiceForm() {
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      category: 'corte',
      icon: iconNameForCategory('corte'),
      duration: 30,
      price: 0,
      business_id: businessId,
    })
    setError('')
    setShowForm(true)
  }

  function openEditServiceForm(service: MockService) {
    setEditingService({ id: service.id })
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      icon: service.iconName,
      duration: service.duration_minutes,
      price: service.price,
      business_id: businessId,
    })
    setError('')
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      category: 'corte',
      icon: iconNameForCategory('corte'),
      duration: 30,
      price: 0,
      business_id: businessId,
    })
    setEditingService(null)
    setShowForm(false)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          updates: formData,
        })
      } else {
        await createService.mutateAsync(formData)
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar servicio')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteService) return

    try {
      await deleteServiceMutation.mutateAsync(deleteService.id)
      setDeleteService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio')
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen lg:pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        {/* Search bar */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden lg:block rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <Skeleton className="h-12 rounded-none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[60px] rounded-none border-t border-zinc-100 dark:border-zinc-800"
            />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <QueryError error={queryError} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:pb-6 relative overflow-x-hidden">
      {/* Subtle Mesh Gradients (15% opacity) — disabled for reduced motion */}
      {!prefersReducedMotion && (
        <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none opacity-15">
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
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 brand-mesh-1 rounded-full blur-3xl"
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
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 brand-mesh-2 rounded-full blur-3xl"
          />
        </div>
      )}

      <PullToRefresh
        onRefresh={async () => {
          await refetch()
        }}
      >
        <div className="px-0 pt-4 sm:px-0 lg:px-0 lg:pt-0 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animations.spring.default}
            className="mb-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="app-page-title brand-gradient-text">Servicios</h1>
                <p className="app-page-subtitle mt-1">{totalServices} servicios</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="lg:hidden">
                  <NotificationBell />
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex items-center gap-2 min-h-[44px] h-10 px-3"
                  aria-label={sidebarOpen ? 'Ocultar insights' : 'Ver insights'}
                >
                  <BarChart3
                    className={`h-4 w-4 transition-colors ${sidebarOpen ? 'text-violet-600 dark:text-violet-400' : 'text-muted'}`}
                  />
                  <span
                    className={`text-sm ${sidebarOpen ? 'text-violet-600 dark:text-violet-400' : 'text-muted'}`}
                  >
                    Insights
                  </span>
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => {
                    openCreateServiceForm()
                    if (isMobileDevice()) haptics.tap()
                  }}
                  className="shrink-0 min-w-[44px] min-h-[44px] h-10 border-0"
                >
                  <Plus className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Nuevo Servicio</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Guide Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animations.spring.default, delay: 0.05 }}
          >
            <GuideContextualTip
              tipId="servicios-duration"
              title="La duración importa"
              description="La duración de cada servicio determina los slots disponibles para reservas online. Configurala lo más precisa posible."
              linkHref="/guia#servicios"
              className="mb-4 sm:mb-5"
            />
          </motion.div>

          {/* Main Layout: Content + Sidebar */}
          <div className="flex gap-6">
            {/* Main Content Area (Left) */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.spring.default, delay: 0.1 }}
                className="relative overflow-hidden mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:border sm:border-zinc-200/70 sm:dark:border-zinc-800/80 sm:bg-white/60 sm:dark:bg-white/[0.03] sm:p-3 sm:backdrop-blur-xl sm:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] sm:dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent lg:block" />
                {/* Search */}
                <div className="w-full sm:flex-1 sm:max-w-md">
                  <Input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="h-11 border border-zinc-200/70 dark:border-zinc-800/80 bg-white/65 dark:bg-white/[0.04] focus:ring-violet-400/45 focus:border-violet-400/45"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <Button
                    variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
                    onClick={() => setSelectedCategory('all')}
                    className="h-9 shrink-0 rounded-full px-3 text-xs"
                  >
                    Todas
                  </Button>
                  {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((category) => {
                    const categoryColor = getCategoryColor(category)
                    const isActive = selectedCategory === category
                    return (
                      <Button
                        key={category}
                        variant={isActive ? 'primary' : 'ghost'}
                        onClick={() => setSelectedCategory(category)}
                        className={`h-9 shrink-0 rounded-full px-3 text-xs ${
                          isActive ? '' : `${categoryColor.text} ${categoryColor.bg}`
                        }`}
                      >
                        {CATEGORY_LABELS[category]}
                      </Button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Mobile Card View */}
              <motion.div
                initial={false}
                animate={listTransitionControls}
                className="lg:hidden space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {sortedServices.map((service) => {
                    const rightActions = [
                      {
                        icon: <Pencil className="h-5 w-5" />,
                        label: 'Editar',
                        color: 'bg-blue-500',
                        onClick: () => openEditServiceForm(service),
                      },
                      {
                        icon: <Trash2 className="h-5 w-5" />,
                        label: 'Eliminar',
                        color: 'bg-red-500',
                        onClick: () => setDeleteService(service),
                      },
                    ]

                    return (
                      <motion.div
                        key={service.id}
                        layout
                        exit={{ opacity: 0, x: -100 }}
                        transition={animations.spring.layout}
                      >
                        <SwipeableRow rightActions={rightActions}>
                          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
                            {/* Row 1: Icon + Name */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 flex-shrink-0">
                                  <ServiceIcon
                                    iconName={service.iconName}
                                    className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-200"
                                  />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                                    {service.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted">
                                      {service.duration_minutes} min
                                    </span>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(service.category).bg} ${getCategoryColor(service.category).text}`}
                                    >
                                      {CATEGORY_LABELS[service.category]}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Price + Bookings + Rating */}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                              <span className="font-bold text-zinc-900 dark:text-white">
                                {formatCurrency(service.price)}
                              </span>
                              <span className="text-sm text-muted">
                                {service.bookings_this_month} reservas
                              </span>
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  {service.avg_rating?.toFixed(1) || 'N/A'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </SwipeableRow>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-shadow">
                <div className="relative">
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-zinc-900 z-10 sm:hidden" />
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full">
                      {/* Header */}
                      <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <tr>
                          {/* Service Name */}
                          <th className="px-4 py-3 text-left">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                            >
                              Servicio
                              {getSortIcon('name')}
                            </Button>
                          </th>

                          {/* Category */}
                          <th className="px-4 py-3 text-left">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                              Categoría
                            </span>
                          </th>

                          {/* Bookings */}
                          <th className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('bookings')}
                              className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                            >
                              Reservas
                              {getSortIcon('bookings')}
                            </Button>
                          </th>

                          {/* Duration */}
                          <th className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('duration')}
                              className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                            >
                              Duración
                              {getSortIcon('duration')}
                            </Button>
                          </th>

                          {/* Price */}
                          <th className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('price')}
                              className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                            >
                              Precio
                              {getSortIcon('price')}
                            </Button>
                          </th>

                          {/* Rating */}
                          <th className="px-4 py-3 text-right">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                              Rating
                            </span>
                          </th>

                          {/* Actions */}
                          <th className="w-24 px-4 py-3 text-right">
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>

                      {/* Body */}
                      <motion.tbody
                        initial={false}
                        animate={listTransitionControls}
                        className="divide-y divide-zinc-200 dark:divide-zinc-800"
                      >
                        {sortedServices.map((service) => {
                          const growth = calculateGrowth(
                            service.bookings_this_month,
                            service.bookings_last_month
                          )

                          return (
                            <tr
                              key={service.id}
                              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                            >
                              {/* Service Name */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                                    <ServiceIcon
                                      iconName={service.iconName}
                                      className="h-4 w-4 text-zinc-700 dark:text-zinc-200"
                                    />
                                  </span>
                                  <div>
                                    <p className="font-medium text-zinc-900 dark:text-white">
                                      {service.name}
                                    </p>
                                    <p className="text-xs text-muted line-clamp-1">
                                      {service.barber_names.length} miembros del equipo
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(service.category).bg} ${getCategoryColor(service.category).text}`}
                                >
                                  {CATEGORY_LABELS[service.category]}
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
                                <span className="text-sm text-muted">
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

                              {/* Actions — visible on row hover */}
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                    title="Editar"
                                    onClick={() => openEditServiceForm(service)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    title="Eliminar"
                                    onClick={() => setDeleteService(service)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </motion.tbody>
                    </table>
                  </div>
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
              </div>

              {/* Results count */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...animations.spring.default, delay: 0.3 }}
                className="mt-3 text-xs text-muted text-center"
              >
                Mostrando {sortedServices.length} de {sourceServices.length} servicios
              </motion.p>
            </div>

            {/* Sidebar (Right) - Insights (collapsible) */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...animations.spring.default, delay: 0.1 }}
                className="hidden lg:block w-[320px] shrink-0 space-y-4"
              >
                {/* Quick Stats */}
                <div className="space-y-3">
                  {/* Total Services */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    transition={animations.spring.snappy}
                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted">Servicios Activos</p>
                        <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                          {totalServices}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30">
                        <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Top Service */}
                  {topService && (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      transition={animations.spring.snappy}
                      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted">Más Popular</p>
                          <div className="mt-1 flex items-center gap-2 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                              <ServiceIcon
                                iconName={topService.iconName}
                                className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200"
                              />
                            </span>
                            <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                              {topService.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted">
                            {topService.bookings_this_month} reservas
                          </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                          <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Average Rating */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    transition={animations.spring.snappy}
                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted">Rating Promedio</p>
                        <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                          {activeServices.length > 0
                            ? (
                                activeServices.reduce((sum, s) => sum + s.avg_rating, 0) /
                                activeServices.length
                              ).toFixed(1)
                            : '0.0'}
                        </p>
                        <p className="text-xs text-muted">
                          {activeServices.reduce((sum, s) => sum + s.total_reviews, 0)} reviews
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30">
                        <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Mini Chart */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.snappy}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
                >
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
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                                <ServiceIcon
                                  iconName={service.iconName}
                                  className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200"
                                />
                              </span>
                              <span className="font-medium text-zinc-900 dark:text-white truncate">
                                {service.name}
                              </span>
                            </div>
                            <span className="ml-2 shrink-0 text-xs text-muted">
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
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-red-50 p-4 text-base text-red-600 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Input
              label="Nombre del servicio"
              type="text"
              placeholder="Ej: Corte de cabello"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <Input
              label="Descripción (opcional)"
              type="text"
              placeholder="Ej: Incluye lavado y peinado"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as ServiceCategory,
                    icon:
                      prev.icon === iconNameForCategory(prev.category)
                        ? iconNameForCategory(e.target.value as ServiceCategory)
                        : prev.icon,
                  }))
                }
                className="flex h-11 w-full rounded-[14px] border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
                  Ícono
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      icon: e.target.value as ServiceIconName,
                    }))
                  }
                  className="flex h-11 w-full rounded-[14px] border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {SERVICE_ICON_NAMES.map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {SERVICE_ICON_LABELS[iconName]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                <ServiceIcon
                  iconName={formData.icon}
                  className="h-4 w-4 text-zinc-700 dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block min-h-[2.75rem] text-sm font-semibold uppercase tracking-wide text-muted">
                  Duración (min)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block min-h-[2.75rem] text-sm font-semibold uppercase tracking-wide text-muted">
                  Precio (CRC)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value === '' ? 0 : Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="h-11">
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={createService.isPending || updateService.isPending}
                className="h-11"
              >
                {editingService ? 'Actualizar' : 'Crear'} Servicio
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteService}
          onClose={() => setDeleteService(null)}
          title="Eliminar Servicio"
        >
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={animations.spring.snappy}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
              >
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </motion.div>
              <div>
                <p className="text-lg text-zinc-900 dark:text-white">
                  ¿Estás seguro de que deseas eliminar <strong>{deleteService?.name}</strong>?
                </p>
                <p className="mt-2 text-base text-muted">
                  Esta acción no se puede deshacer. Las citas existentes con este servicio no se
                  verán afectadas.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteService(null)} className="h-11">
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                isLoading={deleteServiceMutation.isPending}
                className="h-11"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </PullToRefresh>
    </div>
  )
}

export default function ServiciosPageV2() {
  return (
    <ComponentErrorBoundary>
      <ServiciosContent />
    </ComponentErrorBoundary>
  )
}
