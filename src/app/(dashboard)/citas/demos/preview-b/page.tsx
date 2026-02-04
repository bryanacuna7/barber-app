'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, DollarSign, TrendingUp, Zap, Users, Calendar as CalendarIcon, Phone, AlertCircle, CheckCircle2 } from 'lucide-react'
import { mockCitasData, mockCitasStats } from '../mock-data'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

/**
 * DEMO B: Calendar Cinema ⭐ RECOMMENDED
 *
 * Concept: Calendar as cinematic visual storytelling
 * Style: Glassmorphism Cinema (frosted glass + mesh gradients)
 * Key features:
 * - Time blocks with % occupancy visualization
 * - Gap opportunities highlighted
 * - Quick actions context-aware
 * - Revenue storytelling (projected vs goal)
 * - Large typography with personality
 */

export default function CitasCalendarCinemaDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredGap, setHoveredGap] = useState<number | null>(null)

  const today = new Date()

  // Sort appointments by time
  const sortedAppointments = useMemo(() => {
    return [...mockCitasData]
      .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [])

  // Divide day into time blocks: MAÑANA (7-12), MEDIODÍA (12-15), TARDE (15-21)
  const timeBlocks = useMemo(() => {
    const blocks = [
      { id: 'morning', label: 'MAÑANA', start: 7, end: 12, color: 'from-blue-500/20 to-cyan-500/20' },
      { id: 'midday', label: 'MEDIODÍA', start: 12, end: 15, color: 'from-orange-500/20 to-amber-500/20' },
      { id: 'afternoon', label: 'TARDE', start: 15, end: 21, color: 'from-purple-500/20 to-pink-500/20' },
    ]

    return blocks.map((block) => {
      const appointments = sortedAppointments.filter((apt) => {
        const hour = parseISO(apt.scheduled_at).getHours()
        return hour >= block.start && hour < block.end
      })

      const totalMinutesInBlock = (block.end - block.start) * 60
      const occupiedMinutes = appointments.reduce((sum, apt) => sum + apt.duration_minutes, 0)
      const occupancyPercent = Math.round((occupiedMinutes / totalMinutesInBlock) * 100)

      return {
        ...block,
        appointments,
        occupancyPercent,
        count: appointments.length,
      }
    })
  }, [sortedAppointments])

  // Find gaps (30+ minutes)
  const gaps = useMemo(() => {
    const foundGaps: Array<{ start: string; end: string; minutes: number; index: number }> = []

    sortedAppointments.forEach((apt, i) => {
      if (i === sortedAppointments.length - 1) return

      const currentEnd = parseISO(apt.scheduled_at)
      currentEnd.setMinutes(currentEnd.getMinutes() + apt.duration_minutes)

      const nextStart = parseISO(sortedAppointments[i + 1].scheduled_at)
      const gapMinutes = differenceInMinutes(nextStart, currentEnd)

      if (gapMinutes >= 30) {
        foundGaps.push({
          start: currentEnd.toISOString(),
          end: nextStart.toISOString(),
          minutes: gapMinutes,
          index: i,
        })
      }
    })

    return foundGaps
  }, [sortedAppointments])

  // Daily revenue goal
  const DAILY_GOAL = 200000
  const goalProgress = Math.round((mockCitasStats.projectedRevenue / DAILY_GOAL) * 100)

  const handleConfirm = (id: string) => {
    toast.success('Cita confirmada (demo)')
  }

  const handleCheckIn = (id: string) => {
    toast.success('Check-in exitoso (demo)')
  }

  const handleFillGap = () => {
    toast.info('Sugerir clientes frecuentes (demo)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero header */}
        <div className="px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              {format(today, "EEEE d 'de' MMMM", { locale: es }).toUpperCase()}
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              {mockCitasStats.total} citas • ₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k proyectado
            </p>

            {/* Revenue progress bar */}
            <div className="max-w-md mx-auto mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Meta diaria</span>
                <span className="font-bold text-white">{goalProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k</span>
                <span>₡{(DAILY_GOAL / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time blocks */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {timeBlocks.map((block, blockIndex) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: blockIndex * 0.1 }}
                className="relative"
              >
                {/* Block header */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-1">{block.label}</h2>
                  <p className="text-sm text-gray-400">
                    {block.start > 12 ? block.start - 12 : block.start}
                    {block.start >= 12 ? 'pm' : 'am'} -{' '}
                    {block.end > 12 ? block.end - 12 : block.end}
                    {block.end >= 12 ? 'pm' : 'am'}
                  </p>
                </div>

                {/* Occupancy visualization */}
                <div className={`bg-gradient-to-br ${block.color} backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">{block.count} citas</span>
                    <span className={`text-sm font-bold ${
                      block.occupancyPercent >= 90
                        ? 'text-red-400'
                        : block.occupancyPercent >= 60
                        ? 'text-orange-400'
                        : 'text-green-400'
                    }`}>
                      {block.occupancyPercent}% ocupado
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${block.occupancyPercent}%` }}
                      transition={{ duration: 0.8, delay: blockIndex * 0.15 }}
                      className={`h-full ${
                        block.occupancyPercent >= 90
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : block.occupancyPercent >= 60
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Appointments in this block */}
                <div className="space-y-3">
                  {block.appointments.map((apt, aptIndex) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: blockIndex * 0.1 + aptIndex * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => setSelectedId(apt.id)}
                      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 cursor-pointer hover:bg-white/15 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              apt.status === 'completed'
                                ? 'bg-green-400'
                                : apt.status === 'confirmed'
                                ? 'bg-blue-400'
                                : 'bg-orange-400'
                            }`} />
                            <span className="font-bold text-white">{apt.client.name}</span>
                          </div>
                          <div className="text-sm text-gray-300">{apt.service.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-gray-300">
                            {format(parseISO(apt.scheduled_at), 'h:mm a')}
                          </div>
                          <div className="text-xs text-gray-400">{apt.duration_minutes}m</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-orange-400">₡{(apt.price / 1000).toFixed(0)}k</div>
                        {apt.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirm(apt.id)
                            }}
                            className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Confirmar
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCheckIn(apt.id)
                            }}
                            className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Check-in
                          </button>
                        )}
                      </div>

                      {apt.client_notes && (
                        <div className="mt-2 text-xs text-blue-300 italic">
                          💬 {apt.client_notes}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Gap indicators */}
                  {gaps
                    .filter((gap) => {
                      const gapHour = parseISO(gap.start).getHours()
                      return gapHour >= block.start && gapHour < block.end
                    })
                    .map((gap, gapIndex) => (
                      <motion.div
                        key={`gap-${blockIndex}-${gapIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: blockIndex * 0.1 + 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setHoveredGap(gap.index)}
                        onHoverEnd={() => setHoveredGap(null)}
                        className="bg-green-500/10 backdrop-blur-xl rounded-xl border-2 border-dashed border-green-400/40 p-4 cursor-pointer hover:bg-green-500/20 hover:border-green-400/60 transition-all"
                        onClick={handleFillGap}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-green-400">
                              {gap.minutes} MIN GAP
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(parseISO(gap.start), 'h:mm a')} -{' '}
                              {format(parseISO(gap.end), 'h:mm a')}
                            </div>
                          </div>
                          <div className="text-xs text-green-400 font-bold">
                            Llenar →
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {block.appointments.length === 0 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-400">Sin citas en {block.label.toLowerCase()}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Banner */}
        {(mockCitasStats.pending > 0 || gaps.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="px-6 pb-8"
          >
            <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-orange-400/30 p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="font-bold">QUICK ACTIONS:</span>
                </div>

                {mockCitasStats.pending > 0 && (
                  <button
                    onClick={() => toast.success(`${mockCitasStats.pending} citas confirmadas (demo)`)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar todas pendientes ({mockCitasStats.pending})
                  </button>
                )}

                {gaps.length > 0 && (
                  <button
                    onClick={handleFillGap}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition-colors flex items-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Llenar {gaps.length} gaps
                  </button>
                )}

                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-bold transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Ver semana completa
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appointment detail modal */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 backdrop-blur-xl rounded-2xl border-2 border-white/20 p-8 max-w-lg w-full shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Client info */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold mb-2">{apt.client.name}</h2>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{apt.client.phone}</span>
                      </div>
                    </div>

                    {/* Appointment details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm text-gray-400">Horario</div>
                          <div className="font-bold">
                            {format(parseISO(apt.scheduled_at), 'h:mm a', { locale: es })} ({apt.duration_minutes} min)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-sm text-gray-400">Servicio</div>
                          <div className="font-bold">{apt.service.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl border border-orange-400/30">
                        <DollarSign className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-sm text-gray-400">Precio</div>
                          <div className="text-2xl font-bold text-orange-400">₡{apt.price}</div>
                        </div>
                      </div>

                      {apt.client_notes && (
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
                          <div className="text-xs text-blue-400 mb-1">💬 Notas del cliente:</div>
                          <div className="text-sm">{apt.client_notes}</div>
                        </div>
                      )}

                      {apt.internal_notes && (
                        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/30">
                          <div className="text-xs text-purple-400 mb-1">🔒 Notas internas:</div>
                          <div className="text-sm">{apt.internal_notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-colors"
                        >
                          Check-in
                        </button>
                      )}
                      <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors border border-white/20">
                        Editar
                      </button>
                    </div>
                  </motion.div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom info bar */}
        <div className="fixed bottom-6 left-6 right-6 z-40">
          <div className="max-w-7xl mx-auto bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">
                    {gaps.length} gaps aprovechables ({gaps.reduce((sum, g) => sum + g.minutes, 0)} min total)
                  </span>
                </div>
                <button
                  onClick={() => toast.info('Vista de semana (demo)')}
                  className="text-blue-400 hover:text-blue-300 font-bold"
                >
                  📊 Ver semana completa
                </button>
              </div>
              <div className="text-gray-500 font-mono text-xs">
                DEMO MODE - Calendar Cinema
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(40px, 30px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
