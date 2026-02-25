'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, AlertCircle, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBarberDayAppointments } from '@/hooks/queries/useAppointments'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { MiDiaHeader } from '@/components/barber/mi-dia-header'
import { MiDiaTimeline } from '@/components/barber/mi-dia-timeline'
import { FocusMode } from '@/components/barber/focus-mode'
import { WalkInSheet } from '@/components/barber/walk-in-sheet'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import { OnboardingChecklist } from '@/components/barber/onboarding-checklist'
import { getStaffPermissions, mergePermissions } from '@/lib/auth/roles'
import type { TodayAppointment } from '@/types/custom'

/**
 * Mi Día - Staff View Page (Modernized with React Query + Real-time)
 *
 * Phase 0 Week 5-6 Data Integration:
 * - Uses React Query for caching and state management
 * - Real-time WebSocket updates with automatic cache invalidation
 * - Error boundaries for graceful degradation
 * - Feature flag controlled rollout
 *
 * Performance: 95%+ bandwidth reduction vs polling + instant cache updates
 */
function MiDiaPageContent() {
  const router = useRouter()
  const [barberId, setBarberId] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    ('cash' | 'sinpe' | 'card')[] | null
  >(null)
  const [businessName, setBusinessName] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [barberName, setBarberName] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [canCreateCitas, setCanCreateCitas] = useState(true) // default per DEFAULT_STAFF_PERMISSIONS
  const [isWalkInSheetOpen, setIsWalkInSheetOpen] = useState(false)

  const toast = useToast()

  // Authenticate and get barber ID on mount
  useEffect(() => {
    async function authenticateBarber() {
      try {
        const supabase = createClient()

        // 1. Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          setAuthError('No estás autenticado')
          router.push('/login')
          return
        }

        // 2. Get barber records for this user (supports multiple rows safely)
        const { data: barberRows, error: barberError } = await supabase
          .from('barbers')
          .select('id, business_id, is_active, name, photo_url')
          .eq('user_id', user.id)
        if (barberError || !barberRows || barberRows.length === 0) {
          setAuthError('No se encontró el perfil de miembro del equipo')
          setAuthLoading(false)
          return
        }

        const activeBarbers = barberRows.filter((row) => row.is_active !== false)
        if (activeBarbers.length === 0) {
          setAuthError('Tu cuenta de miembro del equipo está inactiva')
          setAuthLoading(false)
          return
        }

        // Prefer barber row for the owner's own business when available
        const { data: ownedBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        const barber =
          (ownedBusiness
            ? activeBarbers.find((row) => row.business_id === ownedBusiness.id)
            : undefined) ?? activeBarbers[0]

        // 4. Fetch business payment methods
        const { data: bizData, error: bizError } = (await supabase
          .from('businesses')
          .select('name, accepted_payment_methods')
          .eq('id', barber.business_id)
          .single()) as { data: Record<string, unknown> | null; error: unknown }

        if (bizError || !bizData) {
          // Keep null → card falls back to showing all payment methods (safe default)
          console.error('Error fetching payment methods:', bizError)
        } else {
          if (typeof bizData.name === 'string') {
            setBusinessName(bizData.name)
          }
          if (Array.isArray(bizData.accepted_payment_methods)) {
            setAcceptedPaymentMethods(
              bizData.accepted_payment_methods as ('cash' | 'sinpe' | 'card')[]
            )
          }
        }

        // 5. Fetch staff permissions for can_create_citas (P0)
        const isOwnerBarber = ownedBusiness?.id === barber.business_id
        if (!isOwnerBarber) {
          // Only fetch permissions for non-owner barbers (owners always have all permissions)
          const businessPerms = getStaffPermissions((bizData as any)?.staff_permissions)
          const { data: barberPermsRow } = await supabase
            .from('barbers')
            .select('custom_permissions')
            .eq('id', barber.id)
            .single()
          const effectivePerms = mergePermissions(
            businessPerms,
            (barberPermsRow as any)?.custom_permissions
          )
          setCanCreateCitas(effectivePerms.can_create_citas)
        }
        // Owners always have can_create_citas = true (default)

        // 6. Set barber ID and business ID
        setBarberId(barber.id)
        setBusinessId(barber.business_id)
        setBarberName((barber as any).name || '')
        setHasPhoto(!!(barber as any).photo_url)

        // 6. Detect first login — show onboarding if no photo
        const dismissed = localStorage.getItem(`onboarding_dismissed_${barber.id}`)
        if (!dismissed && !(barber as any).photo_url) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error authenticating barber:', error)
        setAuthError('Error al verificar la autenticación')
      } finally {
        setAuthLoading(false)
      }
    }

    authenticateBarber()
  }, [router])

  // React Query hook for appointments data
  const {
    data,
    isLoading: isLoadingAppointments,
    error: fetchError,
    refetch,
  } = useBarberDayAppointments(barberId)

  // Real-time WebSocket subscription (automatic cache invalidation)
  useRealtimeAppointments({
    businessId: businessId || '',
    enabled: !!businessId,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [focusAppointmentId, setFocusAppointmentId] = useState<string | null>(null)

  const { checkIn, complete, noShow, loadingAppointmentId } = useAppointmentActions({
    barberId,
    onSuccess: (action) => {
      // Show success message
      const messages = {
        'check-in': 'Cita confirmada correctamente',
        complete: 'Cita completada correctamente',
        'no-show': 'Cita marcada como no asistió',
      }
      toast.success(messages[action])

      // Auto-enter focus mode after check-in
      if (action === 'check-in') {
        // The appointment ID was passed to checkIn — find it from loading state
        // We'll set it in the wrapped checkIn below
      }

      // Refetch will happen automatically via real-time hook
      // But we can force it for immediate feedback
      refetch()
    },
    onError: (action, error) => {
      // Show error message
      toast.error(error.message)
    },
  })

  // Wrapped checkIn that auto-enters focus mode on success
  const handleCheckIn = useCallback(
    (appointmentId: string) => {
      checkIn(appointmentId)
      // Optimistically enter focus mode — if checkIn fails, the appointment
      // won't be confirmed and the auto-exit effect below will clear focus
      setFocusAppointmentId(appointmentId)
    },
    [checkIn]
  )

  // Auto-exit focus mode when appointment is no longer in-progress
  useEffect(() => {
    if (!focusAppointmentId || !data?.appointments) return
    const apt = data.appointments.find((a) => a.id === focusAppointmentId)
    if (!apt || apt.status !== 'confirmed' || !apt.started_at) {
      // Appointment completed, cancelled, or not found — exit focus
      // Small delay to let the completion animation show
      const timer = setTimeout(() => setFocusAppointmentId(null), 300)
      return () => clearTimeout(timer)
    }
  }, [focusAppointmentId, data?.appointments])

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-5">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 mb-3" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Error de Autenticación
          </h2>
          <p className="text-sm text-muted mb-6">{authError}</p>
          <Button onClick={() => router.push('/login')} variant="primary" className="w-full">
            Volver al Inicio de Sesión
          </Button>
        </motion.div>
      </div>
    )
  }

  // Loading skeleton (first load)
  if (isLoadingAppointments && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-5">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 mb-3" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry (uses new QueryError component)
  if (fetchError && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
        <QueryError error={fetchError} onRetry={refetch} />
      </div>
    )
  }

  // No data (shouldn't happen, but handle it)
  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header - Wrapped in error boundary */}
      <ComponentErrorBoundary
        fallbackTitle="Error en el encabezado"
        fallbackDescription="Ocurrió un error al cargar las estadísticas del día"
      >
        <MiDiaHeader
          barberName={data.barber.name}
          date={data.date}
          stats={data.stats}
          lastUpdated={new Date()}
        />
      </ComponentErrorBoundary>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-3 sm:px-4 py-5 sm:py-6">
        {/* Onboarding Checklist */}
        {showOnboarding && barberId && (
          <div className="mb-5">
            <OnboardingChecklist
              barberName={barberName}
              hasPhoto={hasPhoto}
              hasPushSubscription={false}
              onDismiss={() => {
                setShowOnboarding(false)
                if (barberId) {
                  localStorage.setItem(`onboarding_dismissed_${barberId}`, '1')
                }
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {canCreateCitas && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWalkInSheetOpen(true)}
              className="gap-2"
              aria-label="Agregar walk-in"
              data-testid="walk-in-button"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Walk-in
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
            aria-label="Actualizar citas"
            data-testid="refresh-button"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Actualizar
          </Button>
        </div>

        {/* Timeline - Wrapped in error boundary */}
        <ComponentErrorBoundary
          fallbackTitle="Error en el timeline"
          fallbackDescription="Ocurrió un error al mostrar las citas. Las acciones están deshabilitadas temporalmente."
        >
          <MiDiaTimeline
            appointments={data.appointments}
            onCheckIn={handleCheckIn}
            onComplete={complete}
            onNoShow={noShow}
            onFocusMode={(id) => setFocusAppointmentId(id)}
            loadingAppointmentId={loadingAppointmentId}
            acceptedPaymentMethods={acceptedPaymentMethods ?? undefined}
            barberName={data.barber.name}
            businessName={businessName}
          />
        </ComponentErrorBoundary>
      </main>

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
                onComplete={complete}
                onNoShow={noShow}
                onDismiss={() => setFocusAppointmentId(null)}
                isLoading={loadingAppointmentId === apt.id}
                acceptedPaymentMethods={acceptedPaymentMethods ?? undefined}
              />
            )
          })()}
      </AnimatePresence>
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
