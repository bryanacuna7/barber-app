'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Phone, Mail, Zap } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { animations } from '@/lib/design-system'

interface AppointmentDetailModalProps {
  selectedId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[]
  onClose: () => void
  onStatusChange: (id: string, status: 'cancelled') => Promise<void>
}

export function AppointmentDetailModal({
  selectedId,
  appointments,
  onClose,
  onStatusChange,
}: AppointmentDetailModalProps) {
  return (
    <AnimatePresence>
      {selectedId &&
        (() => {
          const apt = appointments.find((a) => a.id === selectedId)
          if (!apt) return null
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animations.spring.default}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={onClose}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={animations.spring.sheet}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {apt.client?.name || 'Cliente'}
                  </h2>
                  <div className="flex items-center gap-2 text-muted">
                    <Phone className="w-4 h-4" />
                    <span>{apt.client?.phone || 'Sin teléfono'}</span>
                  </div>
                  {apt.client?.email && (
                    <div className="flex items-center gap-2 text-muted mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{apt.client.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-muted">Horario</div>
                      <div className="font-medium text-foreground">
                        {format(parseISO(apt.scheduled_at), 'h:mm a')} (
                        {apt.service?.duration_minutes || 30} min)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                    <Zap className="w-5 h-5 text-violet-500" />
                    <div>
                      <div className="text-xs text-muted">Servicio</div>
                      <div className="font-medium text-foreground">
                        {apt.service?.name || 'Sin servicio'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <div className="text-xs text-muted">Precio</div>
                    <div className="text-2xl font-bold text-amber-500 dark:text-amber-500">
                      ₡{apt.service?.price || 0}
                    </div>
                  </div>

                  {apt.client_notes && (
                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div className="text-xs text-blue-500 mb-1">💬 Notas del cliente</div>
                      <div className="text-sm text-foreground">{apt.client_notes}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <Button
                      variant="danger"
                      onClick={async () => {
                        await onStatusChange(apt.id, 'cancelled')
                        onClose()
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button variant="secondary" onClick={onClose} className="px-6">
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
    </AnimatePresence>
  )
}
