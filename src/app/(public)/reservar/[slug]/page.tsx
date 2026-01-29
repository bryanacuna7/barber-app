'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Scissors, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useBookingData } from '@/hooks/useBookingData'
import { BookingHeader } from '@/components/reservar/BookingHeader'
import { ProgressSteps } from '@/components/reservar/ProgressSteps'
import { BookingSuccess } from '@/components/reservar/BookingSuccess'
import { ServiceSelection } from '@/components/reservar/ServiceSelection'
import { BarberSelection } from '@/components/reservar/BarberSelection'
import { DateTimeSelection } from '@/components/reservar/DateTimeSelection'
import { ClientInfoForm } from '@/components/reservar/ClientInfoForm'
import {
  hexToRgbValues,
  lightenColor,
  darkenColor,
  getLuminance,
  getContrastRatio,
  getContrastingTextColor,
  getReadableBrandColor,
} from '@/lib/utils/color'

function hexToRgb(hex: string): string {
  const { r, g, b } = hexToRgbValues(hex)
  return `${r}, ${g}, ${b}`
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string

  const {
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
    setStep,
    setBooking,
    setError,
    handleServiceSelect,
    handleBarberSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
  } = useBookingData(slug)

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

  // Apply brand theme to :root (same logic as ThemeProvider)
  useEffect(() => {
    if (!business?.brand_primary_color) return

    const root = document.documentElement
    const primaryColor = business.brand_primary_color
    const secondaryColor = business.brand_secondary_color

    root.style.setProperty('--brand-primary', primaryColor)
    root.style.setProperty('--brand-primary-rgb', hexToRgb(primaryColor))
    root.style.setProperty('--brand-primary-light', lightenColor(primaryColor, 0.85))
    root.style.setProperty('--brand-primary-dark', darkenColor(primaryColor, 0.3))
    root.style.setProperty('--brand-secondary', secondaryColor || lightenColor(primaryColor, 0.4))
    root.style.setProperty('--brand-primary-contrast', getContrastingTextColor(primaryColor))
    root.style.setProperty('--brand-primary-on-light', getReadableBrandColor(primaryColor, false))
    root.style.setProperty('--brand-primary-on-dark', getReadableBrandColor(primaryColor, true))
  }, [business?.brand_primary_color, business?.brand_secondary_color])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#1C1C1E]">
        <div className="text-center ios-spring-in">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl dark:from-zinc-100 dark:to-zinc-200">
            <Scissors className="h-10 w-10 text-white dark:text-zinc-900 animate-pulse" />
          </div>
          <p className="mt-5 text-[15px] font-medium text-zinc-500 dark:text-zinc-400">
            Cargando...
          </p>
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
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">{error}</h2>
            <p className="mt-2 text-zinc-500">Verifica la dirección e intenta de nuevo.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <BookingSuccess
        service={booking.service}
        date={booking.date}
        time={booking.time?.time || null}
        business={business}
      />
    )
  }

  const noBarbers = barbers.length === 0

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      {/* Header */}
      {business && <BookingHeader business={business} />}

      {/* Progress Steps */}
      <ProgressSteps currentStep={step} barberCount={barbers.length} />

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <ServiceSelection
            services={services}
            noBarbers={noBarbers}
            onSelectService={handleServiceSelect}
          />
        )}

        {/* Step 2: Select Barber */}
        {step === 'barber' && booking.service && (
          <BarberSelection
            service={booking.service}
            barbers={barbers}
            onSelectBarber={handleBarberSelect}
            onBack={() => setStep('service')}
          />
        )}

        {/* Step 3: Select Date & Time */}
        {step === 'datetime' && booking.service && (
          <DateTimeSelection
            service={booking.service}
            availableDates={availableDates}
            selectedDate={booking.date}
            selectedTime={booking.time}
            slots={slots}
            loadingSlots={loadingSlots}
            barberCount={barbers.length}
            onSelectDate={handleDateSelect}
            onSelectTime={handleTimeSelect}
            onBack={() => setStep(barbers.length > 1 ? 'barber' : 'service')}
          />
        )}

        {/* Step 4: Client Info */}
        {step === 'info' && booking.service && booking.date && booking.time && (
          <ClientInfoForm
            service={booking.service}
            date={booking.date}
            time={booking.time.time}
            clientName={booking.clientName}
            clientPhone={booking.clientPhone}
            clientEmail={booking.clientEmail}
            notes={booking.notes}
            submitting={submitting}
            error={error}
            onChangeName={(value) => setBooking((prev) => ({ ...prev, clientName: value }))}
            onChangePhone={(value) => setBooking((prev) => ({ ...prev, clientPhone: value }))}
            onChangeEmail={(value) => setBooking((prev) => ({ ...prev, clientEmail: value }))}
            onChangeNotes={(value) => setBooking((prev) => ({ ...prev, notes: value }))}
            onSubmit={handleSubmit}
            onBack={() => setStep('datetime')}
          />
        )}
      </div>
    </div>
  )
}
