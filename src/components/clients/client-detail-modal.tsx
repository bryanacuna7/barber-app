'use client'

import { X, Phone, Mail, MessageCircle, History, Calendar } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ClientProfileErrorBoundary } from '@/components/error-boundaries'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import type { Client } from '@/types'

interface ClientDetailModalProps {
  client: Client | null
  onClose: () => void
  onWhatsApp: (phone: string) => void
}

export function ClientDetailModal({ client, onClose, onWhatsApp }: ClientDetailModalProps) {
  return (
    <Modal isOpen={!!client} onClose={onClose} size="lg" showCloseButton={false}>
      {client && (
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-2xl font-bold text-zinc-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${segmentConfig[getClientSegment(client)].color}`}
                >
                  {segmentConfig[getClientSegment(client)].label}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-lg p-2 text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 h-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Client Profile Content - Wrapped with specialized error boundary */}
          <ClientProfileErrorBoundary client={client} onReset={onClose}>
            {/* Contacto */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Phone className="h-5 w-5 text-muted" />
                <span className="text-foreground">{client.phone}</span>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onWhatsApp(client.phone)}
                  className="ml-auto flex items-center gap-1.5"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
              {client.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Mail className="h-5 w-5 text-muted" />
                  <span className="text-foreground">{client.email}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <p className="text-2xl font-bold text-foreground">{client.total_visits || 0}</p>
                <p className="text-xs text-muted">Visitas</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(client.total_spent || 0))}
                </p>
                <p className="text-xs text-muted">Total gastado</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <p className="text-lg font-bold text-foreground">
                  {client.last_visit_at
                    ? format(new Date(client.last_visit_at), 'd MMM', {
                        locale: es,
                      })
                    : '-'}
                </p>
                <p className="text-xs text-muted">Ultima visita</p>
              </div>
            </div>

            {/* Notas */}
            {client.notes && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 mb-6">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Notas</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{client.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                <History className="h-4 w-4 mr-2" />
                Ver Historial
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </ClientProfileErrorBoundary>
        </div>
      )}
    </Modal>
  )
}
