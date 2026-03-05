'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, AlertTriangle, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { isMobileDevice } from '@/lib/utils/mobile'
import { animations } from '@/lib/design-system'
import { MiDiaNowCard } from './mi-dia-now-card'
import { MiDiaAppointmentRow } from './mi-dia-appointment-row'
import type { AppointmentZones } from '@/lib/utils/appointment-helpers'
import type { TodayAppointment } from '@/types/custom'

interface MiDiaTimelineProps {
  zones: AppointmentZones
  delayMap: Map<string, number>
  canCreateCitas?: boolean
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string) => void
  onNoShow?: (appointmentId: string) => void
  onFocusMode?: (appointmentId: string) => void
  onSelect?: (appointment: TodayAppointment) => void
  onWalkIn?: () => void
  loadingAppointmentId?: string | null
  isClosedDay?: boolean
  className?: string
}

type FinalizedFilter = 'all' | 'completed' | 'incidents'

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

/* Row stagger delay (ms per item) */
const STAGGER_DELAY = 0.04

/* Section entrance variants */
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

/* Row entrance variants (for stagger children) */
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

/* ─── Section Header ─── */
function SectionHeader({
  label,
  count,
  badge,
  children,
}: {
  label: string
  count: number
  badge?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</h2>
        <span className="text-xs font-medium text-muted tabular-nums">({count})</span>
        {badge}
      </div>
      {children}
    </div>
  )
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.spring.gentle}
      className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700"
      data-testid="mi-dia-empty-state"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
        <Calendar className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No hay citas hoy</h3>
      <p className="text-sm text-muted text-center max-w-sm">
        No tienes citas programadas para hoy. Disfruta tu dia libre o espera nuevas reservas.
      </p>
    </motion.div>
  )
}

/* ─── Closed Day State ─── */
function ClosedDayState({
  canCreateCitas,
  onWalkIn,
}: {
  canCreateCitas?: boolean
  onWalkIn?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.spring.gentle}
      className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700"
      data-testid="mi-dia-closed-state"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
        <Calendar className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Cerrado hoy</h3>
      <p className="text-sm text-muted text-center max-w-sm mb-4">
        No tienes horario de trabajo configurado para hoy.
      </p>
      {canCreateCitas && onWalkIn && (
        <button
          onClick={onWalkIn}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold active:scale-95 transition-transform"
        >
          <UserPlus className="h-4 w-4" />
          Walk-in de emergencia
        </button>
      )}
    </motion.div>
  )
}

/**
 * MiDiaTimeline — Zone compositor (Mock E pattern)
 * Renders 4 priority zones: NOW > Requires Action > Upcoming > Finalized
 */
export function MiDiaTimeline({
  zones,
  delayMap,
  canCreateCitas,
  onCheckIn,
  onComplete,
  onNoShow,
  onFocusMode,
  onSelect,
  onWalkIn,
  loadingAppointmentId,
  isClosedDay = false,
  className,
}: MiDiaTimelineProps) {
  const [finalizedExpanded, setFinalizedExpanded] = useState(false)
  const [finalizedFilter, setFinalizedFilter] = useState<FinalizedFilter>('all')
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false

  const totalFinalized = zones.finalized.completed.length + zones.finalized.incidents.length
  const hasAnyAppointments =
    zones.now || zones.requiresAction.length > 0 || zones.upcoming.length > 0 || totalFinalized > 0

  // Closed day override
  if (isClosedDay && !hasAnyAppointments) {
    return <ClosedDayState canCreateCitas={canCreateCitas} onWalkIn={onWalkIn} />
  }

  // Empty state
  if (!hasAnyAppointments) {
    return <EmptyState />
  }

  // Calculate total revenue from completed
  const totalRevenue = zones.finalized.completed.reduce(
    (sum, apt) => sum + (apt.final_price_snapshot ?? apt.price),
    0
  )

  // Filter finalized list
  const filteredFinalized =
    finalizedFilter === 'all'
      ? [...zones.finalized.completed, ...zones.finalized.incidents]
      : finalizedFilter === 'completed'
        ? zones.finalized.completed
        : zones.finalized.incidents

  // Running stagger offset across zones
  let staggerOffset = 0

  return (
    <div className={cn('space-y-5', className)} data-testid="mi-dia-timeline">
      {/* Zone 1: NOW */}
      {zones.now && (
        <section>
          <MiDiaNowCard
            appointment={zones.now}
            onComplete={onComplete!}
            onFocusMode={onFocusMode!}
            isLoading={loadingAppointmentId === zones.now.id}
          />
        </section>
      )}

      {/* Zone 2: Requires Action */}
      {zones.requiresAction.length > 0 && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={animations.spring.gentle}
        >
          <SectionHeader
            label="Requiere atencion"
            count={zones.requiresAction.length}
            badge={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
          />
          <div className="space-y-2" role="list">
            {zones.requiresAction.map((apt, i) => {
              const delay = (staggerOffset + i) * STAGGER_DELAY
              return (
                <motion.div
                  key={apt.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ ...animations.spring.default, delay }}
                >
                  <MiDiaAppointmentRow
                    appointment={apt}
                    estimatedDelay={delayMap.get(apt.id)}
                    onSelect={onSelect!}
                    onCheckIn={onCheckIn}
                    onNoShow={onNoShow}
                    swipeEnabled={isMobile}
                    variant="requires_action"
                    isLoading={loadingAppointmentId === apt.id}
                  />
                </motion.div>
              )
            })}
          </div>
          {(() => {
            staggerOffset += zones.requiresAction.length
            return null
          })()}
        </motion.section>
      )}

      {/* Zone 3: Upcoming */}
      {zones.upcoming.length > 0 && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...animations.spring.gentle, delay: staggerOffset * STAGGER_DELAY }}
        >
          <SectionHeader label="Proximas" count={zones.upcoming.length} />
          <div className="space-y-2" role="list">
            {zones.upcoming.map((apt, i) => {
              const delay = (staggerOffset + i) * STAGGER_DELAY
              return (
                <motion.div
                  key={apt.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ ...animations.spring.default, delay }}
                >
                  <MiDiaAppointmentRow
                    appointment={apt}
                    estimatedDelay={delayMap.get(apt.id)}
                    onSelect={onSelect!}
                    onCheckIn={onCheckIn}
                    onNoShow={onNoShow}
                    swipeEnabled={isMobile}
                    variant="upcoming"
                    isLoading={loadingAppointmentId === apt.id}
                  />
                </motion.div>
              )
            })}
          </div>
          {(() => {
            staggerOffset += zones.upcoming.length
            return null
          })()}
        </motion.section>
      )}

      {/* Zone 4: Finalized (collapsible) */}
      {totalFinalized > 0 && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...animations.spring.gentle, delay: staggerOffset * STAGGER_DELAY }}
        >
          <SectionHeader
            label="Finalizadas"
            count={totalFinalized}
            badge={
              totalRevenue > 0 ? (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {currencyFormatter.format(totalRevenue)}
                </span>
              ) : undefined
            }
          >
            <button
              onClick={() => setFinalizedExpanded(!finalizedExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {finalizedExpanded ? 'Ocultar' : 'Mostrar'}
              <motion.span
                animate={{ rotate: finalizedExpanded ? 180 : 0 }}
                transition={animations.spring.snappy}
                className="inline-flex"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          </SectionHeader>

          <AnimatePresence>
            {finalizedExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={animations.spring.sheet}
                className="overflow-hidden"
              >
                {/* Micro-toggle filter */}
                {zones.finalized.incidents.length > 0 && zones.finalized.completed.length > 0 && (
                  <div className="flex gap-1 mb-2.5">
                    {(['all', 'completed', 'incidents'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFinalizedFilter(f)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors',
                          finalizedFilter === f
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : 'text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        )}
                      >
                        {f === 'all' ? 'Todas' : f === 'completed' ? 'Completadas' : 'Incidentes'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2" role="list">
                  {filteredFinalized
                    .sort(
                      (a, b) =>
                        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                    )
                    .map((apt, i) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...animations.spring.default, delay: i * STAGGER_DELAY }}
                      >
                        <MiDiaAppointmentRow
                          appointment={apt}
                          onSelect={onSelect!}
                          swipeEnabled={false}
                          variant="finalized"
                          isLoading={loadingAppointmentId === apt.id}
                        />
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Bottom CTA: Walk-in */}
      {canCreateCitas && onWalkIn && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: staggerOffset * STAGGER_DELAY + 0.1 }}
          onClick={onWalkIn}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 px-4',
            'rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700',
            'text-sm font-medium text-muted',
            'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 active:scale-[0.98] transition-all'
          )}
          data-testid="walk-in-bottom-cta"
        >
          <UserPlus className="h-4 w-4" />+ Walk-in
        </motion.button>
      )}
    </div>
  )
}
