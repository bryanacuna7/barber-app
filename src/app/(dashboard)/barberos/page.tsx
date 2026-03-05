'use client'

/**
 * Equipo Page — Orchestrator
 *
 * Decomposed from 924-line monolith. Mobile: SwipeableRow list + bottom sheets.
 * Desktop: table + centered modals. Viewport-gated rendering (no dual render).
 *
 * Sub-components in src/components/team/:
 * - TeamMobileList — Owner featured card + member rows with SwipeableRow
 * - TeamDetailSheet — Viewport-gated: Sheet mobile / Modal desktop
 * - TeamInviteSheet — Viewport-gated: Sheet mobile / Modal desktop
 */

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  ChevronRight,
  UserRound,
  XCircle,
  CheckCircle2,
  Shield,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { useToast } from '@/components/ui/toast'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { trackMobileEvent } from '@/lib/analytics/mobile'
import { MOBILE_CANVAS_CLASS } from '@/lib/ui/mobile-contract'
import { useBusiness } from '@/contexts/business-context'
import { useBarbers, useDeleteBarber } from '@/hooks/queries/useBarbers'
import type { UIBarber } from '@/lib/adapters/barbers'

// Extracted sub-components
import { TeamMobileList } from '@/components/team/team-mobile-list'
import { TeamDetailSheet } from '@/components/team/team-detail-sheet'
import { TeamInviteSheet } from '@/components/team/team-invite-sheet'

type StatusFilter = 'all' | 'active' | 'inactive'

function BarberAvatar({
  name,
  avatarUrl,
  isActive,
}: {
  name: string
  avatarUrl?: string
  isActive: boolean
}) {
  const normalized = avatarUrl?.trim()
  const show = normalized && normalized.toLowerCase() !== 'null'
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || 'U'

  return (
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isActive ? 'bg-gradient-to-br from-teal-400 to-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalized}
          alt=""
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xs font-semibold uppercase text-white">{initials}</span>
      )}
    </div>
  )
}

export default function BarberosPage() {
  const { businessId } = useBusiness()
  const { data: barbers, isLoading, error, refetch } = useBarbers(businessId)

  const toast = useToast()
  const deleteBarberMutation = useDeleteBarber()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view')
  const [deletingBarber, setDeletingBarber] = useState<UIBarber | null>(null)

  // Derive live barber from query data
  const selectedBarber = useMemo(
    () => barbers?.find((b) => b.id === selectedBarberId) ?? null,
    [barbers, selectedBarberId]
  )

  const filteredBarbers = useMemo(() => {
    if (!barbers) return []
    let result = barbers

    // Status filter
    if (statusFilter === 'active') result = result.filter((b) => b.isActive)
    else if (statusFilter === 'inactive') result = result.filter((b) => !b.isActive)

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (b) => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [barbers, searchQuery, statusFilter])

  const activeCount = barbers?.filter((b) => b.isActive).length ?? 0

  const openInviteModal = (source: 'desktop' | 'mobile' | 'empty') => {
    setIsInviteOpen(true)
    if (isMobileDevice()) {
      setTimeout(() => {
        trackMobileEvent('mobile_equipo_invite_open', { source })
      }, 0)
    }
  }

  const openDetail = useCallback((barber: UIBarber) => {
    setDetailMode('view')
    setSelectedBarberId(barber.id)
    if (isMobileDevice()) haptics.tap()
  }, [])

  const handleDeleteBarber = useCallback((barber: UIBarber) => {
    setDeletingBarber(barber)
    if (isMobileDevice()) haptics.tap()
  }, [])

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen px-0 pt-4 lg:px-0 lg:pt-0 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="space-y-1 rounded-2xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-none" />
          ))}
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            Error al cargar miembros del equipo
          </p>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  const isDetailOpen = !!selectedBarberId

  return (
    <div className="min-h-screen lg:pb-6 relative overflow-x-hidden">
      <PullToRefresh
        onRefresh={async () => {
          await refetch()
        }}
        disabled={isDetailOpen || isInviteOpen || !!deletingBarber}
      >
        <div
          className={`${MOBILE_CANVAS_CLASS} pt-4 sm:px-0 lg:px-0 lg:pt-0 space-y-4 sm:space-y-6 relative z-10`}
        >
          {/* ── Desktop Header ── */}
          <DashboardPageHeader
            title="Equipo"
            subtitle={`${activeCount} miembro${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}`}
            actions={
              <Button
                variant="cta"
                onClick={() => openInviteModal('desktop')}
                className="min-w-[44px] min-h-[44px] h-10"
              >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Agregar Miembro</span>
              </Button>
            }
          />

          {/* ── Mobile Header ── */}
          <div className="lg:hidden space-y-3">
            {/* Search bar row: [Search...] [+ circle] */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl bg-zinc-100/70 dark:bg-white/[0.06] pl-10 pr-9 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:bg-zinc-100 dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-zinc-300/60 dark:focus:ring-zinc-600/50"
                  aria-label="Buscar miembro del equipo"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => openInviteModal('mobile')}
                aria-label="Agregar miembro"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0 active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Filter pills — sticky */}
            <div className="sticky top-0 z-20 -mx-4 px-4 py-1.5 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map((filter) => {
                const isActive = statusFilter === filter
                const label =
                  filter === 'all' ? 'Todos' : filter === 'active' ? 'Activos' : 'Inactivos'
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setStatusFilter(filter)
                      if (isMobileDevice()) haptics.selection()
                    }}
                    className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 transition-colors duration-150 ${
                      isActive
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-white/[0.06]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Desktop Search ── */}
          <div className="hidden lg:block">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg bg-zinc-100/70 dark:bg-white/[0.06] pl-9 pr-3 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:bg-zinc-100 dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-zinc-300/60 dark:focus:ring-zinc-600/50"
              />
            </div>
          </div>

          {/* ── Content ── */}
          {filteredBarbers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="text-center py-16 space-y-3"
            >
              <UserRound className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                {searchQuery ? 'Sin resultados' : 'Sin miembros del equipo'}
              </p>
              <p className="text-sm text-muted">
                {searchQuery
                  ? 'Intenta con otro término de búsqueda'
                  : 'Invita a tu primer miembro del equipo para empezar'}
              </p>
              {!searchQuery && (
                <Button
                  variant="cta"
                  onClick={() => openInviteModal('empty')}
                  className="mt-4 h-11 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Miembro del equipo
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Mobile: visual list with owner card + SwipeableRow */}
              <div className="lg:hidden">
                <TeamMobileList
                  barbers={filteredBarbers}
                  onSelect={openDetail}
                  onDelete={handleDeleteBarber}
                />
              </div>

              {/* Desktop: table layout — preserved from original */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden lg:block overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 bg-white/92 dark:bg-zinc-900/88 shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Miembro del equipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        Estado
                      </th>
                      <th className="w-12 px-4 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBarbers.map((barber, index) => (
                      <tr
                        key={barber.id}
                        onClick={() => openDetail(barber)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openDetail(barber)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Ver detalle de ${barber.name}`}
                        className={`group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:ring-inset ${
                          index < filteredBarbers.length - 1
                            ? 'border-b border-zinc-200 dark:border-zinc-800/80'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <BarberAvatar
                              name={barber.name}
                              avatarUrl={barber.avatarUrl}
                              isActive={barber.isActive}
                            />
                            <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                              {barber.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">{barber.email}</td>
                        <td className="px-4 py-3">
                          {barber.role === 'owner' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                              <Shield className="h-3 w-3" />
                              Dueño
                            </span>
                          ) : (
                            <span className="text-sm text-muted">Barbero</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              barber.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-muted'
                            }`}
                          >
                            {barber.isActive ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {barber.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </>
          )}

          {/* Bottom spacing for nav */}
          <div className="h-24 lg:h-0" />
        </div>
      </PullToRefresh>

      {/* Invite Sheet */}
      <TeamInviteSheet open={isInviteOpen} onOpenChange={setIsInviteOpen} />

      {/* Detail Sheet */}
      <TeamDetailSheet
        barber={selectedBarber}
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedBarberId(null)
        }}
        initialMode={detailMode}
      />

      {/* Mobile compact delete confirmation */}
      <Sheet
        open={!!deletingBarber}
        onOpenChange={(open) => {
          if (!open) setDeletingBarber(null)
        }}
      >
        <SheetContent side="bottom">
          <SheetClose onClose={() => setDeletingBarber(null)} />
          <div className="space-y-4 pt-2 pb-[env(safe-area-inset-bottom,0px)]">
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                ¿Eliminar a {deletingBarber?.name}?
              </p>
              <p className="text-sm text-muted mt-1">Esta acción no se puede deshacer.</p>
            </div>
            <Button
              variant="danger"
              onClick={async () => {
                if (!deletingBarber) return
                try {
                  await deleteBarberMutation.mutateAsync(deletingBarber.id)
                  toast.success(`${deletingBarber.name} eliminado`)
                  setDeletingBarber(null)
                  if (isMobileDevice()) haptics.tap()
                } catch {
                  toast.error('Error al eliminar miembro')
                }
              }}
              isLoading={deleteBarberMutation.isPending}
              className="w-full h-11"
            >
              Eliminar Miembro
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
