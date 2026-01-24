'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Building2,
  Clock,
  Calendar,
  Globe,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import type { Business, OperatingHours, DayHours } from '@/types'

const DAYS = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
] as const

const DEFAULT_HOURS: DayHours = { open: '09:00', close: '18:00' }

export default function ConfiguracionPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    timezone: 'America/Costa_Rica',
    booking_buffer_minutes: 15,
    advance_booking_days: 14,
    operating_hours: {
      mon: { ...DEFAULT_HOURS },
      tue: { ...DEFAULT_HOURS },
      wed: { ...DEFAULT_HOURS },
      thu: { ...DEFAULT_HOURS },
      fri: { ...DEFAULT_HOURS },
      sat: { open: '09:00', close: '14:00' },
      sun: null,
    } as OperatingHours,
  })

  useEffect(() => {
    fetchBusiness()
  }, [])

  async function fetchBusiness() {
    try {
      const res = await fetch('/api/business')
      if (res.ok) {
        const data = await res.json()
        setBusiness(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          timezone: data.timezone || 'America/Costa_Rica',
          booking_buffer_minutes: data.booking_buffer_minutes || 15,
          advance_booking_days: data.advance_booking_days || 14,
          operating_hours: data.operating_hours || formData.operating_hours,
        })
      }
    } catch (error) {
      console.error('Error fetching business:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updated = await res.json()
        setBusiness(updated)
        toast.success('Configuración guardada correctamente')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  function handleHoursChange(
    day: keyof OperatingHours,
    field: 'open' | 'close',
    value: string
  ) {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...(prev.operating_hours[day] || DEFAULT_HOURS),
          [field]: value,
        },
      },
    }))
  }

  function toggleDay(day: keyof OperatingHours) {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: prev.operating_hours[day] ? null : { ...DEFAULT_HOURS },
      },
    }))
  }

  function copyBookingLink() {
    if (!business?.slug) return
    const link = `${window.location.origin}/reservar/${business.slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.info('Enlace copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
      </div>
    )
  }

  const bookingUrl = business?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reservar/${business.slug}`
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Administra los datos y preferencias de tu negocio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Public Booking Link */}
        <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-900 dark:text-violet-300">
              <Globe className="h-5 w-5" />
              Tu Página de Reservas
            </CardTitle>
            <CardDescription className="text-violet-700 dark:text-violet-400">
              Comparte este enlace con tus clientes para que puedan reservar online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-violet-200 bg-white px-4 py-3 text-sm font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
                {bookingUrl || 'Cargando...'}
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:text-violet-300"
                onClick={copyBookingLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-white px-3 py-2 text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre del negocio"
              type="text"
              placeholder="Barbería El Patrón"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono"
                type="tel"
                placeholder="2222-3333"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />

              <Input
                label="WhatsApp"
                type="tel"
                placeholder="87175866"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>

            <Input
              label="Dirección"
              type="text"
              placeholder="San José, Costa Rica"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario de Atención
            </CardTitle>
            <CardDescription>
              Define los días y horas en que tu negocio está abierto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => {
                const hours = formData.operating_hours[key]
                const isOpen = hours !== null && hours !== undefined

                return (
                  <div
                    key={key}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={() => toggleDay(key)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                      />
                      <span className="w-24 font-medium text-zinc-900 dark:text-white">
                        {label}
                      </span>
                    </label>

                    {isOpen ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          value={hours?.open || '09:00'}
                          onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        />
                        <span className="text-zinc-500">a</span>
                        <input
                          type="time"
                          value={hours?.close || '18:00'}
                          onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-400">Cerrado</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración de Reservas
            </CardTitle>
            <CardDescription>
              Controla cómo los clientes pueden reservar citas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tiempo entre citas (minutos)
                </label>
                <select
                  value={formData.booking_buffer_minutes}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      booking_buffer_minutes: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value={0}>Sin tiempo extra</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  Tiempo de descanso entre cada cita
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Días de anticipación
                </label>
                <select
                  value={formData.advance_booking_days}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      advance_booking_days: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value={7}>1 semana</option>
                  <option value={14}>2 semanas</option>
                  <option value={21}>3 semanas</option>
                  <option value={30}>1 mes</option>
                  <option value={60}>2 meses</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  Cuántos días adelante pueden reservar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
