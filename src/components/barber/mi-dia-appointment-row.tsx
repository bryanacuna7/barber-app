'use client'

import { useMemo } from 'react'
import { Play, UserX, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SwipeableRow, type SwipeAction } from '@/components/ui/swipeable-row'
import { derivedStatus, type DerivedStatus } from '@/lib/utils/appointment-status'
import { getStatusAccentColor, formatAppointmentTime } from '@/lib/utils/appointment-helpers'
import type { TodayAppointment } from '@/types/custom'

interface MiDiaAppointmentRowProps {
  appointment: TodayAppointment
  estimatedDelay?: number
  onSelect: (appointment: TodayAppointment) => void
  onCheckIn?: (appointmentId: string) => void
  onNoShow?: (appointmentId: string) => void
  swipeEnabled?: boolean
  variant?: 'upcoming' | 'requires_action' | 'finalized'
  isLoading?: boolean
  className?: string
}

function StatusPill({ status }: { status: DerivedStatus }) {
  const labels: Record<DerivedStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistio',
  }

  const colors: Record<DerivedStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    in_progress: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    completed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    cancelled: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    no_show: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  }

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', colors[status])}>
      {labels[status]}
    </span>
  )
}

export function MiDiaAppointmentRow({
  appointment,
  estimatedDelay,
  onSelect,
  onCheckIn,
  onNoShow,
  swipeEnabled = false,
  variant: _variant,
  isLoading = false,
  className,
}: MiDiaAppointmentRowProps) {
  const status = derivedStatus(appointment)
  const isWalkIn = appointment.source === 'walk_in'
  const clientName = appointment.client?.name || (isWalkIn ? 'Walk-in' : 'Cliente')
  const serviceName = appointment.service?.name || 'Servicio'
  const price = appointment.final_price_snapshot ?? appointment.price
  const isFinalized = status === 'completed' || status === 'cancelled' || status === 'no_show'
  const accentColor = getStatusAccentColor(status)

  // Swipe actions: only for non-finalized rows
  const leftActions = useMemo<SwipeAction[]>(() => {
    if (isFinalized || !onCheckIn) return []
    return [
      {
        icon: <Play className="h-4 w-4" />,
        label: 'Iniciar',
        color: 'bg-emerald-500',
        onClick: () => onCheckIn(appointment.id),
      },
    ]
  }, [isFinalized, onCheckIn, appointment.id])

  const rightActions = useMemo<SwipeAction[]>(() => {
    if (isFinalized || !onNoShow) return []
    return [
      {
        icon: <UserX className="h-4 w-4" />,
        label: 'No Show',
        color: 'bg-red-500',
        onClick: () => onNoShow(appointment.id),
      },
    ]
  }, [isFinalized, onNoShow, appointment.id])

  const row = (
    <button
      onClick={() => onSelect(appointment)}
      disabled={isLoading}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-3 text-left',
        'bg-white dark:bg-zinc-900',
        'rounded-xl border border-zinc-200/60 dark:border-zinc-800/60',
        'active:bg-zinc-50 dark:active:bg-zinc-800/80 transition-colors',
        'lg:hover:bg-zinc-50 lg:dark:hover:bg-zinc-800/50 lg:hover:border-zinc-300 lg:dark:hover:border-zinc-700',
        isFinalized && 'opacity-50',
        className
      )}
      data-testid={`appointment-row-${appointment.id}`}
    >
      {/* Time stack */}
      <div className="shrink-0 w-14 text-center">
        <p className="text-sm font-bold tabular-nums text-zinc-900 dark:text-white leading-tight">
          {formatAppointmentTime(appointment.scheduled_at)}
        </p>
        <p className="text-[10px] text-muted">{appointment.duration_minutes} min</p>
      </div>

      {/* Status accent bar */}
      <div className={cn('w-[3px] self-stretch rounded-full shrink-0', accentColor)} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {clientName}
          </p>
          {isWalkIn && (
            <UserPlus className="h-3 w-3 text-amber-500 shrink-0" aria-label="Walk-in" />
          )}
        </div>
        <p className="text-xs text-muted truncate">
          {serviceName}
          {price > 0 && (
            <span className="ml-1.5">
              &middot;{' '}
              {new Intl.NumberFormat('es-CR', {
                style: 'currency',
                currency: 'CRC',
                maximumFractionDigits: 0,
              }).format(price)}
            </span>
          )}
        </p>
      </div>

      {/* Desktop hover actions (hidden on mobile, visible on hover) */}
      {!isFinalized && (onCheckIn || onNoShow) && (
        <div className="hidden lg:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
          {onCheckIn && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onCheckIn(appointment.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  onCheckIn(appointment.id)
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Play className="h-3 w-3" />
              Iniciar
            </span>
          )}
          {onNoShow && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onNoShow(appointment.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  onNoShow(appointment.id)
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <UserX className="h-3 w-3" />
              No Show
            </span>
          )}
        </div>
      )}

      {/* Right side: delay chip or status pill */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {estimatedDelay && estimatedDelay > 0 && !isFinalized && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            +{estimatedDelay} min
          </span>
        )}
        <StatusPill status={status} />
      </div>
    </button>
  )

  // Wrap in swipeable only if enabled and not finalized
  if (swipeEnabled && !isFinalized && (leftActions.length > 0 || rightActions.length > 0)) {
    return (
      <SwipeableRow leftActions={leftActions} rightActions={rightActions}>
        {row}
      </SwipeableRow>
    )
  }

  return row
}
