'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { BarberAppointmentCard } from './barber-appointment-card'
import type { TodayAppointment } from '@/types/custom'

/**
 * Calculate rolling delay for each appointment.
 *
 * When an in-progress appointment exceeds its estimated duration,
 * the overflow cascades as "estimated delay" to all subsequent
 * non-finalized appointments.
 */
function computeDelays(sorted: TodayAppointment[]): Map<string, number> {
  const delays = new Map<string, number>()
  let cumulativeDelay = 0

  for (const apt of sorted) {
    const isFinalized =
      apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show'

    if (isFinalized) continue

    // If this appointment is in progress (confirmed + started), compute its overflow
    if (apt.status === 'confirmed' && apt.started_at) {
      const elapsed = (Date.now() - new Date(apt.started_at).getTime()) / 60_000
      const overflow = Math.max(0, Math.round(elapsed - (apt.duration_minutes || 30)))
      cumulativeDelay = Math.max(cumulativeDelay, overflow)
      // The in-progress appointment itself doesn't show a delay chip
      continue
    }

    // Pending/confirmed but not started: inherit cumulative delay
    if (cumulativeDelay > 0) {
      delays.set(apt.id, cumulativeDelay)
    }
  }

  return delays
}

interface MiDiaTimelineProps {
  appointments: TodayAppointment[]
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string, paymentMethod?: 'cash' | 'sinpe' | 'card') => void
  onNoShow?: (appointmentId: string) => void
  onFocusMode?: (appointmentId: string) => void
  loadingAppointmentId?: string | null
  acceptedPaymentMethods?: ('cash' | 'sinpe' | 'card')[]
  /** Barber name for WhatsApp message templates */
  barberName?: string
  /** Business name for WhatsApp message templates */
  businessName?: string
  className?: string
}

/**
 * Timeline layout for displaying today's appointments
 * Groups appointments with status-colored dots
 */
export function MiDiaTimeline({
  appointments,
  onCheckIn,
  onComplete,
  onNoShow,
  onFocusMode,
  loadingAppointmentId,
  acceptedPaymentMethods,
  barberName,
  businessName,
  className,
}: MiDiaTimelineProps) {
  // Sort appointments by scheduled time
  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ),
    [appointments]
  )

  // Rolling delay calculation (updates when appointments change)
  const delayMap = useMemo(() => computeDelays(sortedAppointments), [sortedAppointments])

  // Empty state
  if (appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          'bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700',
          className
        )}
        data-testid="mi-dia-empty-state"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Calendar className="h-8 w-8 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          No hay citas hoy
        </h3>
        <p className="text-sm text-muted text-center max-w-sm">
          No tienes citas programadas para hoy. Disfruta tu día libre o espera nuevas reservas.
        </p>
      </motion.div>
    )
  }

  return (
    <div className={cn('relative', className)} data-testid="mi-dia-timeline">
      {/* Appointments List */}
      <div
        className="space-y-3.5 sm:space-y-4 py-2 sm:py-3"
        role="list"
        aria-label="Lista de citas de hoy"
      >
        <AnimatePresence mode="popLayout">
          {sortedAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.3 },
              }}
              role="listitem"
              data-testid={`appointment-${appointment.id}`}
            >
              <BarberAppointmentCard
                appointment={appointment}
                onCheckIn={onCheckIn}
                onComplete={onComplete}
                onNoShow={onNoShow}
                onFocusMode={onFocusMode}
                isLoading={loadingAppointmentId === appointment.id}
                acceptedPaymentMethods={acceptedPaymentMethods}
                nextAppointment={
                  sortedAppointments
                    .slice(index + 1)
                    .find(
                      (a) =>
                        a.status !== 'completed' &&
                        a.status !== 'cancelled' &&
                        a.status !== 'no_show'
                    ) ?? null
                }
                barberName={barberName}
                businessName={businessName}
                estimatedDelay={delayMap.get(appointment.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
