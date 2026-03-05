'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageCircle, ChevronRight, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { haptics } from '@/lib/utils/mobile'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Button } from '@/components/ui/button'
import { SlideToComplete } from './slide-to-complete'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import type { TodayAppointment } from '@/types/custom'

interface MiDiaNowCardProps {
  appointment: TodayAppointment
  onComplete: (appointmentId: string) => void
  onFocusMode: (appointmentId: string) => void
  isLoading?: boolean
  className?: string
}

/* ─── Mini Progress Ring (72px) ─── */
function MiniProgressRing({ progress, isOvertime }: { progress: number; isOvertime: boolean }) {
  const size = 72
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(progress, 1)
  const offset = circumference * (1 - clampedProgress)

  return (
    <svg width={size} height={size} className="shrink-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-200 dark:text-zinc-700"
      />
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
          'transition-[stroke-dashoffset,color] duration-1000 ease-out',
          isOvertime ? 'text-amber-400' : 'text-emerald-500'
        )}
      />
    </svg>
  )
}

export function MiDiaNowCard({
  appointment,
  onComplete,
  onFocusMode,
  isLoading = false,
  className,
}: MiDiaNowCardProps) {
  const [elapsed, setElapsed] = useState('')
  const [elapsedMins, setElapsedMins] = useState(0)
  const isMobile = useIsMobile(1024)

  const duration = appointment.duration_minutes || 30
  const isWalkIn = appointment.source === 'walk_in'
  const clientName = appointment.client?.name || (isWalkIn ? 'Walk-in' : 'Cliente')
  const clientPhone = appointment.client?.phone ?? null
  const serviceName = appointment.service?.name || 'Servicio'
  const price = appointment.final_price_snapshot ?? appointment.price

  // Live timer
  useEffect(() => {
    if (!appointment.started_at) return
    const start = new Date(appointment.started_at).getTime()

    const update = () => {
      const diff = Date.now() - start
      const mins = Math.floor(diff / 60_000)
      const secs = Math.floor((diff % 60_000) / 1000)
      setElapsed(`${mins}:${String(secs).padStart(2, '0')}`)
      setElapsedMins(mins)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [appointment.started_at])

  const progress = duration > 0 ? elapsedMins / duration : 0
  const isOvertime = elapsedMins > duration

  const whatsappLink = clientPhone ? buildWhatsAppLink(clientPhone) : null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={appointment.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={cn(
          'rounded-2xl border p-4',
          'bg-white dark:bg-zinc-900',
          'border-emerald-200 dark:border-emerald-800/40',
          'shadow-sm',
          className
        )}
        data-testid="mi-dia-now-card"
      >
        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
          En curso
        </p>

        {/* Tappable area → Focus Mode (Spotify mini-player pattern) */}
        <motion.button
          onClick={() => {
            haptics.tap()
            onFocusMode(appointment.id)
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center gap-4 w-full text-left rounded-xl -mx-1 px-1 py-1 lg:hover:bg-emerald-50/50 lg:dark:hover:bg-emerald-950/20 lg:cursor-pointer transition-colors"
          aria-label="Entrar en modo enfoque"
        >
          {/* Progress ring with timer inside */}
          <div className="relative flex items-center justify-center shrink-0">
            <MiniProgressRing progress={progress} isOvertime={isOvertime} />
            <span
              className={cn(
                'absolute text-sm font-bold tabular-nums',
                isOvertime ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'
              )}
            >
              {elapsed}
            </span>
          </div>

          {/* Client + service info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                {clientName}
              </p>
              {isWalkIn && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                  <UserPlus className="h-2.5 w-2.5" />
                  Walk-in
                </span>
              )}
            </div>
            <p className="text-sm text-muted truncate">{serviceName}</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
              {new Intl.NumberFormat('es-CR', {
                style: 'currency',
                currency: 'CRC',
                maximumFractionDigits: 0,
              }).format(price)}
            </p>
          </div>

          {/* Chevron affordance */}
          <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400 dark:text-zinc-600" />
        </motion.button>

        {/* Contact actions (isolated touch targets) */}
        {clientPhone && (
          <div className="flex items-center gap-2 mt-2">
            <a
              href={`tel:${clientPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-transform"
              aria-label="Llamar cliente"
            >
              <Phone className="h-4 w-4" />
            </a>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Complete action: slide on mobile, button on desktop */}
        <div className="mt-3">
          {isMobile ? (
            <SlideToComplete onComplete={() => onComplete(appointment.id)} disabled={isLoading} />
          ) : (
            <Button
              variant="success"
              onClick={() => onComplete(appointment.id)}
              disabled={isLoading}
              className="w-full h-11"
            >
              Completar servicio
            </Button>
          )}
        </div>

        {/* No "No asistió" here — client is already being served */}
      </motion.div>
    </AnimatePresence>
  )
}
