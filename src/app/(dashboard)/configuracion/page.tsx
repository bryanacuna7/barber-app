'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Building2,
  Clock,
  Calendar,
  Globe,
  ExternalLink,
  Copy,
  Check,
  LogOut,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { createClient } from '@/lib/supabase/client'
import type { Business, OperatingHours, DayHours } from '@/types'

const DAYS = [
  { key: 'mon', label: 'Lunes', short: 'Lun' },
  { key: 'tue', label: 'Martes', short: 'Mar' },
  { key: 'wed', label: 'Miércoles', short: 'Mié' },
  { key: 'thu', label: 'Jueves', short: 'Jue' },
  { key: 'fri', label: 'Viernes', short: 'Vie' },
  { key: 'sat', label: 'Sábado', short: 'Sáb' },
  { key: 'sun', label: 'Domingo', short: 'Dom' },
] as const

const DEFAULT_HOURS: DayHours = { open: '09:00', close: '18:00' }

type TimePickerState = {
  isOpen: boolean
  day: keyof OperatingHours | null
  field: 'open' | 'close'
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const [timePicker, setTimePicker] = useState<TimePickerState>({
    isOpen: false,
    day: null,
    field: 'open',
  })

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

  function openTimePicker(day: keyof OperatingHours, field: 'open' | 'close') {
    setTimePicker({ isOpen: true, day, field })
  }

  function handleTimeChange(value: string) {
    if (!timePicker.day) return

    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [timePicker.day!]: {
          ...(prev.operating_hours[timePicker.day!] || DEFAULT_HOURS),
          [timePicker.field]: value,
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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
        />
      </div>
    )
  }

  const bookingUrl = business?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reservar/${business.slug}`
    : ''

  const currentTimeValue = timePicker.day && formData.operating_hours[timePicker.day]
    ? (formData.operating_hours[timePicker.day] as DayHours)[timePicker.field]
    : '09:00'

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <FadeInUp>
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
            Administra los datos y preferencias de tu negocio
          </p>
        </div>
      </FadeInUp>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Public Booking Link */}
        <FadeInUp delay={0.05}>
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:border-violet-900 dark:from-violet-950/30 dark:to-purple-950/20 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px] text-violet-900 dark:text-violet-300">
                <Globe className="h-5 w-5" />
                Tu Página de Reservas
              </CardTitle>
              <CardDescription className="text-violet-700/80 dark:text-violet-400/80">
                Comparte este enlace con tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex-1 min-w-0 rounded-xl border border-violet-200 bg-white/80 px-4 py-3.5 text-[15px] font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 truncate">
                  {bookingUrl || 'Cargando...'}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyBookingLink}
                    className="flex h-12 min-w-[48px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    <span className="text-[15px] font-medium sm:hidden">Copiar</span>
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 min-w-[48px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="text-[15px] font-medium sm:hidden">Abrir</span>
                  </motion.a>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Business Info */}
        <FadeInUp delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <Building2 className="h-5 w-5" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
        </FadeInUp>

        {/* Operating Hours - iOS Style */}
        <FadeInUp delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <Clock className="h-5 w-5" />
                Horario de Atención
              </CardTitle>
              <CardDescription>
                Toca las horas para cambiarlas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaggeredList className="space-y-2">
                {DAYS.map(({ key, label, short }) => {
                  const hours = formData.operating_hours[key]
                  const isOpen = hours !== null && hours !== undefined

                  return (
                    <StaggeredItem key={key}>
                      <motion.div
                        layout
                        className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
                          isOpen
                            ? 'bg-zinc-50 dark:bg-zinc-800/50'
                            : 'bg-zinc-100/50 dark:bg-zinc-900/50'
                        }`}
                      >
                        {/* Day toggle */}
                        <IOSToggle
                          checked={isOpen}
                          onChange={() => toggleDay(key)}
                          size="sm"
                        />

                        {/* Day label */}
                        <span className={`text-[15px] font-medium w-20 sm:w-24 ${
                          isOpen
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`}>
                          <span className="hidden sm:inline">{label}</span>
                          <span className="sm:hidden">{short}</span>
                        </span>

                        {/* Time pickers */}
                        {isOpen ? (
                          <div className="flex items-center gap-2 ml-auto">
                            <TimePickerTrigger
                              value={hours?.open || '09:00'}
                              onClick={() => openTimePicker(key, 'open')}
                            />
                            <span className="text-zinc-400 text-[15px]">a</span>
                            <TimePickerTrigger
                              value={hours?.close || '18:00'}
                              onClick={() => openTimePicker(key, 'close')}
                            />
                          </div>
                        ) : (
                          <span className="text-[15px] text-zinc-400 ml-auto">
                            Cerrado
                          </span>
                        )}
                      </motion.div>
                    </StaggeredItem>
                  )
                })}
              </StaggeredList>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Booking Settings */}
        <FadeInUp delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <Calendar className="h-5 w-5" />
                Configuración de Reservas
              </CardTitle>
              <CardDescription>
                Controla cómo los clientes pueden reservar citas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Tiempo entre citas
                  </label>
                  <select
                    value={formData.booking_buffer_minutes}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        booking_buffer_minutes: Number(e.target.value),
                      }))
                    }
                    className="w-full h-12 rounded-xl border-0 bg-zinc-100/80 px-4 text-[17px] text-zinc-900 dark:bg-zinc-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition-all"
                  >
                    <option value={0}>Sin tiempo extra</option>
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                    className="w-full h-12 rounded-xl border-0 bg-zinc-100/80 px-4 text-[17px] text-zinc-900 dark:bg-zinc-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition-all"
                  >
                    <option value={7}>1 semana</option>
                    <option value={14}>2 semanas</option>
                    <option value={21}>3 semanas</option>
                    <option value={30}>1 mes</option>
                    <option value={60}>2 meses</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Session */}
        <FadeInUp delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <LogOut className="h-5 w-5" />
                Sesión
              </CardTitle>
              <CardDescription>
                Cierra sesión en este dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Save Button - Sticky on mobile */}
        <FadeInUp delay={0.25}>
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 dark:bg-zinc-900/80 dark:border-zinc-800/50 lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:p-0 lg:flex lg:justify-end z-40">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full lg:w-auto"
            >
              <Button
                type="submit"
                isLoading={saving}
                className="w-full lg:w-auto h-12 px-8 gap-2 text-[15px] font-semibold"
              >
                <Save className="h-5 w-5" />
                Guardar Cambios
              </Button>
            </motion.div>
          </div>
        </FadeInUp>
      </form>

      {/* iOS Time Picker Sheet */}
      <IOSTimePicker
        isOpen={timePicker.isOpen}
        onClose={() => setTimePicker(prev => ({ ...prev, isOpen: false }))}
        value={currentTimeValue}
        onChange={handleTimeChange}
        title={timePicker.field === 'open' ? 'Hora de apertura' : 'Hora de cierre'}
      />
    </div>
  )
}
