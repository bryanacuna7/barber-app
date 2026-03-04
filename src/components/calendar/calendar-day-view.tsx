'use client'

import React, { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { format, parseISO, addMinutes, isValid } from 'date-fns'
import { X, Plus, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { AppointmentContextMenu, type ContextMenuAppointment } from './appointment-context-menu'
import { useLongPress } from '@/hooks/use-long-press'
import { animations } from '@/lib/design-system'
import { formatCurrencyCompactMillions } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeBlock {
  id: string
  label: string
  start: number
  end: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  gradient: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
  occupancyPercent: number
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
      className={`inline-block mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${pill.className}`}
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
  const endTime = format(
    addMinutes(
      parseISO(apt.scheduled_at),
      apt.duration_minutes || apt.service?.duration_minutes || 30
    ),
    'H:mm'
  )
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
              className={`flex min-w-0 flex-1 items-start justify-between gap-2 ${isCancelled ? 'opacity-50' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
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
                    className={`text-sm font-semibold text-foreground leading-tight truncate ${isCancelled ? 'line-through' : ''}`}
                  >
                    {apt.service?.name || 'Servicio'}
                  </span>
                </div>
                <span className="text-xs text-muted leading-tight truncate block">
                  {apt.client?.name || 'Cliente'}
                </span>
              </div>

              {/* Price + Status pill */}
              <div className="flex-shrink-0 text-right">
                <div
                  className={`text-sm font-semibold tabular-nums leading-tight ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}
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
            <div className="min-w-0 flex-1">
              <div className="group flex items-center gap-2 mb-0.5">
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
                        : 'border-zinc-300 dark:border-zinc-600 opacity-0 group-hover:opacity-100'
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
                  className={`text-sm font-semibold text-foreground leading-tight ${isCancelled ? 'line-through' : ''}`}
                >
                  {apt.service?.name || 'Servicio'}
                </span>
              </div>
              <span className="text-xs text-muted">{apt.client?.name || 'Cliente'}</span>
            </div>

            <div className="flex-shrink-0 text-right">
              <div
                className={`text-sm font-semibold tabular-nums leading-tight ${isCancelled ? 'text-muted line-through' : 'text-foreground'}`}
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
// Scroll-fade wrapper — dims blocks as they scroll past (mobile only)
// ---------------------------------------------------------------------------

function TimeBlockScrollFade({
  children,
  isLast,
  entryDelay,
}: {
  children: React.ReactNode
  isLast: boolean
  entryDelay: number
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: innerRef,
    // From: block top at 65% viewport → To: block top 8% above viewport top
    offset: ['start 0.65', 'start -0.08'],
  })

  // Last block never dims — it's always the "current" section
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], isLast ? [1, 1, 1] : [1, 1, 0.38])
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], isLast ? [1, 1, 1] : [1, 1, 0.975])

  return (
    // Outer: scroll-linked visual state
    <motion.div style={{ opacity, scale, transformOrigin: 'top center' }}>
      {/* Inner: entry animation */}
      <motion.div
        ref={innerRef}
        initial={{ opacity: 0, y: 20 }}
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

  return (
    <div className="space-y-4">
      {unscheduledCount > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 p-4 shadow-sm dark:shadow-none">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Sin hora asignada · {unscheduledCount}
          </span>
        </div>
      )}

      {/* Time blocks (Cinema feature) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {timeBlocks.map((block, blockIndex) => (
          <TimeBlockScrollFade
            key={block.id}
            isLast={blockIndex === timeBlocks.length - 1}
            entryDelay={blockIndex * 0.1}
          >
            {/* Block label — fuera del card, estilo Mock B */}
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-1.5">
                <block.icon className={`w-3.5 h-3.5 ${block.iconColor}`} />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  {block.label}
                </h3>
                <span className="text-[11px] text-subtle">
                  · {block.start > 12 ? block.start - 12 : block.start}
                  {block.start >= 12 ? 'pm' : 'am'} – {block.end > 12 ? block.end - 12 : block.end}
                  {block.end >= 12 ? 'pm' : 'am'}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  block.occupancyPercent >= 90
                    ? 'text-red-500'
                    : block.occupancyPercent >= 60
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                }`}
              >
                {block.count} citas · {block.occupancyPercent}%
              </span>
            </div>

            {/* Slim occupancy bar */}
            <div className="h-[3px] mb-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${block.occupancyPercent}%` }}
                className={`h-full rounded-full ${
                  block.occupancyPercent >= 90
                    ? 'bg-red-500'
                    : block.occupancyPercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
              />
            </div>

            {/* Appointments card — solo las filas */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-0 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none">
              {block.appointments.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted">Sin citas en este bloque</div>
              )}

              <AnimatePresence mode="popLayout">
                {(() => {
                  // Compute now-line insertion index for the active block
                  const isActiveBlock =
                    isSelectedDateToday &&
                    currentTime != null &&
                    currentTime.getHours() >= block.start &&
                    currentTime.getHours() < block.end

                  const nowIndex = isActiveBlock
                    ? block.appointments.findIndex((apt) => {
                        if (!isValid(parseISO(apt.scheduled_at))) return false
                        return parseISO(apt.scheduled_at) >= currentTime!
                      })
                    : -1
                  // -1 means all apts are past → show after last; findIndex returns -1 on no match
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
                  const gapHour = parseISO(gap.start).getHours()
                  return gapHour >= block.start && gapHour < block.end
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
                          {gap.minutes} min disponible · {format(parseISO(gap.start), 'h:mm a')} -{' '}
                          {format(parseISO(gap.end), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </TimeBlockScrollFade>
        ))}
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
