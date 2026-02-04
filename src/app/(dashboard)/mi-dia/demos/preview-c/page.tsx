'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  Check,
  UserX,
  RefreshCw,
  Play,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowLeft,
  Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { TodayAppointment } from '@/types/custom'
import { mockMiDiaData } from '../mock-data'

/**
 * PREVIEW C: Timeline Cinema (Mock Data)
 *
 * No authentication required - uses mock data for preview
 */
export default function PreviewCPage() {
  const router = useRouter()
  const toast = useToast()
  const [viewMode, setViewMode] = useState<'day' | 'timeline'>('timeline')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { scrollXProgress } = useScroll({
    container: scrollContainerRef,
  })

  const data = mockMiDiaData

  // Mock action handlers
  const handleCheckIn = (id: string) => {
    toast.success('Check-in exitoso (demo)')
  }

  const handleComplete = (id: string) => {
    toast.success('Cita completada (demo)')
  }

  const handleNoShow = (id: string) => {
    toast.success('Marcada como no show (demo)')
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Actualizado (demo)')
    }, 1000)
  }

  // Find next upcoming appointment
  const nextAppointment = useMemo(() => {
    const now = new Date()
    const upcoming = data.appointments
      .filter((apt) => {
        const aptTime = new Date(apt.scheduled_at)
        return aptTime > now && (apt.status === 'pending' || apt.status === 'confirmed')
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    return upcoming[0] || null
  }, [])

  // Current time position (8am - 8pm = 12 hours)
  const currentTimePosition = useMemo(() => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()

    if (hours < 8) return 0
    if (hours >= 20) return 100

    const totalMinutes = (hours - 8) * 60 + minutes
    const totalWorkMinutes = 12 * 60
    return (totalMinutes / totalWorkMinutes) * 100
  }, [])

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top Bar - Cinematic Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-shrink-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700/50 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/mi-dia/demos')}
              className="text-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(139, 92, 246, 0.3)',
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
            >
              <Play className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">Mi Día - Timeline Cinema</h1>
              <p className="text-sm text-zinc-400">{data.barber.name}</p>
            </div>
            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
              DEMO C (Preview)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-lg">
              <button
                onClick={() => setViewMode('timeline')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-all',
                  viewMode === 'timeline'
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-all',
                  viewMode === 'day'
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                )}
              >
                Vista Día
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-zinc-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Next Appointment */}
      {nextAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-6 py-8 relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold text-blue-100 uppercase tracking-wider">
                Próxima Cita
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Time - Large */}
                <div>
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="text-6xl font-bold text-white mb-1"
                  >
                    {new Intl.DateTimeFormat('es-CR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(nextAppointment.scheduled_at))}
                  </motion.p>
                  <p className="text-blue-100 text-sm">{nextAppointment.duration_minutes} minutos</p>
                </div>

                {/* Client Info */}
                {nextAppointment.client && (
                  <div className="border-l border-white/20 pl-8">
                    <p className="text-2xl font-bold text-white mb-1">
                      {nextAppointment.client.name}
                    </p>
                    <p className="text-blue-100">
                      {nextAppointment.service?.name || 'Sin servicio'}
                    </p>
                    {nextAppointment.client.phone && (
                      <span className="text-sm text-blue-200 flex items-center gap-2 mt-2">
                        <Phone className="h-4 w-4" />
                        {nextAppointment.client.phone.replace(/(\d{4})(\d{4})/, '$1-$2')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleCheckIn(nextAppointment.id)}
                  disabled={nextAppointment.status !== 'pending'}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Check-in
                </Button>

                <Button
                  variant="success"
                  size="lg"
                  onClick={() => handleComplete(nextAppointment.id)}
                  className="shadow-lg shadow-emerald-500/20"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Completar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <StatPill label="Total" value={data.stats.total} color="bg-zinc-700" />
              <StatPill
                label="Activas"
                value={data.stats.pending + data.stats.confirmed}
                color="bg-blue-500"
              />
              <StatPill label="Completadas" value={data.stats.completed} color="bg-emerald-500" />
              <StatPill label="No Show" value={data.stats.no_show} color="bg-amber-500" />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                {new Intl.DateTimeFormat('es-CR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TIMELINE - Cinematic Horizontal Scroll */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-zinc-950 to-black">
        {/* Time markers background */}
        <div className="absolute top-0 left-0 right-0 h-24 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex h-full px-6">
            {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
              <div
                key={hour}
                className="flex-1 border-l border-zinc-800 flex items-center justify-center relative"
              >
                <span className="text-xs text-zinc-600 font-mono">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Current time indicator - animated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20"
            style={{
              left: `${currentTimePosition}%`,
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500/30"
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-500 rounded text-xs text-white font-semibold whitespace-nowrap">
              {new Intl.DateTimeFormat('es-CR', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date())}
            </div>
          </motion.div>
        </div>

        {/* Horizontal scrollable timeline */}
        <div
          ref={scrollContainerRef}
          className="h-full pt-28 px-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          <div className="inline-flex gap-8 min-w-full pb-6">
            <AnimatePresence mode="popLayout">
              {data.appointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <Calendar className="h-16 w-16 text-zinc-700 mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                    No hay citas programadas
                  </h3>
                  <p className="text-zinc-600">Disfruta tu día libre</p>
                </motion.div>
              ) : (
                data.appointments
                  .sort(
                    (a, b) =>
                      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                  )
                  .map((appointment, index) => {
                    // Calculate position based on time
                    const aptTime = new Date(appointment.scheduled_at)
                    const hours = aptTime.getHours()
                    const minutes = aptTime.getMinutes()
                    const totalMinutes = (hours - 8) * 60 + minutes
                    const position = (totalMinutes / (12 * 60)) * 100

                    return (
                      <CinematicAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        index={index}
                        scrollProgress={scrollXProgress}
                        position={position}
                        onCheckIn={handleCheckIn}
                        onComplete={handleComplete}
                        onNoShow={handleNoShow}
                      />
                    )
                  })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll Navigation Hints */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-full">
          <ChevronLeft className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-medium">Desliza para explorar</span>
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </div>
      </div>
    </div>
  )
}

// Cinematic Appointment Card with scroll animations
function CinematicAppointmentCard({
  appointment,
  index,
  scrollProgress,
  position,
  onCheckIn,
  onComplete,
  onNoShow,
}: {
  appointment: TodayAppointment
  index: number
  scrollProgress: any
  position: number
  onCheckIn: (id: string) => void
  onComplete: (id: string) => void
  onNoShow: (id: string) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isPast = new Date(appointment.scheduled_at) < new Date()
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  const [isHovered, setIsHovered] = useState(false)

  // Scroll-linked scale effect
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [0.95, 1, 0.95])
  const opacity = useTransform(scrollProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6])

  const statusStyles = {
    pending: {
      border: 'border-violet-500/50',
      glow: 'from-violet-500/20 to-violet-600/10',
      icon: 'bg-violet-500/20 text-violet-400',
    },
    confirmed: {
      border: 'border-blue-500/50',
      glow: 'from-blue-500/20 to-blue-600/10',
      icon: 'bg-blue-500/20 text-blue-400',
    },
    completed: {
      border: 'border-emerald-500/50',
      glow: 'from-emerald-500/20 to-emerald-600/10',
      icon: 'bg-emerald-500/20 text-emerald-400',
    },
    cancelled: {
      border: 'border-red-500/50',
      glow: 'from-red-500/20 to-red-600/10',
      icon: 'bg-red-500/20 text-red-400',
    },
    no_show: {
      border: 'border-amber-500/50',
      glow: 'from-amber-500/20 to-amber-600/10',
      icon: 'bg-amber-500/20 text-amber-400',
    },
  }

  const style = statusStyles[appointment.status]

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.05,
      }}
      style={{ scale, opacity }}
      className="flex-shrink-0 w-96 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection line to time marker */}
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-gradient-to-b from-zinc-700 to-transparent" />
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-900" />

      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'absolute -inset-3 bg-gradient-to-br rounded-3xl blur-2xl -z-10',
              style.glow
            )}
          />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'bg-zinc-900/90 backdrop-blur-xl rounded-2xl border-2 p-6 shadow-2xl',
          style.border,
          isFinalized && 'opacity-60'
        )}
      >
        {/* Time */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cn('flex items-center justify-center w-14 h-14 rounded-xl', style.icon)}>
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {new Intl.DateTimeFormat('es-CR', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(appointment.scheduled_at))}
            </p>
            <p className="text-sm text-zinc-500">{appointment.duration_minutes} minutos</p>
          </div>
        </div>

        {/* Client */}
        {appointment.client && (
          <div className="mb-6 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-zinc-500" />
              <p className="text-xl font-bold text-white">{appointment.client.name}</p>
            </div>
            {appointment.client.phone && (
              <span className="flex items-center gap-2 text-blue-400 ml-8">
                <Phone className="h-4 w-4" />
                <span>{appointment.client.phone.replace(/(\d{4})(\d{4})/, '$1-$2')}</span>
              </span>
            )}
          </div>
        )}

        {/* Service */}
        {appointment.service && (
          <div className="mb-6 flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Servicio</p>
              <p className="text-lg font-semibold text-white">{appointment.service.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">Precio</p>
              <p className="text-xl font-bold text-green-400">
                {new Intl.NumberFormat('es-CR', {
                  style: 'currency',
                  currency: 'CRC',
                  minimumFractionDigits: 0,
                }).format(appointment.price)}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {(appointment.client_notes || appointment.internal_notes) && (
          <div className="mb-6 p-4 bg-zinc-800/30 rounded-xl space-y-2">
            {appointment.client_notes && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Nota del cliente:</p>
                <p className="text-sm text-zinc-300">{appointment.client_notes}</p>
              </div>
            )}
            {appointment.internal_notes && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Nota interna:</p>
                <p className="text-sm text-zinc-300">{appointment.internal_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isFinalized && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckIn(appointment.id)}
              disabled={appointment.status !== 'pending'}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-xs"
            >
              <Check className="h-4 w-4" />
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => onComplete(appointment.id)}
              className="text-xs"
            >
              <Check className="h-4 w-4" />
              Completar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNoShow(appointment.id)}
              className="bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700 text-xs"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Past indicator */}
        {isPast && !isFinalized && (
          <div className="mt-3 text-xs text-amber-400 text-center">⏰ Cita pasada</div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Stat Pill Component
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
