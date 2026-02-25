'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Check, UserPlus } from 'lucide-react'
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
  onDismiss: () => void
  onWalkIn?: () => void
  isLoading?: boolean
  acceptedPaymentMethods?: PaymentMethod[]
}

/* ─── Progress Ring (Apple Watch style) ─── */
function ProgressRing({
  progress,
  isOvertime,
  size = 200,
  strokeWidth = 8,
}: {
  progress: number
  isOvertime: boolean
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(progress, 1)
  const offset = circumference * (1 - clampedProgress)

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-800/60"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          'transition-all duration-1000 ease-out',
          isOvertime ? 'text-amber-400' : 'text-emerald-400'
        )}
      />
    </svg>
  )
}

/**
 * Full-screen focus overlay for an in-progress appointment.
 * Apple Watch Workout style — progress ring, timer, minimal actions.
 */
export function FocusMode({
  appointment,
  onComplete,
  onDismiss,
  onWalkIn,
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

  // Progress for ring (0 to 1, then keeps going past 1 for overtime)
  const progress = useMemo(() => {
    const duration = appointment.duration_minutes || 30
    return elapsedMins / duration
  }, [elapsedMins, appointment.duration_minutes])

  const isOvertime = progress >= 1

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const ringSize = 200

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
      {/* Top bar: Dismiss only */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end px-6 py-5 pt-safe">
        <button
          onClick={onDismiss}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          aria-label="Salir del modo enfoque"
          data-testid="focus-mode-dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Center content */}
      <div className="h-full flex flex-col items-center justify-center px-8">
        {/* Client + Service */}
        <p className="text-xl font-semibold text-white mb-0.5">
          {appointment.client?.name || 'Walk-in'}
        </p>
        {appointment.service && (
          <p className="text-sm text-zinc-500 mb-8">
            {appointment.service.name} · {formatPrice(appointment.price)}
          </p>
        )}

        {/* Ring + Timer */}
        <div
          className="relative flex items-center justify-center mb-6"
          style={{ width: ringSize, height: ringSize }}
        >
          <ProgressRing
            progress={progress}
            isOvertime={isOvertime}
            size={ringSize}
            strokeWidth={8}
          />
          <div className="flex flex-col items-center">
            <div
              role="timer"
              aria-atomic="true"
              aria-label={`Tiempo transcurrido: ${elapsed}`}
              className={cn(
                'tabular-nums font-mono text-5xl font-bold transition-colors duration-700',
                isOvertime ? 'text-amber-400' : 'text-white'
              )}
            >
              {elapsed || '0:00'}
            </div>
            {isOvertime && (
              <p className="text-xs text-amber-500/80 mt-1">
                +{elapsedMins - (appointment.duration_minutes || 30)} min extra
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-6 mx-auto w-full max-w-lg"
        style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.25rem), 1.75rem)' }}
      >
        {/* Walk-in button */}
        {onWalkIn && (
          <button
            onClick={onWalkIn}
            className="flex items-center justify-center gap-2 w-full h-12 mb-3 rounded-2xl bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium"
            data-testid="focus-mode-walk-in"
          >
            <UserPlus className="h-4 w-4" />
            Walk-in
          </button>
        )}

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
