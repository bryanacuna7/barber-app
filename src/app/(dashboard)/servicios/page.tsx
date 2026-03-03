'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Plus, Search, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'
import { Input } from '@/components/ui/input'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { AlertTriangle } from 'lucide-react'
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
import { resolveServiceIcon, type ServiceCategory } from '@/lib/services/icons'

// Shared types + helpers
import {
  type MockService,
  type CategoryFilter,
  type SortField,
  type SortDirection,
  mockServices,
  CATEGORY_LABELS,
  getCategoryColor,
  resolveCategory,
  iconNameForCategory,
  colorForCategory,
} from '@/components/services/service-types'

// Extracted sub-components
import { ServiceMobileCardList } from '@/components/services/service-mobile-card-list'
import { ServiceDesktopTable } from '@/components/services/service-desktop-table'
import { ServiceInsightsSidebar } from '@/components/services/service-insights-sidebar'
import { ServiceFormModal, type ServiceFormData } from '@/components/services/service-form-modal'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { getDashboardRouteMeta } from '@/lib/navigation/route-meta'
import { EmptyServices, EmptyState } from '@/components/ui/empty-state'
import { ClientEffects } from '@/components/dashboard/client-effects'

function ServiciosContent() {
  const headerMeta = getDashboardRouteMeta('/servicios')
  const router = useRouter()
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

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: 'corte',
    icon: iconNameForCategory('corte'),
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
      router.replace('/servicios', { scroll: false })
      requestAnimationFrame(() => setShowForm(true))
    }
  }, [searchParamsHook, router])

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

  useRealtimeServices({ businessId, enabled: !!businessId })

  const isServicesDemoMode = process.env.NEXT_PUBLIC_SERVICES_DEMO === 'true'
  const sourceServices = useMemo<MockService[]>(() => {
    if (isServicesDemoMode) return mockServices
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

  // Filter and sort
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

  // Quick stats
  const activeServices = useMemo(() => sourceServices.filter((s) => s.is_active), [sourceServices])
  const totalServices = sourceServices.length
  const topService = useMemo(() => {
    const base = activeServices.length > 0 ? activeServices : sourceServices
    if (base.length === 0) return null
    return base.reduce((top, s) => (s.bookings_this_month > top.bookings_this_month ? s : top))
  }, [activeServices, sourceServices])
  const top5Services = [...(activeServices.length > 0 ? activeServices : sourceServices)]
    .sort((a, b) => b.bookings_this_month - a.bookings_this_month)
    .slice(0, 5)
  const maxBookings = top5Services[0]?.bookings_this_month || 100

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

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
    if (formData.duration < 5 || formData.duration > 480) {
      setError('La duración debe estar entre 5 y 480 minutos')
      return
    }
    if (formData.price < 0) {
      setError('El precio no puede ser negativo')
      return
    }
    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          updates: { ...formData, business_id: formData.business_id ?? undefined },
        })
      } else {
        await createService.mutateAsync({ ...formData, business_id: formData.business_id ?? '' })
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

  function handleCategoryChange(nextCategory: ServiceCategory) {
    setFormData((prev) => ({
      ...prev,
      category: nextCategory,
      icon:
        prev.icon === iconNameForCategory(prev.category)
          ? iconNameForCategory(nextCategory)
          : prev.icon,
    }))
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen lg:pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
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

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <QueryError error={queryError} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:pb-6 relative overflow-x-hidden">
      <ClientEffects title="Servicios" />
      {/* Subtle Mesh Gradients */}
      {!prefersReducedMotion && (
        <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none opacity-15">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 brand-mesh-1 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, 100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 brand-mesh-2 rounded-full blur-3xl"
          />
        </div>
      )}

      <PullToRefresh
        onRefresh={async () => {
          await refetch()
        }}
        disabled={showForm || !!deleteService}
      >
        <div className="px-0 pt-4 sm:px-0 lg:px-0 lg:pt-0 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animations.spring.default}
            className="mb-6"
          >
            <DashboardPageHeader
              title={headerMeta.title}
              subtitle={`${headerMeta.subtitle} · ${totalServices} servicios`}
              actions={
                <div className="flex items-center gap-2">
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
              }
            />

            <div className="mt-3 lg:hidden">
              <Button
                variant="gradient"
                onClick={() => {
                  openCreateServiceForm()
                  if (isMobileDevice()) haptics.tap()
                }}
                className="h-11 w-full !border-zinc-200 !bg-white !text-zinc-900 shadow-sm hover:!bg-zinc-50 dark:!border-zinc-200 dark:!bg-white dark:!text-zinc-900 dark:hover:!bg-zinc-100"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>Nuevo Servicio</span>
              </Button>
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
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...animations.spring.default, delay: 0.1 }}
                className="relative overflow-hidden mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:border sm:border-zinc-200/70 sm:dark:border-zinc-800/80 sm:bg-white/60 sm:dark:bg-white/[0.03] sm:p-3 sm:backdrop-blur-xl sm:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] sm:dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent lg:block" />
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
              {sourceServices.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-8 dark:border-zinc-800/70 dark:bg-zinc-900/70">
                  <EmptyServices
                    onCreateService={openCreateServiceForm}
                    onViewGuide={() => router.push('/guia#servicios')}
                  />
                </div>
              ) : sortedServices.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-8 dark:border-zinc-800/70 dark:bg-zinc-900/70">
                  <EmptyState
                    icon={Search}
                    title="No encontramos servicios"
                    description="Ajusta tu búsqueda o cambia la categoría para ver resultados."
                    action={
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory('all')
                        }}
                        className="min-h-[44px]"
                      >
                        Limpiar filtros
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <ServiceMobileCardList
                    services={sortedServices}
                    listTransitionControls={listTransitionControls}
                    onEdit={openEditServiceForm}
                    onDelete={setDeleteService}
                  />

                  <ServiceDesktopTable
                    services={sortedServices}
                    sourceServicesCount={sourceServices.length}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    listTransitionControls={listTransitionControls}
                    onSort={handleSort}
                    onEdit={openEditServiceForm}
                    onDelete={setDeleteService}
                  />
                </>
              )}
            </div>

            {/* Insights Sidebar */}
            <ServiceInsightsSidebar
              isOpen={sidebarOpen}
              totalServices={totalServices}
              topService={topService}
              activeServices={activeServices}
              top5Services={top5Services}
              maxBookings={maxBookings}
            />
          </div>
        </div>

        {/* Form Modal */}
        <ServiceFormModal
          isOpen={showForm}
          onClose={resetForm}
          title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          formData={formData}
          setFormData={setFormData}
          error={error}
          onSubmit={handleSubmit}
          isPending={createService.isPending || updateService.isPending}
          isEditing={!!editingService}
          onCategoryChange={handleCategoryChange}
        />

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
                <p className="text-lg text-foreground">
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

export default function ServiciosPage() {
  return (
    <ComponentErrorBoundary>
      <ServiciosContent />
    </ComponentErrorBoundary>
  )
}
