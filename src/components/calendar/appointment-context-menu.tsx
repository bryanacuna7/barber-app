'use client'

/**
 * AppointmentContextMenu
 *
 * iOS-style action menu triggered by long-press on an appointment card.
 * Renders in a portal above everything else. Features:
 *  - Spring-animated scale + fade entry
 *  - Staggered action row reveal
 *  - Frosted glass card (backdrop-blur)
 *  - Haptic feedback on each action
 *  - Dismiss via backdrop tap
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Pencil, X, Phone } from 'lucide-react'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

export interface ContextMenuAppointment {
  id: string
  clientName: string
  serviceName: string
  /** Formatted time string e.g. "10:30 AM" */
  timeLabel: string
  clientPhone?: string | null
  status: string
}

interface AppointmentContextMenuProps {
  isOpen: boolean
  onClose: () => void
  appointment: ContextMenuAppointment | null
  onComplete: (id: string) => void
  onEdit: (id: string) => void
  onCancel: (id: string) => void
}

export function AppointmentContextMenu({
  isOpen,
  onClose,
  appointment,
  onComplete,
  onEdit,
  onCancel,
}: AppointmentContextMenuProps) {
  // Lock scroll while menu is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (typeof window === 'undefined' || !appointment) return null

  const canAct = appointment.status === 'pending' || appointment.status === 'confirmed'

  type Action = {
    icon: React.ComponentType<{ className?: string }>
    label: string
    description: string
    textColor: string
    bgColor: string
    onClick: () => void
    destructive?: boolean
  }

  const actions: Action[] = [
    ...(canAct
      ? [
          {
            icon: CheckCircle2,
            label: 'Completar',
            description: 'Marcar como terminada',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
            onClick: () => {
              if (isMobileDevice()) haptics.success()
              onComplete(appointment.id)
              onClose()
            },
          },
        ]
      : []),
    {
      icon: Pencil,
      label: 'Ver detalle',
      description: 'Abrir y editar',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      onClick: () => {
        if (isMobileDevice()) haptics.tap()
        onEdit(appointment.id)
        onClose()
      },
    },
    ...(appointment.clientPhone
      ? [
          {
            icon: Phone,
            label: 'Llamar cliente',
            description: appointment.clientPhone,
            textColor: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-50 dark:bg-violet-950/40',
            onClick: () => {
              if (isMobileDevice()) haptics.tap()
              window.location.href = `tel:${appointment.clientPhone}`
              onClose()
            },
          },
        ]
      : []),
    ...(canAct
      ? [
          {
            icon: X,
            label: 'Cancelar cita',
            description: 'Esta acción no se puede deshacer',
            textColor: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950/40',
            destructive: true,
            onClick: () => {
              if (isMobileDevice()) haptics.warning()
              onCancel(appointment.id)
              onClose()
            },
          },
        ]
      : []),
  ]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Menu panel — positioned above the bottom nav */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.65 }}
            className="fixed bottom-[88px] left-4 right-4 z-[81] mx-auto max-w-sm"
          >
            {/* Preview card */}
            <div className="mb-2 rounded-2xl border border-zinc-200/60 bg-white/92 px-4 py-3.5 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/92">
              <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                {appointment.clientName}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">
                {appointment.serviceName} · {appointment.timeLabel}
              </p>
            </div>

            {/* Actions list */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/92 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/92 divide-y divide-zinc-100/70 dark:divide-zinc-800/70">
              {actions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.045, type: 'spring', stiffness: 380, damping: 28 }}
                  onClick={action.onClick}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/60"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${action.bgColor}`}
                  >
                    <action.icon className={`h-[18px] w-[18px] ${action.textColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[14px] font-semibold leading-tight ${
                        action.destructive ? action.textColor : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {action.label}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
