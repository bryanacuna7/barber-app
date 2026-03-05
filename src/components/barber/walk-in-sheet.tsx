'use client'

import { useState } from 'react'
import { ChevronLeft, Clock, Loader2, Scissors, UserPlus, X } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Modal } from '@/components/ui/modal'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/queries/useServices'
import { useCreateWalkIn } from '@/hooks/queries/useAppointments'
import type { TodayAppointment } from '@/types/custom'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

interface BarberOption {
  id: string
  name: string
  photo_url?: string | null
}

interface WalkInSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fixed barber ID (barber flow). Omit when using `barbers` for owner flow. */
  barberId?: string
  businessId: string
  /** When provided, shows barber selector as step 1 (owner flow). */
  barbers?: BarberOption[]
  onCreated?: (appointment: TodayAppointment, mode: 'queue' | 'start_now') => void
}

/**
 * Bottom sheet for quick walk-in creation.
 *
 * Barber flow (barberId fixed): Service → Queue/Start Now
 * Owner flow (barbers[] provided): Barber → Service → Queue/Start Now
 */
export function WalkInSheet({
  open,
  onOpenChange,
  barberId: fixedBarberId,
  businessId,
  barbers,
  onCreated,
}: WalkInSheetProps) {
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const { data: services, isLoading: servicesLoading } = useServices(businessId)
  const createWalkIn = useCreateWalkIn()

  const needsBarberStep = !fixedBarberId && barbers && barbers.length > 0
  const effectiveBarberId = fixedBarberId || selectedBarberId
  const step: 'barber' | 'service' = needsBarberStep && !selectedBarberId ? 'barber' : 'service'

  const activeServices = (services || []).filter((s) => s.isActive)

  const reset = () => {
    setSelectedBarberId(null)
    setSelectedServiceId(null)
  }

  const handleClose = () => {
    if (isCreating) return
    onOpenChange(false)
  }

  const handleCreate = async (mode: 'queue' | 'start_now') => {
    if (!selectedServiceId || !effectiveBarberId) {
      toast.error('Selecciona un servicio')
      return
    }

    try {
      const result = await createWalkIn.mutateAsync({
        service_id: selectedServiceId,
        barber_id: effectiveBarberId,
        mode,
      })

      const label = mode === 'start_now' ? 'Walk-in iniciado' : 'Walk-in agregado'
      toast.success(label)
      reset()
      onOpenChange(false)
      onCreated?.(result, mode)
    } catch (err: any) {
      toast.error(err.message || 'Error al crear walk-in')
    }
  }

  const isCreating = createWalkIn.isPending
  const isMobile = useIsMobile(1024)

  const handleOpenChange = (v: boolean) => {
    if (!isCreating) {
      onOpenChange(v)
      if (!v) reset()
    }
  }

  const walkinBody = (
    <>
      {/* Mobile-only header (desktop uses Modal title) */}
      {isMobile && (
        <>
          <div className="flex-shrink-0 pt-2 pb-1">
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3">
            <div className="flex items-center gap-2">
              {step === 'service' && needsBarberStep && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBarberId(null)
                    setSelectedServiceId(null)
                  }}
                  className="flex items-center justify-center w-8 h-8 -ml-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Volver a seleccionar barbero"
                >
                  <ChevronLeft className="h-5 w-5 text-muted" />
                </button>
              )}
              <UserPlus className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Walk-in</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors active:scale-95 hover:text-zinc-200 focus:outline-none disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Desktop-only back button for barber step */}
      {!isMobile && step === 'service' && needsBarberStep && (
        <button
          type="button"
          onClick={() => {
            setSelectedBarberId(null)
            setSelectedServiceId(null)
          }}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Cambiar barbero
        </button>
      )}

      {/* Scrollable content */}
      <div
        className={
          isMobile
            ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] [-webkit-overflow-scrolling:touch]'
            : ''
        }
      >
        <p className="text-sm text-muted mb-4">
          {step === 'barber'
            ? 'Selecciona el miembro del equipo'
            : 'Selecciona el servicio para el cliente'}
        </p>

        {/* Step 1: Barber selector (owner flow only) */}
        {step === 'barber' && barbers && (
          <div className="space-y-2">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => setSelectedBarberId(barber.id)}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70"
              >
                {barber.photo_url ? (
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                    <Scissors className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </span>
                )}
                <span className="text-sm font-medium text-foreground">{barber.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Service grid */}
        {step === 'service' && (
          <>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
            ) : activeServices.length === 0 ? (
              <p className="text-center text-sm text-muted py-8">No hay servicios activos</p>
            ) : (
              <div className="space-y-1">
                {activeServices.map((service) => {
                  const isSelected = selectedServiceId === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      disabled={isCreating}
                      className={cn(
                        'flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-500/10'
                          : 'hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          isSelected ? 'bg-amber-500' : 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        <Scissors
                          className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-foreground'
                          )}
                        >
                          {service.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </span>
                          <span className="text-xs text-muted">
                            {formatCurrency(Number(service.price))}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500">
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 space-y-2.5">
              <Button
                className="w-full h-11"
                variant="primary"
                disabled={!selectedServiceId || isCreating}
                onClick={() => handleCreate('queue')}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Agregar a cola
              </Button>
              <Button
                className="w-full h-11"
                variant="outline"
                disabled={!selectedServiceId || isCreating}
                onClick={() => handleCreate('start_now')}
              >
                Iniciar ahora
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )

  // Desktop: centered Modal
  if (!isMobile) {
    return (
      <Modal isOpen={open} onClose={handleClose} title="Walk-in" size="sm" contentFill={false}>
        {walkinBody}
      </Modal>
    )
  }

  // Mobile: bottom Sheet
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="!gap-0 !p-0 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {walkinBody}
      </SheetContent>
    </Sheet>
  )
}
