'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight,
  Edit2,
  X as XIcon,
  Search,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { TodayAppointment } from '@/types/custom'
import { mockMiDiaData } from '../mock-data'

/**
 * PREVIEW B: Split Dashboard Pro (Mock Data)
 *
 * No authentication required - uses mock data for preview
 */
export default function PreviewBPage() {
  const router = useRouter()
  const toast = useToast()
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Keyboard navigation (j/k to navigate appointments)
  useEffect(() => {
    if (isEditing) return

    const handleKeyPress = (e: KeyboardEvent) => {
      const sortedApts = [...data.appointments].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )

      const currentIndex = sortedApts.findIndex((apt) => apt.id === selectedAppointmentId)

      if (e.key === 'j' && currentIndex < sortedApts.length - 1) {
        setSelectedAppointmentId(sortedApts[currentIndex + 1].id)
        e.preventDefault()
      } else if (e.key === 'k' && currentIndex > 0) {
        setSelectedAppointmentId(sortedApts[currentIndex - 1].id)
        e.preventDefault()
      } else if (e.key === 'Escape') {
        setSelectedAppointmentId(null)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedAppointmentId, isEditing, data.appointments])

  // Auto-select first appointment on load
  useEffect(() => {
    if (data.appointments.length > 0 && !selectedAppointmentId) {
      const sorted = [...data.appointments].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )
      setSelectedAppointmentId(sorted[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedAppointment = data.appointments.find((apt) => apt.id === selectedAppointmentId)

  // Filter appointments by search
  const filteredAppointments = data.appointments.filter((apt) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      apt.client?.name.toLowerCase().includes(query) ||
      apt.service?.name.toLowerCase().includes(query) ||
      apt.client?.phone?.includes(query)
    )
  })

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
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

            <h1 className="text-xl font-bold text-white">Mi Día - Split Dashboard</h1>
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium">
              DEMO B (Preview)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-400">
              {new Intl.DateTimeFormat('es-CR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }).format(new Date(data.date))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout - 3 columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Timeline */}
        <aside className="w-80 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar citas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-zinc-500"
                >
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    {searchQuery ? 'No se encontraron citas' : 'No hay citas para hoy'}
                  </p>
                </motion.div>
              ) : (
                filteredAppointments
                  .sort(
                    (a, b) =>
                      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                  )
                  .map((appointment, index) => (
                    <TimelineItem
                      key={appointment.id}
                      appointment={appointment}
                      index={index}
                      isSelected={selectedAppointmentId === appointment.id}
                      onClick={() => setSelectedAppointmentId(appointment.id)}
                    />
                  ))
              )}
            </AnimatePresence>
          </div>

          {/* Keyboard hints */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="text-xs text-zinc-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Navegar</span>
                <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded">j / k</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cerrar</span>
                <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded">esc</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Appointment Details */}
        <main className="flex-1 bg-zinc-950 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedAppointment ? (
              <AppointmentDetailsPanel
                key={selectedAppointment.id}
                appointment={selectedAppointment}
                barberName={data.barber.name}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onCheckIn={handleCheckIn}
                onComplete={handleComplete}
                onNoShow={handleNoShow}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-zinc-500"
              >
                <ChevronRight className="h-16 w-16 mb-4 opacity-20" />
                <p>Selecciona una cita de la lista</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT PANEL: Quick Stats */}
        <aside className="w-72 flex-shrink-0 bg-zinc-900 border-l border-zinc-800 p-6 space-y-6">
          {/* Stats Grid */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Resumen del Día
            </h3>
            <div className="space-y-3">
              <StatCard
                label="Total"
                value={data.stats.total}
                color="bg-zinc-700"
                icon={<Activity className="h-5 w-5" />}
              />
              <StatCard
                label="Pendientes"
                value={data.stats.pending}
                color="bg-violet-500/20 text-violet-300"
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                label="Confirmadas"
                value={data.stats.confirmed}
                color="bg-blue-500/20 text-blue-300"
                icon={<Check className="h-5 w-5" />}
              />
              <StatCard
                label="Completadas"
                value={data.stats.completed}
                color="bg-emerald-500/20 text-emerald-300"
                icon={<Check className="h-5 w-5" />}
              />
              <StatCard
                label="No Show"
                value={data.stats.no_show}
                color="bg-amber-500/20 text-amber-300"
                icon={<UserX className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Quick Actions */}
          {selectedAppointment &&
            selectedAppointment.status !== 'completed' &&
            selectedAppointment.status !== 'cancelled' && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCheckIn(selectedAppointment.id)}
                    disabled={selectedAppointment.status !== 'pending'}
                    className="w-full justify-start gap-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  >
                    <Check className="h-4 w-4" />
                    Check-in
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleComplete(selectedAppointment.id)}
                    className="w-full justify-start gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Completar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNoShow(selectedAppointment.id)}
                    className="w-full justify-start gap-2 bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700"
                  >
                    <UserX className="h-4 w-4" />
                    Marcar No Show
                  </Button>
                </div>
              </div>
            )}

          {/* Last Updated */}
          <div className="pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                Actualizado{' '}
                {new Intl.DateTimeFormat('es-CR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date())}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// Timeline Item Component
function TimelineItem({
  appointment,
  index,
  isSelected,
  onClick,
}: {
  appointment: TodayAppointment
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  const isPast = new Date(appointment.scheduled_at) < new Date()
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  const statusColors = {
    pending: 'bg-violet-500',
    confirmed: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-500',
    no_show: 'bg-amber-500',
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600',
        isFinalized && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-2 h-2 rounded-full', statusColors[appointment.status])} />
        <span className="text-sm font-bold text-white">
          {new Intl.DateTimeFormat('es-CR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(appointment.scheduled_at))}
        </span>
        <span className="text-xs text-zinc-500">{appointment.duration_minutes}m</span>
      </div>

      {appointment.client && (
        <p className="text-sm font-medium text-zinc-200 truncate">{appointment.client.name}</p>
      )}

      {appointment.service && (
        <p className="text-xs text-zinc-400 truncate">{appointment.service.name}</p>
      )}

      {isPast && !isFinalized && <div className="mt-2 text-xs text-amber-500">Pasada</div>}
    </motion.button>
  )
}

// Appointment Details Panel
function AppointmentDetailsPanel({
  appointment,
  barberName,
  isEditing,
  setIsEditing,
  onCheckIn,
  onComplete,
  onNoShow,
}: {
  appointment: TodayAppointment
  barberName: string
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  onCheckIn: (id: string) => void
  onComplete: (id: string) => void
  onNoShow: (id: string) => void
}) {
  const isPast = new Date(appointment.scheduled_at) < new Date()
  const isFinalized =
    appointment.status === 'completed' ||
    appointment.status === 'cancelled' ||
    appointment.status === 'no_show'

  const statusBadges = {
    pending: { label: 'Pendiente', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    confirmed: { label: 'Confirmada', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    completed: {
      label: 'Completada',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    cancelled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    no_show: { label: 'No Asistió', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Detalles de la Cita</h2>
          <p className="text-zinc-400">Información completa y acciones rápidas</p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border',
              statusBadges[appointment.status].color
            )}
          >
            {statusBadges[appointment.status].label}
          </div>

          {!isFinalized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-zinc-400 hover:text-white"
            >
              {isEditing ? (
                <>
                  <XIcon className="h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <InfoCard
          icon={<Clock className="h-5 w-5 text-blue-400" />}
          label="Hora"
          value={new Intl.DateTimeFormat('es-CR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(appointment.scheduled_at))}
          sublabel={`${appointment.duration_minutes} minutos`}
          isEditing={isEditing}
        />

        {appointment.client && (
          <InfoCard
            icon={<User className="h-5 w-5 text-purple-400" />}
            label="Cliente"
            value={appointment.client.name}
            sublabel={
              appointment.client.phone
                ? appointment.client.phone.replace(/(\d{4})(\d{4})/, '$1-$2')
                : undefined
            }
            isEditing={isEditing}
          />
        )}

        {appointment.service && (
          <InfoCard
            icon={<DollarSign className="h-5 w-5 text-green-400" />}
            label="Servicio"
            value={appointment.service.name}
            sublabel={new Intl.NumberFormat('es-CR', {
              style: 'currency',
              currency: 'CRC',
              minimumFractionDigits: 0,
            }).format(appointment.price)}
            isEditing={isEditing}
          />
        )}

        <InfoCard
          icon={<User className="h-5 w-5 text-cyan-400" />}
          label="Barbero"
          value={barberName}
          isEditing={isEditing}
        />
      </div>

      {/* Notes Section */}
      {(appointment.client_notes || appointment.internal_notes) && (
        <div className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Notas
          </h3>
          <div className="space-y-3">
            {appointment.client_notes && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Cliente:</p>
                <p className="text-sm text-zinc-200">{appointment.client_notes}</p>
              </div>
            )}
            {appointment.internal_notes && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Interno:</p>
                <p className="text-sm text-zinc-200">{appointment.internal_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isFinalized && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onCheckIn(appointment.id)}
            disabled={appointment.status !== 'pending'}
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            <Check className="h-5 w-5 mr-2" />
            Check-in
          </Button>

          <Button variant="success" onClick={() => onComplete(appointment.id)} className="flex-1">
            <Check className="h-5 w-5 mr-2" />
            Completar Cita
          </Button>

          <Button
            variant="outline"
            onClick={() => onNoShow(appointment.id)}
            className="flex-1 bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700"
          >
            <UserX className="h-5 w-5 mr-2" />
            No Asistió
          </Button>
        </div>
      )}

      {isPast && !isFinalized && (
        <div className="mt-4 text-center text-sm text-amber-500">
          ⚠️ Esta cita ya pasó su hora programada
        </div>
      )}

      {isEditing && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">
          💡 Modo edición activado (demo - funcionalidad no implementada)
        </div>
      )}
    </motion.div>
  )
}

// Info Card Component
function InfoCard({
  icon,
  label,
  value,
  sublabel,
  isEditing,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  isEditing?: boolean
}) {
  return (
    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800">
          {icon}
        </div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>

      {isEditing ? (
        <input
          type="text"
          defaultValue={value}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <>
          <p className="text-lg font-semibold text-white mb-1">{value}</p>
          {sublabel && <p className="text-sm text-zinc-400">{sublabel}</p>}
        </>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className={cn('p-4 rounded-xl border border-zinc-800', color)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
        <div className="opacity-60">{icon}</div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
