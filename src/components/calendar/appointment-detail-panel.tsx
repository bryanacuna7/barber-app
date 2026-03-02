'use client'

/**
 * AppointmentDetailPanel — Appointment detail content for the split panel.
 *
 * Extracted from AppointmentDetailModal, adapted for inline rendering
 * inside SplitPanel (no modal wrapper, no close button).
 */

import { Clock, Phone, Mail, Zap } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface AppointmentDetailPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointment: any
  onStatusChange: (id: string, status: 'cancelled') => Promise<void>
  onClose: () => void
}

export function AppointmentDetailPanel({
  appointment: apt,
  onStatusChange,
  onClose,
}: AppointmentDetailPanelProps) {
  if (!apt) return null

  return (
    <div className="p-5">
      {/* Client header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-2">{apt.client?.name || 'Cliente'}</h2>
        <div className="flex items-center gap-2 text-muted text-sm">
          <Phone className="w-4 h-4" />
          <span>{apt.client?.phone || 'Sin teléfono'}</span>
        </div>
        {apt.client?.email && (
          <div className="flex items-center gap-2 text-muted text-sm mt-1">
            <Mail className="w-4 h-4" />
            <span>{apt.client.email}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-6">
        <div className="flex items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <Clock className="w-5 h-5 text-blue-500 shrink-0" />
          <div>
            <div className="text-xs text-muted">Horario</div>
            <div className="font-medium text-sm text-foreground">
              {format(parseISO(apt.scheduled_at), 'h:mm a')} ({apt.service?.duration_minutes || 30}{' '}
              min)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <Zap className="w-5 h-5 text-violet-500 shrink-0" />
          <div>
            <div className="text-xs text-muted">Servicio</div>
            <div className="font-medium text-sm text-foreground">
              {apt.service?.name || 'Sin servicio'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
          <div className="text-xs text-muted">Precio</div>
          <div className="text-xl font-bold text-amber-500">
            {formatCurrency(apt.service?.price || 0)}
          </div>
        </div>

        {apt.client_notes && (
          <div className="p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <div className="text-xs text-blue-500 mb-1">Notas del cliente</div>
            <div className="text-sm text-foreground">{apt.client_notes}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        {(apt.status === 'pending' || apt.status === 'confirmed') && (
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await onStatusChange(apt.id, 'cancelled')
              onClose()
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onClose} className="px-6">
          Cerrar
        </Button>
      </div>
    </div>
  )
}
