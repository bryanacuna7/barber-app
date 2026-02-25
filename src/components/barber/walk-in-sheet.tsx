'use client'

import { useState } from 'react'
import { ChevronLeft, Clock, DollarSign, Loader2, Scissors, UserPlus } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/queries/useServices'
import { useCreateWalkIn } from '@/hooks/queries/useAppointments'
import type { TodayAppointment } from '@/types/custom'
import { toast } from 'sonner'

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

  const selectedCheckmark = (
    <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
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
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isCreating) {
          onOpenChange(v)
          if (!v) reset()
        }
      }}
    >
      <SheetContent
        side="bottom"
        centered
        className="w-[calc(100%-1.25rem)] max-w-sm sm:max-w-md p-0 gap-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_22px_64px_rgba(15,23,42,0.26)]"
      >
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            {step === 'service' && needsBarberStep && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBarberId(null)
                  setSelectedServiceId(null)
                }}
                className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Volver a seleccionar barbero"
              >
                <ChevronLeft className="h-5 w-5 text-muted" />
              </button>
            )}
            <UserPlus className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Walk-in
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
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
                  className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900 px-4 py-3.5 text-left transition-colors hover:bg-white hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600"
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
                  <span className="text-base font-semibold text-zinc-900 dark:text-white">
                    {barber.name}
                  </span>
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
                <p className="text-center text-sm text-zinc-500 py-8">No hay servicios activos</p>
              ) : (
                <div className="space-y-2">
                  {activeServices.map((service) => {
                    const isSelected = selectedServiceId === service.id
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedServiceId(service.id)}
                        disabled={isCreating}
                        className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/30'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900 hover:bg-white hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-base font-semibold ${isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-900 dark:text-white'}`}
                          >
                            {service.name}
                          </span>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                              <Clock className="h-3.5 w-3.5" />
                              {service.duration} min
                            </span>
                            <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                              <DollarSign className="h-3.5 w-3.5" />
                              {service.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {isSelected && selectedCheckmark}
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

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="mt-3 w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
