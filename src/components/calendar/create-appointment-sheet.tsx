'use client'

import { ChevronDown, Check, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { DatePickerTrigger } from '@/components/ui/ios-date-picker'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatCurrencyCompactMillions as _formatCurrencyCompactMillions } from '@/lib/utils'

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
  activePickerField,
  setActivePickerField,
  isTimePickerOpen,
  setIsTimePickerOpen,
}: CreateAppointmentSheetProps) {
  return (
    <>
      {/* CREATE APPOINTMENT MODAL (aligned with Nuevo Cliente contract) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Nueva Cita</h2>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 h-auto text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">Cliente</label>
                <button
                  type="button"
                  onClick={() => setActivePickerField('client')}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span
                    className={
                      createForm.client_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }
                  >
                    {createForm.client_id
                      ? clients.find((c) => c.id === createForm.client_id)?.name ||
                        'Selecciona un cliente'
                      : 'Selecciona un cliente'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              </div>

              {/* Servicio */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">Servicio</label>
                <button
                  type="button"
                  onClick={() => setActivePickerField('service')}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span
                    className={
                      createForm.service_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }
                  >
                    {createForm.service_id
                      ? (() => {
                          const s = services.find((service) => service.id === createForm.service_id)
                          return s
                            ? `${s.name} - ₡${s.price.toLocaleString()}`
                            : 'Selecciona un servicio'
                        })()
                      : 'Selecciona un servicio'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              </div>

              {/* Miembro del equipo - hidden for barbers (auto-assigned) */}
              {!isBarber && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">
                    Miembro del equipo
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePickerField('barber')}
                    className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <span
                      className={
                        createForm.barber_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                      }
                    >
                      {createForm.barber_id
                        ? barbers.find((b) => b.id === createForm.barber_id)?.name ||
                          'Selecciona un miembro del equipo'
                        : 'Selecciona un miembro del equipo'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                  </button>
                </div>
              )}

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">Fecha</label>
                  <DatePickerTrigger
                    value={selectedDate}
                    onChange={onDateChange}
                    label="Fecha"
                    className="h-[46px] w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">Hora</label>
                  <TimePickerTrigger
                    value={createForm.time || '09:00'}
                    onClick={() => setIsTimePickerOpen(true)}
                    className="h-[46px] w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">
                  Notas (opcional)
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la cita..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={onSubmit} isLoading={isPending} className="flex-1">
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Time Picker for Nueva Cita */}
      <IOSTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        value={createForm.time || '09:00'}
        onChange={(value) => setCreateForm({ ...createForm, time: value })}
        title="Hora de la cita"
      />

      {/* Picker Sheet for Client/Service/Barber selection */}
      <Sheet
        open={activePickerField !== null}
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
          <div className="mt-4 overflow-y-auto max-h-[calc(72vh-96px)] px-2 pb-4 pb-safe">
            {activePickerField === 'client' &&
              clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, client_id: client.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-base text-foreground">{client.name}</span>
                  {createForm.client_id === client.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            {activePickerField === 'service' &&
              services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, service_id: service.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <span className="text-base text-foreground">{service.name}</span>
                    <span className="text-sm text-muted ml-2">
                      ₡{service.price.toLocaleString()}
                    </span>
                  </div>
                  {createForm.service_id === service.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            {activePickerField === 'barber' &&
              barbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, barber_id: barber.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-base text-foreground">{barber.name}</span>
                  {createForm.barber_id === barber.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
