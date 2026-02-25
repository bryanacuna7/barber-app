'use client'

import { useState } from 'react'
import { haptics } from '@/lib/utils/mobile'

type PaymentMethod = 'cash' | 'sinpe' | 'card'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'sinpe', label: 'SINPE Móvil' },
  { value: 'card', label: 'Tarjeta' },
]

interface UsePaymentFlowOptions {
  acceptedPaymentMethods?: PaymentMethod[]
  onComplete?: (appointmentId: string, paymentMethod?: PaymentMethod) => void
}

/**
 * Shared hook for payment method selection logic.
 * Handles the 0/1/2+ payment methods decision:
 * - 0 methods configured → complete without asking
 * - 1 method → auto-select, no sheet
 * - 2+ methods → open picker sheet
 */
export function usePaymentFlow({ acceptedPaymentMethods, onComplete }: UsePaymentFlowOptions) {
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null)

  // Filter payment options based on business settings
  // null/undefined = legacy (no config yet) → show all methods
  // [] = owner configured 0 methods → complete without asking
  // ['cash', ...] = owner configured specific methods → filter
  const activePaymentOptions =
    acceptedPaymentMethods == null
      ? PAYMENT_OPTIONS
      : PAYMENT_OPTIONS.filter((opt) => acceptedPaymentMethods.includes(opt.value))

  const handleCompleteClick = (appointmentId: string) => {
    haptics.tap()

    // 0 methods configured → complete without asking payment
    if (activePaymentOptions.length === 0) {
      onComplete?.(appointmentId)
      return
    }

    // 1 method → auto-select, no sheet
    if (activePaymentOptions.length === 1) {
      haptics.success()
      onComplete?.(appointmentId, activePaymentOptions[0].value)
      return
    }

    // 2+ methods → show picker sheet
    setPendingAppointmentId(appointmentId)
    setPaymentSheetOpen(true)
  }

  const handlePaymentSelect = (method: PaymentMethod) => {
    haptics.success()
    setPaymentSheetOpen(false)
    if (pendingAppointmentId) {
      onComplete?.(pendingAppointmentId, method)
    }
    setPendingAppointmentId(null)
  }

  return {
    paymentSheetOpen,
    setPaymentSheetOpen,
    pendingAppointmentId,
    activePaymentOptions,
    handleCompleteClick,
    handlePaymentSelect,
  }
}
