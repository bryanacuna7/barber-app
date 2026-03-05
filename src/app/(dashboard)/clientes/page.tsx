'use client'

/**
 * Clientes Page — Orchestrator
 *
 * State management + composition of extracted sub-components.
 * Split from 1,981-line god-component in E4.1.
 *
 * Sub-components in src/components/clients/:
 * - ClientStatsSection — KPI cards
 * - ClientNotificationsBanner — smart alerts
 * - ClientSearchToolbar — search + view selector + filters
 * - ClientSegmentSheet — segment filter bottom sheet
 * - ClientCardsView — master-detail cards layout
 * - ClientTableView — sortable table layout
 * - ClientCalendarView — heatmap calendar
 * - ClientMobileSheet — mobile detail bottom sheet
 * - CreateClientModal — new client form
 * - ClientDetailModal — client profile modal
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { Plus, Search, BarChart3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'
import type { Client } from '@/types'
import { ClientesTourWrapper } from '@/components/tours/clientes-tour-wrapper'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { trackMobileEvent } from '@/lib/analytics/mobile'
import { MOBILE_CANVAS_CLASS, MOBILE_PRIMARY_CTA_CLASS } from '@/lib/ui/mobile-contract'
import { usePreference } from '@/lib/preferences'
import { getClientSegment } from '@/lib/utils/client-segments'
import {
  DEFAULT_CLIENT_FILTERS,
  countActiveClientFilters,
  matchesClientFilters,
  type ClientFilters,
} from '@/lib/utils/client-filters'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { getDashboardRouteMeta } from '@/lib/navigation/route-meta'
import { useSavedFilters } from '@/hooks/useSavedFilters'
import { useSelection } from '@/hooks/useSelection'
import { BulkActionsToolbar } from '@/components/ui/bulk-actions-toolbar'
import { useToast } from '@/components/ui/toast'

// React Query hooks
import { useClientMetrics } from '@/hooks/queries/useClientMetrics'
import { useCreateClient } from '@/hooks/queries/useClients'
import { useOptimisticDeleteClient } from '@/hooks/queries/useOptimisticClients'
import { useClientActivities } from '@/hooks/queries/useClientActivities'

// Real-time WebSocket integration
import { useRealtimeClients } from '@/hooks/use-realtime-clients'

// Error boundaries
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'
import { Skeleton } from '@/components/ui/skeleton'

// Business context
import { useBusiness } from '@/contexts/business-context'

// Extracted sub-components
import { ClientStatsSection } from '@/components/clients/client-stats-section'
import { ClientNotificationsBanner } from '@/components/clients/client-notifications-banner'
import { ClientSearchToolbar } from '@/components/clients/client-search-toolbar'
import { ClientSegmentSheet } from '@/components/clients/client-segment-sheet'
import { ClientCardsView } from '@/components/clients/client-cards-view'
import { ClientTableView } from '@/components/clients/client-table-view'
import { ClientCalendarView } from '@/components/clients/client-calendar-view'
import { ClientMobileSheet } from '@/components/clients/client-mobile-sheet'
import { CreateClientModal } from '@/components/clients/create-client-modal'
import { ClientDetailPanel } from '@/components/clients/client-detail-panel'
import { SplitPanel } from '@/components/ui/split-panel'
import { EmptyClients, EmptySearch, EmptyState } from '@/components/ui/empty-state'
import { ClientEffects } from '@/components/dashboard/client-effects'
import { SavedFilterBar } from '@/components/ui/saved-filter-bar'

type ViewMode = 'cards' | 'table' | 'calendar'
type SortColumn = 'name' | 'segment' | 'spent' | 'visits' | null

// Built-in presets removed — quick filters (Todos/VIP/En riesgo) are now
// handled directly in <ClientSearchToolbar> with colored pill buttons.

export default function ClientesPage() {
  const headerMeta = getDashboardRouteMeta('/clientes')
  const router = useRouter()
  const toast = useToast()

  // UI state
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const savedFilters = useSavedFilters<ClientFilters>({
    pageKey: 'clientes',
    defaultFilter: DEFAULT_CLIENT_FILTERS,
    builtInPresets: [],
  })
  const filters = savedFilters.activeFilter
  const setFilters = savedFilters.setActiveFilter
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = usePreference<ViewMode>('clientes_view', 'cards', [
    'cards',
    'table',
    'calendar',
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [segmentSheetOpen, setSegmentSheetOpen] = useState(false)
  const [statsExpanded, setStatsExpanded] = useState(false)
  const [isFollowUpActive, setIsFollowUpActive] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedCardClient, setSelectedCardClient] = useState<Client | null>(null)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  // Business ID from context
  const { businessId } = useBusiness()

  // Auto-open create modal when navigated with ?intent=create
  const searchParams = useSearchParams()
  const intentHandled = useRef(false)
  useEffect(() => {
    if (searchParams.get('intent') === 'create' && !intentHandled.current) {
      intentHandled.current = true
      router.replace('/clientes', { scroll: false })
      requestAnimationFrame(() => setShowModal(true))
    }
  }, [searchParams, router])

  // Data hooks
  const { metrics, clients, isLoading, error: queryError, refetch } = useClientMetrics(businessId)
  const { data: clientActivities, isLoading: activitiesLoading } = useClientActivities({
    clientId: selectedCardClient?.id ?? null,
    enabled: !!selectedCardClient,
  })
  const createClient = useCreateClient()
  const { deleteClient } = useOptimisticDeleteClient()
  useRealtimeClients({ businessId, enabled: !!businessId })

  // Smart notifications — clients that need attention
  const notifications = useMemo(() => {
    return clients
      .filter((c) => {
        const segment = getClientSegment(c)
        const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
        if (!lastVisit) return (c.total_visits || 0) === 0
        const daysSinceVisit = Math.floor(
          (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        )
        return (
          (segment === 'vip' && daysSinceVisit > 14) ||
          (segment === 'frequent' && daysSinceVisit > 20) ||
          (segment === 'inactive' && daysSinceVisit > 25) ||
          daysSinceVisit > 25
        )
      })
      .slice(0, 5)
  }, [clients])

  // IDs of clients needing follow-up (for quick set lookup)
  const followUpIds = useMemo(() => new Set(notifications.map((c) => c.id)), [notifications])

  // Filter + sort
  const filteredClients = useMemo(() => {
    let result = clients

    // When "Seguimiento" pill is active, only show follow-up clients
    if (isFollowUpActive) {
      result = result.filter((c) => followUpIds.has(c.id))
    }

    result = result.filter((c) => matchesClientFilters(c, filters))

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          c.email?.toLowerCase().includes(searchLower)
      )
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

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
  }, [clients, filters, search, sortColumn, sortDirection, isFollowUpActive, followUpIds])

  const hasAppliedFilters = search.trim().length > 0 || countActiveClientFilters(filters) > 0
  const isCriticalClientsEmpty = metrics.total === 0
  const displayedClients = filteredClients

  // Bulk selection for multi-select actions
  const selection = useSelection(displayedClients)

  function openCreateClientModal(source: 'desktop' | 'mobile') {
    setShowModal(true)
    if (isMobileDevice()) {
      haptics.tap()
      trackMobileEvent('mobile_clientes_create_open', { source })
    }
  }

  // Handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const isMobile = isMobileDevice()
    try {
      await createClient.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      })
      if (isMobile) {
        haptics.success()
        trackMobileEvent('mobile_clientes_create_success', {
          hasEmail: Boolean(formData.email.trim()),
          hasNotes: Boolean(formData.notes.trim()),
        })
      }
      setFormData({ name: '', phone: '', email: '', notes: '' })
      setShowModal(false)
    } catch (err) {
      if (isMobile) {
        haptics.error()
        trackMobileEvent('mobile_clientes_create_error', {
          message: err instanceof Error ? err.message : 'unknown',
        })
      }
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
    }
  }

  function handleWhatsApp(phone: string) {
    const link = buildWhatsAppLink(phone)
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
  }

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  function handleBulkAction(actionId: string, ids: string[]) {
    if (ids.length === 0) return

    if (actionId !== 'client.delete') {
      toast.info('Acción masiva no disponible todavía')
      return
    }

    // Clear UI state before optimistic removal
    const deletedIds = new Set(ids)
    selection.clear()
    setSelectedClient((prev) => (prev && deletedIds.has(prev.id) ? null : prev))
    setSelectedCardClient((prev) => (prev && deletedIds.has(prev.id) ? null : prev))
    if (selectedCardClient && deletedIds.has(selectedCardClient.id)) {
      setIsMobileDetailOpen(false)
    }

    // Use undoable optimistic delete for each client
    for (const id of ids) {
      deleteClient(id)
    }
  }

  // Error state
  if (queryError) {
    return (
      <div className="p-6">
        <QueryError error={queryError} title="Error al cargar clientes" onRetry={refetch} />
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary>
      <ClientEffects title="Clientes" />
      <ClientesTourWrapper>
        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
          disabled={showModal || !!selectedClient || isMobileDetailOpen || segmentSheetOpen}
        >
          <div className={`${MOBILE_CANVAS_CLASS} relative overflow-x-hidden pb-4`}>
            <div className="relative z-10 space-y-4 sm:space-y-6">
              {/* Header */}
              <DashboardPageHeader
                title={headerMeta.title}
                subtitle={`${headerMeta.subtitle} · ${metrics.total} registrados`}
                actions={
                  <Button
                    variant="cta"
                    data-tour="clients-add-button"
                    onClick={() => openCreateClientModal('desktop')}
                    className="min-w-[44px] min-h-[44px] h-10"
                  >
                    <Plus className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo Cliente</span>
                  </Button>
                }
              />

              {/* Mobile compact command bar: [🔍 Search...] [🔔] [+] */}
              <div className="lg:hidden flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl bg-zinc-100/70 dark:bg-white/[0.06] pl-10 pr-9 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:bg-zinc-100 dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-zinc-300/60 dark:focus:ring-zinc-600/50"
                    aria-label="Buscar cliente"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setStatsExpanded(!statsExpanded)}
                  aria-label={statsExpanded ? 'Ocultar estadísticas' : 'Ver estadísticas'}
                  className={`flex items-center justify-center h-11 w-11 shrink-0 rounded-xl transition-colors ${
                    statsExpanded
                      ? 'text-foreground bg-zinc-100/70 dark:bg-white/[0.1]'
                      : 'text-muted hover:text-foreground hover:bg-zinc-100/70 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openCreateClientModal('mobile')}
                  aria-label="Nuevo cliente"
                  data-tour="clients-add-button-mobile"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0 active:scale-95 transition-transform"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Guide Tip */}
              <GuideContextualTip
                tipId="clientes-loyalty"
                title="Premiá a tus clientes frecuentes"
                description="Activá el programa de lealtad para que tus clientes acumulen puntos y vuelvan más seguido."
                linkHref="/guia#clientes"
              />

              {/* Stats */}
              <ClientStatsSection metrics={metrics} statsExpanded={statsExpanded} />

              {/* Notifications — desktop only (mobile removed bell to avoid confusion with global notifications) */}
              <div className="hidden lg:block">
                <ClientNotificationsBanner
                  notifications={notifications}
                  showNotifications={showNotifications}
                  onDismiss={() => setShowNotifications(false)}
                  onWhatsApp={handleWhatsApp}
                />
              </div>

              {/* Search + View Selector + Filters */}
              <ClientSearchToolbar
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onOpenSegmentFilter={() => setSegmentSheetOpen(true)}
                filters={filters}
                onFiltersChange={setFilters}
                statsExpanded={statsExpanded}
                onToggleStats={() => setStatsExpanded(!statsExpanded)}
                followUpCount={notifications.length}
                isFollowUpActive={isFollowUpActive}
                onToggleFollowUp={() => setIsFollowUpActive((prev) => !prev)}
              />

              {/* Saved filter presets — show when user has custom presets or can save */}
              {(savedFilters.presets.length > 0 || countActiveClientFilters(filters) > 0) && (
                <div className="hidden lg:block">
                  <SavedFilterBar
                    presets={savedFilters.presets}
                    activePresetId={savedFilters.activePresetId}
                    onApplyPreset={savedFilters.applyPreset}
                    onDeletePreset={savedFilters.deletePreset}
                    onSavePreset={(label) => savedFilters.savePreset(label, filters)}
                    canSave={countActiveClientFilters(filters) > 0}
                  />
                </div>
              )}

              {/* Segment Filter Sheet */}
              <ClientSegmentSheet
                isOpen={segmentSheetOpen}
                onOpenChange={setSegmentSheetOpen}
                filters={filters}
                onFiltersChange={setFilters}
                metrics={metrics}
              />

              <SplitPanel
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                panel={
                  selectedClient ? (
                    <ClientDetailPanel client={selectedClient} onWhatsApp={handleWhatsApp} />
                  ) : (
                    <div />
                  )
                }
              >
                <div>
                  {/* Client Views */}
                  {filteredClients.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-8 dark:border-zinc-800/70 dark:bg-zinc-900/70">
                      {isCriticalClientsEmpty ? (
                        <EmptyClients
                          onAddClient={() =>
                            openCreateClientModal(isMobileDevice() ? 'mobile' : 'desktop')
                          }
                          onViewGuide={() => router.push('/guia#clientes')}
                        />
                      ) : hasAppliedFilters ? (
                        <EmptySearch query={search.trim() || 'filtros aplicados'} />
                      ) : (
                        <EmptyState
                          icon={Search}
                          title="No encontramos clientes"
                          description="Prueba con otro término o cambia los filtros para ver resultados."
                        />
                      )}
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {viewMode === 'cards' && (
                        <ClientCardsView
                          clients={displayedClients}
                          selectedCardClient={selectedCardClient}
                          onSelectCardClient={setSelectedCardClient}
                          onMobileDetailOpen={() => setIsMobileDetailOpen(true)}
                          onSelectClient={setSelectedClient}
                          clientActivities={clientActivities}
                          activitiesLoading={activitiesLoading}
                          onWhatsApp={handleWhatsApp}
                          isSelected={selection.isSelected}
                          onToggleSelect={selection.toggle}
                          selectionCount={selection.count}
                        />
                      )}

                      {viewMode === 'table' && (
                        <ClientTableView
                          clients={displayedClients}
                          sortColumn={sortColumn}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                          onSelectClient={setSelectedClient}
                          isSelected={selection.isSelected}
                          onToggleSelect={selection.toggle}
                          onToggleAll={selection.toggleAll}
                          isAllSelected={selection.isAllSelected}
                          selectionCount={selection.count}
                        />
                      )}

                      {viewMode === 'calendar' && (
                        <ClientCalendarView
                          clients={filteredClients}
                          currentMonth={currentMonth}
                          setCurrentMonth={setCurrentMonth}
                        />
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </SplitPanel>

              {/* Mobile Client Detail Sheet */}
              <ClientMobileSheet
                client={selectedCardClient}
                isOpen={isMobileDetailOpen}
                onOpenChange={setIsMobileDetailOpen}
              />

              {/* Create Client Modal */}
              <CreateClientModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                formData={formData}
                setFormData={setFormData}
                error={error}
                onSubmit={handleSubmit}
                isPending={createClient.isPending}
              />
            </div>
          </div>
        </PullToRefresh>

        {/* Bulk Actions Toolbar — floats above bottom nav */}
        <BulkActionsToolbar
          count={selection.count}
          entityType="client"
          onAction={handleBulkAction}
          selectedIds={Array.from(selection.selected)}
          onClear={selection.clear}
        />
      </ClientesTourWrapper>
    </ComponentErrorBoundary>
  )
}
