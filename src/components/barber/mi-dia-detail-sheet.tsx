'use client'

import { useState } from 'react'
import {
  Phone,
  MessageCircle,
  Clock,
  Scissors,
  UserPlus,
  Smartphone,
  Check,
  AlertTriangle,
  Wallet,
  NotepadText,
  Copy,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { Modal } from '@/components/ui/modal'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { haptics } from '@/lib/utils/mobile'
import { derivedStatus, type DerivedStatus } from '@/lib/utils/appointment-status'
import { getActionsByStatus, formatAppointmentTime } from '@/lib/utils/appointment-helpers'
import { buildWhatsAppLink, buildArriveEarlyLink, buildDelayLink } from '@/lib/whatsapp/deep-link'
import type { TodayAppointment } from '@/types/custom'

interface MiDiaDetailSheetProps {
  appointment: TodayAppointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string) => void
  onNoShow?: (appointmentId: string) => void
  onFocusMode?: (appointmentId: string) => void
  onVerifyPayment?: (appointmentId: string) => void
  nextAppointment?: TodayAppointment | null
  barberName?: string
  businessName?: string
  estimatedDelay?: number
  isLoading?: boolean
}

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

function getStatusLabel(status: DerivedStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'confirmed':
      return 'Confirmada'
    case 'in_progress':
      return 'En curso'
    case 'completed':
      return 'Completada'
    case 'cancelled':
      return 'Cancelada'
    case 'no_show':
      return 'No asistió'
    default:
      return status
  }
}

function getStatusStyle(status: DerivedStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'confirmed':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    case 'in_progress':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    case 'completed':
      return 'bg-zinc-500/10 text-muted border-zinc-500/20'
    case 'cancelled':
      return 'bg-zinc-500/10 text-muted border-zinc-500/20'
    case 'no_show':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    default:
      return 'bg-zinc-500/10 text-muted border-zinc-500/20'
  }
}

function getSourceLabel(source?: string | null): { label: string; icon: typeof Globe } | null {
  switch (source) {
    case 'web_booking':
      return { label: 'Reserva online', icon: Globe }
    case 'walk_in':
      return { label: 'Walk-in', icon: UserPlus }
    case 'owner_created':
      return { label: 'Creada por admin', icon: Scissors }
    case 'barber_created':
      return { label: 'Creada por barbero', icon: Scissors }
    default:
      return null
  }
}

function getRelativeTime(appointment: TodayAppointment, status: DerivedStatus): string | null {
  const now = Date.now()

  if (status === 'in_progress' && appointment.started_at) {
    const elapsed = Math.floor((now - new Date(appointment.started_at).getTime()) / 60_000)
    return `Lleva ${elapsed} de ${appointment.duration_minutes} min`
  }

  if (status === 'pending' || status === 'confirmed') {
    const scheduled = new Date(appointment.scheduled_at).getTime()
    const diffMin = Math.floor((scheduled - now) / 60_000)
    if (diffMin > 0) return `Empieza en ${diffMin} min`
    if (diffMin === 0) return 'Empieza ahora'
    return `Atrasada ${Math.abs(diffMin)} min`
  }

  if (status === 'completed' && appointment.started_at) {
    const completedAgo = Math.floor((now - new Date(appointment.started_at).getTime()) / 60_000)
    if (completedAgo < 60) return `Completada hace ${completedAgo} min`
    const hours = Math.floor(completedAgo / 60)
    return `Completada hace ${hours}h`
  }

  return null
}

export function MiDiaDetailSheet({
  appointment,
  open,
  onOpenChange,
  onCheckIn,
  onComplete,
  onNoShow,
  onFocusMode,
  onVerifyPayment,
  nextAppointment,
  barberName,
  businessName,
  estimatedDelay,
  isLoading = false,
}: MiDiaDetailSheetProps) {
  const [copied, setCopied] = useState(false)
  const isMobile = useIsMobile(1024)
  const [now] = useState(() => Date.now())

  if (!appointment) return null

  const status = derivedStatus(appointment)
  const actions = getActionsByStatus(appointment)
  const isWalkIn = appointment.source === 'walk_in'
  const clientName = appointment.client?.name || (isWalkIn ? 'Walk-in' : 'Cliente')
  const clientPhone = appointment.client?.phone ?? null
  const serviceName = appointment.service?.name || 'Servicio'
  const price = appointment.final_price_snapshot ?? appointment.price
  const basePrice = appointment.base_price_snapshot ?? appointment.price
  const hasDiscount = (appointment.discount_pct_snapshot ?? 0) > 0
  const hasAdvancePending = appointment.advance_payment_status === 'pending'
  const hasAdvanceVerified = appointment.advance_payment_status === 'verified'

  const whatsappLink = clientPhone ? buildWhatsAppLink(clientPhone) : null
  const sourceInfo = getSourceLabel(appointment.source)
  const relativeTime = getRelativeTime(appointment, status)
  const inProgressRatio =
    status === 'in_progress' && appointment.started_at
      ? Math.min(
          (now - new Date(appointment.started_at).getTime()) /
            ((appointment.duration_minutes || 30) * 60_000),
          1.2
        )
      : null

  // "Llega Antes" link
  let arriveEarlyLink: string | null = null
  if (status === 'completed' && nextAppointment?.client?.phone && nextAppointment.client.name) {
    arriveEarlyLink = buildArriveEarlyLink(nextAppointment.client.phone, {
      clientName: nextAppointment.client.name,
      barberName: barberName || 'Tu miembro del equipo',
      businessName: businessName || 'Tu barberia',
    })
  }

  // Delay WhatsApp link
  let delayLink: string | null = null
  if (estimatedDelay && estimatedDelay > 0 && clientPhone && appointment.client?.name) {
    delayLink = buildDelayLink(clientPhone, {
      clientName: appointment.client.name,
      barberName: barberName || 'Tu miembro del equipo',
      businessName: businessName || 'Tu barberia',
      delayMinutes: estimatedDelay,
    })
  }

  const handleCopyPhone = async () => {
    if (!clientPhone || copied) return
    try {
      await navigator.clipboard.writeText(clientPhone)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // No-op: clipboard may be blocked
    }
  }

  const detailBody = (
    <>
      {/* -- Centered Profile Header -- */}
      <div className={cn('flex flex-col items-center gap-1 pb-1', isMobile ? 'pt-2' : 'pt-2.5')}>
        <div className="relative mb-2">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white',
              isWalkIn
                ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                : 'bg-gradient-to-br from-zinc-600 to-zinc-800'
            )}
          >
            {isWalkIn ? <UserPlus className="h-6 w-6" /> : clientName.charAt(0).toUpperCase()}
          </div>
        </div>
        <p
          className={cn(
            'max-w-[92%] break-words text-center font-bold text-foreground',
            isMobile ? 'text-base leading-tight' : 'text-[1.4rem] leading-[1.2]'
          )}
        >
          {clientName}
        </p>

        {/* Status pill + source */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border font-medium',
              isMobile ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
              getStatusStyle(status)
            )}
          >
            {getStatusLabel(status)}
          </span>
          {sourceInfo && appointment.source !== 'walk_in' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <sourceInfo.icon className="h-3 w-3" />
              {sourceInfo.label}
            </span>
          )}
        </div>

        {/* Relative time context */}
        {relativeTime && (
          <p
            className={cn(
              'mt-1.5 font-medium',
              isMobile ? 'text-xs' : 'text-[13px]',
              status === 'in_progress'
                ? 'text-emerald-600 dark:text-emerald-400'
                : status === 'pending' || status === 'confirmed'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-muted'
            )}
          >
            {relativeTime}
          </p>
        )}

        {/* Mini progress bar for in-progress */}
        {inProgressRatio !== null && (
          <div className="w-32 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-1.5 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                inProgressRatio > 1 ? 'bg-amber-400' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(inProgressRatio * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* -- Quick Action Buttons -- */}
      {clientPhone && (
        <div className="flex items-center justify-center gap-3 py-2">
          <a href={`tel:${clientPhone}`} className="flex flex-col items-center gap-1 w-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors active:bg-blue-500/20">
              <Phone className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Llamar</span>
          </a>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 w-16"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors active:bg-emerald-500/20">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                WhatsApp
              </span>
            </a>
          )}
          <button
            type="button"
            onClick={handleCopyPhone}
            className="flex flex-col items-center gap-1 w-16"
          >
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-zinc-500/20',
                copied
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-500/10 text-muted'
              )}
            >
              {copied ? (
                <Check className="h-[18px] w-[18px]" />
              ) : (
                <Copy className="h-[18px] w-[18px]" />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'
              )}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </span>
          </button>
        </div>
      )}

      {/* -- Horario tile (full-width, visual timeline) -- */}
      <div
        className={cn(
          'mx-1 mb-2 rounded-xl bg-zinc-50 px-4 dark:bg-white/[0.04]',
          isMobile ? 'py-3' : 'py-3.5'
        )}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Clock className="h-3 w-3 text-muted" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
            Horario
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          {/* Start */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />
            <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p
                className={cn(
                  'font-semibold leading-none text-foreground',
                  isMobile ? 'text-[15px]' : 'text-base'
                )}
              >
                {formatAppointmentTime(appointment.scheduled_at)}
              </p>
              <span className="ml-2 shrink-0 whitespace-nowrap text-[11px] text-muted">Inicio</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <p
                className={cn(
                  'font-medium leading-none text-muted',
                  isMobile ? 'text-[15px]' : 'text-base'
                )}
              >
                {formatAppointmentTime(
                  new Date(
                    new Date(appointment.scheduled_at).getTime() +
                      appointment.duration_minutes * 60_000
                  ).toISOString()
                )}
              </p>
              <span className="ml-2 shrink-0 whitespace-nowrap text-[11px] text-muted">
                Fin · {appointment.duration_minutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -- Stats Grid (Servicio + Precio) -- */}
      <div
        className={cn(
          'grid gap-2 px-1 pb-2.5',
          isMobile ? 'grid-cols-2' : 'grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]'
        )}
      >
        <div
          className={cn(
            'min-w-0 rounded-xl bg-zinc-50 px-3 pb-3 dark:bg-white/[0.04]',
            isMobile ? 'pt-3.5' : 'pt-4'
          )}
        >
          <div
            className={cn(
              'mb-1 flex items-center gap-1.5',
              isMobile ? 'min-h-[1rem]' : 'min-h-[1.15rem] pt-0.5'
            )}
          >
            <Scissors className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span
              className={cn(
                'font-medium uppercase tracking-wide text-muted',
                isMobile ? 'text-[10px] leading-4' : 'text-xs leading-[1.1rem]'
              )}
            >
              Servicio
            </span>
          </div>
          <p
            className={cn(
              'font-bold leading-snug text-foreground break-words',
              isMobile ? 'line-clamp-2 min-h-[2.25rem] text-sm' : 'min-h-[2.75rem] text-[1.1rem]'
            )}
          >
            {serviceName}
          </p>
        </div>
        <div
          className={cn(
            'min-w-0 rounded-xl bg-zinc-50 px-3 pb-3 dark:bg-white/[0.04]',
            isMobile ? 'pt-3.5' : 'pt-4'
          )}
        >
          <div
            className={cn(
              'mb-1 flex items-center gap-1.5',
              isMobile ? 'min-h-[1rem]' : 'min-h-[1.15rem] pt-0.5'
            )}
          >
            <Wallet className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span
              className={cn(
                'font-medium uppercase tracking-wide text-muted',
                isMobile ? 'text-[10px] leading-4' : 'text-xs leading-[1.1rem]'
              )}
            >
              Precio
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p
              className={cn(
                'whitespace-nowrap font-bold tabular-nums text-foreground',
                isMobile ? 'text-sm' : 'text-[1.2rem]'
              )}
            >
              {currencyFormatter.format(price)}
            </p>
            {hasDiscount && (
              <span className="whitespace-nowrap text-[10px] text-muted line-through">
                {currencyFormatter.format(basePrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* -- Contextual Alerts -- */}
      <div className="space-y-2 px-1">
        {/* Advance payment badges */}
        {hasAdvancePending && (
          <button
            onClick={() => onVerifyPayment?.(appointment.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40"
          >
            <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Adelanto pendiente de verificar
            </span>
          </button>
        )}

        {hasAdvanceVerified && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Adelanto verificado
            </span>
          </div>
        )}

        {/* Delay chip + WhatsApp CTA */}
        {(estimatedDelay ?? 0) > 0 && status !== 'completed' && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Retraso estimado: +{estimatedDelay} min
            </span>
            {delayLink && (
              <a
                href={delayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-300 underline"
              >
                Avisar
              </a>
            )}
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20">
            <Wallet className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {appointment.discount_pct_snapshot}% descuento aplicado
            </span>
          </div>
        )}

        {/* Notes */}
        {appointment.client_notes && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <NotepadText className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Notas del cliente
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {appointment.client_notes}
            </p>
          </div>
        )}

        {appointment.internal_notes && (
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <NotepadText className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Notas internas
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {appointment.internal_notes}
            </p>
          </div>
        )}

        {/* Completed info */}
        {status === 'completed' && appointment.payment_method && (
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Wallet className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Pago
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {appointment.payment_method === 'cash'
                ? 'Efectivo'
                : appointment.payment_method === 'sinpe'
                  ? 'SINPE'
                  : 'Tarjeta'}
              {appointment.actual_duration_minutes &&
                ` · ${appointment.actual_duration_minutes} min`}
            </p>
          </div>
        )}

        {/* "Llega Antes" CTA */}
        {arriveEarlyLink && (
          <a
            href={arriveEarlyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-sm font-semibold text-blue-700 dark:text-blue-300 active:scale-[0.98] transition-transform"
          >
            Avisar al siguiente que llegue antes
          </a>
        )}
      </div>

      {/* -- Action buttons by status -- */}
      {actions.length > 0 && (
        <div className="space-y-2.5 px-1 pt-3.5">
          {actions.includes('check_in') && onCheckIn && (
            <Button
              variant="primary"
              onClick={() => {
                haptics.tap()
                onCheckIn(appointment.id)
                onOpenChange(false)
              }}
              disabled={isLoading}
              className={cn('w-full h-11', !isMobile && 'h-12 text-[1.05rem]')}
            >
              Iniciar servicio
            </Button>
          )}

          {actions.includes('complete') && onComplete && (
            <Button
              variant="success"
              onClick={() => {
                haptics.tap()
                onComplete(appointment.id)
              }}
              disabled={isLoading}
              className="w-full h-11"
            >
              Completar
            </Button>
          )}

          {actions.includes('focus_mode') && onFocusMode && (
            <Button
              variant="outline"
              onClick={() => {
                haptics.tap()
                onFocusMode(appointment.id)
                onOpenChange(false)
              }}
              className="w-full h-11"
            >
              Modo Enfoque
            </Button>
          )}

          {actions.includes('no_show') && onNoShow && (
            <button
              onClick={() => {
                haptics.tap()
                onNoShow(appointment.id)
                onOpenChange(false)
              }}
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
            >
              No asistió
            </button>
          )}
        </div>
      )}

      <div className="h-2" />
    </>
  )

  // Desktop: centered Modal
  if (!isMobile) {
    return (
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Detalle de cita"
        size="md"
        className="max-w-[32rem]"
        contentFill={false}
      >
        {detailBody}
      </Modal>
    )
  }

  // Mobile: bottom Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-zinc-900 pb-safe"
      >
        <SheetClose onClose={() => onOpenChange(false)} />
        {detailBody}
      </SheetContent>
    </Sheet>
  )
}
