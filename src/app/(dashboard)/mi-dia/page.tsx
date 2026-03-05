'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBarberDayAppointments } from '@/hooks/queries/useAppointments'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { usePaymentFlow } from '@/hooks/use-payment-flow'
import { computeDelays, groupByZone } from '@/lib/utils/appointment-helpers'
import { MiDiaHeader } from '@/components/barber/mi-dia-header'
import { MiDiaTimeline } from '@/components/barber/mi-dia-timeline'
import { MiDiaDetailSheet } from '@/components/barber/mi-dia-detail-sheet'
import { FocusMode } from '@/components/barber/focus-mode'
import { WalkInSheet } from '@/components/barber/walk-in-sheet'
import { PaymentMethodPickerSheet } from '@/components/barber/payment-method-picker-sheet'
import { AdvancePaymentVerifyModal } from '@/components/barber/advance-payment-verify'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import { OnboardingChecklist } from '@/components/barber/onboarding-checklist'
import { getStaffPermissions, mergePermissions, type StaffPermissions } from '@/lib/auth/roles'
import { useBusiness } from '@/contexts/business-context'
import type { TodayAppointment } from '@/types/custom'

type PaymentMethod = 'cash' | 'sinpe' | 'card'

/**
 * Mi Dia - Staff View Page (Mock E Redesign)
 *
 * Zone-based layout: NOW > Requires Action > Upcoming > Finalized
 * Centralized payment flow, single PaymentMethodPickerSheet instance.
 */
function MiDiaPageContent() {
  const router = useRouter()
  const { businessId, barberId: contextBarberId, isOwner } = useBusiness()
  const barberId = contextBarberId ?? null
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<PaymentMethod[] | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [barberName, setBarberName] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [canCreateCitas, setCanCreateCitas] = useState(true)
  const [isWalkInSheetOpen, setIsWalkInSheetOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null)
  const [focusAppointmentId, setFocusAppointmentId] = useState<string | null>(null)
  const [verifyPaymentApt, setVerifyPaymentApt] = useState<TodayAppointment | null>(null)

  const toast = useToast()

  // Load business + barber presentation data from dashboard context
  useEffect(() => {
    async function loadMiDiaContextData() {
      if (!businessId || !barberId) {
        setProfileError('No se encontró el perfil de miembro del equipo')
        setProfileLoading(false)
        return
      }

      try {
        const supabase = createClient()

        const [{ data: barberData, error: barberError }, { data: bizData, error: bizError }] =
          await Promise.all([
            supabase
              .from('barbers')
              .select('id, name, photo_url, custom_permissions')
              .eq('id', barberId)
              .maybeSingle(),
            supabase
              .from('businesses')
              .select('name, accepted_payment_methods, staff_permissions')
              .eq('id', businessId)
              .single(),
          ])

        if (barberError || !barberData) {
          setProfileError('No se encontró el perfil de miembro del equipo')
          return
        }

        if (bizError || !bizData) {
          console.error('Error loading business data for Mi Día:', bizError)
        } else {
          if (typeof bizData.name === 'string') setBusinessName(bizData.name)
          if (Array.isArray(bizData.accepted_payment_methods)) {
            setAcceptedPaymentMethods(bizData.accepted_payment_methods as PaymentMethod[])
          }
        }

        const barberRecord = barberData as Record<string, unknown>
        const bizRecord = bizData as Record<string, unknown>

        if (!isOwner) {
          const businessPerms = getStaffPermissions(bizRecord?.staff_permissions)
          const effectivePerms = mergePermissions(
            businessPerms,
            barberRecord?.custom_permissions as Partial<StaffPermissions> | undefined
          )
          setCanCreateCitas(effectivePerms.can_create_citas)
        } else {
          setCanCreateCitas(true)
        }

        setBarberName((barberRecord.name as string) || '')
        setHasPhoto(!!barberRecord.photo_url)

        const dismissed = localStorage.getItem(`onboarding_dismissed_${barberData.id}`)
        if (!dismissed && !barberRecord.photo_url) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error loading Mi Día context:', error)
        setProfileError('Error al cargar la información de Mi Día')
      } finally {
        setProfileLoading(false)
      }
    }

    loadMiDiaContextData()
  }, [businessId, barberId, isOwner])

  // React Query hook for appointments data
  const {
    data,
    isLoading: isLoadingAppointments,
    error: fetchError,
    refetch,
  } = useBarberDayAppointments(barberId)

  // Real-time WebSocket subscription
  useRealtimeAppointments({ businessId, enabled: !!businessId })

  const { checkIn, complete, noShow, loadingAppointmentId } = useAppointmentActions({
    barberId,
    onSuccess: (action) => {
      const messages = {
        'check-in': 'Cita iniciada correctamente',
        complete: 'Cita completada correctamente',
        'no-show': 'Cita marcada como no asistió',
      }
      toast.success(messages[action])

      if (action === 'complete' || action === 'no-show') {
        setFocusAppointmentId(null)
        setSelectedAppointment(null)
      }

      refetch()
    },
    onError: (_action, error) => {
      toast.error(error.message)
    },
  })

  // Centralized payment flow (P0 fix: single instance)
  const paymentFlow = usePaymentFlow({
    acceptedPaymentMethods: acceptedPaymentMethods ?? undefined,
    onComplete: (appointmentId, method) => complete(appointmentId, method),
  })

  // Wrapped checkIn that enters focus mode after success
  const handleCheckIn = useCallback(
    async (appointmentId: string) => {
      try {
        await checkIn(appointmentId)
        setFocusAppointmentId(appointmentId)
        setSelectedAppointment(null)
      } catch {
        // Error shown via onError toast
      }
    },
    [checkIn]
  )

  // Compute zones from appointments (pure helpers in page.tsx — P0 fix)
  const sortedAppointments = useMemo(
    () =>
      data?.appointments
        ? [...data.appointments].sort(
            (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          )
        : [],
    [data?.appointments]
  )

  const delayMap = useMemo(() => computeDelays(sortedAppointments), [sortedAppointments])
  const zones = useMemo(
    () => groupByZone(sortedAppointments, delayMap),
    [sortedAppointments, delayMap]
  )

  // Stats for header
  const completedCount = zones.finalized.completed.length
  const totalCount = sortedAppointments.length

  // Auto-exit focus mode when appointment is no longer in-progress
  useEffect(() => {
    if (!focusAppointmentId || !data?.appointments) return
    const apt = data.appointments.find((a) => a.id === focusAppointmentId)
    if (!apt || apt.status !== 'confirmed' || !apt.started_at) {
      const timer = setTimeout(() => setFocusAppointmentId(null), 300)
      return () => clearTimeout(timer)
    }
  }, [focusAppointmentId, data?.appointments])

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleOwnerOnlyOnboardingStep = useCallback(
    (path: string, featureLabel: string) => {
      if (!isOwner) {
        toast.info(
          `Este paso (${featureLabel}) lo configura la persona dueña del negocio desde Configuración.`
        )
        return
      }
      router.push(path)
    },
    [isOwner, router, toast]
  )

  const handlePhotoOnboardingStep = useCallback(() => {
    if (isOwner) {
      router.push('/barberos')
      return
    }
    router.push('/mi-dia/cuenta')
  }, [isOwner, router])

  // Find next non-finalized appointment for "Llega Antes" in detail sheet
  const nextUpcomingForSelected = useMemo(() => {
    if (!selectedAppointment) return null
    const idx = sortedAppointments.findIndex((a) => a.id === selectedAppointment.id)
    if (idx === -1) return null
    return (
      sortedAppointments
        .slice(idx + 1)
        .find(
          (a) => a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no_show'
        ) ?? null
    )
  }, [selectedAppointment, sortedAppointments])

  // PullToRefresh disabled check
  const pullToRefreshDisabled =
    !!focusAppointmentId ||
    isWalkInSheetOpen ||
    !!selectedAppointment ||
    paymentFlow.paymentSheetOpen

  // --- Loading / Error states ---

  if (profileLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
        <div className="px-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Error de Perfil</h2>
          <p className="text-sm text-muted">{profileError}</p>
        </motion.div>
      </div>
    )
  }

  if (isLoadingAppointments && !data) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
        <div className="px-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (fetchError && !data) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <QueryError error={fetchError} onRetry={refetch} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full text-center"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            No se pudieron cargar las citas
          </h2>
          <p className="text-sm text-muted mb-5">
            Intenta recargar para sincronizar los datos de Mi Día.
          </p>
          <Button onClick={() => refetch()} variant="primary" className="w-full">
            Reintentar
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Sticky compact header */}
      <ComponentErrorBoundary
        fallbackTitle="Error en el encabezado"
        fallbackDescription="Ocurrió un error al cargar las estadísticas del día"
      >
        <MiDiaHeader
          barberName={data.barber.name}
          date={data.date}
          completedCount={completedCount}
          totalCount={totalCount}
          canCreateCitas={canCreateCitas}
          onWalkIn={() => setIsWalkInSheetOpen(true)}
        />
      </ComponentErrorBoundary>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-5">
        {/* Onboarding Checklist */}
        {showOnboarding && barberId && (
          <div className="mb-4">
            <OnboardingChecklist
              barberName={barberName}
              hasPhoto={hasPhoto}
              hasPushSubscription={false}
              onOpenPhotoSettings={handlePhotoOnboardingStep}
              onOpenScheduleSettings={() =>
                handleOwnerOnlyOnboardingStep('/configuracion/horario', 'horario')
              }
              onDismiss={() => {
                setShowOnboarding(false)
                if (barberId) {
                  localStorage.setItem(`onboarding_dismissed_${barberId}`, '1')
                }
              }}
            />
          </div>
        )}

        {/* Timeline with zones */}
        <ComponentErrorBoundary
          fallbackTitle="Error en el timeline"
          fallbackDescription="Ocurrió un error al mostrar las citas."
        >
          <PullToRefresh onRefresh={handleRefresh} disabled={pullToRefreshDisabled}>
            <MiDiaTimeline
              zones={zones}
              delayMap={delayMap}
              canCreateCitas={canCreateCitas}
              onCheckIn={handleCheckIn}
              onComplete={paymentFlow.handleCompleteClick}
              onNoShow={noShow}
              onFocusMode={(id) => setFocusAppointmentId(id)}
              onSelect={(apt) => setSelectedAppointment(apt)}
              onWalkIn={() => setIsWalkInSheetOpen(true)}
              loadingAppointmentId={loadingAppointmentId}
            />
          </PullToRefresh>
        </ComponentErrorBoundary>
      </main>

      {/* Detail Sheet */}
      <MiDiaDetailSheet
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null)
        }}
        onCheckIn={handleCheckIn}
        onComplete={paymentFlow.handleCompleteClick}
        onNoShow={noShow}
        onFocusMode={(id) => {
          setSelectedAppointment(null)
          setFocusAppointmentId(id)
        }}
        onVerifyPayment={(id) => {
          const apt = data.appointments.find((a) => a.id === id) ?? null
          setVerifyPaymentApt(apt)
        }}
        nextAppointment={nextUpcomingForSelected}
        barberName={data.barber.name}
        businessName={businessName}
        estimatedDelay={selectedAppointment ? (delayMap.get(selectedAppointment.id) ?? 0) : 0}
        isLoading={selectedAppointment ? loadingAppointmentId === selectedAppointment.id : false}
      />

      {/* Walk-in Sheet */}
      {barberId && businessId && (
        <WalkInSheet
          open={isWalkInSheetOpen}
          onOpenChange={setIsWalkInSheetOpen}
          barberId={barberId}
          businessId={businessId}
          onCreated={(appointment: TodayAppointment, mode: 'queue' | 'start_now') => {
            if (mode === 'start_now') {
              setFocusAppointmentId(appointment.id)
            }
            refetch()
          }}
        />
      )}

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusAppointmentId &&
          (() => {
            const apt = data.appointments.find((a) => a.id === focusAppointmentId)
            if (!apt || apt.status !== 'confirmed' || !apt.started_at) return null
            return (
              <FocusMode
                key={apt.id}
                appointment={apt}
                onComplete={paymentFlow.handleCompleteClick}
                onDismiss={() => setFocusAppointmentId(null)}
                onWalkIn={canCreateCitas ? () => setIsWalkInSheetOpen(true) : undefined}
                isLoading={loadingAppointmentId === apt.id}
              />
            )
          })()}
      </AnimatePresence>

      {/* SINGLE payment picker instance (P0 fix) */}
      <PaymentMethodPickerSheet
        open={paymentFlow.paymentSheetOpen}
        onOpenChange={paymentFlow.setPaymentSheetOpen}
        options={paymentFlow.activePaymentOptions}
        onSelect={paymentFlow.handlePaymentSelect}
      />

      {/* Advance Payment Verification Modal */}
      {verifyPaymentApt && (
        <AdvancePaymentVerifyModal
          appointmentId={verifyPaymentApt.id}
          proofChannel={verifyPaymentApt.proof_channel || 'whatsapp'}
          basePrice={verifyPaymentApt.base_price_snapshot ?? undefined}
          discountPct={verifyPaymentApt.discount_pct_snapshot ?? undefined}
          finalPrice={verifyPaymentApt.final_price_snapshot ?? undefined}
          isOpen={!!verifyPaymentApt}
          onClose={() => setVerifyPaymentApt(null)}
          onVerified={() => {
            setVerifyPaymentApt(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}

/**
 * Mi Día Page with top-level error boundary
 */
export default function MiDiaPage() {
  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Mi Día"
      fallbackDescription="Ocurrió un error inesperado. Por favor recarga la página."
      showReset
    >
      <MiDiaPageContent />
    </ComponentErrorBoundary>
  )
}
