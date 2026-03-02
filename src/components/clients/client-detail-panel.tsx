'use client'

/**
 * ClientDetailPanel — Client detail content for the split panel.
 *
 * Extracted from ClientDetailModal, adapted for inline rendering
 * inside SplitPanel (no modal wrapper, no close button).
 */

import { Phone, Mail, MessageCircle, History, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientProfileErrorBoundary } from '@/components/error-boundaries'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import type { Client } from '@/types'

interface ClientDetailPanelProps {
  client: Client
  onWhatsApp: (phone: string) => void
}

export function ClientDetailPanel({ client, onWhatsApp }: ClientDetailPanelProps) {
  const segment = getClientSegment(client)
  const config = segmentConfig[segment]

  return (
    <div className="p-5">
      {/* Header: avatar + name + segment */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-xl font-bold text-zinc-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${config.color}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <ClientProfileErrorBoundary client={client} onReset={() => {}}>
        {/* Contact */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <Phone className="h-4 w-4 text-muted shrink-0" />
            <span className="text-sm text-foreground">{client.phone}</span>
            <Button
              variant="success"
              size="sm"
              onClick={() => onWhatsApp(client.phone)}
              className="ml-auto flex items-center gap-1.5 text-xs"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
          </div>
          {client.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
              <Mail className="h-4 w-4 text-muted shrink-0" />
              <span className="text-sm text-foreground truncate">{client.email}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <p className="text-xl font-bold text-foreground">{client.total_visits || 0}</p>
            <p className="text-xs text-muted">Visitas</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(Number(client.total_spent || 0))}
            </p>
            <p className="text-xs text-muted">Total gastado</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <p className="text-base font-bold text-foreground">
              {client.last_visit_at
                ? format(new Date(client.last_visit_at), 'd MMM', { locale: es })
                : '-'}
            </p>
            <p className="text-xs text-muted">Última visita</p>
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 mb-6">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Notas</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{client.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" className="flex-1">
            <History className="h-4 w-4 mr-1.5" />
            Historial
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-1.5" />
            Nueva Cita
          </Button>
        </div>
      </ClientProfileErrorBoundary>
    </div>
  )
}
