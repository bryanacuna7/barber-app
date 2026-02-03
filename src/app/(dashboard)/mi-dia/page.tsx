'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useBarberAppointments } from '@/hooks/use-barber-appointments'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { MiDiaHeader } from '@/components/barber/mi-dia-header'
import { MiDiaTimeline } from '@/components/barber/mi-dia-timeline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

/**
 * Mi Día - Staff View Page
 *
 * Shows today's appointments for the authenticated barber.
 * Includes quick actions for check-in, complete, and no-show.
 *
 * Features:
 * - Real-time updates with optimistic UI
 * - Pull-to-refresh
 * - Auto-refresh every 30 seconds
 * - Loading skeletons
 * - Error handling with retry
 */
export default function MiDiaPage() {
  // TODO: Get barberId from auth context or session
  // For now, using placeholder - implement auth integration
  const [barberId] = useState<string>('BARBER_ID_PLACEHOLDER')

  const toast = useToast()

  const {
    data,
    isLoading: isLoadingAppointments,
    error: fetchError,
    refetch,
    lastUpdated,
  } = useBarberAppointments({
    barberId,
    enabled: !!barberId,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

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

      // Refetch appointments to update the list
      refetch()
    },
    onError: (action, error) => {
      // Show error message
      toast.error(error.message)
    },
  })

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Loading skeleton
  if (isLoadingAppointments && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
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

  // Error state
  if (fetchError && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Error al cargar citas
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{fetchError.message}</p>
          <Button onClick={refetch} variant="primary" className="w-full">
            Reintentar
          </Button>
        </motion.div>
      </div>
    )
  }

  // No data (shouldn't happen, but handle it)
  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <MiDiaHeader
        barberName={data.barber.name}
        date={data.date}
        stats={data.stats}
        lastUpdated={lastUpdated}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
            aria-label="Actualizar citas"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Actualizar
          </Button>
        </div>

        {/* Timeline */}
        <MiDiaTimeline
          appointments={data.appointments}
          onCheckIn={checkIn}
          onComplete={complete}
          onNoShow={noShow}
          loadingAppointmentId={loadingAppointmentId}
        />
      </main>
    </div>
  )
}
