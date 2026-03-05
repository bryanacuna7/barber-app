'use client'

import { useMemo, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EntityContextMenu } from '@/components/ui/entity-context-menu'
import {
  Crown,
  Heart,
  Clock,
  Zap,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  User,
  UserPlus,
  DollarSign,
  Scissors,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { ActivityItem } from '@/components/clients/activity-item'
import { formatCurrencyCompact } from '@/lib/utils'
import type { Client } from '@/types'
import { animations } from '@/lib/design-system'
import { getClientSegment, calculateLoyalty } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'

interface ClientActivity {
  id: string
  type: 'appointment' | 'registered'
  title: string
  description: string
  date: string
  amount?: number
  status?: string
}

interface ClientCardsViewProps {
  clients: Client[]
  selectedCardClient: Client | null
  onSelectCardClient: (client: Client) => void
  onMobileDetailOpen: () => void
  onSelectClient: (client: Client) => void
  clientActivities: ClientActivity[] | undefined
  activitiesLoading: boolean
  onWhatsApp: (phone: string) => void
  // Bulk selection (optional — backwards compatible)
  isSelected?: (id: string) => boolean
  onToggleSelect?: (id: string, event?: { shiftKey: boolean }) => void
  selectionCount?: number
}

/**
 * Alphabet rail — vanilla DOM appended to body to escape framer-motion transforms.
 * Singleton pattern (ID-based) prevents StrictMode duplicates.
 * Uses native event listeners so iOS Safari touch/click works reliably.
 */
const RAIL_ID = 'alphabet-rail'

function AlphabetRail({
  letters,
  onScrollTo,
}: {
  letters: string[]
  onScrollTo: (letter: string) => void
}) {
  const scrollRef = useRef(onScrollTo)
  useEffect(() => {
    scrollRef.current = onScrollTo
  })

  useEffect(() => {
    if (letters.length <= 1) {
      document.getElementById(RAIL_ID)?.remove()
      return
    }

    // Singleton: remove any existing rail first
    document.getElementById(RAIL_ID)?.remove()

    const nav = document.createElement('nav')
    nav.id = RAIL_ID
    nav.setAttribute('aria-label', 'Índice alfabético')
    // Position dynamically between filter bar and bottom nav
    nav.style.cssText =
      'position:fixed;right:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 2px;pointer-events:none;touch-action:none;'

    // Calculate bounds: below filters, above bottom nav
    const filterBar = document.querySelector('[data-filter-bar]')
    const bottomNav = document.querySelector('nav.fixed.bottom-0')
    const topPx = filterBar ? filterBar.getBoundingClientRect().bottom + 8 : 184 // fallback
    const bottomPx = bottomNav ? window.innerHeight - bottomNav.getBoundingClientRect().top + 8 : 80 // fallback ~5rem
    nav.style.top = `${topPx}px`
    nav.style.bottom = `${bottomPx}px`

    // Hide on large screens
    const mq = window.matchMedia('(min-width: 1024px)')
    const applyMq = () => {
      nav.style.display = mq.matches ? 'none' : 'flex'
    }
    applyMq()
    mq.addEventListener('change', applyMq)

    for (const letter of letters) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.dataset.letter = letter
      btn.className = 'flex h-[18px] w-[18px] items-center justify-center pointer-events-auto'
      btn.style.touchAction = 'manipulation'
      const span = document.createElement('span')
      span.textContent = letter
      span.className =
        'text-[11px] font-bold text-blue-400 leading-none pointer-events-none select-none'
      btn.appendChild(span)
      // Native click for both desktop and iOS
      btn.addEventListener('click', () => scrollRef.current(letter))
      nav.appendChild(btn)
    }

    // Touch-scrub: drag finger along rail
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault() // prevent scroll & ghost clicks
      const touch = e.touches[0]
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      const l =
        el?.getAttribute('data-letter') ?? (el as HTMLElement)?.parentElement?.dataset.letter
      if (l) scrollRef.current(l)
    }
    nav.addEventListener('touchmove', handleTouch, { passive: false })
    nav.addEventListener('touchstart', handleTouch, { passive: false })

    document.body.appendChild(nav)

    return () => {
      nav.remove()
      mq.removeEventListener('change', applyMq)
    }
  }, [letters])

  return null
}

function getActivityIcon(type: string) {
  if (type === 'registered')
    return {
      icon: UserPlus,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100 dark:bg-green-900/30',
    }
  return {
    icon: Scissors,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
  }
}

export function ClientCardsView({
  clients,
  selectedCardClient,
  onSelectCardClient,
  onMobileDetailOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectClient,
  clientActivities,
  activitiesLoading,
  onWhatsApp,
  isSelected,
  onToggleSelect,
  selectionCount = 0,
}: ClientCardsViewProps) {
  const hasBulkSelection = selectionCount > 0

  // ── Group clients by first letter (iOS Contacts sections) ──
  const groupedClients = useMemo(() => {
    const groups: Record<string, Client[]> = {}
    for (const client of clients) {
      const letter = (client.name.charAt(0) || '#').toUpperCase()
      const key = /[A-Z]/.test(letter) ? letter : '#'
      if (!groups[key]) groups[key] = []
      groups[key].push(client)
    }
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '#') return 1
      if (b === '#') return -1
      return a.localeCompare(b)
    })
  }, [clients])

  const availableLetters = useMemo(() => groupedClients.map(([letter]) => letter), [groupedClients])

  const mobileListRef = useRef<HTMLDivElement>(null)

  const scrollToLetter = useCallback((letter: string) => {
    // Multiple section-{letter} may exist (mobile + desktop); pick the visible one
    const candidates = document.querySelectorAll(`[id="section-${letter}"]`)
    for (const el of candidates) {
      if ((el as HTMLElement).offsetParent !== null) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
  }, [])

  return (
    <motion.div
      key="cards"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`grid grid-cols-1 gap-6 ${selectedCardClient ? 'lg:grid-cols-5' : 'lg:grid-cols-1'}`}
    >
      {/* ── Mobile: iOS Contacts style list ── */}
      <div
        className={`lg:hidden relative ${selectedCardClient ? 'lg:col-span-2' : 'lg:col-span-1'}`}
      >
        <div ref={mobileListRef} className="pr-6">
          {groupedClients.map(([letter, sectionClients]) => (
            <div key={letter} id={`section-${letter}`}>
              {/* Section header */}
              <div className="sticky top-0 z-10 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm px-4 py-1.5">
                <span className="text-[13px] font-bold text-foreground">{letter}</span>
              </div>

              {/* Client rows */}
              {sectionClients.map((client, idx) => {
                const segment = getClientSegment(client)
                const rightActions = [
                  {
                    icon: <MessageCircle className="h-5 w-5" />,
                    label: 'WhatsApp',
                    color: 'bg-emerald-500',
                    onClick: () => onWhatsApp(client.phone),
                  },
                  {
                    icon: <User className="h-5 w-5" />,
                    label: 'Ver perfil',
                    color: 'bg-blue-500',
                    onClick: () => {
                      onSelectCardClient(client)
                      onMobileDetailOpen()
                    },
                  },
                ]

                return (
                  <div key={client.id}>
                    <SwipeableRow rightActions={rightActions} showAffordance={false}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCardClient(client)
                          onMobileDetailOpen()
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 text-sm font-bold text-white">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          {segment === 'vip' && (
                            <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-0.5">
                              <Crown className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name only */}
                        <p className="font-medium text-[15px] text-foreground truncate flex-1">
                          {client.name}
                        </p>
                      </button>
                    </SwipeableRow>
                    {/* Divider outside SwipeableRow so it doesn't slide */}
                    {idx < sectionClients.length - 1 && (
                      <div className="ml-[4.25rem] h-px bg-zinc-200/60 dark:bg-zinc-800" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* ── Alphabet index rail (iOS style — rendered via portal to escape transforms) ── */}
        <AlphabetRail letters={availableLetters} onScrollTo={scrollToLetter} />
      </div>

      {/* ── Desktop: compact card list ── */}
      <div
        className={`hidden lg:block space-y-2 ${selectedCardClient ? 'lg:col-span-2' : 'lg:col-span-1'}`}
      >
        <div
          className={`space-y-2 ${
            selectedCardClient ? 'lg:max-h-[calc(100vh-24rem)] lg:overflow-y-auto lg:pr-2' : ''
          }`}
        >
          {clients.map((client) => {
            const segment = getClientSegment(client)
            const isCardSelected = selectedCardClient?.id === client.id

            return (
              <EntityContextMenu key={client.id} entityType="client" entityId={client.id}>
                <motion.div
                  onClick={() => {
                    onSelectCardClient(client)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectCardClient(client)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.snappy}
                  className={`group/card relative w-full text-left rounded-xl p-3 transition-colors border flex items-center gap-3 cursor-pointer ${
                    isSelected?.(client.id)
                      ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-600'
                      : isCardSelected
                        ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600'
                        : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Bulk checkbox — visible on hover or when any selection active */}
                  {onToggleSelect && (
                    <button
                      type="button"
                      className={`shrink-0 transition-opacity ${hasBulkSelection ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect(client.id, { shiftKey: e.shiftKey })
                      }}
                      aria-label={`Seleccionar ${client.name}`}
                      role="checkbox"
                      aria-checked={isSelected?.(client.id) ?? false}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                          isSelected?.(client.id)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400'
                        }`}
                      >
                        {isSelected?.(client.id) && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    {segment === 'vip' && (
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-0.5">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name + segment */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted">
                      {client.total_visits || 0} visitas ·{' '}
                      {formatCurrencyCompact(Number(client.total_spent || 0))}
                    </p>
                  </div>

                  {/* Segment badge */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${segmentConfig[segment].color}`}
                  >
                    {segmentConfig[segment].label}
                  </span>

                  {/* Chevron on hover */}
                  <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </motion.div>
              </EntityContextMenu>
            )
          })}
        </div>
      </div>

      {/* Right: Detail panel - Desktop only, only visible when client selected */}
      <div className={`hidden ${selectedCardClient ? 'lg:block lg:col-span-3' : ''}`}>
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
                  <h2 className="text-2xl font-bold text-foreground">{selectedCardClient.name}</h2>
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
                onClick={() => onWhatsApp(selectedCardClient.phone)}
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
                <p className="text-3xl font-bold text-foreground">
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
                <p className="text-2xl font-bold text-foreground truncate">
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
                <p className="text-3xl font-bold text-foreground">
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
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(calculateLoyalty(selectedCardClient))}%
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Phone className="h-5 w-5 text-muted" />
                <span className="text-foreground">{selectedCardClient.phone}</span>
              </div>
              {selectedCardClient.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Mail className="h-5 w-5 text-muted" />
                  <span className="text-foreground">{selectedCardClient.email}</span>
                </div>
              )}
            </div>

            {/* Activity Timeline — Real Data */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Actividad</h3>
              <div className="space-y-0">
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : clientActivities && clientActivities.length > 0 ? (
                  <>
                    {/* Registration event */}
                    {selectedCardClient.created_at &&
                      (() => {
                        const regIcon = getActivityIcon('registered')
                        const allActivities = [
                          ...clientActivities.map((a) => ({
                            ...a,
                            ...getActivityIcon('appointment'),
                          })),
                          {
                            id: 'registered',
                            title: 'Cliente registrado',
                            description: 'Se unió al programa',
                            date: selectedCardClient.created_at,
                            ...regIcon,
                          },
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                        return allActivities.map((activity, index, arr) => (
                          <ActivityItem
                            key={activity.id}
                            icon={activity.icon}
                            iconColor={activity.iconColor}
                            iconBgColor={activity.iconBgColor}
                            title={activity.title}
                            description={activity.description}
                            date={new Date(activity.date)}
                            amount={'amount' in activity ? activity.amount : undefined}
                            isLast={index === arr.length - 1}
                          />
                        ))
                      })()}
                    {!selectedCardClient.created_at &&
                      clientActivities.map((activity, index, arr) => {
                        const icons = getActivityIcon('appointment')
                        return (
                          <ActivityItem
                            key={activity.id}
                            icon={icons.icon}
                            iconColor={icons.iconColor}
                            iconBgColor={icons.iconBgColor}
                            title={activity.title}
                            description={activity.description}
                            date={new Date(activity.date)}
                            amount={activity.amount}
                            isLast={index === arr.length - 1}
                          />
                        )
                      })}
                  </>
                ) : (
                  <p className="text-sm text-muted py-4 text-center">Sin actividad registrada</p>
                )}
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
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Notas</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {selectedCardClient.notes}
                </p>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  )
}
