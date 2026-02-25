'use client'

/**
 * LiveQueueCard — Uber-like live queue tracking for client dashboard
 *
 * 3 phases:
 * A) Countdown (> 60 min) — static card with countdown timer
 * B) Live Queue (<= 60 min) — Gantt bar + ETA + delay indicator
 * C) Your Turn (your appointment started) — live timer
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Scissors, User, MessageCircle, Clock, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import { haptics } from '@/lib/utils/mobile'
import { formatDate, formatTime } from '@/lib/utils/format'
import { animations } from '@/lib/design-system'
import { createClient } from '@/lib/supabase/client'
import { CancelRescheduleActions } from '@/components/track/cancel-reschedule-actions'
import type { ClientUpcomingAppointment } from '@/hooks/queries/useClientDashboard'
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

interface QueueResponse {
  barberName: string
  date: string
  yourAppointmentId: string
  queue: QueueItem[]
  stats: {
    completed: number
    inProgress: number
    pending: number
    beforeYou: number
    estimatedDelay: number
    estimatedStartTime: string
  }
}

type Phase = 'countdown' | 'live-queue' | 'your-turn'

interface LiveQueueCardProps {
  appointment: ClientUpcomingAppointment
  businessId: string
  businessSlug: string
}

// =====================================================
// Hooks
// =====================================================

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

function useBarberQueue(barberId: string, businessId: string, enabled: boolean) {
  return useQuery<QueueResponse>({
    queryKey: ['barber-queue', barberId, businessId],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${barberId}/today?businessId=${businessId}`)
      if (!res.ok) throw new Error('Queue fetch failed')
      return res.json()
    },
    enabled,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible' ? 30_000 : false,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  })
}

// =====================================================
// Main Component
// =====================================================

function useCancelPolicy(businessId: string) {
  return useQuery<CancellationPolicy | null>({
    queryKey: ['cancel-policy-by-id', businessId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('businesses')
        .select('cancellation_policy, slug')
        .eq('id', businessId)
        .single()
      if (!data) return null
      return (data.cancellation_policy as CancellationPolicy) ?? null
    },
    enabled: !!businessId,
    staleTime: 5 * 60_000,
  })
}

export function LiveQueueCard({ appointment, businessId, businessSlug }: LiveQueueCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const timeLeft = useCountdown(appointment.scheduled_at)
  const minutesUntil = timeLeft.totalMs / 60_000

  // Determine phase
  const phase: Phase = useMemo(() => {
    if (appointment.status === 'confirmed' && appointment.started_at) {
      return 'your-turn'
    }
    if (minutesUntil <= 60) {
      return 'live-queue'
    }
    return 'countdown'
  }, [appointment.status, appointment.started_at, minutesUntil])

  // Fetch queue data only in live-queue phase
  const barberId = appointment.barber?.id
  const { data: queueData, isLoading: queueLoading } = useBarberQueue(
    barberId ?? '',
    businessId,
    phase === 'live-queue' && !!barberId
  )

  // Fetch cancellation policy for this business
  const { data: cancelPolicy } = useCancelPolicy(businessId)

  // Haptic feedback on phase transitions
  const prevPhaseRef = useRef<Phase>(phase)
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      if (phase === 'live-queue' || phase === 'your-turn') {
        haptics.success()
      }
      prevPhaseRef.current = phase
    }
  }, [phase])

  const springConfig = prefersReducedMotion ? { duration: 0.01 } : animations.spring.card

  // Invalidate upcoming query after cancel so the card disappears
  function handleCancelled() {
    queryClient.invalidateQueries({ queryKey: ['client-upcoming'] })
  }

  // Whether to show cancel/reschedule actions (not during your-turn, and must have token + policy)
  const trackingToken = (appointment as any).tracking_token as string | null
  const showActions =
    phase !== 'your-turn' &&
    !!trackingToken &&
    !!cancelPolicy &&
    (appointment.status === 'pending' || appointment.status === 'confirmed')

  const cancelActions = showActions ? (
    <div className="mt-4">
      <CancelRescheduleActions
        token={trackingToken!}
        scheduledAt={appointment.scheduled_at}
        policy={cancelPolicy!}
        serviceName={appointment.service?.name ?? 'Servicio'}
        barberName={appointment.barber?.name ?? 'Miembro del equipo'}
        businessSlug={businessSlug}
        onCancelled={handleCancelled}
      />
    </div>
  ) : null

  return (
    <AnimatePresence mode="wait">
      {phase === 'countdown' && (
        <motion.div
          key="countdown"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={springConfig}
        >
          <CountdownPhase
            appointment={appointment}
            timeLeft={timeLeft}
            cancelActions={cancelActions}
          />
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
          <LiveQueuePhase
            appointment={appointment}
            queueData={queueData ?? null}
            queueLoading={queueLoading}
            timeLeft={timeLeft}
            cancelActions={cancelActions}
          />
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
          <YourTurnPhase appointment={appointment} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =====================================================
// Phase A — Countdown (> 60 min)
// =====================================================

function CountdownPhase({
  appointment,
  timeLeft,
  cancelActions,
}: {
  appointment: ClientUpcomingAppointment
  timeLeft: ReturnType<typeof computeTimeLeft>
  cancelActions: React.ReactNode
}) {
  const countdownText =
    timeLeft.hours > 0
      ? `${timeLeft.hours}h ${timeLeft.minutes}min`
      : `${timeLeft.minutes}min ${timeLeft.seconds}s`

  const whatsAppLink = appointment.barber?.phone
    ? buildWhatsAppLink(appointment.barber.phone)
    : null

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      {/* Countdown */}
      <div className="text-center mb-5">
        <p className="text-sm text-muted mb-1">Tu cita es en</p>
        <p className="text-3xl font-bold tabular-nums font-mono text-zinc-900 dark:text-white">
          {countdownText}
        </p>
      </div>

      {/* Info rows */}
      <div className="space-y-3 mb-4">
        <InfoRow
          icon={Calendar}
          label={formatDate(new Date(appointment.scheduled_at))}
          sublabel={formatTime(new Date(appointment.scheduled_at))}
        />
        {appointment.service && (
          <InfoRow
            icon={Scissors}
            label={appointment.service.name}
            sublabel={
              appointment.price != null
                ? `₡${Number(appointment.price).toLocaleString()}`
                : undefined
            }
          />
        )}
        {appointment.barber && <InfoRow icon={User} label={appointment.barber.name} />}
      </div>

      {/* WhatsApp button */}
      {whatsAppLink && (
        <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full h-11 gap-2">
            <MessageCircle className="h-4 w-4" />
            Contactar miembro del equipo
          </Button>
        </a>
      )}

      {/* Cancel / Reschedule actions */}
      {cancelActions}
    </div>
  )
}

// =====================================================
// Phase B — Live Queue (<= 60 min)
// =====================================================

function LiveQueuePhase({
  appointment,
  queueData,
  queueLoading,
  timeLeft,
  cancelActions,
}: {
  appointment: ClientUpcomingAppointment
  queueData: QueueResponse | null
  queueLoading: boolean
  timeLeft: ReturnType<typeof computeTimeLeft>
  cancelActions: React.ReactNode
}) {
  // Check if all non-yours items are pending (barber not using "Iniciar")
  const allPending = queueData?.queue.filter((q) => !q.isYours).every((q) => q.status === 'pending')

  const noLiveData = !queueData || (allPending && queueData.stats.completed === 0)

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
          {queueData && <p className="text-xs text-muted">Con {queueData.barberName}</p>}
        </div>

        {/* Delay chip */}
        {queueData && <DelayChip delay={queueData.stats.estimatedDelay} />}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        {queueLoading ? (
          <QueueSkeleton />
        ) : noLiveData ? (
          /* Fallback: barber not using "Iniciar" */
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
        ) : queueData.stats.beforeYou === 0 ? (
          /* Edge case: first in queue */
          <FirstInQueueView appointment={appointment} queueData={queueData} />
        ) : (
          /* Normal: Gantt + stats */
          <>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/85 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
              <GanttBar queue={queueData.queue} />
              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted">
                <span>Ahora</span>
                <span>Tu turno aprox.</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {queueData.stats.beforeYou}
                </span>{' '}
                {queueData.stats.beforeYou === 1 ? 'cita' : 'citas'} antes de ti
              </p>
              <p className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                ~{formatTime(new Date(queueData.stats.estimatedStartTime))}
              </p>
            </div>
          </>
        )}

        {/* Compact info */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex min-w-0 items-center gap-2 text-muted">
            <Scissors className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
              {appointment.service?.name ?? 'Servicio'}
            </span>
          </div>
          <span className="shrink-0 font-medium text-muted">
            {formatTime(new Date(appointment.scheduled_at))}
          </span>
        </div>

        {/* Cancel / Reschedule actions */}
        {cancelActions}
      </div>
    </div>
  )
}

// =====================================================
// Phase C — Your Turn
// =====================================================

function YourTurnPhase({ appointment }: { appointment: ClientUpcomingAppointment }) {
  const elapsed = useLiveTimer(appointment.started_at!)
  const durationMin = appointment.duration_minutes ?? 30
  const progress = Math.min(1, elapsed.totalMinutes / durationMin)
  const remaining = Math.max(0, Math.round(durationMin - elapsed.totalMinutes))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-white dark:bg-zinc-900 shadow-[0_8px_28px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sky-500/[0.07] via-sky-500/[0.02] to-transparent dark:from-sky-400/[0.06]" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-800/80 dark:bg-sky-900/25 dark:text-sky-300">
            <Scissors className="h-3 w-3" />
            Es tu turno
          </span>
          <p className="text-xs text-muted">
            {appointment.barber?.name ?? 'Tu miembro del equipo'} te está atendiendo
          </p>
        </div>
      </div>

      {/* Timer */}
      <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="text-center py-3">
          <p className="text-5xl font-bold tabular-nums font-mono text-sky-600 dark:text-sky-400">
            {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Progress bar */}
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

        {/* Service info */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex min-w-0 items-center gap-2 text-muted">
            <Scissors className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
              {appointment.service?.name ?? 'Servicio'}
            </span>
          </div>
          <span className="shrink-0 font-medium text-muted">{durationMin} min</span>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// Sub-components
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

  const visualQueue = queue.map((item, index) => {
    if (item.isYours) {
      return { item, state: 'yours' as const }
    }
    if (item.status === 'completed') {
      return { item, state: 'completed' as const }
    }
    if (index === activeIndex) {
      return { item, state: 'active' as const }
    }
    return { item, state: 'pending' as const }
  })

  const counts = visualQueue.reduce(
    (acc, segment) => {
      if (segment.state === 'completed') acc.completed += 1
      if (segment.state === 'active') acc.active += 1
      if (segment.state === 'pending') acc.pending += 1
      return acc
    },
    { completed: 0, active: 0, pending: 0 }
  )

  return (
    <div>
      <div className="flex h-9 items-stretch gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/90 p-1 dark:border-zinc-700/70 dark:bg-zinc-900/70 sm:h-10">
        {visualQueue.map(({ item, state }) => {
          const widthPercent = (item.durationMinutes / totalMinutes) * 100
          const minWidth = 24

          let bgColor = 'bg-zinc-300/95 dark:bg-zinc-700'
          let segmentLabel = 'En espera'

          if (state === 'yours') {
            bgColor = 'bg-[var(--brand-primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]'
            segmentLabel = 'Tu cita'
          } else if (state === 'completed') {
            bgColor = 'bg-emerald-500/90 dark:bg-emerald-500/80'
            segmentLabel = 'Completada'
          } else if (state === 'active') {
            bgColor = 'bg-sky-500 dark:bg-sky-500'
            segmentLabel = 'En curso'
          }

          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-center rounded-lg transition-colors duration-500 ${bgColor}`}
              style={{
                width: `${widthPercent}%`,
                minWidth: `${minWidth}px`,
              }}
              title={`${item.serviceName} · ${item.durationMinutes} min · ${segmentLabel}`}
            >
              {state === 'active' && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 h-1.5 w-1.5 motion-safe:animate-ping rounded-full bg-white/60" />
                  <span className="relative block h-1.5 w-1.5 rounded-full bg-white/95 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]" />
                </span>
              )}
              {state === 'yours' && widthPercent > 13 && (
                <span className="truncate px-1 text-[10px] font-bold text-white">TÚ</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
        {counts.active > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            En curso
          </span>
        )}
        {counts.completed > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Completadas {counts.completed}
          </span>
        )}
        {counts.pending > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            En espera {counts.pending}
          </span>
        )}
      </div>
    </div>
  )
}

function FirstInQueueView({
  appointment,
  queueData,
}: {
  appointment: ClientUpcomingAppointment
  queueData: QueueResponse
}) {
  return (
    <div className="text-center py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-2">
        <Scissors className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="font-semibold text-zinc-900 dark:text-white">Eres el siguiente</p>
      <p className="text-sm text-muted mt-0.5">
        {appointment.service?.name ?? 'Servicio'} ·{' '}
        {formatTime(new Date(queueData.stats.estimatedStartTime))}
      </p>
    </div>
  )
}

function QueueSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/85 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <div className="flex h-9 items-stretch gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/90 p-1 dark:border-zinc-700/70 dark:bg-zinc-900/70">
          <div className="rounded-lg bg-zinc-300 dark:bg-zinc-700" style={{ width: '30%' }} />
          <div className="rounded-lg bg-zinc-300 dark:bg-zinc-700" style={{ width: '25%' }} />
          <div className="rounded-lg bg-zinc-300 dark:bg-zinc-700" style={{ width: '20%' }} />
          <div className="rounded-lg bg-zinc-300 dark:bg-zinc-700" style={{ width: '25%' }} />
        </div>
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="flex justify-between rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
