'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  User,
  Scissors,
  Phone,
  MoreVertical,
  Check,
  X,
  MessageCircle,
  Edit,
  Trash2,
  CalendarCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, type AppointmentStatus } from '@/components/ui/badge'
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from '@/components/ui/dropdown'
import { cn } from '@/lib/utils/cn'
import { formatTime, formatCurrency } from '@/lib/utils/format'
import type { Appointment } from '@/types'

interface AppointmentCardProps {
  appointment: Appointment & {
    client?: { name: string; phone: string } | null
    service?: { name: string } | null
  }
  onStatusChange?: (id: string, status: AppointmentStatus) => void
  onEdit?: (appointment: Appointment) => void
  onDelete?: (id: string) => void
  onWhatsApp?: (phone: string) => void
  variant?: 'default' | 'compact' | 'timeline'
  className?: string
}

export function AppointmentCard({
  appointment,
  onStatusChange,
  onEdit,
  onDelete,
  onWhatsApp,
  variant = 'default',
  className,
}: AppointmentCardProps) {
  const scheduledTime = new Date(appointment.scheduled_at)
  const endTime = new Date(scheduledTime.getTime() + appointment.duration_minutes * 60000)

  const statusColors: Record<AppointmentStatus, string> = {
    pending: 'border-l-violet-500',
    confirmed: 'border-l-blue-500',
    completed: 'border-l-emerald-500',
    cancelled: 'border-l-red-500',
    no_show: 'border-l-amber-500',
  }

  if (variant === 'compact') {
    // Contextual actions based on status
    const canConfirm = appointment.status === 'pending'
    const canComplete = appointment.status === 'confirmed' || appointment.status === 'pending'
    const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed'

    return (
      <div className="relative rounded-xl overflow-hidden">
        {/* Swipe affordance indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-20 pointer-events-none z-0">
          <div className="w-1 h-6 rounded-full bg-zinc-400" />
          <div className="w-1 h-6 rounded-full bg-zinc-400" />
          <div className="w-1 h-6 rounded-full bg-zinc-400" />
        </div>

        {/* Swipeable content */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -160, right: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          className={cn(
            'group relative z-10 w-full flex items-center gap-3 p-3 rounded-xl',
            'bg-zinc-50 dark:bg-zinc-800',
            'touch-pan-y border-l-4',
            statusColors[appointment.status as AppointmentStatus],
            className
          )}
        >
          {/* Action buttons - positioned absolutely on the right edge */}
          <div className="absolute right-0 top-0 bottom-0 flex translate-x-full">
            {/* Primary action: Confirm or Complete */}
            {(canConfirm || canComplete) && (
              <button
                onClick={() => {
                  if (canConfirm) {
                    onStatusChange?.(appointment.id, 'confirmed')
                  } else if (canComplete) {
                    onStatusChange?.(appointment.id, 'completed')
                  }
                }}
                className="flex h-full w-20 items-center justify-center bg-emerald-500 text-white"
              >
                {canConfirm ? <CalendarCheck className="h-5 w-5" /> : <Check className="h-5 w-5" />}
              </button>
            )}
            {/* Secondary action: Cancel or Delete */}
            {canCancel && (
              <button
                onClick={() => onStatusChange?.(appointment.id, 'cancelled')}
                className="flex h-full w-20 items-center justify-center bg-red-500 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-white truncate">
                {appointment.client?.name || 'Cliente sin nombre'}
              </span>
              <StatusBadge status={appointment.status as AppointmentStatus} size="sm" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(scheduledTime)}
              </span>
              <span className="flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5" />
                {appointment.service?.name || 'Servicio'}
              </span>
            </div>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(Number(appointment.price))}
          </span>
        </motion.div>
      </div>
    )
  }

  if (variant === 'timeline') {
    return (
      <div
        className={cn(
          'relative pl-8 pb-8 last:pb-0',
          'before:absolute before:left-3 before:top-3 before:bottom-0 before:w-px',
          'before:bg-zinc-200 dark:before:bg-zinc-700',
          'last:before:hidden',
          className
        )}
      >
        {/* Timeline dot */}
        <div
          className={cn(
            'absolute left-0 top-0 w-6 h-6 rounded-full',
            'flex items-center justify-center',
            'ring-4 ring-white dark:ring-zinc-900',
            appointment.status === 'completed'
              ? 'bg-emerald-500'
              : appointment.status === 'confirmed'
                ? 'bg-blue-500'
                : appointment.status === 'pending'
                  ? 'bg-violet-500'
                  : appointment.status === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
          )}
        >
          {appointment.status === 'completed' && <Check className="w-3 h-3 text-white" />}
          {appointment.status === 'confirmed' && <CalendarCheck className="w-3 h-3 text-white" />}
          {appointment.status === 'pending' && <Clock className="w-3 h-3 text-white" />}
          {appointment.status === 'cancelled' && <X className="w-3 h-3 text-white" />}
        </div>

        <Card className="p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-zinc-500">
                  {formatTime(scheduledTime)} - {formatTime(endTime)}
                </span>
                <StatusBadge status={appointment.status as AppointmentStatus} size="sm" />
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {appointment.client?.name || 'Cliente sin nombre'}
              </h4>
              <p className="text-sm text-zinc-500 mt-1">
                {appointment.service?.name || 'Servicio'} • {appointment.duration_minutes} min
              </p>
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(Number(appointment.price))}
            </span>
          </div>
        </Card>
      </div>
    )
  }

  // Default variant
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        'border-l-4',
        statusColors[appointment.status as AppointmentStatus],
        className
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            {appointment.client?.name || 'Cliente sin nombre'}
          </h3>
          {appointment.client?.phone && (
            <button
              onClick={() => onWhatsApp?.(appointment.client!.phone)}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-emerald-600 transition-colors mt-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              {appointment.client.phone}
            </button>
          )}
        </div>

        {/* Service & Time */}
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Scissors className="w-4 h-4" />
          <span>{appointment.service?.name || 'Servicio'}</span>
          <span className="text-zinc-400">•</span>
          <Clock className="w-4 h-4" />
          <span>
            {formatTime(scheduledTime)} - {formatTime(endTime)}
          </span>
        </div>

        {/* Footer with inline quick actions */}
        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {appointment.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange?.(appointment.id, 'confirmed')}
                className="text-xs"
              >
                <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                Confirmar
              </Button>
            )}
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange?.(appointment.id, 'completed')}
                className="text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Completar
              </Button>
            )}
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              align="left"
            >
              <DropdownLabel>Más acciones</DropdownLabel>
              {appointment.client?.phone && (
                <DropdownItem
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => onWhatsApp?.(appointment.client!.phone)}
                >
                  WhatsApp
                </DropdownItem>
              )}
              <DropdownItem
                icon={<Edit className="w-4 h-4" />}
                onClick={() => onEdit?.(appointment)}
              >
                Editar
              </DropdownItem>
              {appointment.status !== 'no_show' && (
                <DropdownItem
                  icon={<X className="w-4 h-4" />}
                  onClick={() => onStatusChange?.(appointment.id, 'no_show')}
                >
                  No asistió
                </DropdownItem>
              )}
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 className="w-4 h-4" />}
                danger
                onClick={() => onDelete?.(appointment.id)}
              >
                Eliminar
              </DropdownItem>
            </Dropdown>
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(Number(appointment.price))}
          </span>
        </div>

        {/* Notes */}
        {appointment.client_notes && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-medium">Nota:</span> {appointment.client_notes}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
