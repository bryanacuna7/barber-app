'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, CalendarCheck, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useBookingData } from '@/hooks/useBookingData'
import { BookingHeader } from '@/components/reservar/BookingHeader'
import { ProgressSteps } from '@/components/reservar/ProgressSteps'
import { BookingSuccess } from '@/components/reservar/BookingSuccess'
import { ServiceSelection } from '@/components/reservar/ServiceSelection'
import { BarberSelection } from '@/components/reservar/BarberSelection'
import { DateTimeSelection } from '@/components/reservar/DateTimeSelection'
import { ClientInfoForm } from '@/components/reservar/ClientInfoForm'
import { BookingLoadingState } from '@/components/reservar/booking-loading-state'
import { InstallAppCta } from '@/components/pwa/install-app-cta'
import { ClientStatusCard, ClientStatusCardSkeleton } from '@/components/loyalty/client-status-card'
import { LoyaltyUpsellBanner } from '@/components/loyalty/loyalty-upsell-banner'
import { createClient } from '@/lib/supabase/client'
import type { ClientLoyaltyStatus, LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'
import {
  hexToRgbValues,
  lightenColor,
  darkenColor,
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
    createdClientId,
    claimToken,
    bookingPricing,
    trackingToken,
    slotMeta,
    setStep,
    setBooking,
    retryInitialData,
    handleServiceSelect,
    handleBarberSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
  } = useBookingData(slug)

  // Loyalty status state
  const [loyaltyStatus, setLoyaltyStatus] = useState<ClientLoyaltyStatus | null>(null)
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showDashboardBanner, setShowDashboardBanner] = useState(true)
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false)

  // Load loyalty status for authenticated user
  useEffect(() => {
    async function loadLoyaltyStatus() {
      if (!business?.id) return

      try {
        const supabase = createClient()

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setIsAuthenticated(!!user)

        // Check if user is a client of THIS business (not owner/barber)
        if (user) {
          // First, exclude owners and barbers of this business
          const { data: biz } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', business.id)
            .single()
          const isOwner = biz?.owner_id === user.id

          let isBarber = false
          if (!isOwner) {
            const { data: barberRows } = await supabase
              .from('barbers')
              .select('id')
              .eq('user_id', user.id)
              .eq('business_id', business.id)
              .limit(1)
            isBarber = !!barberRows && barberRows.length > 0
          }

          if (isOwner || isBarber) {
            setIsClient(false)
          } else {
            const { data: clientRows, error: clientErr } = await supabase
              .from('clients')
              .select('id, name, phone, email')
              .eq('user_id', user.id)
              .eq('business_id', business.id)
              .order('created_at', { ascending: false })
              .limit(1)
            const foundClient = !clientErr && !!clientRows && clientRows.length > 0
            setIsClient(foundClient)

            // Pre-fill booking form with client's saved data
            if (foundClient && clientRows[0]) {
              const c = clientRows[0]
              setBooking((prev) => ({
                ...prev,
                clientName: prev.clientName || c.name || '',
                clientPhone: prev.clientPhone || c.phone || '',
                clientEmail: prev.clientEmail || c.email || '',
              }))
            }
          }
        } else {
          setIsClient(false)
        }

        // Always get loyalty program (regardless of auth status)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: program } = await (supabase as any)
          .from('loyalty_programs')
          .select('*')
          .eq('business_id', business.id)
          .eq('enabled', true)
          .single()

        if (program) {
          setLoyaltyProgram({
            id: program.id,
            businessId: program.business_id,
            enabled: program.enabled,
            programType: program.program_type,
            pointsPerCurrencyUnit: program.points_per_currency_unit,
            pointsExpiryDays: program.points_expiry_days,
            freeServiceAfterVisits: program.free_service_after_visits,
            discountAfterVisits: program.discount_after_visits,
            discountPercentage: program.discount_percentage,
            referralRewardType: program.referral_reward_type,
            referralRewardAmount: program.referral_reward_amount,
            refereeRewardAmount: program.referee_reward_amount,
            createdAt: program.created_at,
            updatedAt: program.updated_at,
          })
        }

        // Only get client status if user is authenticated
        if (!user) {
          setLoadingLoyalty(false)
          return
        }

        // Get client loyalty status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: status } = await (supabase as any)
          .from('client_loyalty_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('business_id', business.id)
          .single()

        if (status) {
          setLoyaltyStatus({
            id: status.id,
            clientId: status.client_id,
            businessId: status.business_id,
            userId: status.user_id,
            pointsBalance: status.points_balance,
            lifetimePoints: status.lifetime_points,
            visitCount: status.visit_count,
            currentTier: status.current_tier || 'bronze',
            referralCode: status.referral_code,
            createdAt: status.created_at,
            updatedAt: status.updated_at,
            lastPointsEarnedAt: status.last_points_earned_at,
            lastRewardRedeemedAt: status.last_reward_redeemed_at,
            referredByClientId: status.referred_by_client_id,
          })
        }
      } catch (error) {
        console.error('Error loading loyalty status:', error)
      } finally {
        setLoadingLoyalty(false)
      }
    }

    loadLoyaltyStatus()
  }, [business?.id, setBooking])

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

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false)
      return
    }

    setShowSlowLoadingHint(false)
    const timer = window.setTimeout(() => {
      setShowSlowLoadingHint(true)
    }, 8000)

    return () => window.clearTimeout(timer)
  }, [loading])

  if (loading) {
    return <BookingLoadingState showSlowHint={showSlowLoadingHint} />
  }

  if (error && !business) {
    const isNotFound = error === 'Negocio no encontrado'
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-[#0B0D14]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">{error}</h2>
            <p className="mt-2 text-zinc-500">
              {isNotFound
                ? 'Verifica la dirección del enlace e intenta de nuevo.'
                : 'Revisa tu conexión e intenta de nuevo.'}
            </p>
            <div className="mt-5 flex justify-center">
              <Button type="button" variant="outline" onClick={retryInitialData} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
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
        appointmentDateTime={booking.time?.datetime || null}
        business={business}
        clientId={createdClientId}
        claimToken={claimToken}
        clientEmail={booking.clientEmail}
        trackingToken={trackingToken}
        barberName={booking.barber?.name ?? null}
        pricing={bookingPricing}
        isClient={isClient}
      />
    )
  }

  const noBarbers = barbers.length === 0

  return (
    <div className="public-booking-theme min-h-screen bg-zinc-50 dark:bg-[#0B0D14] text-zinc-900 dark:text-white relative overflow-hidden">
      {/* Subtle mesh gradients to match dashboard language */}
      <div className="pointer-events-none absolute inset-0 opacity-20 hidden dark:block">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* Header */}
      {business && <BookingHeader business={business} isClient={isClient} />}

      {/* Client dashboard banner — dismissible, session-only */}
      {isClient && showDashboardBanner && (
        <div className="relative z-10 mx-auto max-w-2xl px-4 mt-3">
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 px-4 py-3 border border-blue-200 dark:border-blue-800">
            <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Tienes citas programadas
              </p>
              <a
                href="/mi-cuenta"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400"
              >
                Ver mi cuenta &rarr;
              </a>
            </div>
            <button
              type="button"
              onClick={() => setShowDashboardBanner(false)}
              className="shrink-0 rounded-lg p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <ProgressSteps currentStep={step} barberCount={barbers.length} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-6">
        {/* Loyalty Status Card - Shows if user is authenticated and has loyalty status */}
        {!loadingLoyalty && loyaltyStatus && loyaltyProgram && business && (
          <div className="mb-5">
            <ClientStatusCard
              status={loyaltyStatus}
              program={loyaltyProgram}
              businessName={business.name}
            />
          </div>
        )}

        {loadingLoyalty && (
          <div className="mb-5">
            <ClientStatusCardSkeleton />
          </div>
        )}

        {/* Loyalty Upsell Banner - Shows if user is NOT authenticated and there's an active program */}
        {!loadingLoyalty && !isAuthenticated && loyaltyProgram && business && (
          <div className="mb-5">
            <LoyaltyUpsellBanner
              program={loyaltyProgram}
              businessName={business.name}
              estimatedPoints={
                booking.service
                  ? Math.floor(booking.service.price * loyaltyProgram.pointsPerCurrencyUnit)
                  : 0
              }
              onCreateAccount={() => {
                window.location.href = '/register'
              }}
              onSignIn={() => {
                window.location.href = '/login'
              }}
            />
          </div>
        )}

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
            predictedDuration={slotMeta?.predictedDuration}
            onSelectDate={handleDateSelect}
            onSelectTime={handleTimeSelect}
            onBack={() => setStep(barbers.length > 1 ? 'barber' : 'service')}
          />
        )}

        {/* Step 4: Client Info */}
        {step === 'info' && booking.service && booking.date && booking.time && (
          <>
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
              discount={booking.time.discount}
              onChangeName={(value) => setBooking((prev) => ({ ...prev, clientName: value }))}
              onChangePhone={(value) => setBooking((prev) => ({ ...prev, clientPhone: value }))}
              onChangeEmail={(value) => setBooking((prev) => ({ ...prev, clientEmail: value }))}
              onChangeNotes={(value) => setBooking((prev) => ({ ...prev, notes: value }))}
              onSubmit={handleSubmit}
              onBack={() => setStep('datetime')}
            />
            {/* Subtle PWA install CTA — only on info step to avoid distracting from booking flow */}
            <div className="mt-4">
              <InstallAppCta variant="subtle" businessName={business.name} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
