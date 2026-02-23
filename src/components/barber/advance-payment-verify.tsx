'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2, Smartphone, ImageOff } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdvancePaymentVerifyModalProps {
  appointmentId: string
  proofChannel: string
  basePrice?: number
  discountPct?: number
  finalPrice?: number
  isOpen: boolean
  onClose: () => void
  /** Called after a successful verify or reject action */
  onVerified: (action: 'verify' | 'reject') => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCRC(amount: number) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * AdvancePaymentVerifyModal
 *
 * Shown to the owner / barber to approve or reject a pending advance payment.
 *
 * Usage:
 * ```tsx
 * <AdvancePaymentVerifyModal
 *   appointmentId={appointment.id}
 *   proofChannel={appointment.proof_channel || 'whatsapp'}
 *   basePrice={appointment.base_price_snapshot}
 *   discountPct={appointment.discount_pct_snapshot}
 *   finalPrice={appointment.final_price_snapshot}
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onVerified={(action) => { setShowModal(false); refetch() }}
 * />
 * ```
 */
export function AdvancePaymentVerifyModal({
  appointmentId,
  proofChannel,
  basePrice,
  discountPct,
  finalPrice,
  isOpen,
  onClose,
  onVerified,
}: AdvancePaymentVerifyModalProps) {
  const toast = useToast()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isUploadChannel = proofChannel === 'upload'

  // Fetch signed URL when modal opens for upload channel
  useEffect(() => {
    if (!isOpen || !isUploadChannel) return

    setImageLoading(true)
    setImageError(false)
    setProofImageUrl(null)

    fetch(`/api/appointments/${appointmentId}/payment-proof`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener el comprobante')
        return res.json()
      })
      .then((data: { url: string }) => {
        setProofImageUrl(data.url)
      })
      .catch(() => {
        setImageError(true)
      })
      .finally(() => {
        setImageLoading(false)
      })
  }, [isOpen, isUploadChannel, appointmentId])

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  async function handleAction(action: 'verify' | 'reject') {
    if (action === 'verify') {
      setIsVerifying(true)
    } else {
      setIsRejecting(true)
    }

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || data?.error || 'Error al procesar el pago')
      }

      toast.success(
        action === 'verify' ? 'Pago verificado correctamente' : 'Pago rechazado correctamente'
      )
      onVerified(action)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(message)
    } finally {
      setIsVerifying(false)
      setIsRejecting(false)
    }
  }

  const anyLoading = isVerifying || isRejecting

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verificar Pago Anticipado"
      size="md"
      closeOnOverlayClick={!anyLoading}
    >
      <div className="space-y-5">
        {/* Channel indicator */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <Smartphone
            className="h-5 w-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Canal</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {isUploadChannel ? 'Comprobante subido en la app' : 'WhatsApp'}
            </p>
          </div>
        </div>

        {/* Proof image — upload channel only */}
        {isUploadChannel && (
          <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 min-h-[160px] flex items-center justify-center">
            {imageLoading && (
              <div
                className="flex flex-col items-center gap-2 py-8 text-muted"
                aria-label="Cargando comprobante"
              >
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                <span className="text-xs">Cargando comprobante...</span>
              </div>
            )}

            {!imageLoading && imageError && (
              <div className="flex flex-col items-center gap-2 py-8 text-muted">
                <ImageOff className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs">No se pudo cargar el comprobante</span>
              </div>
            )}

            {!imageLoading && proofImageUrl && (
              <img
                src={proofImageUrl}
                alt="Comprobante de pago"
                className="w-full h-auto max-h-64 object-contain"
              />
            )}
          </div>
        )}

        {/* WhatsApp instruction — whatsapp channel */}
        {!isUploadChannel && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
              El cliente envió su comprobante por WhatsApp. Verificá en tu WhatsApp que el monto
              coincida antes de confirmar.
            </p>
          </div>
        )}

        {/* Price breakdown */}
        {(basePrice != null || discountPct != null || finalPrice != null) && (
          <div className="space-y-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            {basePrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Precio original</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {formatCRC(basePrice)}
                </span>
              </div>
            )}
            {discountPct != null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Descuento</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  -{discountPct}%
                </span>
              </div>
            )}
            {finalPrice != null && (
              <>
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between text-sm">
                  <span className="font-semibold text-zinc-900 dark:text-white">Precio final</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCRC(finalPrice)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <ModalFooter className="flex-col sm:flex-row gap-3 pt-0 mt-0 border-none">
          <Button
            variant="danger"
            size="md"
            onClick={() => handleAction('reject')}
            isLoading={isRejecting}
            disabled={anyLoading}
            className="h-11 flex-1"
            aria-label="Rechazar pago anticipado"
          >
            {!isRejecting && <XCircle className="h-4 w-4" aria-hidden="true" />}
            Rechazar
          </Button>

          <Button
            variant="success"
            size="md"
            onClick={() => handleAction('verify')}
            isLoading={isVerifying}
            disabled={anyLoading}
            className="h-11 flex-1"
            aria-label="Verificar pago anticipado"
          >
            {!isVerifying && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            Verificar Pago
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}
