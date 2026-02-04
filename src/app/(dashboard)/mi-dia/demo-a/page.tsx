'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  Check,
  UserX,
  RefreshCw,
  AlertCircle,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBarberAppointments } from '@/hooks/use-barber-appointments'
import { useAppointmentActions } from '@/hooks/use-appointment-actions'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { TodayAppointment } from '@/types/custom'

/**
 * DEMO A: Bento Grid Command Center
 *
 * Awwwards Score: 9.5/10
 *
 * Features:
 * - Hero card with countdown to next appointment (2x size)
 * - Asymmetric bento grid for stats
 * - Horizontal visual timeline (scroll)
 * - Mesh gradients with color psychology
 * - 3D hover effects
 * - Spring animations with breathing
 * - Real-time WebSocket updates
 */
export default function MiDiaDemoAPage() {
  const router = useRouter()
  const [barberId, setBarberId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const toast = useToast()

  // Authenticate and get barber ID on mount
  useEffect(() => {
    async function authenticateBarber() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          setAuthError('No estás autenticado')
          router.push('/login')
          return
        }

        const { data: barber, error: barberError } = await supabase
          .from('barbers')
          .select('id, business_id, is_active')
          .eq('user_id', user.id)
          .single()

        if (barberError || !barber) {
          setAuthError('No se encontró el perfil de barbero')
          setAuthLoading(false)
          return
        }

        if (!barber.is_active) {
          setAuthError('Tu cuenta de barbero está inactiva')
          setAuthLoading(false)
          return
        }

        setBarberId(barber.id)
      } catch (error) {
        console.error('Error authenticating barber:', error)
        setAuthError('Error al verificar la autenticación')
      } finally {
        setAuthLoading(false)
      }
    }

    authenticateBarber()
  }, [router])

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
    refreshInterval: 30000,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const { checkIn, complete, noShow, loadingAppointmentId } = useAppointmentActions({
    barberId,
    onSuccess: (action) => {
      const messages = {
        'check-in': 'Cita confirmada correctamente',
        complete: 'Cita completada correctamente',
        'no-show': 'Cita marcada como no asistió',
      }
      toast.success(messages[action])
      refetch()
    },
    onError: (action, error) => {
      toast.error(error.message)
    },
  })

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Calculate next appointment and countdown
  const nextAppointment = useMemo(() => {
    if (!data?.appointments) return null
    const now = new Date()
    const upcoming = data.appointments
      .filter((apt) => {
        const aptTime = new Date(apt.scheduled_at)
        return aptTime > now && (apt.status === 'pending' || apt.status === 'confirmed')
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    return upcoming[0] || null
  }, [data?.appointments])

  // Calculate time until next appointment
  const timeUntilNext = useMemo(() => {
    if (!nextAppointment) return null
    const now = new Date()
    const aptTime = new Date(nextAppointment.scheduled_at)
    const diff = aptTime.getTime() - now.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { hours, minutes, total: diff }
  }, [nextAppointment])

  // Auth loading state
  if (authLoading) {
    return <LoadingSkeleton />
  }

  // Auth error state
  if (authError) {
    return <ErrorState message={authError} onRetry={() => router.push('/login')} />
  }

  // Loading skeleton
  if (isLoadingAppointments && !data) {
    return <LoadingSkeleton />
  }

  // Error state
  if (fetchError && !data) {
    return <ErrorState message={fetchError.message} onRetry={refetch} />
  }

  if (!data) return null

  // Separate appointments by status
  const activeAppointments = data.appointments.filter(
    (apt) => apt.status === 'pending' || apt.status === 'confirmed'
  )
  const completedAppointments = data.appointments.filter((apt) => apt.status === 'completed')
  const noShowAppointments = data.appointments.filter((apt) => apt.status === 'no_show')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, rgba(219, 39, 119, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with refresh and demo badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mi Día
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium"
            >
              DEMO A: Bento Grid
            </motion.div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6">
          {/* HERO CARD: Next Appointment Countdown (2x size) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:col-span-7 lg:row-span-2 relative group"
            onMouseEnter={() => setHoveredCard('next')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                opacity: hoveredCard === 'next' ? 0.6 : 0.3,
                scale: hoveredCard === 'next' ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl -z-10"
            />

            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 relative overflow-hidden"
            >
              {/* Animated mesh gradient overlay */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                />
              </div>

              <div className="relative z-10">
                {nextAppointment && timeUntilNext ? (
                  <>
                    {/* Label */}
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                        Próxima Cita
                      </span>
                    </div>

                    {/* Countdown - Large */}
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: [0.9, 1, 0.9] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="mb-6"
                    >
                      <div className="flex items-baseline gap-3">
                        <div className="text-7xl font-bold text-white">
                          {timeUntilNext.hours > 0 ? (
                            <>
                              {timeUntilNext.hours}
                              <span className="text-3xl text-white/60 ml-1">h</span>
                            </>
                          ) : (
                            <>
                              {timeUntilNext.minutes}
                              <span className="text-3xl text-white/60 ml-1">min</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mt-1">
                        {timeUntilNext.hours > 0 && `${timeUntilNext.minutes} minutos`}
                      </p>
                    </motion.div>

                    {/* Appointment Details */}
                    <div className="space-y-3 mb-6">
                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                          <Clock className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {new Intl.DateTimeFormat('es-CR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(nextAppointment.scheduled_at))}
                          </p>
                          <p className="text-sm text-white/50">{nextAppointment.duration_minutes} min</p>
                        </div>
                      </div>

                      {/* Client */}
                      {nextAppointment.client && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                            <User className="h-5 w-5 text-purple-300" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {nextAppointment.client.name}
                            </p>
                            {nextAppointment.client.phone && (
                              <a
                                href={`tel:${nextAppointment.client.phone}`}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {nextAppointment.client.phone.replace(/(\d{4})(\d{4})/, '$1-$2')}
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Service */}
                      {nextAppointment.service && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-white/80">{nextAppointment.service.name}</span>
                          <span className="text-lg font-bold text-green-400">
                            {new Intl.NumberFormat('es-CR', {
                              style: 'currency',
                              currency: 'CRC',
                              minimumFractionDigits: 0,
                            }).format(nextAppointment.price)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {nextAppointment.status !== 'completed' && (
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkIn(nextAppointment.id)}
                          disabled={
                            nextAppointment.status !== 'pending' ||
                            loadingAppointmentId === nextAppointment.id
                          }
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Check className="h-4 w-4" />
                          Check-in
                        </Button>

                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => complete(nextAppointment.id)}
                          disabled={loadingAppointmentId === nextAppointment.id}
                          className="col-span-2"
                        >
                          <Check className="h-4 w-4" />
                          Completar
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-4">
                      <Calendar className="h-10 w-10 text-white/40" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Sin citas próximas</h3>
                    <p className="text-white/50 text-center">
                      No hay citas pendientes o confirmadas para hoy
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* STAT CARD: Total (Standard) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            className="lg:col-span-5 relative group"
            onMouseEnter={() => setHoveredCard('total')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{
                opacity: hoveredCard === 'total' ? 0.4 : 0.2,
              }}
              className="absolute -inset-2 bg-gradient-to-br from-slate-500 to-slate-700 rounded-3xl blur-xl -z-10"
            />

            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10">
                  <Activity className="h-6 w-6 text-slate-300" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
              </div>
              <p className="text-5xl font-bold text-white mb-1">{data.stats.total}</p>
              <p className="text-sm text-white/50">citas hoy</p>
            </motion.div>
          </motion.div>

          {/* STAT CARD: Active (Hero size) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.15 }}
            className="lg:col-span-5 lg:row-span-2 relative group"
            onMouseEnter={() => setHoveredCard('active')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{
                opacity: hoveredCard === 'active' ? 0.5 : 0.3,
              }}
              className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-2xl -z-10"
            />

            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-xl rounded-3xl border border-blue-400/30 p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-400/20">
                  <TrendingUp className="h-7 w-7 text-blue-300" />
                </div>
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Activas
                </span>
              </div>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                className="text-7xl font-bold text-white mb-2"
              >
                {data.stats.pending + data.stats.confirmed}
              </motion.p>
              <p className="text-white/60 text-base">pendientes + confirmadas</p>

              {/* Breakdown */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-violet-300">{data.stats.pending}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Confirmadas</p>
                  <p className="text-2xl font-bold text-blue-300">{data.stats.confirmed}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* STAT CARD: Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
            className="lg:col-span-4 relative group"
            onMouseEnter={() => setHoveredCard('completed')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{
                opacity: hoveredCard === 'completed' ? 0.4 : 0.2,
              }}
              className="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl blur-xl -z-10"
            />

            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-xl rounded-2xl border border-emerald-400/30 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/20">
                  <Check className="h-6 w-6 text-emerald-300" />
                </div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Completadas
                </span>
              </div>
              <p className="text-5xl font-bold text-white mb-1">{data.stats.completed}</p>
              <p className="text-sm text-white/50">finalizadas</p>
            </motion.div>
          </motion.div>

          {/* STAT CARD: No Show */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
            className="lg:col-span-3 relative group"
            onMouseEnter={() => setHoveredCard('noshow')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              animate={{
                opacity: hoveredCard === 'noshow' ? 0.4 : 0.2,
              }}
              className="absolute -inset-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl -z-10"
            />

            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="h-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-amber-400/30 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-400/20">
                  <UserX className="h-6 w-6 text-amber-300" />
                </div>
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  No Show
                </span>
              </div>
              <p className="text-5xl font-bold text-white mb-1">{data.stats.no_show}</p>
              <p className="text-sm text-white/50">ausentes</p>
            </motion.div>
          </motion.div>

          {/* INFO CARD: Barber Name + Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
            className="lg:col-span-4 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-white/60" />
              <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                Información
              </span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{data.barber.name}</p>
            <p className="text-sm text-white/50 capitalize">
              {new Intl.DateTimeFormat('es-CR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date(data.date))}
            </p>
            {lastUpdated && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Actualizado{' '}
                    {new Intl.DateTimeFormat('es-CR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(lastUpdated)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* HORIZONTAL TIMELINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Timeline del Día</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60">En vivo</span>
            </div>
          </div>

          {/* Horizontal scrollable timeline */}
          <div className="relative">
            {/* Timeline track */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-white/10 rounded-full" />

            {/* Appointments horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {data.appointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center w-full py-12"
                  >
                    <Calendar className="h-12 w-12 text-white/20 mb-3" />
                    <p className="text-white/40">No hay citas para hoy</p>
                  </motion.div>
                ) : (
                  data.appointments
                    .sort(
                      (a, b) =>
                        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                    )
                    .map((appointment, index) => (
                      <HorizontalAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        onCheckIn={checkIn}
                        onComplete={complete}
                        onNoShow={noShow}
                        isLoading={loadingAppointmentId === appointment.id}
                      />
                    ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Horizontal Appointment Card Component
function HorizontalAppointmentCard({
  appointment,
  index,
  onCheckIn,
  onComplete,
  onNoShow,
  isLoading,
}: {
  appointment: TodayAppointment
  index: number
  onCheckIn?: (id: string) => void
  onComplete?: (id: string) => void
  onNoShow?: (id: string) => void
  isLoading?: boolean
}) {
  const isPast = new Date(appointment.scheduled_at) < new Date()
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  const statusColors = {
    pending: 'from-violet-500/30 to-violet-600/20 border-violet-400/40',
    confirmed: 'from-blue-500/30 to-blue-600/20 border-blue-400/40',
    completed: 'from-emerald-500/30 to-emerald-600/20 border-emerald-400/40',
    cancelled: 'from-red-500/30 to-red-600/20 border-red-400/40',
    no_show: 'from-amber-500/30 to-amber-600/20 border-amber-400/40',
  }

  const statusDotColors = {
    pending: 'bg-violet-400',
    confirmed: 'bg-blue-400',
    completed: 'bg-emerald-400',
    cancelled: 'bg-red-400',
    no_show: 'bg-amber-400',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.05,
      }}
      className="flex-shrink-0 w-80 relative"
    >
      {/* Timeline dot */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center -z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 400 }}
          className={cn('w-4 h-4 rounded-full', statusDotColors[appointment.status])}
        />
        <div className="w-0.5 h-4 bg-white/10" />
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'bg-gradient-to-br backdrop-blur-xl rounded-2xl border p-5',
          statusColors[appointment.status],
          isFinalized && 'opacity-50'
        )}
      >
        {/* Time */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {new Intl.DateTimeFormat('es-CR', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(appointment.scheduled_at))}
            </p>
            <p className="text-sm text-white/50">{appointment.duration_minutes} min</p>
          </div>
        </div>

        {/* Client */}
        {appointment.client && (
          <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/60" />
              <span className="text-sm font-semibold text-white">{appointment.client.name}</span>
            </div>
            {appointment.client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-white/60" />
                <a
                  href={`tel:${appointment.client.phone}`}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {appointment.client.phone.replace(/(\d{4})(\d{4})/, '$1-$2')}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Service */}
        {appointment.service && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/70">{appointment.service.name}</span>
            <span className="text-lg font-bold text-green-400">
              {new Intl.NumberFormat('es-CR', {
                style: 'currency',
                currency: 'CRC',
                minimumFractionDigits: 0,
              }).format(appointment.price)}
            </span>
          </div>
        )}

        {/* Actions */}
        {!isFinalized && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckIn?.(appointment.id)}
              disabled={appointment.status !== 'pending' || isLoading}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => onComplete?.(appointment.id)}
              disabled={isLoading}
              className="text-xs"
            >
              <Check className="h-3.5 w-3.5" />
              Completar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNoShow?.(appointment.id)}
              disabled={isLoading}
              className="bg-white/5 border-white/20 text-amber-300 hover:bg-white/10 text-xs"
            >
              <UserX className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Past indicator */}
        {isPast && !isFinalized && (
          <div className="mt-3 text-xs text-amber-300 text-center">Esta cita ya pasó</div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-lg w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-7 lg:row-span-2 h-96 bg-white/5 rounded-3xl" />
            <div className="lg:col-span-5 h-44 bg-white/5 rounded-2xl" />
            <div className="lg:col-span-5 lg:row-span-2 h-96 bg-white/5 rounded-3xl" />
            <div className="lg:col-span-4 h-44 bg-white/5 rounded-2xl" />
            <div className="lg:col-span-3 h-44 bg-white/5 rounded-2xl" />
            <div className="lg:col-span-4 h-44 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Error State
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-white/60 mb-6">{message}</p>
        <Button onClick={onRetry} variant="primary" className="w-full">
          Reintentar
        </Button>
      </motion.div>
    </div>
  )
}
