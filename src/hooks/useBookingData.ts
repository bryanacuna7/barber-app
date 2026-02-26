import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, startOfDay } from 'date-fns'
import type { Service, Business, Barber } from '@/types'
import type { EnrichedTimeSlot, BookingPricing } from '@/types/api'

interface SlotMeta {
  autoRefresh: boolean
  slotInterval: number
  predictedDuration: number | null
}

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
  const searchParams = useSearchParams()
  const smartToken = searchParams.get('sn')
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
  const [claimToken, setClaimToken] = useState<string | null>(null)
  const [bookingPricing, setBookingPricing] = useState<BookingPricing | null>(null)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  const [slotMeta, setSlotMeta] = useState<SlotMeta | null>(null)

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
  // Memoize by date string to avoid recreating on every render
  // Use T12:00:00 trick to avoid UTC midnight timezone shift (CR = UTC-6)
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const availableDates = useMemo(() => {
    const today = new Date(`${todayKey}T12:00:00`)
    return Array.from({ length: 30 }, (_, i) => addDays(startOfDay(today), i))
  }, [todayKey])

  // Fetch business, services, and barbers
  useEffect(() => {
    async function fetchData() {
      try {
        const [businessRes, servicesRes, barbersRes] = await Promise.all([
          fetch(`/api/public/${slug}`, { cache: 'force-cache' }),
          fetch(`/api/public/${slug}/services`, { cache: 'no-store' }),
          fetch(`/api/public/${slug}/barbers`, { cache: 'no-store' }),
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

  // Extracted fetchSlots for reuse by initial load + auto-refresh
  const fetchSlots = useCallback(
    async (showLoading: boolean) => {
      if (!booking.service || !booking.date) return

      if (showLoading) setLoadingSlots(true)
      try {
        const dateStr = format(booking.date, 'yyyy-MM-dd')
        const params = new URLSearchParams({
          date: dateStr,
          service_id: booking.service.id,
        })

        if (booking.barber?.id) {
          params.set('barber_id', booking.barber.id)
        }

        const res = await fetch(`/api/public/${slug}/availability?${params.toString()}`)
        const json = await res.json().catch(() => null)

        if (!res.ok) {
          const apiError =
            json && typeof json === 'object' && 'error' in json
              ? String(json.error)
              : 'No se pudieron cargar los horarios disponibles.'
          setSlots([])
          setError(apiError)
          return
        }

        // Handle both response shapes: array (legacy) or { slots, meta } (new)
        const slotsData = Array.isArray(json) ? json : json?.slots
        const meta: SlotMeta | null = Array.isArray(json) ? null : (json?.meta ?? null)

        if (!Array.isArray(slotsData)) {
          setSlots([])
          setError('No se pudieron cargar los horarios disponibles.')
          return
        }

        setError('')
        setSlots(slotsData)
        setSlotMeta(meta)
      } catch {
        setError('Error al cargar horarios disponibles. Intenta de nuevo.')
        setSlots([])
      } finally {
        if (showLoading) setLoadingSlots(false)
      }
    },
    [slug, booking.service, booking.date, booking.barber]
  )

  // Fetch available slots when date/service/barber changes
  useEffect(() => {
    fetchSlots(true)
  }, [fetchSlots])

  // Auto-refresh slots every 60s — ONLY when smart duration is ON (P1 fix)
  // Gate: API must have returned meta.autoRefresh=true AND selected date must be "today"
  // in the business timezone (P2 fix: timezone-safe comparison)
  useEffect(() => {
    if (!slotMeta?.autoRefresh) return
    if (!booking.service || !booking.date) return

    // Timezone-safe: compare selected date against "today" in the business timezone
    const tz = business?.timezone || 'America/Costa_Rica'
    const selectedDateStr = format(booking.date, 'yyyy-MM-dd')
    const todayInBizTz = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
    if (selectedDateStr !== todayInBizTz) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchSlots(false)
      }
    }, 60_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchSlots(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [slotMeta?.autoRefresh, booking.service, booking.date, business, fetchSlots])

  const handleServiceSelect = (service: Service) => {
    if (barbers.length === 0) {
      setError(
        'Este negocio aún no tiene miembros del equipo configurados. Contacta a la barbería.'
      )
      return
    }

    setError('')
    setSlotMeta(null)
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
    setSlotMeta(null)
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
      setError(
        'Este negocio aún no tiene miembros del equipo configurados. Contacta a la barbería.'
      )
      return
    }

    // Validate barber_id exists
    const selectedBarberId = booking.barber?.id || barbers[0]?.id
    if (!selectedBarberId) {
      setError('No se pudo asignar un miembro del equipo para esta cita. Contacta a la barbería.')
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
        smart_token: smartToken || undefined,
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

      // Store client_id and claim_token for loyalty modal
      if (data.client_id) {
        setCreatedClientId(data.client_id)
      }
      if (data.claim_token) {
        setClaimToken(data.claim_token)
      }

      // Store pricing info from transparent response
      if (data.pricing) {
        setBookingPricing(data.pricing)
      }

      // Store tracking token for advance payment flow
      if (data.tracking_token) {
        setTrackingToken(data.tracking_token)
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
    claimToken,
    bookingPricing,
    trackingToken,
    slotMeta,
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
