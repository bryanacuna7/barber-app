'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Scissors,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service, Business, TimeSlot, Barber } from '@/types'

type Step = 'service' | 'barber' | 'datetime' | 'info' | 'confirm'

// Service color palette
const SERVICE_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
]

interface BookingData {
  service: Service | null
  barber: Barber | null
  date: Date | null
  time: TimeSlot | null
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('service')
  const [bookingComplete, setBookingComplete] = useState(false)

  const [booking, setBooking] = useState<BookingData>({
    service: null,
    barber: null,
    date: null,
    time: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  })

  // Generate available dates (30 days ahead)
  const availableDates = Array.from({ length: 30 }, (_, i) =>
    addDays(startOfDay(new Date()), i),
  )

  // PWA: inject manifest link and register service worker
  useEffect(() => {
    // Dynamic manifest
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = `/api/public/${slug}/manifest`
    document.head.appendChild(link)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    return () => {
      document.head.removeChild(link)
    }
  }, [slug])

  // Apply brand theme to :root
  useEffect(() => {
    if (!business?.brand_primary_color) return

    function hexToRgb(hex: string): string {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return '0, 0, 0'
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    }

    function lightenColor(hex: string, amount: number): string {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return hex
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      const newR = Math.min(255, r + Math.round((255 - r) * amount))
      const newG = Math.min(255, g + Math.round((255 - g) * amount))
      const newB = Math.min(255, b + Math.round((255 - b) * amount))
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    const root = document.documentElement
    const primaryColor = business.brand_primary_color
    const secondaryColor = business.brand_secondary_color

    root.style.setProperty('--brand-primary', primaryColor)
    root.style.setProperty('--brand-primary-rgb', hexToRgb(primaryColor))
    root.style.setProperty('--brand-primary-light', lightenColor(primaryColor, 0.85))
    root.style.setProperty(
      '--brand-secondary',
      secondaryColor || lightenColor(primaryColor, 0.4)
    )
  }, [business?.brand_primary_color, business?.brand_secondary_color])

  // Fetch business, services, and barbers
  useEffect(() => {
    async function fetchData() {
      try {
        const [businessRes, servicesRes, barbersRes] = await Promise.all([
          fetch(`/api/public/${slug}`),
          fetch(`/api/public/${slug}/services`),
          fetch(`/api/public/${slug}/barbers`),
        ])

        if (!businessRes.ok) {
          setError('Negocio no encontrado')
          setLoading(false)
          return
        }

        const businessData = await businessRes.json()
        const servicesData = await servicesRes.json()
        const barbersData = await barbersRes.json()

        setBusiness(businessData)
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setBarbers(Array.isArray(barbersData) ? barbersData : [])
      } catch {
        setError('Error al cargar la información')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // Fetch available slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!booking.service || !booking.date) return

      setLoadingSlots(true)
      try {
        const dateStr = format(booking.date, 'yyyy-MM-dd')
        const res = await fetch(
          `/api/public/${slug}/availability?date=${dateStr}&service_id=${booking.service.id}`,
        )
        const data = await res.json()
        setSlots(data)
      } catch {
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [slug, booking.service, booking.date])

  const handleServiceSelect = (service: Service) => {
    if (barbers.length === 0) {
      setError('Este negocio aún no tiene barberos configurados. Contacta a la barbería.')
      return
    }

    setError('')
    setBooking(prev => ({ ...prev, service, barber: null, date: null, time: null }))

    // Smart barber routing
    if (barbers.length === 1) {
      // Only 1 barber, auto-assign and skip to datetime
      setBooking(prev => ({ ...prev, barber: barbers[0] }))
      setStep('datetime')
    } else {
      // Multiple barbers, show selection
      setStep('barber')
    }
  }

  const handleBarberSelect = (barber: Barber) => {
    setBooking(prev => ({ ...prev, barber, date: null, time: null }))
    setStep('datetime')
  }

  const handleDateSelect = (date: Date) => {
    setBooking((prev) => ({ ...prev, date, time: null }))
  }

  const handleTimeSelect = (time: TimeSlot) => {
    setBooking((prev) => ({ ...prev, time }))
    setStep('info')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking.service || !booking.time) return
    if (barbers.length === 0) {
      setError('Este negocio aún no tiene barberos configurados. Contacta a la barbería.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/public/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: booking.service.id,
          barber_id: booking.barber?.id || barbers[0]?.id, // Fallback to first barber if none selected
          scheduled_at: booking.time.datetime,
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          client_email: booking.clientEmail || undefined,
          notes: booking.notes || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al reservar la cita')
        return
      }

      setBookingComplete(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#1C1C1E]">
        <div className="text-center ios-spring-in">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl dark:from-zinc-100 dark:to-zinc-200">
            <Scissors className="h-10 w-10 text-white dark:text-zinc-900 animate-pulse" />
          </div>
          <p className="mt-5 text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error && !business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
              {error}
            </h2>
            <p className="mt-2 text-zinc-500">
              Verifica la dirección e intenta de nuevo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
        <div className="w-full max-w-md ios-card overflow-hidden ios-spring-in">
          {/* Success animation - iOS style */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="mt-5 text-[28px] font-bold">¡Cita Reservada!</h2>
            <p className="mt-1 text-[15px] text-emerald-100">Te esperamos</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Servicio
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                {booking.service?.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Fecha
                </p>
                <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                  {booking.date &&
                    format(booking.date, "d 'de' MMM", { locale: es })}
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Hora
                </p>
                <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                  {booking.time?.time}
                </p>
              </div>
            </div>
            {business?.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-4 text-[17px] font-semibold text-white ios-press"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar mensaje por WhatsApp
              </a>
            )}
            <p className="text-center text-[13px] text-zinc-500 dark:text-zinc-400">
              Te enviaremos un recordatorio antes de tu cita.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic step labels based on barber count
  const stepLabels = barbers.length > 1 
    ? ['Servicio', 'Barbero', 'Fecha y Hora', 'Tus Datos']
    : ['Servicio', 'Fecha y Hora', 'Tus Datos']

  const stepKeys = barbers.length > 1
    ? ['service', 'barber', 'datetime', 'info']
    : ['service', 'datetime', 'info']
  const noBarbers = barbers.length === 0

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      {/* iOS-style Header with Blur */}
      <div className="ios-glass sticky top-0 z-50 border-b border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            {business?.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-14 w-14 rounded-[18px] object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[18px] shadow-lg"
                style={{
                  background: business?.brand_primary_color
                    ? `linear-gradient(135deg, ${business.brand_primary_color}, ${business.brand_primary_color}dd)`
                    : 'linear-gradient(135deg, #18181b, #27272a)',
                }}
              >
                <Scissors className="h-7 w-7 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                {business?.name}
              </h1>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Reserva tu cita</p>
            </div>
          </div>

          {/* Business Info Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {business?.address && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/60 px-3 py-1.5 text-[13px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[160px] sm:max-w-none">{business.address}</span>
              </div>
            )}
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/60 px-3 py-1.5 text-[13px] font-medium text-zinc-600 ios-press dark:bg-zinc-800 dark:text-zinc-400"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{business.phone}</span>
              </a>
            )}
            {business?.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[13px] font-semibold text-emerald-700 ios-press dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* iOS Progress Steps - Floating Pill Style */}
      <div className="sticky top-[108px] sm:top-[116px] z-40 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-xl p-2 shadow-sm dark:bg-zinc-900/80">
            {stepLabels.map((label, i) => {
              const stepIndex = stepKeys.indexOf(step)
              const isCompleted = i < stepIndex
              const isCurrent = i === stepIndex

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300',
                      isCurrent && 'bg-zinc-900 dark:bg-white',
                      isCompleted && 'bg-emerald-100 dark:bg-emerald-900/30',
                      !isCompleted && !isCurrent && 'bg-transparent',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                        isCurrent && 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white',
                        isCompleted && 'bg-emerald-500 text-white',
                        !isCompleted && !isCurrent && 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[13px] font-semibold hidden sm:block',
                        isCurrent && 'text-white dark:text-zinc-900',
                        isCompleted && 'text-emerald-700 dark:text-emerald-400',
                        !isCompleted && !isCurrent && 'text-zinc-400 dark:text-zinc-500',
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={cn(
                      'w-4 sm:w-6 h-0.5 mx-1 rounded-full transition-colors',
                      i < stepIndex ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-1">
              <h2 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Elige servicio
              </h2>
              <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
                Selecciona el servicio que deseas reservar
              </p>
            </div>
            {noBarbers && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                Esta barbería aún no tiene barberos configurados. Contacta al negocio para reservar.
              </div>
            )}

            {services.length === 0 ? (
              <div className="ios-card p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Scissors className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="mt-4 text-[15px] text-zinc-500">
                  No hay servicios disponibles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service, index) => {
                  const colorClass =
                    SERVICE_COLORS[index % SERVICE_COLORS.length]
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      disabled={noBarbers}
                      className={cn(
                        'ios-card w-full flex items-center gap-4 p-4 text-left ios-press',
                        noBarbers && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl',
                          colorClass,
                        )}
                      >
                        <Scissors className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-zinc-900 dark:text-white truncate">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[20px] font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(Number(service.price))}
                        </p>
                        <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 'barber' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
            <button
              onClick={() => setStep('service')}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
            >
              <ChevronLeft className="h-5 w-5 -ml-1" />
              Servicios
            </button>

            {/* Selected Service */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {booking.service?.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {booking.service?.duration_minutes} min ·{' '}
                    {formatCurrency(Number(booking.service?.price))}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Elige tu barbero
              </h2>
              <p className="mt-1 text-zinc-500">
                Selecciona quién te atenderá
              </p>
            </div>

            <div className="space-y-3">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberSelect(barber)}
                  className="ios-card w-full flex items-center gap-4 p-4 text-left ios-press"
                >
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 overflow-hidden">
                    {barber.photo_url ? (
                      <img
                        src={barber.photo_url}
                        alt={barber.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                      {barber.name}
                    </p>
                    {barber.bio && (
                      <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {barber.bio}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
            <button
              onClick={() => setStep(barbers.length > 1 ? 'barber' : 'service')}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
            >
              <ChevronLeft className="h-5 w-5 -ml-1" />
              {barbers.length > 1 ? 'Barbero' : 'Servicios'}
            </button>

            {/* Selected Service */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {booking.service?.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {booking.service?.duration_minutes} min ·{' '}
                    {formatCurrency(Number(booking.service?.price))}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection - Horizontal Scroll */}
            <div>
              <h3 className="mb-4 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Selecciona el día
              </h3>
              <div className="relative -mx-4 sm:mx-0">
                {/* Scroll fade indicators */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F2F2F7] dark:from-[#1C1C1E] to-transparent z-10" />

                <div className="flex gap-2.5 overflow-x-auto pb-3 px-4 sm:px-0 snap-x snap-mandatory">
                  {availableDates.map((date) => {
                    const isSelected =
                      booking.date?.toDateString() === date.toDateString()
                    const isToday =
                      date.toDateString() === new Date().toDateString()

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          'relative flex min-w-[68px] flex-col items-center rounded-2xl px-3 py-3 transition-all ios-press flex-shrink-0 snap-start',
                          isSelected
                            ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 dark:bg-white dark:text-zinc-900 dark:shadow-white/20'
                            : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-700/80',
                          isToday && 'mt-2'
                        )}
                      >
                        {isToday && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm whitespace-nowrap">
                            Hoy
                          </span>
                        )}
                        <span className={cn(
                          "text-[11px] font-semibold uppercase tracking-wide",
                          isSelected ? "opacity-80" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                          {format(date, 'EEE', { locale: es })}
                        </span>
                        <span className="mt-1 text-[28px] font-bold leading-none">
                          {format(date, 'd')}
                        </span>
                        <span className={cn(
                          "mt-0.5 text-[11px] font-medium uppercase",
                          isSelected ? "opacity-70" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                          {format(date, 'MMM', { locale: es })}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Time Selection - iOS Grid */}
            {booking.date && (
              <div>
                <h3 className="mb-4 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Selecciona la hora
                </h3>
                {loadingSlots ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="ios-card p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                      <Clock className="h-7 w-7 text-zinc-400" />
                    </div>
                    <p className="mt-4 text-[15px] text-zinc-500">
                      No hay horarios disponibles para este día.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {slots.map((slot) => (
                      <button
                        key={slot.datetime}
                        onClick={() => slot.available && handleTimeSelect(slot)}
                        disabled={!slot.available}
                        className={cn(
                          'rounded-2xl py-4 text-[15px] font-semibold transition-all',
                          !slot.available
                            ? 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-800/50 dark:text-zinc-600'
                            : booking.time?.datetime === slot.datetime
                              ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 dark:bg-white dark:text-zinc-900'
                              : 'bg-white text-zinc-900 ios-press dark:bg-zinc-800 dark:text-white',
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Client Info */}
        {step === 'info' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
            <button
              onClick={() => setStep('datetime')}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
            >
              <ChevronLeft className="h-5 w-5 -ml-1" />
              Horario
            </button>

            {/* Booking Summary - iOS Card */}
            <div className="ios-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600 dark:from-violet-900/40 dark:to-violet-800/40 dark:text-violet-400">
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-semibold text-zinc-900 dark:text-white truncate">
                    {booking.service?.name}
                  </p>
                  <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                    {booking.date &&
                      format(booking.date, "EEEE d 'de' MMMM", {
                        locale: es,
                      })}{' '}
                    · {booking.time?.time}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="px-1">
                <h3 className="text-[20px] font-bold text-zinc-900 dark:text-white">
                  Tus datos
                </h3>
                <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
                  Para enviarte confirmación y recordatorios
                </p>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-[15px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                label="Nombre completo"
                type="text"
                placeholder="Tu nombre"
                value={booking.clientName}
                onChange={(e) =>
                  setBooking((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                placeholder="8 dígitos (ej: 87175866)"
                value={booking.clientPhone}
                onChange={(e) =>
                  setBooking((prev) => ({
                    ...prev,
                    clientPhone: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Email (opcional)"
                type="email"
                placeholder="tu@email.com"
                value={booking.clientEmail}
                onChange={(e) =>
                  setBooking((prev) => ({
                    ...prev,
                    clientEmail: e.target.value,
                  }))
                }
              />

              <div>
                <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Alguna petición especial o preferencia..."
                  value={booking.notes}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full rounded-2xl border-0 bg-zinc-100/80 px-4 py-4 text-[17px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:bg-zinc-100 dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-white/20 dark:focus:bg-zinc-800 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>

              {/* Submit Button with Safe Area */}
              <div className="pt-4 ios-safe-bottom">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={submitting}
                >
                  Confirmar Reservación ·{' '}
                  {formatCurrency(Number(booking.service?.price))}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
