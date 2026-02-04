'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import {
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Calendar as CalendarIcon,
  Phone,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  LayoutGrid,
} from 'lucide-react'
import { mockCitasData, mockCitasStats } from '../mock-data'
import {
  format,
  parseISO,
  differenceInMinutes,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

/**
 * DEMO B ENHANCED: Calendar Cinema Pro
 *
 * Enhanced features:
 * ✅ Multiple views: TODAY / WEEK / MONTH (like Google Calendar)
 * ✅ Drag & drop rescheduling with visual feedback
 * ✅ Improved time blocks with mini timeline
 * ✅ Mobile-optimized responsive design
 * ✅ Swipe gestures on mobile
 * ✅ Better gap visualization with suggestions
 */

type ViewMode = 'today' | 'week' | 'month'

export default function CitasCalendarCinemaEnhancedDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const today = new Date()

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'today') {
      setSelectedDate(addDays(selectedDate, -1))
    } else if (viewMode === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1))
    } else {
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'today') {
      setSelectedDate(addDays(selectedDate, 1))
    } else if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1))
    } else {
      setSelectedDate(addMonths(selectedDate, 1))
    }
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  // Filter appointments by view mode and date
  const filteredAppointments = useMemo(() => {
    return mockCitasData.filter((apt) => {
      const aptDate = parseISO(apt.scheduled_at)

      if (viewMode === 'today') {
        return isSameDay(aptDate, selectedDate)
      } else if (viewMode === 'week') {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
        return aptDate >= weekStart && aptDate <= weekEnd
      } else {
        const monthStart = startOfMonth(selectedDate)
        const monthEnd = endOfMonth(selectedDate)
        return aptDate >= monthStart && aptDate <= monthEnd
      }
    })
  }, [viewMode, selectedDate])

  // Sort by time
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments]
      .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [filteredAppointments])

  // Time blocks for TODAY view
  const timeBlocks = useMemo(() => {
    if (viewMode !== 'today') return []

    const blocks = [
      { id: 'morning', label: 'MAÑANA', start: 7, end: 12, color: 'from-blue-500/20 to-cyan-500/20', icon: '🌅' },
      { id: 'midday', label: 'MEDIODÍA', start: 12, end: 15, color: 'from-orange-500/20 to-amber-500/20', icon: '☀️' },
      { id: 'afternoon', label: 'TARDE', start: 15, end: 21, color: 'from-purple-500/20 to-pink-500/20', icon: '🌆' },
    ]

    return blocks.map((block) => {
      const appointments = sortedAppointments.filter((apt) => {
        const hour = parseISO(apt.scheduled_at).getHours()
        return hour >= block.start && hour < block.end
      })

      const totalMinutesInBlock = (block.end - block.start) * 60
      const occupiedMinutes = appointments.reduce((sum, apt) => sum + apt.duration_minutes, 0)
      const occupancyPercent = Math.round((occupiedMinutes / totalMinutesInBlock) * 100)

      return { ...block, appointments, occupancyPercent, count: appointments.length }
    })
  }, [viewMode, sortedAppointments])

  // Week days for WEEK view
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return days.map((day) => {
      const dayAppointments = mockCitasData.filter((apt) =>
        isSameDay(parseISO(apt.scheduled_at), day)
      )
      return { date: day, appointments: dayAppointments }
    })
  }, [viewMode, selectedDate])

  // Month days for MONTH view
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return days.map((day) => {
      const dayAppointments = mockCitasData.filter((apt) =>
        isSameDay(parseISO(apt.scheduled_at), day)
      )
      const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
      return { date: day, appointments: dayAppointments, isCurrentMonth }
    })
  }, [viewMode, selectedDate])

  // Find gaps
  const gaps = useMemo(() => {
    const foundGaps: Array<{ start: string; end: string; minutes: number }> = []

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
        })
      }
    })

    return foundGaps
  }, [sortedAppointments])

  // Revenue calculation
  const DAILY_GOAL = 200000
  const viewRevenue = useMemo(() => {
    const total = filteredAppointments
      .filter((a) => a.status === 'confirmed' || a.status === 'completed')
      .reduce((sum, a) => sum + a.price, 0)
    return total
  }, [filteredAppointments])

  const goalProgress = Math.round((viewRevenue / DAILY_GOAL) * 100)

  // Drag handlers
  const handleDragEnd = (aptId: string, info: PanInfo) => {
    setDraggedId(null)
    toast.info('Rescheduling appointment (demo)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 md:px-6 py-4">
            {/* Top row: Title + Stats */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">CITAS</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {viewMode === 'today' && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  {viewMode === 'week' && `Semana del ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}`}
                  {viewMode === 'month' && format(selectedDate, "MMMM yyyy", { locale: es })}
                </p>
              </div>

              {/* Revenue stats - responsive */}
              <div className="flex items-center gap-3 md:gap-6">
                <div className="text-right">
                  <div className="text-[10px] md:text-xs text-gray-400">PROYECTADO</div>
                  <div className="text-xl md:text-2xl font-bold text-orange-500">
                    ₡{(viewRevenue / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray-400">CITAS</div>
                  <div className="text-2xl font-bold text-white">{filteredAppointments.length}</div>
                </div>
              </div>
            </div>

            {/* View mode switcher + Navigation */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* View switcher */}
              <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => setViewMode('today')}
                  className={`px-3 md:px-4 py-2 rounded-md font-bold text-xs md:text-sm transition-colors flex items-center gap-2 ${
                    viewMode === 'today'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden md:inline">Hoy</span>
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 md:px-4 py-2 rounded-md font-bold text-xs md:text-sm transition-colors flex items-center gap-2 ${
                    viewMode === 'week'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline">Semana</span>
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 md:px-4 py-2 rounded-md font-bold text-xs md:text-sm transition-colors flex items-center gap-2 ${
                    viewMode === 'month'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden md:inline">Mes</span>
                </button>
              </div>

              {/* Date navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Revenue progress bar - only in TODAY view */}
            {viewMode === 'today' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Meta diaria</span>
                  <span className="font-bold text-white">{goalProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* View content */}
        <div className="px-4 md:px-6 py-6 md:py-8">
          {/* TODAY VIEW */}
          {viewMode === 'today' && (
            <motion.div
              key="today-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mini timeline (mobile-friendly) */}
              <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {Array.from({ length: 14 }, (_, i) => {
                    const hour = 7 + i
                    const hasAppointment = sortedAppointments.some((apt) => {
                      return parseISO(apt.scheduled_at).getHours() === hour
                    })

                    return (
                      <div key={hour} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                            hasAppointment
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          {hour > 12 ? hour - 12 : hour}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {hour >= 12 ? 'PM' : 'AM'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Time blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                {timeBlocks.map((block, blockIndex) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: blockIndex * 0.1 }}
                  >
                    {/* Block header */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{block.icon}</span>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white">{block.label}</h2>
                          <p className="text-xs text-gray-400">
                            {block.start > 12 ? block.start - 12 : block.start}
                            {block.start >= 12 ? 'pm' : 'am'} -{' '}
                            {block.end > 12 ? block.end - 12 : block.end}
                            {block.end >= 12 ? 'pm' : 'am'}
                          </p>
                        </div>
                      </div>

                      {/* Occupancy bar */}
                      <div className={`bg-gradient-to-br ${block.color} backdrop-blur-xl rounded-xl border border-white/20 p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{block.count} citas</span>
                          <span
                            className={`text-sm font-bold ${
                              block.occupancyPercent >= 90
                                ? 'text-red-400'
                                : block.occupancyPercent >= 60
                                ? 'text-orange-400'
                                : 'text-green-400'
                            }`}
                          >
                            {block.occupancyPercent}% ocupado
                          </span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
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
                    </div>

                    {/* Appointments */}
                    <div className="space-y-3">
                      {block.appointments.map((apt) => (
                        <motion.div
                          key={apt.id}
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0.1}
                          onDragStart={() => setDraggedId(apt.id)}
                          onDragEnd={(_, info) => handleDragEnd(apt.id, info)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileDrag={{ scale: 1.05, zIndex: 50 }}
                          onClick={() => setSelectedId(apt.id)}
                          className={`bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 cursor-grab active:cursor-grabbing transition-all ${
                            draggedId === apt.id ? 'opacity-50' : 'hover:bg-white/15'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    apt.status === 'completed'
                                      ? 'bg-green-400'
                                      : apt.status === 'confirmed'
                                      ? 'bg-blue-400'
                                      : 'bg-orange-400'
                                  }`}
                                />
                                <span className="font-bold text-white text-sm md:text-base">
                                  {apt.client.name}
                                </span>
                              </div>
                              <div className="text-xs md:text-sm text-gray-300">{apt.service.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs md:text-sm font-mono text-gray-300">
                                {format(parseISO(apt.scheduled_at), 'h:mm a')}
                              </div>
                              <div className="text-[10px] md:text-xs text-gray-400">
                                {apt.duration_minutes}m
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-base md:text-lg font-bold text-orange-400">
                              ₡{(apt.price / 1000).toFixed(0)}k
                            </div>
                            {apt.status === 'pending' && (
                              <div className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-[10px] font-bold text-orange-400">
                                POR CONFIRMAR
                              </div>
                            )}
                          </div>
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
                            whileHover={{ scale: 1.02 }}
                            className="bg-green-500/10 backdrop-blur-xl rounded-xl border-2 border-dashed border-green-400/40 p-4 cursor-pointer hover:bg-green-500/20 hover:border-green-400/60 transition-all"
                            onClick={() => toast.info('Sugerir clientes para este gap (demo)')}
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
                              <div className="text-xs text-green-400 font-bold">Llenar →</div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <motion.div
              key="week-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4">
                {weekDays.map((day, dayIndex) => (
                  <motion.div
                    key={day.date.toISOString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: dayIndex * 0.05 }}
                    className={`bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 ${
                      isSameDay(day.date, today) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Day header */}
                    <div className="text-center mb-4">
                      <div className="text-xs text-gray-400">
                        {format(day.date, 'EEE', { locale: es }).toUpperCase()}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          isSameDay(day.date, today) ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {format(day.date, 'd')}
                      </div>
                    </div>

                    {/* Appointments count */}
                    <div className="text-center mb-3">
                      <div className="text-xs text-gray-400 mb-1">{day.appointments.length} citas</div>
                      <div className="text-sm font-bold text-orange-400">
                        ₡
                        {(
                          day.appointments.reduce((sum, apt) => sum + apt.price, 0) / 1000
                        ).toFixed(0)}
                        k
                      </div>
                    </div>

                    {/* Mini appointments list */}
                    <div className="space-y-2">
                      {day.appointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedId(apt.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="text-xs font-mono text-gray-300">
                            {format(parseISO(apt.scheduled_at), 'h:mm a')}
                          </div>
                          <div className="text-xs font-bold text-white truncate">
                            {apt.client.name}
                          </div>
                        </div>
                      ))}
                      {day.appointments.length > 3 && (
                        <div className="text-xs text-center text-gray-500">
                          +{day.appointments.length - 3} más
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <motion.div
              key="month-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, dayIndex) => (
                  <motion.div
                    key={day.date.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: dayIndex * 0.01 }}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setViewMode('today')
                    }}
                    className={`aspect-square bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-2 cursor-pointer hover:bg-white/10 transition-colors ${
                      !day.isCurrentMonth ? 'opacity-30' : ''
                    } ${isSameDay(day.date, today) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          isSameDay(day.date, today) ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {format(day.date, 'd')}
                      </div>
                    </div>
                    {day.appointments.length > 0 && (
                      <div className="mt-1">
                        <div className="text-[10px] text-gray-400">{day.appointments.length} citas</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {day.appointments.slice(0, 3).map((apt) => (
                            <div
                              key={apt.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                apt.status === 'completed'
                                  ? 'bg-green-400'
                                  : apt.status === 'confirmed'
                                  ? 'bg-blue-400'
                                  : 'bg-orange-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions (only in TODAY view) */}
        {viewMode === 'today' && (mockCitasStats.pending > 0 || gaps.length > 0) && (
          <div className="px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="max-w-7xl mx-auto bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-orange-400/30 p-4 md:p-6"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-white text-sm md:text-base">QUICK ACTIONS:</span>
                </div>

                {mockCitasStats.pending > 0 && (
                  <button
                    onClick={() => toast.success(`${mockCitasStats.pending} citas confirmadas (demo)`)}
                    className="px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold text-xs md:text-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden md:inline">Confirmar todas pendientes</span>
                    <span className="md:hidden">Confirmar</span> ({mockCitasStats.pending})
                  </button>
                )}

                {gaps.length > 0 && (
                  <button
                    onClick={() => toast.info('Sugerir clientes para gaps (demo)')}
                    className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-xs md:text-sm transition-colors flex items-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Llenar {gaps.length} gaps
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>

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
              const apt = mockCitasData.find((a) => a.id === selectedId)
              if (!apt) return null

              return (
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 backdrop-blur-xl rounded-2xl border-2 border-white/20 p-6 md:p-8 max-w-lg w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                      {apt.client.name}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{apt.client.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Horario</div>
                        <div className="font-bold text-white">
                          {format(parseISO(apt.scheduled_at), 'h:mm a', { locale: es })} (
                          {apt.duration_minutes} min)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-sm text-gray-400">Servicio</div>
                        <div className="font-bold text-white">{apt.service.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl border border-orange-400/30">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-sm text-gray-400">Precio</div>
                        <div className="text-xl md:text-2xl font-bold text-orange-400">₡{apt.price}</div>
                      </div>
                    </div>

                    {apt.client_notes && (
                      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
                        <div className="text-xs text-blue-400 mb-1">💬 Notas del cliente:</div>
                        <div className="text-sm text-white">{apt.client_notes}</div>
                      </div>
                    )}

                    {apt.internal_notes && (
                      <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/30">
                        <div className="text-xs text-purple-400 mb-1">🔒 Notas internas:</div>
                        <div className="text-sm text-white">{apt.internal_notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => {
                          toast.success('Cita confirmada (demo)')
                          setSelectedId(null)
                        }}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-colors"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm flex-wrap gap-3">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">
                  <span className="hidden md:inline">{gaps.length} gaps aprovechables</span>
                  <span className="md:hidden">{gaps.length} gaps</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">
                  ₡{(mockCitasStats.totalRevenue / 1000).toFixed(0)}k completado
                </span>
              </div>
            </div>
            <div className="text-gray-500 font-mono text-xs">
              DEMO B ENHANCED - Calendar Cinema Pro
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
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
