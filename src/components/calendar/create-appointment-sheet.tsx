'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Check, Search, Scissors } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
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

// Avatar helpers
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-indigo-500',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
}

function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
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
  const [clientSearch, setClientSearch] = useState('')

  const minAllowedDate = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
  const maxAllowedDate = useMemo(
    () => new Date(minAllowedDate.getFullYear(), 11, 31),
    [minAllowedDate]
  )

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [clients, clientSearch])

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
    if (activePickerField !== 'client') setClientSearch('')
  }, [activePickerField])

  useEffect(() => {
    if (!isOpen) {
      setActivePickerField(null)
      setIsTimePickerOpen(false)
    }
  }, [isOpen, setActivePickerField, setIsTimePickerOpen])

  useEffect(() => {
    if (!isOpen) return
    const selectedDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    )
    if (selectedDay < minAllowedDate) {
      onDateChange(minAllowedDate)
      return
    }
    if (selectedDay > maxAllowedDate) {
      onDateChange(maxAllowedDate)
    }
  }, [isOpen, maxAllowedDate, minAllowedDate, onDateChange, selectedDate])

  const pickerTitle =
    activePickerField === 'client'
      ? 'Seleccionar Cliente'
      : activePickerField === 'service'
        ? 'Seleccionar Servicio'
        : 'Miembro del equipo'

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Cita" contentFill={false}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Cliente</label>
            <button
              type="button"
              onClick={() => openPicker('client')}
              className={cn(
                'flex h-11 w-full items-center justify-between rounded-xl bg-zinc-100 px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none active:bg-zinc-200/70 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700/80',
                fieldErrors?.client_id ? 'ring-2 ring-red-400/60 dark:ring-red-500/50' : ''
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
                'flex h-11 w-full items-center justify-between rounded-xl bg-zinc-100 px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none active:bg-zinc-200/70 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700/80',
                fieldErrors?.service_id ? 'ring-2 ring-red-400/60 dark:ring-red-500/50' : ''
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
                      return service ? service.name : 'Selecciona un servicio'
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
                  'flex h-11 w-full items-center justify-between rounded-xl bg-zinc-100 px-4 text-left text-sm text-zinc-900 transition-colors focus:outline-none active:bg-zinc-200/70 dark:bg-zinc-800 dark:text-white dark:active:bg-zinc-700/80',
                  fieldErrors?.barber_id ? 'ring-2 ring-red-400/60 dark:ring-red-500/50' : ''
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
                minDate={minAllowedDate}
                maxDate={maxAllowedDate}
                pickerZIndex={90}
                className="h-11 w-full justify-start rounded-xl bg-zinc-100 px-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white"
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
                className="h-11 w-full justify-start rounded-xl bg-zinc-100 px-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white"
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
              className="w-full resize-none rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="mt-2 pt-1">
            {fieldErrors?.general && (
              <p className="mb-2 text-xs font-medium text-red-500">{fieldErrors.general}</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="h-11 w-full sm:w-auto text-muted"
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

      {/* Picker Sheet */}
      <Sheet
        open={isOpen && activePickerField !== null}
        zIndex={90}
        onOpenChange={(open) => {
          if (!open) setActivePickerField(null)
        }}
      >
        <SheetContent side="bottom" className="max-h-[82vh] !gap-0 !p-0 overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-base font-semibold text-foreground">{pickerTitle}</h2>

            {/* Search bar — clients only */}
            {activePickerField === 'client' && (
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/30"
                />
              </div>
            )}
          </div>

          {/* List */}
          <div className="mt-3 overflow-y-auto overscroll-contain px-2 pb-4 pb-safe [-webkit-overflow-scrolling:touch]">
            {/* Clients */}
            {activePickerField === 'client' && (
              <>
                {filteredClients.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted">
                    Sin resultados para &ldquo;{clientSearch}&rdquo;
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = createForm.client_id === client.id
                    return (
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
                        className={cn(
                          'flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
                            getAvatarColor(client.name)
                          )}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-foreground'
                            )}
                          >
                            {client.name}
                          </p>
                          {client.phone && (
                            <p className="text-xs text-muted truncate">{client.phone}</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </>
            )}

            {/* Services */}
            {activePickerField === 'service' &&
              services.map((service) => {
                const isSelected = createForm.service_id === service.id
                return (
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
                    className={cn(
                      'flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/10'
                        : 'hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        isSelected ? 'bg-blue-500' : 'bg-zinc-100 dark:bg-zinc-800'
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
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                        )}
                      >
                        {service.name}
                      </p>
                      <p className="text-xs text-muted">{formatDuration(service.duration)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          isSelected ? 'text-blue-500' : 'text-foreground'
                        )}
                      >
                        ₡{service.price.toLocaleString()}
                      </span>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}

            {/* Barbers */}
            {activePickerField === 'barber' &&
              barbers.map((barber) => {
                const isSelected = createForm.barber_id === barber.id
                return (
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
                    className={cn(
                      'flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/10'
                        : 'hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
                        getAvatarColor(barber.name)
                      )}
                    >
                      {getInitials(barber.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                        )}
                      >
                        {barber.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
