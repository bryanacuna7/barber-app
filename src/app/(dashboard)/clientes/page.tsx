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
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'
import type { Client } from '@/types'
import { ClientesTourWrapper } from '@/components/tours/clientes-tour-wrapper'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { usePreference } from '@/lib/preferences'
import { getClientSegment } from '@/lib/utils/client-segments'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'

// React Query hooks
import { useClientMetrics } from '@/hooks/queries/useClientMetrics'
import { useCreateClient } from '@/hooks/queries/useClients'
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
import { ClientDetailModal } from '@/components/clients/client-detail-modal'

type ClientSegment = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'
type ViewMode = 'cards' | 'table' | 'calendar'
type SortColumn = 'name' | 'segment' | 'spent' | 'visits' | null

export default function ClientesPage() {
  // UI state
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<ClientSegment>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = usePreference<ViewMode>('clientes_view', 'cards', [
    'cards',
    'table',
    'calendar',
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [segmentSheetOpen, setSegmentSheetOpen] = useState(false)
  const [statsExpanded, setStatsExpanded] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedCardClient, setSelectedCardClient] = useState<Client | null>(null)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAll, setShowAll] = useState(false)

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
      window.history.replaceState(null, '', '/clientes')
      requestAnimationFrame(() => setShowModal(true))
    }
  }, [searchParams])

  // Data hooks
  const { metrics, clients, isLoading, error: queryError, refetch } = useClientMetrics(businessId)
  const { data: clientActivities, isLoading: activitiesLoading } = useClientActivities({
    clientId: selectedCardClient?.id ?? null,
    enabled: !!selectedCardClient,
  })
  const createClient = useCreateClient()
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

  // Filter + sort
  const filteredClients = useMemo(() => {
    let result = clients

    if (selectedSegment !== 'all') {
      result = result.filter((c) => getClientSegment(c) === selectedSegment)
    }

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
  }, [clients, selectedSegment, search, sortColumn, sortDirection])

  const DISPLAY_LIMIT = 50
  const displayedClients = useMemo(() => {
    if (showAll || viewMode === 'calendar') return filteredClients
    return filteredClients.slice(0, DISPLAY_LIMIT)
  }, [filteredClients, showAll, viewMode])

  // Handlers
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
      <ClientesTourWrapper>
        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
          disabled={showModal || !!selectedClient || isMobileDetailOpen || segmentSheetOpen}
        >
          <div className="relative overflow-x-hidden pb-4">
            <div className="relative z-10 space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="app-page-title brand-gradient-text">Clientes</h1>
                  <p className="app-page-subtitle mt-1">{metrics.total} registrados</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="lg:hidden">
                    <NotificationBell />
                  </div>
                  <Button
                    variant="cta"
                    data-tour="clients-add-button"
                    onClick={() => {
                      setShowModal(true)
                      if (isMobileDevice()) haptics.tap()
                    }}
                    className="min-w-[44px] min-h-[44px] h-10"
                  >
                    <Plus className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo Cliente</span>
                  </Button>
                </div>
              </div>

              {/* Guide Tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={animations.spring.default}
              >
                <GuideContextualTip
                  tipId="clientes-loyalty"
                  title="Premiá a tus clientes frecuentes"
                  description="Activá el programa de lealtad para que tus clientes acumulen puntos y vuelvan más seguido."
                  linkHref="/guia#clientes"
                />
              </motion.div>

              {/* Stats */}
              <ClientStatsSection metrics={metrics} statsExpanded={statsExpanded} />

              {/* Notifications */}
              <ClientNotificationsBanner
                notifications={notifications}
                showNotifications={showNotifications}
                onDismiss={() => setShowNotifications(false)}
                onWhatsApp={handleWhatsApp}
              />

              {/* Search + View Selector + Filters */}
              <ClientSearchToolbar
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onOpenSegmentFilter={() => setSegmentSheetOpen(true)}
                selectedSegment={selectedSegment}
                statsExpanded={statsExpanded}
                onToggleStats={() => setStatsExpanded(!statsExpanded)}
              />

              {/* Segment Filter Sheet */}
              <ClientSegmentSheet
                isOpen={segmentSheetOpen}
                onOpenChange={setSegmentSheetOpen}
                selectedSegment={selectedSegment}
                onSegmentChange={setSelectedSegment}
                metrics={metrics}
              />

              {/* Client Views */}
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
                  />
                )}

                {viewMode === 'table' && (
                  <ClientTableView
                    clients={displayedClients}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onSelectClient={setSelectedClient}
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

              {/* Show all button for progressive disclosure */}
              {!showAll && viewMode !== 'calendar' && filteredClients.length > DISPLAY_LIMIT && (
                <div className="flex justify-center pt-4">
                  <Button variant="ghost" onClick={() => setShowAll(true)} className="text-sm">
                    Mostrar todos ({filteredClients.length})
                  </Button>
                </div>
              )}

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

              {/* Client Detail Modal */}
              <ClientDetailModal
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onWhatsApp={handleWhatsApp}
              />
            </div>
          </div>
        </PullToRefresh>
      </ClientesTourWrapper>
    </ComponentErrorBoundary>
  )
}
