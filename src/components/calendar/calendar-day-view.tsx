'use client'

import React, { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { format, parseISO, addMinutes, isValid } from 'date-fns'
import { X, Plus, CheckCircle2, CalendarX2 } from 'lucide-react'
import { toast } from 'sonner'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { AppointmentContextMenu, type ContextMenuAppointment } from './appointment-context-menu'
import { useLongPress } from '@/hooks/use-long-press'
import { animations } from '@/lib/design-system'
import { formatCurrencyCompactMillions } from '@/lib/utils'
import { getEffectiveDurationMinutes, toMinutesOfDay } from '@/lib/utils/occupancy'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeBlock {
  id: string
  label: string
  startMinute: number
  endMinute: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  gradient: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
  blockMinutes: number
  occupiedMinutes: number
  rawOccupancyPercent: number
  occupancyPercent: number
  occupancyCount: number
  isOverbooked: boolean
  count: number
}

interface Gap {
  start: string
  end: string
  minutes: number
}

export interface CalendarDayViewProps {
  timeBlocks: TimeBlock[]
  unscheduledCount: number
  gaps: Gap[]
  selectedId: string | null
  onSelectId: (id: string | null) => void
  draggedId: string | null
  onDragId: (id: string | null) => void
  onStatusChange: (appointmentId: string, status: 'cancelled' | 'completed') => void
  isBarber: boolean
  onWalkIn: () => void
  isSelected?: (id: string) => boolean
  onToggleSelect?: (id: string, event?: { shiftKey: boolean }) => void
  selectionCount?: number
  currentTime?: Date
  isSelectedDateToday?: boolean
}

// ---------------------------------------------------------------------------
// Now line — "you are here" separator between past and upcoming appointments
// ---------------------------------------------------------------------------

function NowLine({ time }: { time: Date }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 pointer-events-none" aria-hidden="true">
      <span className="text-[10px] font-bold tabular-nums text-[var(--brand-primary)] shrink-0">
        {format(time, 'H:mm')}
      </span>
      <div className="h-[1.5px] flex-1 bg-[var(--brand-primary)] opacity-50 rounded-full" />
      <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse shrink-0" />
    </div>
  )
}

function formatMinuteLabel(minuteOfDay: number): string {
  const normalized = ((minuteOfDay % 1440) + 1440) % 1440
  const hours24 = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const hours12 = hours24 % 12 || 12
  const suffix = hours24 >= 12 ? 'pm' : 'am'

  if (minutes === 0) {
    return `${hours12}${suffix}`
  }

  return `${hours12}:${String(minutes).padStart(2, '0')}${suffix}`
}

// ---------------------------------------------------------------------------
// Status accent bar — replaces the invisible 1.5px dot
// ---------------------------------------------------------------------------

function StatusAccent({ status }: { status: string }) {
  const color =
    status === 'completed'
      ? 'bg-emerald-400 dark:bg-emerald-500'
      : status === 'confirmed'
        ? 'bg-blue-400 dark:bg-blue-500'
        : status === 'pending'
          ? 'bg-amber-400 dark:bg-amber-500'
          : 'bg-zinc-300 dark:bg-zinc-600'

  return <div className={`w-[3px] self-stretch flex-shrink-0 rounded-full ${color}`} />
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    },
    confirmed: {
      label: 'Confirmada',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    },
    completed: {
      label: 'Completada',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    cancelled: {
      label: 'Cancelada',
      className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    },
    no_show: {
      label: 'No Show',
      className: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    },
    in_progress: {
      label: 'En curso',
      className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    },
  }
  const pill = map[status] ?? map.pending
  return (
    <span
      className={`inline-block mt-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${pill.className}`}
    >
      {pill.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Single swipeable appointment row
// ---------------------------------------------------------------------------

interface AppointmentRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apt: any
  isLast: boolean
  onSelectId: (id: string) => void
  onStatusChange: (id: string, status: 'cancelled' | 'completed') => void
  isSelected?: (id: string) => boolean
  onToggleSelect?: (id: string, event?: { shiftKey: boolean }) => void
  onOpenContextMenu: (apt: ContextMenuAppointment) => void
}

function AppointmentRow({
  apt,
  isLast,
  onSelectId,
  onStatusChange,
  isSelected,
  onToggleSelect,
  onOpenContextMenu,
}: AppointmentRowProps) {
  const canAct =
    apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'in_progress'

  const rightActions = canAct
    ? [
        {
          icon: <X className="h-5 w-5" />,
          label: 'Cancelar',
          color: 'bg-red-500',
          onClick: () => onStatusChange(apt.id, 'cancelled'),
        },
      ]
    : []

  const leftActions = canAct
    ? [
        {
          icon: <CheckCircle2 className="h-5 w-5" />,
          label: 'Completar',
          color: 'bg-emerald-500',
          onClick: () => onStatusChange(apt.id, 'completed'),
        },
      ]
    : []

  const contextMenuData: ContextMenuAppointment = {
    id: apt.id,
    clientName: apt.client?.name || 'Cliente',
    serviceName: apt.service?.name || 'Servicio',
    timeLabel: format(parseISO(apt.scheduled_at), 'h:mm a'),
    clientPhone: apt.client?.phone ?? null,
    status: apt.status,
  }

  const longPress = useLongPress({
    onLongPress: () => onOpenContextMenu(contextMenuData),
  })

  const startTime = format(parseISO(apt.scheduled_at), 'H:mm')
  const effectiveStart = apt.started_at ? parseISO(apt.started_at) : parseISO(apt.scheduled_at)
  const endTime = format(addMinutes(effectiveStart, getEffectiveDurationMinutes(apt)), 'H:mm')
  const price = formatCurrencyCompactMillions(apt.service?.price || 0)
  const isCancelled = apt.status === 'cancelled' || apt.status === 'no_show'

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
      transition={animations.spring.layout}
      className={isLast ? '' : 'border-b border-zinc-200/70 dark:border-zinc-800/50'}
    >
      {/* Mobile: swipeable + long-press */}
      <div className="lg:hidden">
        <SwipeableRow
          rightActions={rightActions}
          leftActions={leftActions}
          showAffordance={false}
          containerClassName="rounded-none"
        >
          <div
            {...longPress}
            onClick={(e) => longPress.onClick(e, () => onSelectId(apt.id))}
            className={`flex cursor-pointer items-stretch gap-2.5 px-3 py-3 select-none active:bg-zinc-100/80 dark:active:bg-zinc-900 ${
              isSelected?.(apt.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
          >
            {/* Stacked start/end time */}
            <div
              className={`flex-shrink-0 w-[38px] flex flex-col justify-center text-right ${isCancelled ? 'opacity-40' : ''}`}
            >
              <span className="text-[13px] font-semibold text-foreground tabular-nums leading-tight">
                {startTime}
              </span>
              <span className="text-[11px] text-muted tabular-nums leading-tight">{endTime}</span>
            </div>

            {/* Status accent bar */}
            <StatusAccent status={apt.status} />

            {/* Main content */}
            <div
              className={`flex min-w-0 flex-1 flex-col gap-1 ${isCancelled ? 'opacity-50' : ''}`}
            >
              <div className="min-w-0">
                <div className="mb-0.5 flex min-w-0 items-center gap-2">
                  {onToggleSelect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect(apt.id, { shiftKey: e.shiftKey })
                      }}
                      aria-label={`Seleccionar ${apt.client?.name || 'cita'}`}
                      role="checkbox"
                      aria-checked={isSelected?.(apt.id) ?? false}
                      className="flex h-5 w-5 items-center justify-center rounded border-2 border-zinc-300 dark:border-zinc-600"
                    >
                      {isSelected?.(apt.id) && (
                        <svg
                          className="h-3 w-3 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}
                  <span
                    className={`min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-foreground ${isCancelled ? 'line-through' : ''}`}
                  >
                    {apt.service?.name || 'Servicio'}
                  </span>
                </div>
                <span className="text-xs text-muted leading-tight truncate block">
                  {apt.client?.name || 'Cliente'}
                </span>
              </div>

              {/* Price + Status pill */}
              <div className="flex w-full items-center justify-between text-left">
                <div
                  className={`whitespace-nowrap text-sm font-semibold tabular-nums leading-tight ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}
                >
                  {price}
                </div>
                <StatusPill status={apt.status} />
              </div>
            </div>
          </div>
        </SwipeableRow>
      </div>

      {/* Desktop: draggable version */}
      <motion.div
        className="hidden lg:block"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragStart={() => {}}
        onDragEnd={() => {
          toast.info('Rescheduling (demo)')
        }}
        whileTap={{ scale: 0.98 }}
        whileDrag={{ scale: 1.05, zIndex: 50 }}
        onClick={() => onSelectId(apt.id)}
      >
        <div
          className={`flex cursor-grab items-stretch gap-2.5 px-4 py-3 active:cursor-grabbing transition-[opacity,background-color] ${
            isSelected?.(apt.id)
              ? 'bg-blue-50 dark:bg-blue-950/20'
              : 'hover:bg-zinc-100/85 dark:hover:bg-zinc-900'
          }`}
        >
          {/* Stacked start/end time */}
          <div
            className={`flex-shrink-0 w-[38px] flex flex-col justify-center text-right ${isCancelled ? 'opacity-40' : ''}`}
          >
            <span className="text-[13px] font-semibold text-foreground tabular-nums leading-tight">
              {startTime}
            </span>
            <span className="text-[11px] text-muted tabular-nums leading-tight">{endTime}</span>
          </div>

          <StatusAccent status={apt.status} />

          <div
            className={`flex min-w-0 flex-1 items-start justify-between gap-2 ${isCancelled ? 'opacity-50' : ''}`}
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="group mb-0.5 flex min-w-0 items-center gap-2">
                {onToggleSelect && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleSelect(apt.id, { shiftKey: e.shiftKey })
                    }}
                    aria-label={`Seleccionar ${apt.client?.name || 'cita'}`}
                    role="checkbox"
                    aria-checked={isSelected?.(apt.id) ?? false}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-opacity ${
                      isSelected?.(apt.id)
                        ? 'border-blue-500 bg-blue-500 text-white opacity-100'
                        : 'border-zinc-400 bg-white/80 text-zinc-700 opacity-100 hover:bg-white dark:border-zinc-400 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {isSelected?.(apt.id) && (
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
                  </button>
                )}
                <span
                  className={`min-w-0 flex-1 truncate whitespace-nowrap text-sm font-semibold leading-tight text-foreground ${isCancelled ? 'line-through' : ''}`}
                >
                  {apt.service?.name || 'Servicio'}
                </span>
              </div>
              <span className="block truncate text-xs text-muted">
                {apt.client?.name || 'Cliente'}
              </span>
            </div>

            <div className="flex-shrink-0 text-right">
              <div
                className={`whitespace-nowrap text-sm font-semibold tabular-nums leading-tight ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}
              >
                {price}
              </div>
              <StatusPill status={apt.status} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Card-level fade — opacity dims as card scrolls past the sticky label.
// Pure visual transform: zero layout change, zero feedback loop.
// ---------------------------------------------------------------------------

function CardScrollFade({
  children,
  isLast,
  entryDelay,
}: {
  children: React.ReactNode
  isLast: boolean
  entryDelay: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 0.55', 'start -0.1'],
  })

  // Dims past sections so the current block stays in focus
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], isLast ? [1, 1, 1] : [1, 1, 0.15])

  return (
    <motion.div ref={cardRef} style={{ opacity }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...animations.spring.gentle, delay: entryDelay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalendarDayView({
  timeBlocks,
  unscheduledCount,
  gaps,
  selectedId: _selectedId,
  onSelectId,
  draggedId: _draggedId,
  onDragId: _onDragId,
  onStatusChange,
  onWalkIn,
  isSelected,
  onToggleSelect,
  selectionCount = 0,
  currentTime,
  isSelectedDateToday = false,
}: CalendarDayViewProps) {
  void _selectedId
  void _draggedId
  void _onDragId
  void selectionCount

  const [contextMenu, setContextMenu] = useState<ContextMenuAppointment | null>(null)
  const allBlocksEmpty = timeBlocks.every((b) => b.appointments.length === 0)

  return (
    <div className="space-y-4">
      {unscheduledCount > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 p-4 shadow-sm dark:shadow-none">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Sin hora asignada · {unscheduledCount}
          </span>
        </div>
      )}

      {/* Mobile: unified empty state when ALL blocks are empty */}
      {allBlocksEmpty && (
        <div className="lg:hidden flex flex-col items-center gap-3 rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 px-6 py-10 shadow-sm dark:shadow-none text-center">
          <CalendarX2 className="h-10 w-10 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-foreground">Sin citas para hoy</p>
            <p className="mt-0.5 text-xs text-muted">Agendá una cita o agregá un walk-in</p>
          </div>
          <button
            type="button"
            onClick={onWalkIn}
            className="mt-1 flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 h-10 text-sm font-medium text-foreground active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar cita
          </button>
        </div>
      )}

      {/* Time blocks — sticky labels + fading cards */}
      {/* Desktop: always visible. Mobile: hidden when all blocks empty */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 ${allBlocksEmpty ? 'hidden lg:grid' : ''}`}
      >
        {timeBlocks.map((block, blockIndex) => {
          const isLastBlock = blockIndex === timeBlocks.length - 1
          return (
            <div key={block.id} className="relative">
              {/* Sticky label — glass pill, never fades, sticks at top while scrolling */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...animations.spring.gentle, delay: blockIndex * 0.05 }}
                className="sticky top-14 z-[5] -mx-1 px-1 pt-1 pb-2 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-sm md:static md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none"
              >
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <block.icon className={`w-3.5 h-3.5 ${block.iconColor}`} />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      {block.label}
                    </h3>
                    <span className="text-[11px] text-subtle">
                      · {formatMinuteLabel(block.startMinute)} –{' '}
                      {formatMinuteLabel(block.endMinute)}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      block.isOverbooked || block.occupancyPercent >= 90
                        ? 'text-red-500'
                        : block.occupancyPercent >= 60
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                    }`}
                  >
                    {block.occupancyCount} citas · {block.occupancyPercent}%
                    {block.isOverbooked ? ' · Sobrecupo' : ''}
                  </span>
                </div>

                {/* Slim occupancy bar */}
                <div className="h-[3px] mb-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${block.occupancyPercent}%` }}
                    className={`h-full rounded-full ${
                      block.isOverbooked || block.occupancyPercent >= 90
                        ? 'bg-red-500'
                        : block.occupancyPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Card content — fades as block scrolls past top */}
              <CardScrollFade isLast={isLastBlock} entryDelay={blockIndex * 0.1}>
                {/* Appointments card */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none mt-2">
                  {block.appointments.length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted">Sin citas en este bloque</div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {(() => {
                      // Compute now-line insertion index for the active block
                      const isActiveBlock =
                        isSelectedDateToday &&
                        currentTime != null &&
                        toMinutesOfDay(currentTime) >= block.startMinute &&
                        toMinutesOfDay(currentTime) < block.endMinute

                      const nowIndex = isActiveBlock
                        ? block.appointments.findIndex((apt) => {
                            if (!isValid(parseISO(apt.scheduled_at))) return false
                            return parseISO(apt.scheduled_at) >= currentTime!
                          })
                        : -1
                      // -1 means all apts are past → show after last
                      const insertAfterLast =
                        isActiveBlock && nowIndex === -1 && block.appointments.length > 0

                      return block.appointments.map((apt, aptIndex) => (
                        <React.Fragment key={apt.id}>
                          {aptIndex === (nowIndex === -1 ? -99 : nowIndex) && (
                            <NowLine time={currentTime!} />
                          )}
                          <AppointmentRow
                            apt={apt}
                            isLast={aptIndex === block.appointments.length - 1 && !insertAfterLast}
                            onSelectId={onSelectId}
                            onStatusChange={onStatusChange}
                            isSelected={isSelected}
                            onToggleSelect={onToggleSelect}
                            onOpenContextMenu={setContextMenu}
                          />
                          {insertAfterLast && aptIndex === block.appointments.length - 1 && (
                            <NowLine time={currentTime!} />
                          )}
                        </React.Fragment>
                      ))
                    })()}
                  </AnimatePresence>
                </div>

                {/* Gap indicators */}
                <div className="mt-3 space-y-1.5 lg:space-y-2">
                  {gaps
                    .filter((gap) => {
                      const gapMinute = toMinutesOfDay(parseISO(gap.start))
                      return gapMinute >= block.startMinute && gapMinute < block.endMinute
                    })
                    .map((gap, gapIndex) => (
                      <motion.div
                        key={`gap-${blockIndex}-${gapIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-lg p-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                        onClick={() => toast.info('Sugerir clientes para gap')}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5 text-subtle" />
                          <div className="flex-1">
                            <div className="text-xs text-subtle">
                              {gap.minutes} min disponible · {format(parseISO(gap.start), 'h:mm a')}{' '}
                              - {format(parseISO(gap.end), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardScrollFade>
            </div>
          )
        })}
      </div>

      {/* Long-press context menu (portal) */}
      <AppointmentContextMenu
        isOpen={!!contextMenu}
        onClose={() => setContextMenu(null)}
        appointment={contextMenu}
        onComplete={(id) => onStatusChange(id, 'completed')}
        onEdit={(id) => onSelectId(id)}
        onCancel={(id) => onStatusChange(id, 'cancelled')}
      />
    </div>
  )
}
