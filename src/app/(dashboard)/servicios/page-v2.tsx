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
import { motion } from 'framer-motion'
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
  AlertTriangle,
  Pause,
  Play,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { formatCurrency } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/queries/useServices'
import { useBusiness } from '@/contexts/business-context'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'
import { useRealtimeServices } from '@/hooks/use-realtime-services'

// ============================================================================
// MOCK DATA (Demo D - For UI exploration)
// ============================================================================

type ServiceCategory = 'corte' | 'barba' | 'combo' | 'facial'
type SortField = 'name' | 'category' | 'bookings' | 'price' | 'duration'
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
  icon: string // Emoji for demo
  iconName: string // Lucide icon name
  color: string
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
    icon: '✂️',
    iconName: 'Scissors',
    color: 'blue',
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
    icon: '✨',
    iconName: 'Sparkles',
    color: 'purple',
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
    icon: '⚡',
    iconName: 'Zap',
    color: 'amber',
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
    icon: '🔥',
    iconName: 'Flame',
    color: 'red',
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
    icon: '🌊',
    iconName: 'Waves',
    color: 'cyan',
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
    icon: '👑',
    iconName: 'Crown',
    color: 'gold',
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
    icon: '🎁',
    iconName: 'Gift',
    color: 'emerald',
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
    icon: '💆',
    iconName: 'Sparkle',
    color: 'green',
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
    icon: '👦',
    iconName: 'Users',
    color: 'blue',
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
    icon: '👁️',
    iconName: 'CircleDot',
    color: 'zinc',
  },
]

// Icon mapping (reserved for dynamic icon resolution)
const _iconMap: Record<string, LucideIcon> = {
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

// Helper functions
function getCategoryLabel(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    corte: 'Corte',
    barba: 'Barba',
    combo: 'Combo',
    facial: 'Facial',
  }
  return labels[category]
}

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

function getActiveServices() {
  return mockServices.filter((s) => s.bookings_this_month > 0)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ServiciosContent() {
  const { businessId } = useBusiness()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('bookings')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingService, setEditingService] = useState<{ id: string } | null>(null)
  const [deleteService, setDeleteService] = useState<MockService | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    business_id: businessId,
  })

  const searchParamsHook = useSearchParams()
  const intentHandled = useRef(false)
  const categoryTabsRef = useRef<HTMLDivElement>(null)

  // Auto-open create form when navigated with ?intent=create
  useEffect(() => {
    if (searchParamsHook.get('intent') === 'create' && !intentHandled.current) {
      intentHandled.current = true
      window.history.replaceState(null, '', '/servicios')
      requestAnimationFrame(() => setShowForm(true))
    }
  }, [searchParamsHook])

  useEffect(() => {
    const container = categoryTabsRef.current
    if (!container) return

    const activeChip = container.querySelector<HTMLButtonElement>(
      `[data-category-chip="${selectedCategory}"]`
    )
    if (!activeChip) return

    requestAnimationFrame(() => {
      activeChip.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    })
  }, [selectedCategory])

  // React Query hooks
  const { isLoading: _loading, isError, error: queryError, refetch } = useServices(businessId)
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteServiceMutation = useDeleteService()

  // Real-time WebSocket subscription
  useRealtimeServices({
    businessId,
    enabled: !!businessId,
  })

  // Filter and sort services (using mock data for demo)
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
      // In real app, would delete using deleteServiceMutation
      // For demo, just close modal
      setDeleteService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio')
    }
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
    <div className="-mx-4 sm:-mx-6 lg:mx-0 min-h-screen lg:pb-6 relative overflow-x-hidden">
      {/* Subtle Mesh Gradients (15% opacity) */}
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

      <PullToRefresh
        onRefresh={async () => {
          await refetch()
        }}
      >
        <div className="px-4 pt-4 sm:px-6 lg:px-0 lg:pt-0 lg:mx-auto lg:max-w-[1400px] relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animations.spring.default}
            className="mb-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Servicios
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Gestiona tus servicios con insights en tiempo real
                </p>
              </div>
              <Button
                onClick={openCreateServiceForm}
                className="shrink-0 min-w-[44px] min-h-[44px] h-10 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25 border-0"
              >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Servicio</span>
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
                transition={{ ...animations.spring.default, delay: 0.1 }}
                className="mb-4 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-black/20 backdrop-blur-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/65 dark:bg-white/[0.04] pl-9 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all focus:border-violet-400/45 focus:outline-none focus-visible:outline-none focus:ring-1 focus:ring-violet-400/45"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative rounded-xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-1.5">
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/90 dark:from-zinc-950 z-10 sm:hidden rounded-r-xl" />
                  <div
                    ref={categoryTabsRef}
                    className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide"
                  >
                    {categories.map((cat) => (
                      <motion.button
                        key={cat}
                        layout
                        onClick={() => setSelectedCategory(cat)}
                        data-category-chip={cat}
                        whileTap={{ scale: 0.98 }}
                        transition={animations.spring.snappy}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.28)]'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-white/10'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : getCategoryLabel(cat as ServiceCategory)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {sortedServices.map((service) => {
                  const categoryColor = getCategoryColor(service.category)
                  // Assume is_active is a property on service (TODO: integrate with real data)
                  const isActive = true // Replace with service.is_active when integrated

                  const rightActions = [
                    {
                      icon: <Pencil className="h-5 w-5" />,
                      label: 'Editar',
                      color: 'bg-blue-500',
                      onClick: () => openEditServiceForm(service),
                    },
                    {
                      icon: isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />,
                      label: isActive ? 'Pausar' : 'Activar',
                      color: 'bg-amber-500',
                      onClick: () => {
                        // TODO: Toggle is_active when integrated
                        console.log('Toggle active state for', service.id)
                      },
                    },
                  ]

                  return (
                    <SwipeableRow key={service.id} rightActions={rightActions}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.3)]"
                      >
                        {/* Row 1: Emoji + Name */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-2xl flex-shrink-0">{service.icon}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 dark:text-white truncate">
                                {service.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}
                                >
                                  {getCategoryLabel(service.category)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {service.duration_minutes} min
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
                          <span className="text-sm text-zinc-500">
                            {service.bookings_this_month} reservas
                          </span>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {service.avg_rating?.toFixed(1) || 'N/A'}
                            </span>
                          </span>
                        </div>
                      </motion.div>
                    </SwipeableRow>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.spring.default, delay: 0.2 }}
                className="hidden lg:block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-shadow"
              >
                <div className="relative">
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-zinc-900 z-10 sm:hidden" />
                  <div className="overflow-x-auto scrollbar-hide">
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

                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                    title="Editar"
                                    onClick={() => openEditServiceForm(service)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    title="Eliminar"
                                    onClick={() => setDeleteService(service)}
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
                transition={{ ...animations.spring.default, delay: 0.3 }}
                className="mt-3 text-xs text-zinc-500 text-center"
              >
                Mostrando {sortedServices.length} de {mockServices.length} servicios
              </motion.p>
            </div>

            {/* Sidebar (Right) - Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...animations.spring.default, delay: 0.2 }}
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
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Servicios Activos
                      </p>
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
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.snappy}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                      <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </motion.div>

                {/* Average Rating */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.snappy}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
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
              </motion.div>
            </motion.div>
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
                className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-600 dark:bg-red-900/20 dark:text-red-400"
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

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duración (minutos)"
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

              <Input
                label="Precio (CRC)"
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
                <p className="text-[17px] text-zinc-900 dark:text-white">
                  ¿Estás seguro de que deseas eliminar <strong>{deleteService?.name}</strong>?
                </p>
                <p className="mt-2 text-[15px] text-zinc-500">
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
