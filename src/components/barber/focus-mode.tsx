'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Check, UserX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { usePaymentFlow } from '@/hooks/use-payment-flow'
import { PaymentMethodPickerSheet } from './payment-method-picker-sheet'
import { SlideToComplete } from './slide-to-complete'
import type { TodayAppointment } from '@/types/custom'

type PaymentMethod = 'cash' | 'sinpe' | 'card'

interface FocusModeProps {
  appointment: TodayAppointment
  onComplete?: (appointmentId: string, paymentMethod?: PaymentMethod) => void
  onNoShow?: (appointmentId: string) => void
  onDismiss: () => void
  isLoading?: boolean
  acceptedPaymentMethods?: PaymentMethod[]
}

/**
 * Full-screen focus overlay for an in-progress appointment.
 * Inspired by Apple Watch workout mode — shows client, service, timer, and complete action.
 */
export function FocusMode({
  appointment,
  onComplete,
  onNoShow,
  onDismiss,
  isLoading = false,
  acceptedPaymentMethods,
}: FocusModeProps) {
  const [elapsedMins, setElapsedMins] = useState(0)
  const [elapsed, setElapsed] = useState('')

  const {
    paymentSheetOpen,
    setPaymentSheetOpen,
    activePaymentOptions,
    handleCompleteClick,
    handlePaymentSelect,
  } = usePaymentFlow({ acceptedPaymentMethods, onComplete })

  // Live timer
  useEffect(() => {
    if (!appointment.started_at) return

    const start = new Date(appointment.started_at).getTime()

    const update = () => {
      const diff = Date.now() - start
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsedMins(mins)
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [appointment.started_at])

  // Overtime detection: timer > expected duration
  const isOvertime = useMemo(() => {
    return elapsedMins >= (appointment.duration_minutes || 30)
  }, [elapsedMins, appointment.duration_minutes])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] bg-zinc-950"
      role="dialog"
      aria-label="Modo enfoque"
      data-testid="focus-mode"
    >
      {/* Top bar: No Show (left) + Dismiss (right) — absolute so it never pushes content */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-5 pt-safe">
        <button
          onClick={() => onNoShow?.(appointment.id)}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 h-12 rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-amber-900/40 hover:text-amber-400 transition-colors disabled:opacity-50"
          aria-label="Marcar como no asistió"
          data-testid="focus-mode-no-show"
        >
          <UserX className="h-4 w-4" />
          <span className="text-sm font-medium">No Show</span>
        </button>
        <button
          onClick={onDismiss}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          aria-label="Salir del modo enfoque"
          data-testid="focus-mode-dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Center content — fills viewport, vertically centered */}
      <div className="h-full flex flex-col items-center justify-center px-8">
        {/* Client name */}
        <p className="text-2xl font-bold text-white mb-1">
          {appointment.client?.name || 'Cliente'}
        </p>

        {/* Service name */}
        {appointment.service && (
          <p className="text-base text-zinc-400 mb-8">{appointment.service.name}</p>
        )}

        {/* Timer */}
        <div
          role="timer"
          aria-atomic="true"
          aria-label={`Tiempo transcurrido: ${elapsed}`}
          className={cn(
            'tabular-nums font-mono text-6xl font-bold mb-4 transition-colors duration-700',
            isOvertime ? 'text-amber-400' : 'text-white'
          )}
        >
          {elapsed || '0:00'}
        </div>

        {/* Overtime label */}
        {isOvertime && (
          <p className="text-sm text-amber-500/80 mb-2">
            +{elapsedMins - (appointment.duration_minutes || 30)} min sobre el tiempo
          </p>
        )}

        {/* Price */}
        <p className="text-xl font-semibold text-zinc-300">{formatPrice(appointment.price)}</p>
      </div>

      {/* Bottom action — absolute so it's always visible above safe area */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-8 mx-auto w-full max-w-lg"
        style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.5rem), 2rem)' }}
      >
        {/* Mobile: Slide to Complete */}
        <div className="lg:hidden">
          <SlideToComplete
            onComplete={() => handleCompleteClick(appointment.id)}
            disabled={isLoading}
          />
        </div>
        {/* Desktop: Regular button */}
        <Button
          variant="success"
          size="lg"
          onClick={() => handleCompleteClick(appointment.id)}
          disabled={isLoading}
          className="hidden lg:flex w-full min-h-[56px] text-base font-semibold"
          data-testid="focus-mode-complete"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
          Completar
        </Button>
      </div>

      <PaymentMethodPickerSheet
        open={paymentSheetOpen}
        onOpenChange={setPaymentSheetOpen}
        options={activePaymentOptions}
        onSelect={handlePaymentSelect}
      />
    </motion.div>
  )
}
