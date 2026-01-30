'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, User, Scissors, FileText } from 'lucide-react'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import type { Appointment, Service, Client } from '@/types'

interface AppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AppointmentFormData) => Promise<void>
  appointment?: Appointment | null
  services: Service[]
  clients: Client[]
  selectedDate?: Date
}

export interface AppointmentFormData {
  client_id: string
  service_id: string
  scheduled_at: string
  client_notes?: string
  internal_notes?: string
}

const timeSlots = Array.from({ length: 24 }, (_, hour) => {
  return ['00', '30'].map((minutes) => {
    const time = `${hour.toString().padStart(2, '0')}:${minutes}`
    return { value: time, label: time }
  })
})
  .flat()
  .filter((slot) => {
    const hour = parseInt(slot.value.split(':')[0])
    return hour >= 8 && hour < 20
  })

export function AppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  services,
  clients,
  selectedDate,
}: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AppointmentFormData>({
    client_id: '',
    service_id: '',
    scheduled_at: '',
    client_notes: '',
    internal_notes: '',
  })

  const [date, setDate] = useState(format(selectedDate || new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState('09:00')

  // Initialize form when editing
  useEffect(() => {
    if (appointment) {
      const apptDate = new Date(appointment.scheduled_at)
      setFormData({
        client_id: appointment.client_id || '',
        service_id: appointment.service_id || '',
        scheduled_at: appointment.scheduled_at,
        client_notes: appointment.client_notes || '',
        internal_notes: appointment.internal_notes || '',
      })
      setDate(format(apptDate, 'yyyy-MM-dd'))
      setTime(format(apptDate, 'HH:mm'))
    } else {
      // Reset form for new appointment
      setFormData({
        client_id: '',
        service_id: services[0]?.id || '',
        scheduled_at: '',
        client_notes: '',
        internal_notes: '',
      })
      setDate(format(selectedDate || new Date(), 'yyyy-MM-dd'))
      setTime('09:00')
    }
  }, [appointment, selectedDate, services])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.client_id) {
      setError('Selecciona un cliente')
      return
    }
    if (!formData.service_id) {
      setError('Selecciona un servicio')
      return
    }

    setIsSubmitting(true)

    try {
      const scheduled_at = new Date(`${date}T${time}:00`).toISOString()
      await onSubmit({
        ...formData,
        scheduled_at,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cita')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedService = services.find((s) => s.id === formData.service_id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Editar Cita' : 'Nueva Cita'}
      description={
        appointment ? 'Modifica los detalles de la cita' : 'Programa una nueva cita para un cliente'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Client Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <User className="w-4 h-4" />
            Cliente
          </label>
          <Select
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar cliente...' },
              ...clients.map((c) => ({ value: c.id, label: `${c.name} - ${c.phone}` })),
            ]}
          />
        </div>

        {/* Service Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Scissors className="w-4 h-4" />
            Servicio
          </label>
          <Select
            value={formData.service_id}
            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
            options={services.map((s) => ({
              value: s.id,
              label: `${s.name} - ${s.duration_minutes} min - ₡${s.price}`,
            }))}
          />
          {selectedService && (
            <p className="text-sm text-zinc-500">
              Duración: {selectedService.duration_minutes} minutos
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4" />
              Fecha
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Clock className="w-4 h-4" />
              Hora
            </label>
            <Select value={time} onChange={(e) => setTime(e.target.value)} options={timeSlots} />
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Vista previa:</p>
          <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
            {format(new Date(`${date}T${time}:00`), "EEEE, d 'de' MMMM 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <FileText className="w-4 h-4" />
              Notas del cliente (opcional)
            </label>
            <textarea
              value={formData.client_notes}
              onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
              placeholder="Preferencias o solicitudes especiales..."
              rows={2}
              className={cn(
                'w-full px-4 py-3 rounded-xl resize-none',
                'bg-white dark:bg-zinc-900',
                'border border-zinc-200 dark:border-zinc-800',
                'text-zinc-900 dark:text-zinc-100',
                'placeholder:text-zinc-400',
                'focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent',
                'transition-all duration-200'
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <FileText className="w-4 h-4" />
              Notas internas (opcional)
            </label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              placeholder="Notas solo visibles para el equipo..."
              rows={2}
              className={cn(
                'w-full px-4 py-3 rounded-xl resize-none',
                'bg-white dark:bg-zinc-900',
                'border border-zinc-200 dark:border-zinc-800',
                'text-zinc-900 dark:text-zinc-100',
                'placeholder:text-zinc-400',
                'focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {appointment ? 'Guardar cambios' : 'Crear cita'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
