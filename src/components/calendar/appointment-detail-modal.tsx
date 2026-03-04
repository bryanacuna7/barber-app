'use client'

import { useState } from 'react'
import { X, Clock, Scissors, Phone, MessageSquare } from 'lucide-react'
import { format, parseISO, addMinutes } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  confirmed: {
    label: 'Confirmada',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  completed: {
    label: 'Completada',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  },
  in_progress: {
    label: 'En curso',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  },
}

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
  const [cancelling, setCancelling] = useState(false)

  const apt = selectedId ? appointments.find((a) => a.id === selectedId) : null
  const isOpen = !!apt

  const handleCancel = async () => {
    if (!apt) return
    setCancelling(true)
    try {
      await onStatusChange(apt.id, 'cancelled')
      onClose()
    } finally {
      setCancelling(false)
    }
  }

  const statusInfo = apt ? (STATUS_MAP[apt.status] ?? STATUS_MAP.pending) : STATUS_MAP.pending
  const duration = apt?.duration_minutes || apt?.service?.duration_minutes || 30
  const scheduledAt = apt ? parseISO(apt.scheduled_at) : new Date()
  const endTime = addMinutes(scheduledAt, duration)
  const price = apt?.price ?? apt?.service?.price ?? 0
  const canCancel = apt?.status === 'pending' || apt?.status === 'confirmed'

  // Mobile: bottom sheet
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        className="!gap-0 !p-0 max-h-[85vh] overflow-hidden flex flex-col"
      >
        {apt && (
          <>
            {/* Drag handle */}
            <div className="flex-shrink-0 pt-2 pb-1">
              <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            {/* Header: client name + status + close */}
            <div className="flex items-start justify-between px-5 pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {apt.client?.name || 'Cliente'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold leading-none ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                  {apt.client?.phone && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {apt.client.phone}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors active:scale-95 hover:text-zinc-200 focus:outline-none flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] space-y-3">
              {/* Info rows — compact, no cards */}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-foreground font-medium">
                  {format(scheduledAt, 'h:mm a')} – {format(endTime, 'h:mm a')}
                </span>
                <span className="text-muted">({duration} min)</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Scissors className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="text-foreground font-medium">
                  {apt.service?.name || 'Sin servicio'}
                </span>
                <span className="ml-auto text-foreground font-semibold tabular-nums">
                  ₡{price.toLocaleString()}
                </span>
              </div>

              {/* Notes */}
              {(apt.client_notes || apt.internal_notes) && (
                <div className="pt-1 space-y-2">
                  {apt.client_notes && (
                    <div className="flex items-start gap-3 text-sm">
                      <MessageSquare className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                      <p className="text-muted">{apt.client_notes}</p>
                    </div>
                  )}
                  {apt.internal_notes && (
                    <div className="flex items-start gap-3 text-sm">
                      <MessageSquare className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                      <p className="text-muted italic">{apt.internal_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {canCancel && (
                <div className="pt-2">
                  <Button
                    variant="danger"
                    onClick={handleCancel}
                    isLoading={cancelling}
                    className="w-full h-11"
                  >
                    Cancelar cita
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
