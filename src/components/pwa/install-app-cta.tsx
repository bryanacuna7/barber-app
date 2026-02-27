'use client'

import { useState } from 'react'
import { Download, Share, Plus, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { usePWAInstall } from '@/hooks/use-pwa-install'

interface InstallAppCtaProps {
  businessName: string
  variant?: 'subtle' | 'post-booking'
}

/**
 * Inline CTA for clients to install the PWA from the booking flow.
 *
 * - `subtle`: Low-key card shown on the booking info step (threshold: 1, namespace: booking_browse)
 * - `post-booking`: Prominent card shown after successful booking (threshold: 0, namespace: booking_success)
 *
 * Each variant uses a separate namespace so dismissing one doesn't affect the other.
 */
export function InstallAppCta({ businessName, variant = 'subtle' }: InstallAppCtaProps) {
  const isPostBooking = variant === 'post-booking'

  const { canPrompt, isIOS, isInstalled, promptInstall, dismiss } = usePWAInstall({
    threshold: isPostBooking ? 0 : 1,
    namespace: isPostBooking ? 'booking_success' : 'booking_browse',
  })

  const [showIOSModal, setShowIOSModal] = useState(false)

  if (!canPrompt || isInstalled) return null

  const handleInstall = () => {
    if (isIOS) {
      setShowIOSModal(true)
    } else {
      promptInstall()
    }
  }

  if (isPostBooking) {
    return (
      <>
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-sm">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                Guarda {businessName} en tu pantalla
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Accede a tus reservas y recibe recordatorios desde la pantalla de inicio
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={handleInstall} className="h-11 flex-1">
              <Download className="h-4 w-4 mr-1.5" />
              {isIOS ? 'Ver instrucciones' : 'Instalar app'}
            </Button>
            <Button variant="ghost" size="sm" onClick={dismiss} className="h-11">
              Ahora no
            </Button>
          </div>
        </div>

        <IOSInstructionsModal
          isOpen={showIOSModal}
          onClose={() => setShowIOSModal(false)}
          onDismiss={() => {
            setShowIOSModal(false)
            dismiss()
          }}
        />
      </>
    )
  }

  // Variant: subtle
  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Guarda {businessName} en tu pantalla
            </p>
            <p className="text-xs text-muted">Reserva más rápido la próxima vez</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleInstall} className="shrink-0">
            {isIOS ? 'Cómo' : 'Instalar'}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <IOSInstructionsModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        onDismiss={() => {
          setShowIOSModal(false)
          dismiss()
        }}
      />
    </>
  )
}

function IOSInstructionsModal({
  isOpen,
  onClose,
  onDismiss,
}: {
  isOpen: boolean
  onClose: () => void
  onDismiss: () => void
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar a pantalla de inicio"
      description="Sigue estos 3 pasos para instalar la app"
      size="sm"
    >
      <div className="space-y-5">
        <div className="space-y-4">
          <Step
            number={1}
            text="Toca el ícono de compartir"
            icon={<Share className="inline h-4 w-4 text-blue-500" />}
          />
          <Step
            number={2}
            text={
              <>
                Desplázate y selecciona <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
              </>
            }
            icon={<Plus className="inline h-4 w-4 text-blue-500" />}
          />
          <Step
            number={3}
            text={
              <>
                Toca <strong>&quot;Agregar&quot;</strong> para confirmar
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
          <Button variant="outline" onClick={onDismiss} className="w-full whitespace-nowrap">
            No mostrar de nuevo
          </Button>
          <Button variant="primary" onClick={onClose} className="w-full whitespace-nowrap">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Step({
  number,
  text,
  icon,
}: {
  number: number
  text: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600 dark:text-blue-400">
        {number}
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 pt-0.5">
        {text} {icon}
      </p>
    </div>
  )
}
