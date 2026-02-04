'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Clock, DollarSign, Phone, Zap, Users, CheckCircle2, AlertCircle, XCircle, Calendar as CalendarIcon, ChevronRight, TrendingUp } from 'lucide-react'
import { mockCitasData, mockCitasStats } from '../mock-data'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

/**
 * DEMO C: Grid Kanban Pro
 *
 * Concept: Kanban workflow for appointment lifecycle
 * Style: Bento Grid Kanban (soft pastel backgrounds by status)
 * Key features:
 * - Workflow-based columns (Por Confirmar → Confirmadas → En Curso → Completadas)
 * - Drag cards between columns to change status
 * - Collapsed completed column (just count)
 * - Time + Status dual priority
 * - Real-time collaboration indicators
 */

type KanbanColumn = {
  id: string
  label: string
  status: string[]
  color: string
  bgGradient: string
  icon: React.ReactNode
}

export default function CitasKanbanDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const today = new Date()

  // Kanban columns configuration
  const columns: KanbanColumn[] = [
    {
      id: 'pending',
      label: 'POR CONFIRMAR',
      status: ['pending'],
      color: 'text-orange-500',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: 'confirmed',
      label: 'CONFIRMADAS',
      status: ['confirmed'],
      color: 'text-blue-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      id: 'in_progress',
      label: 'EN CURSO',
      status: ['in_progress'], // Note: mock data doesn't have this, showing confirmed as proxy
      color: 'text-green-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'completed',
      label: 'COMPLETADAS',
      status: ['completed'],
      color: 'text-gray-500',
      bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  ]

  // Group appointments by column
  const columnAppointments = useMemo(() => {
    return columns.map((col) => {
      const appointments = mockCitasData
        .filter((apt) => {
          // Special handling: show some confirmed as "in_progress" for demo
          if (col.id === 'in_progress') {
            return apt.status === 'confirmed' && parseISO(apt.scheduled_at).getHours() <= new Date().getHours()
          }
          return col.status.includes(apt.status)
        })
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

      const revenue = appointments.reduce((sum, apt) => sum + apt.price, 0)

      return {
        ...col,
        appointments,
        count: appointments.length,
        revenue,
      }
    })
  }, [])

  const handleDragStatus = (aptId: string, newStatus: string) => {
    toast.success(`Cita movida a ${newStatus} (demo)`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CITAS
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {format(today, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>

              {/* Revenue stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">PROYECTADO HOY</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    ₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">META</div>
                  <div className="text-xl font-bold text-gray-400">₡200k</div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-950/30 rounded-full">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                  {mockCitasStats.pending} por confirmar
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-950/30 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  {mockCitasStats.confirmed} confirmadas
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-950/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  {mockCitasStats.completed} completadas
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban board */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Drag instruction */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⚡ Arrastra las citas entre columnas para cambiar su estado
            </p>
          </motion.div>

          {/* Columns grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {columnAppointments.map((col, colIndex) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: colIndex * 0.1 }}
                className="flex flex-col"
              >
                {/* Column header */}
                <div className={`mb-4 p-4 bg-gradient-to-br ${col.bgGradient} backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-white/10`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={col.color}>{col.icon}</div>
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        {col.label}
                      </h2>
                    </div>
                    <div className={`px-2 py-1 bg-white/50 dark:bg-black/30 rounded-full text-xs font-bold ${col.color}`}>
                      {col.count}
                    </div>
                  </div>

                  {col.revenue > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      ₡{(col.revenue / 1000).toFixed(0)}k total
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 min-h-[200px]">
                  {col.id === 'completed' && !showCompleted ? (
                    // Collapsed completed view
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setShowCompleted(true)}
                      className="w-full p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-colors group"
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {col.count}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          citas completadas hoy
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors flex items-center justify-center gap-1">
                          <span>Ver todas</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.button>
                  ) : (
                    <>
                      {col.appointments.map((apt, aptIndex) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: colIndex * 0.1 + aptIndex * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          onDragEnd={() => handleDragStatus(apt.id, 'moved')}
                          onClick={() => setSelectedId(apt.id)}
                          className="bg-white dark:bg-zinc-900 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-lg transition-shadow"
                        >
                          {/* Time */}
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-900 dark:text-white font-bold">
                              {format(parseISO(apt.scheduled_at), 'h:mm a')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {apt.duration_minutes}m
                            </span>
                          </div>

                          {/* Client */}
                          <div className="mb-2">
                            <div className="font-bold text-gray-900 dark:text-white mb-1">
                              {apt.client.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {apt.service.name}
                            </div>
                          </div>

                          {/* Revenue */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                            <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                              ₡{(apt.price / 1000).toFixed(0)}k
                            </div>

                            {/* Quick action button */}
                            {col.id === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success('Confirmada (demo)')
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-colors"
                              >
                                Confirmar
                              </button>
                            )}
                            {col.id === 'confirmed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success('Check-in (demo)')
                                }}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full transition-colors"
                              >
                                Check-in
                              </button>
                            )}
                          </div>

                          {/* Notes indicator */}
                          {(apt.client_notes || apt.internal_notes) && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                              <span>💬</span>
                              <span>Tiene notas</span>
                            </div>
                          )}

                          {/* VIP badge */}
                          {apt.internal_notes?.toLowerCase().includes('vip') && (
                            <div className="mt-2 inline-block px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-purple-600 dark:text-purple-400">
                              ⭐ VIP
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {col.appointments.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl">
                          <div className={`${col.color} mb-2 flex justify-center`}>
                            {col.icon}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Sin citas en {col.label.toLowerCase()}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Batch actions */}
          {mockCitasStats.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-orange-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      Acciones rápidas disponibles
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Optimiza tu workflow con un click
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toast.success(`${mockCitasStats.pending} citas confirmadas (demo)`)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar todas ({mockCitasStats.pending})
                  </button>

                  <button
                    onClick={() => toast.info('Enviar recordatorios (demo)')}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    Enviar recordatorios
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Appointment detail modal */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            {(() => {
              const apt = mockCitasData.find((a) => a.id === selectedId)
              if (!apt) return null

              return (
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-200 dark:border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {apt.client.name}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{apt.client.phone}</span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horario</div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {format(parseISO(apt.scheduled_at), 'h:mm a')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{apt.duration_minutes} minutos</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-xl">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Precio</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        ₡{apt.price}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl mb-6">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Servicio</div>
                    <div className="font-bold text-gray-900 dark:text-white">{apt.service.name}</div>
                  </div>

                  {apt.client_notes && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl mb-4 border border-blue-200 dark:border-blue-800/30">
                      <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                        <span>💬</span>
                        <span>Notas del cliente:</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">{apt.client_notes}</div>
                    </div>
                  )}

                  {apt.internal_notes && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl mb-6 border border-purple-200 dark:border-purple-800/30">
                      <div className="text-xs text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                        <span>🔒</span>
                        <span>Notas internas:</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">{apt.internal_notes}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => {
                          toast.success('Cita confirmada (demo)')
                          setSelectedId(null)
                        }}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          toast.success('Check-in exitoso (demo)')
                          setSelectedId(null)
                        }}
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                    <button className="px-6 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold rounded-xl transition-colors">
                      Editar
                    </button>
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom stats bar */}
      <div className="fixed bottom-6 left-6 right-6 z-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-7xl mx-auto bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/20 px-6 py-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {mockCitasStats.total} citas programadas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  ₡{(mockCitasStats.totalRevenue / 1000).toFixed(0)}k completado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  ₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k proyectado
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
              DEMO MODE - Grid Kanban Pro
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
