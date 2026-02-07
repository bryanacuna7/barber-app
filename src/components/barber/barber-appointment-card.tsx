'use client'

import { motion } from 'framer-motion'
import { Clock, User, Phone, DollarSign, FileText, Check, X, UserX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import type { TodayAppointment } from '@/types/custom'

interface BarberAppointmentCardProps {
  appointment: TodayAppointment
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string) => void
  onNoShow?: (appointmentId: string) => void
  isLoading?: boolean
  className?: string
}

/**
 * Card component for displaying a single appointment in Mi Dia view
 * Includes quick action buttons for status updates
 */
export function BarberAppointmentCard({
  appointment,
  onCheckIn,
  onComplete,
  onNoShow,
  isLoading = false,
  className,
}: BarberAppointmentCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return null
    // Simple formatting for Costa Rica numbers
    return phone.replace(/(\d{4})(\d{4})/, '$1-$2')
  }

  const isPast = new Date(appointment.scheduled_at) < new Date()
  const canCheckIn = appointment.status === 'pending'
  const canComplete = appointment.status === 'pending' || appointment.status === 'confirmed'
  const canNoShow = appointment.status === 'pending' || appointment.status === 'confirmed'
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  // Card border color based on status
  const borderColor = {
    pending: 'border-l-violet-500',
    confirmed: 'border-l-blue-500',
    completed: 'border-l-emerald-500',
    cancelled: 'border-l-red-500',
    no_show: 'border-l-amber-500',
  }[appointment.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-2xl border-l-4 shadow-sm',
        'border border-zinc-200 dark:border-zinc-800',
        borderColor,
        isFinalized && 'opacity-60',
        className
      )}
    >
      <div className="p-4">
        {/* Header: Time + Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {formatTime(appointment.scheduled_at)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {appointment.duration_minutes} min
              </p>
            </div>
          </div>
          <StatusBadge status={appointment.status} size="sm" />
        </div>

        {/* Client Info */}
        {appointment.client && (
          <div className="space-y-2 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {appointment.client.name}
              </span>
            </div>
            {appointment.client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
                <a
                  href={`tel:${appointment.client.phone}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  aria-label={`Llamar a ${appointment.client.name}`}
                >
                  {formatPhone(appointment.client.phone)}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Service Info */}
        {appointment.service && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {appointment.service.name}
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-white">
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                <span>{formatPrice(appointment.price)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {(appointment.client_notes || appointment.internal_notes) && (
          <div className="space-y-2 mb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {appointment.client_notes && (
              <div className="flex gap-2">
                <FileText
                  className="h-4 w-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Cliente: </span>
                  {appointment.client_notes}
                </p>
              </div>
            )}
            {appointment.internal_notes && (
              <div className="flex gap-2">
                <FileText
                  className="h-4 w-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Interno: </span>
                  {appointment.internal_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isFinalized && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckIn?.(appointment.id)}
              disabled={!canCheckIn || isLoading}
              className="text-xs"
              aria-label="Marcar como confirmada"
              data-testid="check-in-button"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Check-in
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => onComplete?.(appointment.id)}
              disabled={!canComplete || isLoading}
              className="text-xs"
              aria-label="Marcar como completada"
              data-testid="complete-button"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Completar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNoShow?.(appointment.id)}
              disabled={!canNoShow || isLoading}
              className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400"
              aria-label="Marcar como no asistió"
              data-testid="no-show-button"
            >
              <UserX className="h-4 w-4" aria-hidden="true" />
              No Show
            </Button>
          </div>
        )}

        {/* Past appointment indicator */}
        {isPast && !isFinalized && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-500 text-center">
            Esta cita ya pasó
          </div>
        )}
      </div>
    </motion.div>
  )
}
