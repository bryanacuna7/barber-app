'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { SwipeableRow } from '@/components/ui/swipeable-row'
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
  onStatusChange: (appointmentId: string, status: 'cancelled') => void
  isBarber: boolean
  onWalkIn: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalendarDayView({
  timeBlocks,
  unscheduledCount,
  gaps,
  selectedId,
  onSelectId,
  draggedId,
  onDragId,
  onStatusChange,
}: CalendarDayViewProps) {
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

              {/* Occupancy bar (Cinema feature) */}
              <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 p-3">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-foreground">{block.count} citas</span>
                  <span
                    className={`font-bold ${
                      block.occupancyPercent >= 90
                        ? 'text-red-500 dark:text-red-500'
                        : block.occupancyPercent >= 60
                          ? 'text-amber-500 dark:text-amber-500'
                          : 'text-green-500 dark:text-emerald-500'
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
                        ? 'bg-red-500 dark:bg-red-500'
                        : block.occupancyPercent >= 60
                          ? 'bg-amber-500 dark:bg-amber-500'
                          : 'bg-green-500 dark:bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Appointments (grouped rows inside block card) */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60">
              {block.appointments.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted">Sin citas programadas</div>
              )}

              <AnimatePresence mode="popLayout">
                {block.appointments.map((apt, aptIndex) => {
                  const canCancel = apt.status === 'pending' || apt.status === 'confirmed'
                  const isLast = aptIndex === block.appointments.length - 1

                  const rightActions = []
                  if (canCancel) {
                    rightActions.push({
                      icon: <X className="h-5 w-5" />,
                      label: 'Cancelar',
                      color: 'bg-red-500',
                      onClick: () => onStatusChange(apt.id, 'cancelled'),
                    })
                  }

                  return (
                    <motion.div
                      key={apt.id}
                      layout
                      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                      transition={animations.spring.layout}
                      className={
                        isLast ? '' : 'border-b border-zinc-200/70 dark:border-zinc-800/80'
                      }
                    >
                      {/* Mobile: swipeable version */}
                      <div className="lg:hidden">
                        <SwipeableRow
                          rightActions={rightActions}
                          showAffordance={false}
                          containerClassName="rounded-none"
                        >
                          <div
                            onClick={() => onSelectId(apt.id)}
                            className="cursor-pointer px-3 py-3 active:bg-zinc-100/80 dark:active:bg-zinc-900"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      apt.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`}
                                  />
                                  <span className="font-medium text-foreground text-sm">
                                    {apt.client?.name || 'Cliente'}
                                  </span>
                                </div>
                                <div className="text-xs text-muted leading-tight">
                                  {apt.service?.name || 'Servicio'}
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-muted font-medium tabular-nums leading-tight">
                                  {format(parseISO(apt.scheduled_at), 'h:mm a')}
                                </div>
                                <div className="mt-1 text-[13px] leading-tight font-semibold text-amber-500 dark:text-amber-500">
                                  {formatCurrencyCompactMillions(apt.service?.price || 0)}
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
                        onDragStart={() => onDragId(apt.id)}
                        onDragEnd={() => {
                          onDragId(null)
                          toast.info('Rescheduling (demo)')
                        }}
                        whileTap={{ scale: 0.98 }}
                        whileDrag={{ scale: 1.05, zIndex: 50 }}
                        onClick={() => onSelectId(apt.id)}
                      >
                        <div
                          className={`cursor-grab px-4 py-3 active:cursor-grabbing transition-[opacity,background-color] ${
                            draggedId === apt.id
                              ? 'opacity-50'
                              : 'hover:bg-zinc-100/85 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    apt.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                />
                                <span className="font-medium text-foreground text-sm">
                                  {apt.client?.name || 'Cliente'}
                                </span>
                              </div>
                              <div className="text-xs text-muted">
                                {apt.service?.name || 'Servicio'}
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-muted font-medium tabular-nums leading-tight">
                                {format(parseISO(apt.scheduled_at), 'h:mm a')}
                              </div>
                              <div className="mt-1 text-[13px] leading-tight font-semibold text-amber-500 dark:text-amber-500">
                                {formatCurrencyCompactMillions(apt.service?.price || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Gap indicators (Cinema feature) */}
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
    </div>
  )
}
