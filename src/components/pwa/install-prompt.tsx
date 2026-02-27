'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { usePWAInstall } from '@/hooks/use-pwa-install'

/**
 * Contextual PWA install prompt.
 * - Android/Chrome: shows install card → triggers native prompt
 * - iOS: shows instructions card → opens modal with 3-step guide
 * - Respects visit threshold and dismissal preference
 */
export function InstallPrompt() {
  const { canPrompt, isIOS, promptInstall, dismiss } = usePWAInstall()
  const [showIOSModal, setShowIOSModal] = useState(false)

  if (!canPrompt) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-[calc(env(safe-area-inset-top,0px)+16px)] left-4 right-4 z-50 lg:top-auto lg:left-auto lg:right-6 lg:bottom-6 lg:w-[360px]"
        >
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {isIOS ? 'Agrega a tu pantalla de inicio' : 'Instalar BarberApp'}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Accede más rápido desde tu pantalla de inicio
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Ahora no
              </Button>
              {isIOS ? (
                <Button variant="primary" size="sm" onClick={() => setShowIOSModal(true)}>
                  Ver instrucciones
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={promptInstall}>
                  Instalar
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <Modal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
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
            <Button
              variant="outline"
              onClick={() => {
                setShowIOSModal(false)
                dismiss()
              }}
              className="w-full whitespace-nowrap"
            >
              No mostrar de nuevo
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowIOSModal(false)}
              className="w-full whitespace-nowrap"
            >
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </>
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

export default InstallPrompt
