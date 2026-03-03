'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
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
  const canAct = apt.status === 'pending' || apt.status === 'confirmed'

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

  const timeLabel = format(parseISO(apt.scheduled_at), 'h:mm a')
  const price = formatCurrencyCompactMillions(apt.service?.price || 0)

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
      transition={animations.spring.layout}
      className={isLast ? '' : 'border-b border-zinc-200/70 dark:border-zinc-800/80'}
    >
      {/* Mobile: swipeable + long-press */}
      <div className="lg:hidden">
        <SwipeableRow
          rightActions={rightActions}
          leftActions={leftActions}
          showAffordance={canAct}
          containerClassName="rounded-none"
        >
          <div
            {...longPress}
            onClick={(e) => longPress.onClick(e, () => onSelectId(apt.id))}
            className={`flex cursor-pointer items-stretch gap-3 px-3 py-3 select-none active:bg-zinc-100/80 dark:active:bg-zinc-900 ${
              isSelected?.(apt.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
          >
            {/* Status accent bar */}
            <StatusAccent status={apt.status} />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 items-start justify-between">
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
                  <span className="text-sm font-semibold text-foreground leading-tight truncate">
                    {apt.client?.name || 'Cliente'}
                  </span>
                </div>
                <span className="text-xs text-muted leading-tight">
                  {apt.service?.name || 'Servicio'}
                </span>
              </div>

              {/* Time (primary) + Price (secondary) */}
              <div className="ml-3 flex-shrink-0 text-right">
                <div className="text-sm font-semibold text-foreground tabular-nums leading-tight">
                  {timeLabel}
                </div>
                <div className="mt-0.5 text-xs font-medium text-amber-500 dark:text-amber-400 leading-tight">
                  {price}
                </div>
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
          className={`flex cursor-grab items-stretch gap-3 px-4 py-3 active:cursor-grabbing transition-[opacity,background-color] ${
            isSelected?.(apt.id)
              ? 'bg-blue-50 dark:bg-blue-950/20'
              : 'hover:bg-zinc-100/85 dark:hover:bg-zinc-900'
          }`}
        >
          <StatusAccent status={apt.status} />

          <div className="flex min-w-0 flex-1 items-start justify-between">
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
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {apt.client?.name || 'Cliente'}
                </span>
              </div>
              <span className="text-xs text-muted">{apt.service?.name || 'Servicio'}</span>
            </div>

            <div className="ml-3 flex-shrink-0 text-right">
              <div className="text-sm font-semibold text-foreground tabular-nums leading-tight">
                {timeLabel}
              </div>
              <div className="mt-0.5 text-xs font-medium text-amber-500 dark:text-amber-400 leading-tight">
                {price}
              </div>
            </div>
          </div>
        </div>
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
}: CalendarDayViewProps) {
  void _selectedId
  void _draggedId
  void _onDragId
  void selectionCount

  const [contextMenu, setContextMenu] = useState<ContextMenuAppointment | null>(null)

  return (
    <div className="space-y-4">
      {unscheduledCount > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Sin hora asignada · {unscheduledCount}
          </span>
        </div>
      )}

      {/* Time blocks (Cinema feature) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {timeBlocks.map((block, blockIndex) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animations.spring.gentle, delay: blockIndex * 0.1 }}
            className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
          >
            {/* Block header */}
            <div className="mb-4">
              <div className="flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <block.icon className={`w-5 h-5 ${block.iconColor}`} />
                  <h3 className="truncate text-sm font-semibold text-foreground leading-tight uppercase tracking-wide">
                    {block.label}
                  </h3>
                </div>
                <span className="pl-7 text-xs sm:text-sm font-medium text-muted xl:pl-0 xl:shrink-0">
                  {block.start > 12 ? block.start - 12 : block.start}
                  {block.start >= 12 ? 'pm' : 'am'} - {block.end > 12 ? block.end - 12 : block.end}
                  {block.end >= 12 ? 'pm' : 'am'}
                </span>
              </div>

              {/* Occupancy bar */}
              <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 p-3">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-foreground">{block.count} citas</span>
                  <span
                    className={`font-bold ${
                      block.occupancyPercent >= 90
                        ? 'text-red-500'
                        : block.occupancyPercent >= 60
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                    }`}
                  >
                    {block.occupancyPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${block.occupancyPercent}%` }}
                    className={`h-full ${
                      block.occupancyPercent >= 90
                        ? 'bg-red-500'
                        : block.occupancyPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Appointments list */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60">
              {block.appointments.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted">Sin citas en este bloque</div>
              )}

              <AnimatePresence mode="popLayout">
                {block.appointments.map((apt, aptIndex) => (
                  <AppointmentRow
                    key={apt.id}
                    apt={apt}
                    isLast={aptIndex === block.appointments.length - 1}
                    onSelectId={onSelectId}
                    onStatusChange={onStatusChange}
                    isSelected={isSelected}
                    onToggleSelect={onToggleSelect}
                    onOpenContextMenu={setContextMenu}
                  />
                ))}
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
                    className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
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
          </motion.div>
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
