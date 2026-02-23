import { useState, useEffect } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import type { Service, Business, TimeSlot, Barber } from '@/types'
import type { EnrichedTimeSlot, BookingPricing } from '@/types/api'

type Step = 'service' | 'barber' | 'datetime' | 'info' | 'confirm'

interface BookingData {
  service: Service | null
  barber: Barber | null
  date: Date | null
  time: EnrichedTimeSlot | null
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

export function useBookingData(slug: string) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [slots, setSlots] = useState<EnrichedTimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('service')
  const [bookingComplete, setBookingComplete] = useState(false)
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const [bookingPricing, setBookingPricing] = useState<BookingPricing | null>(null)

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
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i))

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
          `/api/public/${slug}/availability?date=${dateStr}&service_id=${booking.service.id}`
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
    setBooking((prev) => ({ ...prev, service, barber: null, date: null, time: null }))

    // Smart barber routing
    if (barbers.length === 1) {
      // Only 1 barber, auto-assign and skip to datetime
      setBooking((prev) => ({ ...prev, barber: barbers[0] }))
      setStep('datetime')
    } else {
      // Multiple barbers, show selection
      setStep('barber')
    }
  }

  const handleBarberSelect = (barber: Barber) => {
    setBooking((prev) => ({ ...prev, barber, date: null, time: null }))
    setStep('datetime')
  }

  const handleDateSelect = (date: Date) => {
    setBooking((prev) => ({ ...prev, date, time: null }))
  }

  const handleTimeSelect = (time: EnrichedTimeSlot) => {
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

    // Validate barber_id exists
    const selectedBarberId = booking.barber?.id || barbers[0]?.id
    if (!selectedBarberId) {
      setError('No se pudo asignar un barbero para esta cita. Contacta a la barbería.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const bookingPayload = {
        service_id: booking.service.id,
        barber_id: selectedBarberId,
        scheduled_at: booking.time.datetime,
        client_name: booking.clientName,
        client_phone: booking.clientPhone,
        client_email: booking.clientEmail || undefined,
        notes: booking.notes || undefined,
        promo_rule_id: booking.time.discount?.ruleId || undefined,
      }

      const res = await fetch(`/api/public/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('[Booking] API error:', data)
        setError(data.error || 'Error al reservar la cita')
        return
      }

      // Store client_id for loyalty modal
      if (data.client_id) {
        setCreatedClientId(data.client_id)
      }

      // Store pricing info from transparent response
      if (data.pricing) {
        setBookingPricing(data.pricing)
      }

      setBookingComplete(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    // State
    business,
    services,
    barbers,
    slots,
    loading,
    loadingSlots,
    submitting,
    error,
    step,
    bookingComplete,
    booking,
    availableDates,
    createdClientId,
    bookingPricing,
    // Setters
    setStep,
    setBooking,
    setError,
    // Handlers
    handleServiceSelect,
    handleBarberSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
  }
}
