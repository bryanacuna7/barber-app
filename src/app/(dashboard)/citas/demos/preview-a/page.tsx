'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Calendar, Search, Clock, DollarSign, TrendingUp, Zap, X } from 'lucide-react'
import { mockCitasData, mockCitasStats } from '../mock-data'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

/**
 * DEMO A: Timeline Command Center
 *
 * Concept: DAW-inspired timeline with power user features
 * Style: Brutalist Professional (black/white/orange)
 * Key features:
 * - Horizontal timeline with proportional time blocks
 * - Revenue-first stats in header
 * - Command palette search (⌘K)
 * - Keyboard shortcuts legend
 * - Time density visualization
 * - Drag & drop rescheduling
 */

export default function CitasTimelineCommandDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const today = new Date()

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Close search
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setShowShortcuts(false)
        setSelectedId(null)
      }
      // Show shortcuts
      if (e.key === '?') {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Filter by search
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return mockCitasData
    const query = searchQuery.toLowerCase()
    return mockCitasData.filter(
      (apt) =>
        apt.client.name.toLowerCase().includes(query) ||
        apt.client.phone.includes(query) ||
        apt.service.name.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Sort by time
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )
  }, [filteredAppointments])

  // Timeline configuration: 7am - 9pm (14 hours)
  const TIMELINE_START = 7
  const TIMELINE_END = 21
  const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START
  const PIXELS_PER_HOUR = 120

  // Calculate position and width for each appointment
  const getTimelinePosition = (scheduledAt: string, durationMinutes: number) => {
    const date = parseISO(scheduledAt)
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const totalMinutes = (hours - TIMELINE_START) * 60 + minutes
    const left = (totalMinutes / 60) * PIXELS_PER_HOUR
    const width = (durationMinutes / 60) * PIXELS_PER_HOUR

    return { left, width }
  }

  // Current time indicator position
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalMinutes = (hours - TIMELINE_START) * 60 + minutes
    return (totalMinutes / 60) * PIXELS_PER_HOUR
  }, [currentTime])

  // Status colors for brutalist style
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600'
      case 'confirmed':
        return 'bg-blue-500 border-blue-600'
      case 'pending':
        return 'bg-orange-500 border-orange-600'
      case 'cancelled':
        return 'bg-gray-500 border-gray-600'
      case 'no_show':
        return 'bg-red-500 border-red-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  const handleConfirm = (id: string) => {
    toast.success('Cita confirmada (demo)')
  }

  const handleCheckIn = (id: string) => {
    toast.success('Check-in exitoso (demo)')
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header with revenue-first stats */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b-2 border-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CITAS</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {format(today, "EEEE d 'de' MMMM", { locale: es }).toUpperCase()}
              </p>
            </div>

            {/* Revenue stats */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
                <kbd className="text-xs bg-white/20 px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>

              <div className="text-right">
                <div className="text-xs text-gray-400">PROYECTADO HOY</div>
                <div className="text-2xl font-bold text-orange-500">
                  ₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">TOTAL CITAS</div>
                <div className="text-2xl font-bold">{mockCitasStats.total}</div>
              </div>
            </div>
          </div>

          {/* Quick stats inline */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-500" />
              <span className="text-gray-400">Pending:</span>
              <span className="font-bold">{mockCitasStats.pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500" />
              <span className="text-gray-400">Confirmed:</span>
              <span className="font-bold">{mockCitasStats.confirmed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500" />
              <span className="text-gray-400">Completed:</span>
              <span className="font-bold">{mockCitasStats.completed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-500" />
              <span className="text-gray-400">No-show:</span>
              <span className="font-bold">{mockCitasStats.no_show}</span>
            </div>
            <div className="ml-auto text-gray-400">
              Completado: ₡{(mockCitasStats.totalRevenue / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      </header>

      {/* Timeline container */}
      <div className="p-6">
        <div
          ref={timelineRef}
          className="relative bg-zinc-950 border-2 border-white/10 overflow-x-auto"
          style={{
            height: '500px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#F97316 #18181B'
          }}
        >
          {/* Time grid */}
          <div
            className="relative h-full"
            style={{ width: `${TIMELINE_HOURS * PIXELS_PER_HOUR}px` }}
          >
            {/* Hour markers */}
            {Array.from({ length: TIMELINE_HOURS + 1 }).map((_, i) => {
              const hour = TIMELINE_START + i
              return (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-white/10"
                  style={{ left: `${i * PIXELS_PER_HOUR}px` }}
                >
                  <div className="sticky top-2 left-2 text-xs text-gray-500 font-mono">
                    {hour === 12 ? '12PM' : hour > 12 ? `${hour - 12}PM` : `${hour}AM`}
                  </div>
                </div>
              )
            })}

            {/* Current time indicator */}
            {currentTime.getHours() >= TIMELINE_START && currentTime.getHours() < TIMELINE_END && (
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-30"
                style={{ left: `${currentTimePosition}px` }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-orange-500 rotate-45" />
                <div className="absolute top-2 -left-8 text-xs font-bold text-orange-500 bg-black px-1">
                  NOW
                </div>
              </motion.div>
            )}

            {/* Appointment blocks */}
            <div className="absolute inset-0 pt-12">
              {sortedAppointments.map((apt) => {
                const { left, width } = getTimelinePosition(apt.scheduled_at, apt.duration_minutes)
                const isSelected = selectedId === apt.id

                return (
                  <motion.div
                    key={apt.id}
                    className={`absolute cursor-pointer border-2 ${getStatusColor(apt.status)} hover:scale-105 transition-transform`}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: '20px',
                      height: '180px',
                    }}
                    onClick={() => setSelectedId(apt.id)}
                    whileHover={{ y: -4 }}
                    drag="x"
                    dragMomentum={false}
                    onDragEnd={() => toast.info('Rescheduling (demo)')}
                  >
                    <div className="h-full p-3 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="text-xs font-bold mb-1">
                          {format(parseISO(apt.scheduled_at), 'h:mm a', { locale: es })}
                        </div>
                        <div className="text-sm font-bold truncate">
                          {apt.client.name}
                        </div>
                        <div className="text-xs text-white/80 truncate mt-1">
                          {apt.service.name}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-white/70">
                          {apt.duration_minutes} min
                        </div>
                        <div className="text-sm font-bold text-orange-400">
                          ₡{(apt.price / 1000).toFixed(0)}k
                        </div>
                      </div>

                      {apt.client_notes && (
                        <div className="text-[10px] text-white/60 italic truncate mt-1">
                          {apt.client_notes}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )
              })}
            </div>

            {/* Gap indicators */}
            <div className="absolute inset-0 pt-12 pointer-events-none">
              {sortedAppointments.map((apt, i) => {
                if (i === sortedAppointments.length - 1) return null

                const currentEnd = parseISO(apt.scheduled_at)
                currentEnd.setMinutes(currentEnd.getMinutes() + apt.duration_minutes)

                const nextStart = parseISO(sortedAppointments[i + 1].scheduled_at)
                const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000

                if (gapMinutes >= 30) {
                  const { left: currentLeft, width: currentWidth } = getTimelinePosition(
                    apt.scheduled_at,
                    apt.duration_minutes
                  )
                  const gapStart = currentLeft + currentWidth
                  const gapWidth = (gapMinutes / 60) * PIXELS_PER_HOUR

                  return (
                    <div
                      key={`gap-${i}`}
                      className="absolute pointer-events-auto cursor-pointer"
                      style={{
                        left: `${gapStart}px`,
                        width: `${gapWidth}px`,
                        top: '220px',
                        height: '60px',
                      }}
                    >
                      <div className="h-full border-2 border-dashed border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors flex items-center justify-center group">
                        <div className="text-xs text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {gapMinutes} MIN GAP
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>

        {/* Time density heatmap */}
        <div className="mt-4 px-4 py-3 bg-zinc-950 border-2 border-white/10">
          <div className="text-xs text-gray-400 mb-2 font-bold">DENSIDAD DEL DÍA</div>
          <div className="flex gap-1">
            {Array.from({ length: TIMELINE_HOURS }).map((_, i) => {
              const hour = TIMELINE_START + i
              const appointmentsInHour = sortedAppointments.filter((apt) => {
                const aptHour = parseISO(apt.scheduled_at).getHours()
                return aptHour === hour
              }).length

              const intensity = appointmentsInHour === 0 ? 0 : appointmentsInHour === 1 ? 50 : 100

              return (
                <div
                  key={hour}
                  className="flex-1 h-8 relative group cursor-pointer"
                  style={{
                    backgroundColor:
                      intensity === 0
                        ? '#27272A'
                        : intensity === 50
                        ? '#F97316'
                        : '#DC2626',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-bold text-white">
                      {hour > 12 ? hour - 12 : hour}
                      {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>🟩 Libre</span>
            <span>🟧 Normal</span>
            <span>🟥 Packed</span>
          </div>
        </div>
      </div>

      {/* Command Palette Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-zinc-900 border-2 border-white w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por cliente, teléfono, servicio..."
                    className="flex-1 bg-transparent text-white outline-none text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No se encontraron citas
                  </div>
                ) : (
                  filteredAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => {
                        setSelectedId(apt.id)
                        setSearchOpen(false)
                        // Scroll to appointment in timeline
                        const { left } = getTimelinePosition(apt.scheduled_at, apt.duration_minutes)
                        timelineRef.current?.scrollTo({ left: left - 200, behavior: 'smooth' })
                      }}
                      className="w-full p-4 hover:bg-white/5 border-b border-white/5 text-left transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold">{apt.client.name}</span>
                          <span className="text-xs text-gray-400">
                            {format(parseISO(apt.scheduled_at), 'h:mm a')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">{apt.service.name}</div>
                      </div>
                      <div className="text-orange-500 font-bold">₡{apt.price}</div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts legend */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-zinc-900 border-2 border-white p-8 max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6">KEYBOARD SHORTCUTS</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">NAVIGATION</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Search</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">⌘ K</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Close/Escape</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">ESC</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This dialog</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">?</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-2">ACTIONS</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Check-in</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">SPACE</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Edit</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">E</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confirm</span>
                      <kbd className="bg-white/10 px-2 py-1 text-xs">C</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                Drag appointments left/right to reschedule
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment details panel */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={() => setSelectedId(null)}
          >
            {(() => {
              const apt = sortedAppointments.find((a) => a.id === selectedId)
              if (!apt) return null

              return (
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-zinc-900 border-2 border-white p-6 max-w-md w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{apt.client.name}</h3>
                      <p className="text-sm text-gray-400">{apt.client.phone}</p>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {format(parseISO(apt.scheduled_at), "h:mm a '-' h:mm a", { locale: es })}
                      </span>
                      <span className="text-xs text-gray-500">({apt.duration_minutes} min)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{apt.service.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-orange-500" />
                      <span className="text-lg font-bold text-orange-500">₡{apt.price}</span>
                    </div>

                    {apt.client_notes && (
                      <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Notas del cliente:</div>
                        <div className="text-sm">{apt.client_notes}</div>
                      </div>
                    )}

                    {apt.internal_notes && (
                      <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Notas internas:</div>
                        <div className="text-sm">{apt.internal_notes}</div>
                      </div>
                    )}

                    <div className={`inline-block px-3 py-1 text-xs font-bold ${getStatusColor(apt.status)}`}>
                      {apt.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(apt.id)}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleCheckIn(apt.id)}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                    <button
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hints footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t-2 border-white/10 py-2 px-6 z-40">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-6">
            <span>⌨️ SHORTCUTS:</span>
            <div className="flex items-center gap-1.5">
              <kbd className="bg-white/10 px-1.5 py-0.5">⌘K</kbd>
              <span>search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="bg-white/10 px-1.5 py-0.5">SPACE</kbd>
              <span>check-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="bg-white/10 px-1.5 py-0.5">E</kbd>
              <span>edit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="bg-white/10 px-1.5 py-0.5">?</kbd>
              <span>all shortcuts</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-500">Drag blocks to reschedule</span>
            <span className="text-orange-500 font-bold">DEMO MODE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
