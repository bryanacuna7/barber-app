'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { BarberAppointmentCard } from './barber-appointment-card'
import type { TodayAppointment } from '@/types/custom'

interface MiDiaTimelineProps {
  appointments: TodayAppointment[]
  onCheckIn?: (appointmentId: string) => void
  onComplete?: (appointmentId: string, paymentMethod?: 'cash' | 'sinpe' | 'card') => void
  onNoShow?: (appointmentId: string) => void
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
 * Shows current time indicator and groups appointments
 */
export function MiDiaTimeline({
  appointments,
  onCheckIn,
  onComplete,
  onNoShow,
  loadingAppointmentId,
  acceptedPaymentMethods,
  barberName,
  businessName,
  className,
}: MiDiaTimelineProps) {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Calculate position for current time indicator (0-100%)
  const getCurrentTimePosition = () => {
    const startHour = 8 // 8 AM
    const endHour = 20 // 8 PM
    const totalMinutes = (endHour - startHour) * 60
    const currentMinutes = (currentHour - startHour) * 60 + currentMinute

    if (currentMinutes < 0) return 0
    if (currentMinutes > totalMinutes) return 100

    return (currentMinutes / totalMinutes) * 100
  }

  const formatCurrentTime = () => {
    return new Intl.DateTimeFormat('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now)
  }

  const isCurrentTimeVisible = currentHour >= 8 && currentHour < 20

  // Sort appointments by scheduled time
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  })

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
      {/* Timeline Line */}
      <div
        className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800"
        aria-hidden="true"
      />

      {/* Current Time Indicator */}
      {isCurrentTimeVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute left-0 z-10 flex items-center gap-2"
          style={{ top: `${getCurrentTimePosition()}%` }}
          aria-live="polite"
          aria-label={`Hora actual: ${formatCurrentTime()}`}
        >
          <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs font-semibold">{formatCurrentTime()}</span>
          </div>
          <div className="h-0.5 w-full bg-blue-500" aria-hidden="true" />
        </motion.div>
      )}

      {/* Appointments List */}
      <div className="space-y-4 pl-12 pr-4 py-4" role="list" aria-label="Lista de citas de hoy">
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
              {/* Timeline Dot */}
              <div
                className={cn(
                  'absolute left-3.5 w-3 h-3 rounded-full',
                  'border-2 border-white dark:border-zinc-900',
                  {
                    'bg-violet-500': appointment.status === 'pending',
                    'bg-blue-500': appointment.status === 'confirmed',
                    'bg-emerald-500': appointment.status === 'completed',
                    'bg-red-500': appointment.status === 'cancelled',
                    'bg-amber-500': appointment.status === 'no_show',
                  }
                )}
                aria-hidden="true"
              />

              <BarberAppointmentCard
                appointment={appointment}
                onCheckIn={onCheckIn}
                onComplete={onComplete}
                onNoShow={onNoShow}
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
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
