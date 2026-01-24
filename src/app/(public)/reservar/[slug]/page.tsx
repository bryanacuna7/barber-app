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

  // Generate available dates
  const availableDates = Array.from({ length: 14 }, (_, i) =>
    addDays(startOfDay(new Date()), i),
  )

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
    setBooking(prev => ({ ...prev, service, barber: null, date: null, time: null }))
    
    // Smart barber routing
    if (barbers.length === 0) {
      // No barbers configured, skip to datetime
      setStep('datetime')
    } else if (barbers.length === 1) {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white">
            <Scissors className="h-8 w-8 text-white dark:text-zinc-900 animate-pulse" />
          </div>
          <p className="mt-4 text-zinc-500">Cargando...</p>
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
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <Card className="w-full max-w-md overflow-hidden">
          {/* Success animation */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-8 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">¡Cita Reservada!</h2>
            <p className="mt-1 text-emerald-100">Te esperamos</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Servicio
                </p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {booking.service?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Fecha
                  </p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {booking.date &&
                      format(booking.date, "d 'de' MMM", { locale: es })}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Hora
                  </p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {booking.time?.time}
                  </p>
                </div>
              </div>
              {business?.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
                >
                  <MessageCircle className="h-5 w-5" />
                  Enviar mensaje por WhatsApp
                </a>
              )}
              <p className="text-center text-sm text-zinc-500">
                Te enviaremos un recordatorio antes de tu cita.
              </p>
            </div>
          </CardContent>
        </Card>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white">
                <Scissors className="h-7 w-7 text-white dark:text-zinc-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {business?.name}
                </h1>
                <p className="text-sm text-zinc-500">Reserva tu cita online</p>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
            {business?.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{business.address}</span>
              </div>
            )}
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white"
              >
                <Phone className="h-4 w-4" />
                <span>{business.phone}</span>
              </a>
            )}
            {business?.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => {
              const stepIndex = stepKeys.indexOf(step)
              const isCompleted = i < stepIndex
              const isCurrent = i === stepIndex

              return (
                <div key={label} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                        isCompleted &&
                          'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
                        isCurrent &&
                          'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
                        !isCompleted &&
                          !isCurrent &&
                          'bg-zinc-100 text-zinc-400 dark:bg-zinc-800',
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
                        'hidden text-sm font-medium sm:block',
                        isCompleted || isCurrent
                          ? 'text-zinc-900 dark:text-white'
                          : 'text-zinc-400',
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <ChevronRight className="mx-2 h-4 w-4 text-zinc-300 sm:mx-4" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Selecciona un servicio
              </h2>
              <p className="mt-1 text-zinc-500">
                Elige el servicio que deseas reservar
              </p>
            </div>

            {services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scissors className="mx-auto h-12 w-12 text-zinc-300" />
                  <p className="mt-4 text-zinc-500">
                    No hay servicios disponibles.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {services.map((service, index) => {
                  const colorClass =
                    SERVICE_COLORS[index % SERVICE_COLORS.length]
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-xl border',
                          colorClass,
                        )}
                      >
                        <Scissors className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="mt-0.5 text-sm text-zinc-500">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(Number(service.price))}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-300 transition-transform group-hover:translate-x-1" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 'barber' && (
          <div className="space-y-6">
            <button
              onClick={() => setStep('service')}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Cambiar servicio
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

            <div className="grid gap-4">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberSelect(barber)}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {barber.photo_url ? (
                      <img
                        src={barber.photo_url}
                        alt={barber.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-7 w-7 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {barber.name}
                    </p>
                    {barber.bio && (
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {barber.bio}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-300 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6">
            <button
              onClick={() => setStep(barbers.length > 1 ? 'barber' : 'service')}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← {barbers.length > 1 ? 'Cambiar barbero' : 'Cambiar servicio'}
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

            {/* Date Selection */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                <Calendar className="h-5 w-5" />
                Selecciona el día
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                        'relative flex min-w-[72px] flex-col items-center rounded-xl border px-4 py-3 transition-all',
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-zinc-900'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900',
                      )}
                    >
                      {isToday && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white">
                          Hoy
                        </span>
                      )}
                      <span className="text-xs font-medium uppercase opacity-70">
                        {format(date, 'EEE', { locale: es })}
                      </span>
                      <span className="mt-1 text-2xl font-bold">
                        {format(date, 'd')}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(date, 'MMM', { locale: es })}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            {booking.date && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  <Clock className="h-5 w-5" />
                  Selecciona la hora
                </h3>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white" />
                  </div>
                ) : slots.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Clock className="mx-auto h-8 w-8 text-zinc-300" />
                      <p className="mt-2 text-zinc-500">
                        No hay horarios disponibles para este día.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((slot) => (
                      <button
                        key={slot.datetime}
                        onClick={() => slot.available && handleTimeSelect(slot)}
                        disabled={!slot.available}
                        className={cn(
                          'rounded-xl border px-3 py-3 text-sm font-medium transition-all',
                          !slot.available
                            ? 'cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-600'
                            : booking.time?.datetime === slot.datetime
                              ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-zinc-900'
                              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900',
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

        {/* Step 3: Client Info */}
        {step === 'info' && (
          <div className="space-y-6">
            <button
              onClick={() => setStep('datetime')}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Cambiar horario
            </button>

            {/* Booking Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {booking.service?.name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {booking.date &&
                        format(booking.date, "EEEE d 'de' MMMM", {
                          locale: es,
                        })}{' '}
                      · {booking.time?.time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Tus datos de contacto
                </h3>
                <p className="text-sm text-zinc-500">
                  Los usaremos para enviarte confirmación y recordatorios
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
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
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Alguna petición especial o preferencia..."
                  value={booking.notes}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="pt-4">
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
