'use client'

import { useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { DatePickerTrigger } from '@/components/ui/ios-date-picker'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { cn } from '@/lib/utils/cn'

type CreateAppointmentErrorField = 'client_id' | 'service_id' | 'barber_id' | 'general'
type CreateAppointmentErrors = Partial<Record<CreateAppointmentErrorField, string>>

export interface CreateAppointmentSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  createForm: {
    client_id: string
    service_id: string
    barber_id: string
    time: string
    notes: string
  }
  setCreateForm: React.Dispatch<
    React.SetStateAction<{
      client_id: string
      service_id: string
      barber_id: string
      time: string
      notes: string
    }>
  >
  clients: Array<{ id: string; name: string; phone: string }>
  services: Array<{ id: string; name: string; duration: number; price: number }>
  barbers: Array<{ id: string; name: string }>
  formDate: string
  onDateChange: (date: Date) => void
  selectedDate: Date
  onSubmit: () => void
  isPending: boolean
  isBarber: boolean
  barberId: string | null
  defaultTime: string
  fieldErrors?: CreateAppointmentErrors
  onClearFieldError?: (field: CreateAppointmentErrorField) => void
  activePickerField: 'client' | 'service' | 'barber' | null
  setActivePickerField: (field: 'client' | 'service' | 'barber' | null) => void
  isTimePickerOpen: boolean
  setIsTimePickerOpen: (open: boolean) => void
}

export function CreateAppointmentSheet({
  isOpen,
  onOpenChange,
  createForm,
  setCreateForm,
  clients,
  services,
  barbers,
  onDateChange,
  selectedDate,
  onSubmit,
  isPending,
  isBarber,
  defaultTime,
  fieldErrors,
  onClearFieldError,
  activePickerField,
  setActivePickerField,
  isTimePickerOpen,
  setIsTimePickerOpen,
}: CreateAppointmentSheetProps) {
  const handleClose = () => {
    setActivePickerField(null)
    setIsTimePickerOpen(false)
    onOpenChange(false)
  }

  const openPicker = (field: 'client' | 'service' | 'barber') => {
    if (isMobileDevice()) haptics.selection()
    setActivePickerField(field)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onClearFieldError?.('general')
    onSubmit()
  }

  useEffect(() => {
    if (!isOpen) {
      setActivePickerField(null)
      setIsTimePickerOpen(false)
    }
  }, [isOpen, setActivePickerField, setIsTimePickerOpen])

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Cita" mobileFullHeight>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Cliente</label>
            <button
              type="button"
              onClick={() => openPicker('client')}
              className={cn(
                'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 active:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700',
                fieldErrors?.client_id
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/70'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500/20 dark:border-zinc-700'
              )}
            >
              <span
                className={createForm.client_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}
              >
                {createForm.client_id
                  ? clients.find((c) => c.id === createForm.client_id)?.name ||
                    'Selecciona un cliente'
                  : 'Selecciona un cliente'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>
            {fieldErrors?.client_id && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.client_id}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Servicio</label>
            <button
              type="button"
              onClick={() => openPicker('service')}
              className={cn(
                'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 active:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700',
                fieldErrors?.service_id
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/70'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500/20 dark:border-zinc-700'
              )}
            >
              <span
                className={
                  createForm.service_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                }
              >
                {createForm.service_id
                  ? (() => {
                      const service = services.find((item) => item.id === createForm.service_id)
                      return service
                        ? `${service.name} - ₡${service.price.toLocaleString()}`
                        : 'Selecciona un servicio'
                    })()
                  : 'Selecciona un servicio'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>
            {fieldErrors?.service_id && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.service_id}</p>
            )}
          </div>

          {!isBarber && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Miembro del equipo
              </label>
              <button
                type="button"
                onClick={() => openPicker('barber')}
                className={cn(
                  'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 active:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700',
                  fieldErrors?.barber_id
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/70'
                    : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500/20 dark:border-zinc-700'
                )}
              >
                <span
                  className={
                    createForm.barber_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                  }
                >
                  {createForm.barber_id
                    ? barbers.find((item) => item.id === createForm.barber_id)?.name ||
                      'Selecciona un miembro del equipo'
                    : 'Selecciona un miembro del equipo'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
              </button>
              {fieldErrors?.barber_id && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.barber_id}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Fecha</label>
              <DatePickerTrigger
                value={selectedDate}
                onChange={onDateChange}
                label="Fecha"
                pickerZIndex={90}
                className="h-11 w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Hora</label>
              <TimePickerTrigger
                value={createForm.time || defaultTime}
                onClick={() => {
                  if (isMobileDevice()) haptics.selection()
                  setIsTimePickerOpen(true)
                }}
                className="h-11 w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Notas (opcional)</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre la cita..."
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="sticky bottom-0 -mx-5 mt-2 border-t border-zinc-200/80 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/95 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
            {fieldErrors?.general && (
              <p className="mb-2 text-xs font-medium text-red-500">{fieldErrors.general}</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-11 w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending} className="h-11 w-full sm:w-auto">
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <IOSTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        value={createForm.time || defaultTime}
        onChange={(value) => setCreateForm((prev) => ({ ...prev, time: value }))}
        title="Hora de la cita"
        zIndex={90}
      />

      <Sheet
        open={isOpen && activePickerField !== null}
        zIndex={90}
        onOpenChange={(open) => {
          if (!open) setActivePickerField(null)
        }}
      >
        <SheetContent
          side="bottom"
          centered
          className="w-[min(42rem,calc(100%-1rem))] max-h-[72vh] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 pb-safe md:max-h-[70vh]"
        >
          <SheetHeader>
            <SheetTitle className="text-foreground text-lg font-semibold">
              {activePickerField === 'client' && 'Seleccionar Cliente'}
              {activePickerField === 'service' && 'Seleccionar Servicio'}
              {activePickerField === 'barber' && 'Seleccionar Miembro del equipo'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 max-h-[calc(72vh-96px)] overflow-y-auto px-2 pb-4 pb-safe">
            {activePickerField === 'client' &&
              clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({ ...prev, client_id: client.id }))
                    if (isMobileDevice()) haptics.selection()
                    onClearFieldError?.('client_id')
                    onClearFieldError?.('general')
                    setActivePickerField(null)
                  }}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
                >
                  <span className="text-base text-foreground">{client.name}</span>
                  {createForm.client_id === client.id && (
                    <Check className="h-5 w-5 shrink-0 text-blue-500" />
                  )}
                </button>
              ))}

            {activePickerField === 'service' &&
              services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({ ...prev, service_id: service.id }))
                    if (isMobileDevice()) haptics.selection()
                    onClearFieldError?.('service_id')
                    onClearFieldError?.('general')
                    setActivePickerField(null)
                  }}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
                >
                  <div>
                    <span className="text-base text-foreground">{service.name}</span>
                    <span className="ml-2 text-sm text-muted">
                      ₡{service.price.toLocaleString()}
                    </span>
                  </div>
                  {createForm.service_id === service.id && (
                    <Check className="h-5 w-5 shrink-0 text-blue-500" />
                  )}
                </button>
              ))}

            {activePickerField === 'barber' &&
              barbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({ ...prev, barber_id: barber.id }))
                    if (isMobileDevice()) haptics.selection()
                    onClearFieldError?.('barber_id')
                    onClearFieldError?.('general')
                    setActivePickerField(null)
                  }}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
                >
                  <span className="text-base text-foreground">{barber.name}</span>
                  {createForm.barber_id === barber.id && (
                    <Check className="h-5 w-5 shrink-0 text-blue-500" />
                  )}
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
