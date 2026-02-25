'use client'

/**
 * Public Tracking Page — /track/[token]
 *
 * Uber-style live queue tracking without authentication.
 * Shared via WhatsApp "Llegá Antes" or booking confirmation email.
 *
 * 3 states:
 * 1. Valid — shows live queue with Gantt bar + ETA
 * 2. Expired — token expired, show CTA to rebook
 * 3. Not Found — invalid token
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Scissors, User, Clock, Activity, AlertCircle, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { animations } from '@/lib/design-system'
import { CancelRescheduleActions } from '@/components/track/cancel-reschedule-actions'
import type { CancellationPolicy } from '@/types'

// =====================================================
// Types
// =====================================================

interface QueueItem {
  id: string
  scheduledAt: string
  durationMinutes: number
  status: 'pending' | 'confirmed' | 'completed'
  startedAt: string | null
  actualDurationMinutes: number | null
  serviceName: string
  isYours: boolean
}

interface PublicQueueResponse {
  barberName: string
  businessName: string
  brandColor: string | null
  businessSlug: string
  date: string
  yourAppointmentId: string
  appointmentDetails: {
    scheduledAt: string
    serviceName: string
    barberName: string
    durationMinutes: number
    status: string
    startedAt: string | null
  }
  queue: QueueItem[]
  stats: {
    completed: number
    inProgress: number
    pending: number
    beforeYou: number
    estimatedDelay: number
    estimatedStartTime: string
  }
  expired: boolean
}

type TrackingState = 'loading' | 'valid' | 'expired' | 'completed' | 'cancelled' | 'not-found'

// =====================================================
// Hooks
// =====================================================

function usePublicQueue(token: string) {
  return useQuery<PublicQueueResponse>({
    queryKey: ['public-queue', token],
    queryFn: async () => {
      const res = await fetch(`/api/public/queue?token=${token}`)
      if (res.status === 410) {
        const data = await res.json()
        return { ...data, expired: true } as PublicQueueResponse
      }
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      if (!res.ok) throw new Error('Queue fetch failed')
      return res.json()
    },
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible' ? 30_000 : false,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'NOT_FOUND') return false
      return failureCount < 2
    },
  })
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

function computeTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    totalMs: diff,
  }
}

function useLiveTimer(startedAt: string) {
  const [elapsed, setElapsed] = useState({ minutes: 0, seconds: 0, totalMinutes: 0 })

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const update = () => {
      const diff = Math.max(0, Date.now() - start)
      setElapsed({
        minutes: Math.floor(diff / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
        totalMinutes: diff / 60_000,
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return elapsed
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// =====================================================
// Main Page
// =====================================================

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { data, isLoading, error } = usePublicQueue(token)
  const [cancelPolicy, setCancelPolicy] = useState<CancellationPolicy | null>(null)

  // Apply brand color as CSS variable
  useEffect(() => {
    if (data?.brandColor) {
      document.documentElement.style.setProperty('--brand-primary', data.brandColor)
    }
    return () => {
      document.documentElement.style.removeProperty('--brand-primary')
    }
  }, [data?.brandColor])

  // Fetch cancel policy once businessSlug is available
  useEffect(() => {
    if (data?.businessSlug) {
      fetch(`/api/public/cancel-policy/${data.businessSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((policyData: CancellationPolicy | null) => setCancelPolicy(policyData))
        .catch(() => {}) // silently fail — cancel actions simply won't show
    }
  }, [data?.businessSlug])

  // Determine state
  const [localTrackingState, setLocalTrackingState] = useState<TrackingState | null>(null)

  const derivedTrackingState: TrackingState = useMemo(() => {
    if (isLoading) return 'loading'
    if (error instanceof Error && error.message === 'NOT_FOUND') return 'not-found'
    if (data?.expired) return 'expired'
    if (data?.appointmentDetails?.status === 'completed') return 'completed'
    if (
      data?.appointmentDetails?.status === 'cancelled' ||
      data?.appointmentDetails?.status === 'no_show'
    )
      return 'cancelled'
    if (data) return 'valid'
    return 'not-found'
  }, [isLoading, error, data])

  // Local override wins (e.g. client just cancelled via the UI)
  const trackingState: TrackingState = localTrackingState ?? derivedTrackingState

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      {data && trackingState !== 'not-found' && (
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
          <div className="mx-auto max-w-lg">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {data.businessName}
            </p>
            <p className="text-xs text-muted">Seguimiento en vivo</p>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {trackingState === 'loading' && <TrackingSkeleton />}
        {trackingState === 'valid' && data && (
          <ValidTracking
            data={data}
            token={token}
            cancelPolicy={cancelPolicy}
            onCancelled={() => setLocalTrackingState('cancelled')}
            onRescheduled={(newToken) => router.push('/track/' + newToken)}
          />
        )}
        {trackingState === 'completed' && data && <CompletedTracking data={data} />}
        {trackingState === 'cancelled' && data && <CancelledTracking data={data} />}
        {trackingState === 'expired' && data && (
          <ExpiredTracking businessSlug={data.businessSlug} />
        )}
        {trackingState === 'not-found' && <NotFoundTracking />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 py-4 text-center">
        <p className="text-xs text-muted">Seguimiento en vivo por BarberApp</p>
      </footer>
    </div>
  )
}

// =====================================================
// Valid Tracking — Live Queue
// =====================================================

interface ValidTrackingProps {
  data: PublicQueueResponse
  token: string
  cancelPolicy: CancellationPolicy | null
  onCancelled: () => void
  onRescheduled: (newToken: string) => void
}

function ValidTracking({
  data,
  token,
  cancelPolicy,
  onCancelled,
  onRescheduled,
}: ValidTrackingProps) {
  const prefersReducedMotion = useReducedMotion()
  const { appointmentDetails } = data
  const timeLeft = useCountdown(appointmentDetails.scheduledAt)
  const minutesUntil = timeLeft.totalMs / 60_000

  type Phase = 'countdown' | 'live-queue' | 'your-turn'

  const phase: Phase = useMemo(() => {
    if (appointmentDetails.status === 'confirmed' && appointmentDetails.startedAt) {
      return 'your-turn'
    }
    if (minutesUntil <= 60) {
      return 'live-queue'
    }
    return 'countdown'
  }, [appointmentDetails.status, appointmentDetails.startedAt, minutesUntil])

  const springConfig = prefersReducedMotion ? { duration: 0.01 } : animations.spring.card

  // Haptic on phase change
  const prevPhaseRef = useRef(phase)
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      if ('vibrate' in navigator) {
        navigator.vibrate(phase === 'your-turn' ? [100, 50, 100] : [50])
      }
      prevPhaseRef.current = phase
    }
  }, [phase])

  // Show cancel/reschedule only for pending/confirmed appointments that haven't started yet
  const showCancelActions =
    phase !== 'your-turn' &&
    (appointmentDetails.status === 'pending' || appointmentDetails.status === 'confirmed') &&
    cancelPolicy !== null

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={springConfig}
          >
            <PublicCountdownPhase data={data} timeLeft={timeLeft} />
          </motion.div>
        )}
        {phase === 'live-queue' && (
          <motion.div
            key="live-queue"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={springConfig}
          >
            <PublicLiveQueuePhase data={data} timeLeft={timeLeft} />
          </motion.div>
        )}
        {phase === 'your-turn' && (
          <motion.div
            key="your-turn"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
          >
            <PublicYourTurnPhase data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel / Reschedule actions — shown below the tracking card */}
      <AnimatePresence>
        {showCancelActions && (
          <motion.div
            key="cancel-actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={springConfig}
          >
            <CancelRescheduleActions
              token={token}
              scheduledAt={appointmentDetails.scheduledAt}
              policy={cancelPolicy!}
              serviceName={appointmentDetails.serviceName}
              barberName={data.barberName}
              businessSlug={data.businessSlug}
              onCancelled={onCancelled}
              onRescheduled={onRescheduled}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =====================================================
// Phase A — Countdown (> 60 min)
// =====================================================

function PublicCountdownPhase({
  data,
  timeLeft,
}: {
  data: PublicQueueResponse
  timeLeft: ReturnType<typeof computeTimeLeft>
}) {
  const { appointmentDetails } = data
  const countdownText =
    timeLeft.hours > 0
      ? `${timeLeft.hours}h ${timeLeft.minutes}min`
      : `${timeLeft.minutes}min ${timeLeft.seconds}s`

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="text-center mb-5">
        <p className="text-sm text-muted mb-1">Tu cita es en</p>
        <p className="text-3xl font-bold tabular-nums font-mono text-zinc-900 dark:text-white">
          {countdownText}
        </p>
      </div>

      <div className="space-y-3">
        <InfoRow
          icon={Calendar}
          label={formatDate(new Date(appointmentDetails.scheduledAt))}
          sublabel={formatTime(new Date(appointmentDetails.scheduledAt))}
        />
        <InfoRow
          icon={Scissors}
          label={appointmentDetails.serviceName}
          sublabel={`${appointmentDetails.durationMinutes} min`}
        />
        <InfoRow icon={User} label={appointmentDetails.barberName} />
      </div>
    </div>
  )
}

// =====================================================
// Phase B — Live Queue (<= 60 min)
// =====================================================

function PublicLiveQueuePhase({
  data,
  timeLeft,
}: {
  data: PublicQueueResponse
  timeLeft: ReturnType<typeof computeTimeLeft>
}) {
  const allPending = data.queue.filter((q) => !q.isYours).every((q) => q.status === 'pending')

  const noLiveData = allPending && data.stats.completed === 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-[0_8px_28px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-transparent dark:from-emerald-400/[0.05]" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-900/25 dark:text-emerald-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-500/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Cola en vivo
          </span>
          <p className="text-xs text-muted">Con {data.barberName}</p>
        </div>
        <DelayChip delay={data.stats.estimatedDelay} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        {noLiveData ? (
          <div className="text-center py-4">
            <Clock className="h-6 w-6 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">
              Tu cita es en{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {timeLeft.hours > 0
                  ? `${timeLeft.hours}h ${timeLeft.minutes}min`
                  : `${timeLeft.minutes} min`}
              </span>
            </p>
            <p className="text-xs text-muted mt-1">Información en vivo no disponible</p>
          </div>
        ) : data.stats.beforeYou === 0 ? (
          <div className="text-center py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-2">
              <Scissors className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-zinc-900 dark:text-white">Eres el siguiente</p>
            <p className="text-sm text-muted mt-0.5">
              {data.appointmentDetails.serviceName} ·{' '}
              {formatTime(new Date(data.stats.estimatedStartTime))}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/85 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
              <GanttBar queue={data.queue} />
              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted">
                <span>Ahora</span>
                <span>Tu turno aprox.</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {data.stats.beforeYou}
                </span>{' '}
                {data.stats.beforeYou === 1 ? 'cita' : 'citas'} antes de ti
              </p>
              <p className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                ~{formatTime(new Date(data.stats.estimatedStartTime))}
              </p>
            </div>
          </>
        )}

        {/* Compact info */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex min-w-0 items-center gap-2 text-muted">
            <Scissors className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
              {data.appointmentDetails.serviceName}
            </span>
          </div>
          <span className="shrink-0 font-medium text-muted">
            {formatTime(new Date(data.appointmentDetails.scheduledAt))}
          </span>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// Phase C — Your Turn
// =====================================================

function PublicYourTurnPhase({ data }: { data: PublicQueueResponse }) {
  const elapsed = useLiveTimer(data.appointmentDetails.startedAt!)
  const durationMin = data.appointmentDetails.durationMinutes
  const progress = Math.min(1, elapsed.totalMinutes / durationMin)
  const remaining = Math.max(0, Math.round(durationMin - elapsed.totalMinutes))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-white dark:bg-zinc-900 shadow-[0_8px_28px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sky-500/[0.07] via-sky-500/[0.02] to-transparent dark:from-sky-400/[0.06]" />

      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-800/80 dark:bg-sky-900/25 dark:text-sky-300">
            <Scissors className="h-3 w-3" />
            Es tu turno
          </span>
          <p className="text-xs text-muted">{data.barberName} te está atendiendo</p>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="text-center py-3">
          <p className="text-5xl font-bold tabular-nums font-mono text-sky-600 dark:text-sky-400">
            {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/85 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="h-2.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted">
            <span>Inicio</span>
            <span>{remaining > 0 ? `~${remaining} min restantes` : 'Finalizando'}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex min-w-0 items-center gap-2 text-muted">
            <Scissors className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
              {data.appointmentDetails.serviceName}
            </span>
          </div>
          <span className="shrink-0 font-medium text-muted">{durationMin} min</span>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// Completed State
// =====================================================

function CompletedTracking({ data }: { data: PublicQueueResponse }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-3">
        <Scissors className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Cita completada</h2>
      <p className="text-sm text-muted mt-1">
        {data.appointmentDetails.serviceName} con {data.barberName}
      </p>
      {data.businessSlug && (
        <a href={`/reservar/${data.businessSlug}`}>
          <Button variant="outline" className="mt-4 h-11 gap-2">
            <CalendarPlus className="h-4 w-4" />
            Reservar otra cita
          </Button>
        </a>
      )}
    </div>
  )
}

// =====================================================
// Cancelled State
// =====================================================

function CancelledTracking({ data }: { data: PublicQueueResponse }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-3">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Cita cancelada</h2>
      <p className="text-sm text-muted mt-1">Esta cita ya no está activa.</p>
      {data.businessSlug && (
        <a href={`/reservar/${data.businessSlug}`}>
          <Button variant="outline" className="mt-4 h-11 gap-2">
            <CalendarPlus className="h-4 w-4" />
            Reservar otra cita
          </Button>
        </a>
      )}
    </div>
  )
}

// =====================================================
// Expired State
// =====================================================

function ExpiredTracking({ businessSlug }: { businessSlug?: string | null }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-3">
        <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Link expirado</h2>
      <p className="text-sm text-muted mt-1">Este link de seguimiento ya no está disponible.</p>
      {businessSlug && (
        <a href={`/reservar/${businessSlug}`}>
          <Button variant="outline" className="mt-4 h-11 gap-2">
            <CalendarPlus className="h-4 w-4" />
            Reservar otra cita
          </Button>
        </a>
      )}
    </div>
  )
}

// =====================================================
// Not Found State
// =====================================================

function NotFoundTracking() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-3">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Cita no encontrada</h2>
      <p className="text-sm text-muted mt-1">Este link de seguimiento no es válido.</p>
    </div>
  )
}

// =====================================================
// Sub-components (shared)
// =====================================================

function InfoRow({
  icon: Icon,
  label,
  sublabel,
}: {
  icon: typeof Calendar
  label: string
  sublabel?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-5 w-5 text-muted" />
      </div>
      <div>
        <p className="font-medium text-zinc-900 dark:text-white">{label}</p>
        {sublabel && <p className="text-sm text-muted">{sublabel}</p>}
      </div>
    </div>
  )
}

function DelayChip({ delay }: { delay: number }) {
  if (delay <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-900/30 dark:text-emerald-300">
        <Activity className="h-3 w-3" />
        Al día
      </span>
    )
  }

  const isHeavy = delay >= 15
  const colorClasses = isHeavy
    ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-800/80 dark:bg-red-900/30 dark:text-red-300'
    : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/80 dark:bg-amber-900/30 dark:text-amber-300'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${colorClasses}`}
    >
      <Clock className="h-3 w-3" />+{delay} min
    </span>
  )
}

function GanttBar({ queue }: { queue: QueueItem[] }) {
  const totalMinutes = queue.reduce((sum, q) => sum + q.durationMinutes, 0)
  if (totalMinutes === 0) return null

  const yourIndex = queue.findIndex((item) => item.isYours)
  const beforeYourIndex = yourIndex >= 0 ? yourIndex : queue.length

  let activeIndex = queue.findIndex(
    (item, index) =>
      index < beforeYourIndex &&
      !item.isYours &&
      item.status === 'confirmed' &&
      Boolean(item.startedAt)
  )
  if (activeIndex < 0) {
    activeIndex = queue.findIndex(
      (item, index) => index < beforeYourIndex && !item.isYours && item.status === 'confirmed'
    )
  }
  if (activeIndex < 0) {
    activeIndex = queue.findIndex(
      (item, index) => index < beforeYourIndex && !item.isYours && item.status !== 'completed'
    )
  }

  return (
    <div>
      <div className="flex h-9 items-stretch gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/90 p-1 dark:border-zinc-700/70 dark:bg-zinc-900/70 sm:h-10">
        {queue.map((item, index) => {
          const widthPercent = (item.durationMinutes / totalMinutes) * 100
          const isYours = item.isYours
          const isCompleted = item.status === 'completed'
          const isActive = index === activeIndex

          let bgColor = 'bg-zinc-300/95 dark:bg-zinc-700'
          if (isYours)
            bgColor =
              'bg-[var(--brand-primary,#3b82f6)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]'
          else if (isCompleted) bgColor = 'bg-emerald-500/90 dark:bg-emerald-500/80'
          else if (isActive) bgColor = 'bg-sky-500 dark:bg-sky-500'

          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-center rounded-lg transition-colors duration-500 ${bgColor}`}
              style={{ width: `${widthPercent}%`, minWidth: '24px' }}
            >
              {isActive && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 h-1.5 w-1.5 motion-safe:animate-ping rounded-full bg-white/60" />
                  <span className="relative block h-1.5 w-1.5 rounded-full bg-white/95" />
                </span>
              )}
              {isYours && widthPercent > 13 && (
                <span className="truncate px-1 text-[10px] font-bold text-white">TÚ</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrackingSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 animate-pulse">
      <div className="text-center mb-5">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto mb-2" />
        <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  )
}
