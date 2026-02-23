'use client'

/**
 * CancelRescheduleActions
 *
 * Shows "Cancelar cita" and optionally "Reagendar" buttons on the public
 * tracking page (/track/[token]).
 *
 * - Renders nothing when policy.enabled is false
 * - Disables buttons when cancellation deadline has already passed
 * - Confirms cancel via Modal before making the API call
 * - Redirects to booking page for reschedule (v2 picker enhancement pending)
 *
 * Usage:
 * <CancelRescheduleActions
 *   token={token}
 *   scheduledAt={data.appointmentDetails.scheduledAt}
 *   policy={cancelPolicy}
 *   serviceName={data.appointmentDetails.serviceName}
 *   barberName={data.barberName}
 *   businessSlug={data.businessSlug}
 *   onCancelled={() => setTrackingState('cancelled')}
 *   onRescheduled={(newToken) => router.push('/track/' + newToken)}
 * />
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal, ModalFooter } from '@/components/ui/modal'
import type { CancellationPolicy } from '@/types'

// =====================================================
// Props
// =====================================================

export interface CancelRescheduleActionsProps {
  token: string
  scheduledAt: string
  policy: CancellationPolicy
  serviceName: string
  barberName: string
  businessSlug: string
  onCancelled?: () => void
  onRescheduled?: (newTrackingToken: string) => void
}

// =====================================================
// Component
// =====================================================

export function CancelRescheduleActions({
  token,
  scheduledAt,
  policy,
  serviceName,
  barberName,
  businessSlug,
  onCancelled,
  onRescheduled: _onRescheduled,
}: CancelRescheduleActionsProps) {
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Policy not enabled — render nothing
  if (!policy.enabled) return null

  // Deadline check
  const deadlineMs = policy.deadline_hours * 60 * 60 * 1000
  const deadline = new Date(new Date(scheduledAt).getTime() - deadlineMs)
  const isPastDeadline = new Date() > deadline

  // ---- handlers ----

  function handleOpenCancelModal() {
    setCancelError(null)
    setShowCancelModal(true)
  }

  function handleCloseModal() {
    if (cancelLoading) return
    setShowCancelModal(false)
  }

  async function handleConfirmCancel() {
    setCancelError(null)
    setCancelLoading(true)

    try {
      const res = await fetch('/api/public/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCancelError(data?.error ?? 'No se pudo cancelar la cita. Intentá de nuevo.')
        return
      }

      setCancelSuccess(true)
      setShowCancelModal(false)
      onCancelled?.()
    } catch {
      setCancelError('Error de conexión. Verificá tu internet e intentá de nuevo.')
    } finally {
      setCancelLoading(false)
    }
  }

  function handleReschedule() {
    // v2: will open inline reschedule picker with new_scheduled_at selection
    // For now, redirect to the booking page so the client can pick a new slot
    window.location.href = `/reservar/${businessSlug}?reschedule=${token}`
  }

  // ---- success state ----
  if (cancelSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-4 flex items-center gap-3"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Tu cita ha sido cancelada exitosamente.
        </p>
      </motion.div>
    )
  }

  // ---- main render ----
  return (
    <>
      <div className="space-y-3">
        {/* Section header */}
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Opciones</p>

        {/* Action buttons */}
        <div className="flex gap-3">
          {policy.allow_reschedule && (
            <Button
              variant="outline"
              className="h-11 flex-1 gap-2"
              disabled={isPastDeadline}
              onClick={handleReschedule}
              aria-label="Reagendar cita"
            >
              <CalendarClock className="h-4 w-4" />
              Reagendar
            </Button>
          )}

          <Button
            variant="danger"
            className={`h-11 gap-2 ${policy.allow_reschedule ? 'flex-1' : 'w-full'}`}
            disabled={isPastDeadline}
            onClick={handleOpenCancelModal}
            aria-label="Cancelar cita"
          >
            <X className="h-4 w-4" />
            Cancelar cita
          </Button>
        </div>

        {/* Deadline helper text */}
        <AnimatePresence>
          {isPastDeadline ? (
            <motion.p
              key="past-deadline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-muted"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Ya no es posible cancelar (límite: {policy.deadline_hours}h antes)
            </motion.p>
          ) : (
            <motion.p
              key="deadline-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted"
            >
              Podés cancelar hasta {policy.deadline_hours}h antes de tu cita
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseModal}
        title="Cancelar cita"
        size="sm"
        closeOnOverlayClick={!cancelLoading}
        showCloseButton={!cancelLoading}
      >
        <div className="space-y-5">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            ¿Estás seguro que querés cancelar tu cita de{' '}
            <span className="font-semibold text-zinc-900 dark:text-white">{serviceName}</span> con{' '}
            <span className="font-semibold text-zinc-900 dark:text-white">{barberName}</span>? Esta
            acción no se puede deshacer.
          </p>

          {/* Inline error */}
          <AnimatePresence>
            {cancelError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 px-3 py-2.5"
              >
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{cancelError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <ModalFooter className="pt-0 mt-0 border-t-0">
            <Button
              variant="outline"
              className="h-11"
              onClick={handleCloseModal}
              disabled={cancelLoading}
            >
              No, mantener cita
            </Button>
            <Button
              variant="danger"
              className="h-11"
              onClick={handleConfirmCancel}
              isLoading={cancelLoading}
            >
              Sí, cancelar
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  )
}
