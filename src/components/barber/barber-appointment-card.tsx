'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  User,
  Phone,
  FileText,
  Play,
  Check,
  UserX,
  Banknote,
  Smartphone,
  CreditCard,
  MessageCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { haptics } from '@/lib/utils/mobile'
import { buildWhatsAppLink, buildArriveEarlyLink } from '@/lib/whatsapp/deep-link'
import type { TodayAppointment } from '@/types/custom'

type PaymentMethod = 'cash' | 'sinpe' | 'card'

interface BarberAppointmentCardProps {
  appointment: TodayAppointment
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string, paymentMethod?: PaymentMethod) => void
  onNoShow?: (appointmentId: string) => void
  isLoading?: boolean
  acceptedPaymentMethods?: PaymentMethod[]
  /** Next appointment in the timeline (for "Llegá Antes" feature) */
  nextAppointment?: TodayAppointment | null
  /** Barber name for WhatsApp message templates */
  barberName?: string
  /** Business name for WhatsApp message templates */
  businessName?: string
  className?: string
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'sinpe', label: 'SINPE Móvil', icon: Smartphone },
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
]

/**
 * Live timer that shows elapsed time since started_at
 */
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const start = new Date(startedAt).getTime()

    const update = () => {
      const diff = Date.now() - start
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <span className="tabular-nums font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
      {elapsed}
    </span>
  )
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
  acceptedPaymentMethods,
  nextAppointment,
  barberName,
  businessName,
  className,
}: BarberAppointmentCardProps) {
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)

  // Filter payment options based on business settings
  // null/undefined = legacy (no config yet) → show all methods
  // [] = owner configured 0 methods → complete without asking
  // ['cash', ...] = owner configured specific methods → filter
  const activePaymentOptions =
    acceptedPaymentMethods == null
      ? PAYMENT_OPTIONS
      : PAYMENT_OPTIONS.filter((opt) => acceptedPaymentMethods.includes(opt.value))

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
    return phone.replace(/(\d{4})(\d{4})/, '$1-$2')
  }

  const paymentMethodLabel = (method: string | null) => {
    if (!method) return null
    const labels: Record<string, string> = { cash: 'Efectivo', sinpe: 'SINPE', card: 'Tarjeta' }
    return labels[method] || method
  }

  const now = new Date()
  const isPast = new Date(appointment.scheduled_at) < now
  const canCheckIn = appointment.status === 'pending'
  const isInProgress = appointment.status === 'confirmed' && appointment.started_at
  const canComplete = appointment.status === 'pending' || appointment.status === 'confirmed'
  const canNoShow = appointment.status === 'pending' || appointment.status === 'confirmed'
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  // Cache WhatsApp link (avoid double call)
  const whatsAppLink = appointment.client?.phone
    ? buildWhatsAppLink(appointment.client.phone)
    : null

  // "Llegá Antes" — compute link for next appointment within 60 min
  const arriveEarlyLink = (() => {
    if (appointment.status !== 'completed') return null
    if (!nextAppointment?.client?.phone) return null
    if (
      nextAppointment.status === 'completed' ||
      nextAppointment.status === 'cancelled' ||
      nextAppointment.status === 'no_show'
    )
      return null

    const nextTime = new Date(nextAppointment.scheduled_at).getTime()
    const minutesUntilNext = (nextTime - now.getTime()) / 60000
    if (minutesUntilNext <= 0 || minutesUntilNext > 60) return null

    // Build tracking URL if token available
    const trackingToken = (nextAppointment as any).tracking_token
    const trackingUrl = trackingToken
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${trackingToken}`
      : undefined

    return buildArriveEarlyLink(nextAppointment.client.phone, {
      clientName: nextAppointment.client.name,
      barberName: barberName || 'Tu barbero',
      businessName: businessName || 'Tu barbería',
      trackingUrl,
    })
  })()

  const borderColor = {
    pending: 'border-l-violet-500',
    confirmed: 'border-l-blue-500',
    completed: 'border-l-emerald-500',
    cancelled: 'border-l-red-500',
    no_show: 'border-l-amber-500',
  }[appointment.status]

  const handleCheckIn = () => {
    haptics.tap()
    onCheckIn?.(appointment.id)
  }

  const handleCompleteClick = () => {
    haptics.tap()
    // 0 methods configured → complete without asking payment (legacy 2-tap)
    if (activePaymentOptions.length === 0) {
      onComplete?.(appointment.id)
      return
    }
    // 1 method → auto-select, no sheet (2 taps)
    if (activePaymentOptions.length === 1) {
      haptics.success()
      onComplete?.(appointment.id, activePaymentOptions[0].value)
      return
    }
    // 2+ methods → show picker sheet
    setPaymentSheetOpen(true)
  }

  const handlePaymentSelect = (method: PaymentMethod) => {
    haptics.success()
    setPaymentSheetOpen(false)
    onComplete?.(appointment.id, method)
  }

  return (
    <>
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
          {/* Header: Time + Status + Timer */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Clock className="h-5 w-5 text-muted" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {formatTime(appointment.scheduled_at)}
                </p>
                <p className="text-xs text-muted">{appointment.duration_minutes} min</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={appointment.status} size="sm" />
              {isInProgress && appointment.started_at && (
                <LiveTimer startedAt={appointment.started_at} />
              )}
            </div>
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
                  {whatsAppLink && (
                    <a
                      href={whatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                      aria-label={`Enviar WhatsApp a ${appointment.client.name}`}
                    >
                      <MessageCircle
                        className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Service Info */}
          {appointment.service && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{appointment.service.name}</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatPrice(appointment.price)}
                </span>
              </div>
            </div>
          )}

          {/* Completion Info (for completed appointments) */}
          {appointment.status === 'completed' && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <Check
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {appointment.actual_duration_minutes != null
                    ? `${appointment.actual_duration_minutes} min`
                    : 'Completada'}
                  {appointment.payment_method &&
                    ` · ${paymentMethodLabel(appointment.payment_method)}`}
                </span>
              </div>

              {/* "Llegá Antes" CTA — show when next appointment is within 60 min */}
              {arriveEarlyLink && nextAppointment?.client && (
                <a
                  href={arriveEarlyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                >
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Avisar a {nextAppointment.client.name} que llegue antes
                  </span>
                  <MessageCircle
                    className="h-3.5 w-3.5 text-green-600 dark:text-green-400 ml-auto"
                    aria-hidden="true"
                  />
                </a>
              )}
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
                  <p className="text-xs text-muted">
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
                  <p className="text-xs text-muted">
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
              {canCheckIn && !isInProgress && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="min-h-[44px] text-xs"
                  aria-label="Iniciar servicio"
                  data-testid="check-in-button"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Iniciar
                </Button>
              )}

              {isInProgress && (
                <Button
                  variant="success"
                  size="md"
                  onClick={handleCompleteClick}
                  disabled={isLoading}
                  className="min-h-[44px] text-xs col-span-2"
                  aria-label="Completar servicio"
                  data-testid="complete-button"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Completar
                </Button>
              )}

              {!isInProgress && canComplete && (
                <Button
                  variant="success"
                  size="md"
                  onClick={handleCompleteClick}
                  disabled={isLoading}
                  className="min-h-[44px] text-xs"
                  aria-label="Completar servicio"
                  data-testid="complete-button"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Completar
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                onClick={() => onNoShow?.(appointment.id)}
                disabled={!canNoShow || isLoading}
                className="min-h-[44px] text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400"
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

      {/* Payment Method Sheet */}
      <Sheet open={paymentSheetOpen} onOpenChange={setPaymentSheetOpen}>
        <SheetContent side="bottom" className="pb-safe">
          <SheetHeader>
            <SheetTitle>¿Cómo pagó el cliente?</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 py-4">
            {activePaymentOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant="outline"
                size="md"
                onClick={() => handlePaymentSelect(value)}
                className="min-h-[52px] justify-start gap-3 text-base font-medium"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
