'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Plus,
} from 'lucide-react'
import { mockCitasData, mockCitasStats } from '../mock-data'
import {
  format,
  parseISO,
  differenceInMinutes,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  getDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

/**
 * DEMO B FUSION: Calendar Cinema + macOS Polish
 *
 * Fusión de:
 * - Cinema: Time blocks, gaps, revenue storytelling, mesh gradients
 * - macOS: Mini calendar sidebar, clean grid, current time indicator, professional polish
 *
 * Score objetivo: 9.8/10
 */

type ViewMode = 'day' | 'week' | 'month'

export default function CitasCalendarFusionDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
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
    if (viewMode === 'day') setSelectedDate(subDays(selectedDate, 1))
    else if (viewMode === 'week') setSelectedDate(subWeeks(selectedDate, 1))
    else setSelectedDate(subMonths(selectedDate, 1))
  }

  const handleNext = () => {
    if (viewMode === 'day') setSelectedDate(addDays(selectedDate, 1))
    else if (viewMode === 'week') setSelectedDate(addWeeks(selectedDate, 1))
    else setSelectedDate(addMonths(selectedDate, 1))
  }

  const handleToday = () => setSelectedDate(new Date())

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return mockCitasData.filter((apt) => {
      const aptDate = parseISO(apt.scheduled_at)
      if (viewMode === 'day') return isSameDay(aptDate, selectedDate)
      else if (viewMode === 'week') {
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

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments]
      .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [filteredAppointments])

  // Time blocks (Cinema feature - only in day view)
  const timeBlocks = useMemo(() => {
    if (viewMode !== 'day') return []
    const blocks = [
      {
        id: 'morning',
        label: 'MAÑANA',
        start: 7,
        end: 12,
        emoji: '🌅',
        gradient: 'from-violet-500/10 to-blue-500/10',
      },
      {
        id: 'midday',
        label: 'MEDIODÍA',
        start: 12,
        end: 15,
        emoji: '☀️',
        gradient: 'from-purple-500/10 to-violet-500/10',
      },
      {
        id: 'afternoon',
        label: 'TARDE',
        start: 15,
        end: 21,
        emoji: '🌆',
        gradient: 'from-blue-500/10 to-purple-500/10',
      },
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

  // Week days
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => ({
      date: day,
      appointments: mockCitasData.filter((apt) => isSameDay(parseISO(apt.scheduled_at), day)),
    }))
  }, [viewMode, selectedDate])

  // Month days
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => ({
      date: day,
      appointments: mockCitasData.filter((apt) => isSameDay(parseISO(apt.scheduled_at), day)),
      isCurrentMonth: isSameMonth(day, selectedDate),
    }))
  }, [viewMode, selectedDate])

  // Mini calendar for sidebar
  const miniCalendarDays = useMemo(() => {
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [today])

  // Gaps (Cinema feature)
  const gaps = useMemo(() => {
    if (viewMode !== 'day') return []
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
  }, [viewMode, sortedAppointments])

  // Current time position (for day/week views)
  const currentTimePercent = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalMinutes = (hours - 7) * 60 + minutes
    const dayTotalMinutes = (21 - 7) * 60
    return (totalMinutes / dayTotalMinutes) * 100
  }, [currentTime])

  const DAILY_GOAL = 200000
  const goalProgress = Math.round((mockCitasStats.projectedRevenue / DAILY_GOAL) * 100)

  return (
    <div className="min-h-screen bg-[#1C1C1E]">
      {/* Subtle mesh gradients (15% opacity) */}
      <div className="fixed inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex">
        {/* Main content area */}
        <div className="flex-1 pr-80">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#2C2C2E]">
            <div className="px-6 py-4">
              {/* Top row: Date + View Switcher + Navigation */}
              <div className="flex items-center justify-between mb-4">
                {/* Left: Month/Year context */}
                <div className="text-sm text-[#8E8E93]">
                  {format(selectedDate, 'MMMM yyyy', { locale: es })}
                </div>

                {/* Center: View Switcher */}
                <div className="flex items-center gap-1 bg-[#2C2C2E] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'day'
                        ? 'bg-[#3A3A3C] text-white'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'week'
                        ? 'bg-[#3A3A3C] text-white'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'month'
                        ? 'bg-[#3A3A3C] text-white'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Month
                  </button>
                </div>

                {/* Right: Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    className="p-1 hover:bg-[#2C2C2E] rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#8E8E93]" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1 text-sm font-medium text-[#FF3B30] hover:bg-[#2C2C2E] rounded transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 hover:bg-[#2C2C2E] rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
                  </button>
                  <button className="p-1.5 hover:bg-[#2C2C2E] rounded transition-colors ml-2">
                    <Plus className="w-5 h-5 text-[#8E8E93]" />
                  </button>
                </div>
              </div>

              {/* Large date header (Day view only) */}
              {viewMode === 'day' && (
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-6xl font-bold text-white">{format(selectedDate, 'd')}</div>
                  <div className="text-2xl text-[#8E8E93]">
                    {format(selectedDate, 'EEEE', { locale: es })}
                  </div>
                </div>
              )}

              {/* Revenue stats (Cinema feature - compact) */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#8E8E93]">Proyectado:</span>
                  <span className="font-bold text-[#FF9500]">
                    ₡{(mockCitasStats.projectedRevenue / 1000).toFixed(0)}k
                  </span>
                </div>
                {viewMode === 'day' && (
                  <div className="flex-1 max-w-xs">
                    <div className="h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goalProgress}%` }}
                        className="h-full bg-gradient-to-r from-[#FF9500] to-[#FF3B30]"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[#8E8E93]">{filteredAppointments.length} citas</span>
                </div>
              </div>
            </div>
          </header>

          {/* View Content */}
          <div className="p-6">
            {/* DAY VIEW */}
            {viewMode === 'day' && (
              <div>
                {/* All Day section */}
                <div className="border-b border-[#2C2C2E] p-4 mb-4 min-h-[50px]">
                  <span className="text-xs text-[#8E8E93]">All Day</span>
                </div>

                {/* Time blocks (Cinema feature) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {timeBlocks.map((block, blockIndex) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: blockIndex * 0.1 }}
                    >
                      {/* Block header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{block.emoji}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{block.label}</h3>
                            <p className="text-xs text-[#8E8E93]">
                              {block.start > 12 ? block.start - 12 : block.start}
                              {block.start >= 12 ? 'pm' : 'am'} -{' '}
                              {block.end > 12 ? block.end - 12 : block.end}
                              {block.end >= 12 ? 'pm' : 'am'}
                            </p>
                          </div>
                        </div>

                        {/* Occupancy bar (Cinema feature) */}
                        <div
                          className={`bg-gradient-to-br ${block.gradient} backdrop-blur-sm rounded-xl border border-[#2C2C2E] p-3`}
                        >
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-white">{block.count} citas</span>
                            <span
                              className={`font-bold ${
                                block.occupancyPercent >= 90
                                  ? 'text-[#FF3B30]'
                                  : block.occupancyPercent >= 60
                                    ? 'text-[#FF9500]'
                                    : 'text-[#34C759]'
                              }`}
                            >
                              {block.occupancyPercent}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${block.occupancyPercent}%` }}
                              className={`h-full ${
                                block.occupancyPercent >= 90
                                  ? 'bg-[#FF3B30]'
                                  : block.occupancyPercent >= 60
                                    ? 'bg-[#FF9500]'
                                    : 'bg-[#34C759]'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Appointments */}
                      <div className="space-y-2">
                        {block.appointments.map((apt) => (
                          <motion.div
                            key={apt.id}
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.05}
                            onDragStart={() => setDraggedId(apt.id)}
                            onDragEnd={() => {
                              setDraggedId(null)
                              toast.info('Rescheduling (demo)')
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileDrag={{ scale: 1.05, zIndex: 50 }}
                            onClick={() => setSelectedId(apt.id)}
                            className={`bg-[#2C2C2E]/80 backdrop-blur-sm rounded-lg border border-[#3A3A3C] p-3 cursor-grab active:cursor-grabbing transition-all ${
                              draggedId === apt.id ? 'opacity-50' : 'hover:bg-[#3A3A3C]/60'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      apt.status === 'completed'
                                        ? 'bg-[#34C759]'
                                        : apt.status === 'confirmed'
                                          ? 'bg-[#0A84FF]'
                                          : 'bg-[#FF9500]'
                                    }`}
                                  />
                                  <span className="font-medium text-white text-sm">
                                    {apt.client.name}
                                  </span>
                                </div>
                                <div className="text-xs text-[#8E8E93]">{apt.service.name}</div>
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-[#8E8E93] font-mono">
                                  {format(parseISO(apt.scheduled_at), 'h:mm a')}
                                </div>
                                <div className="text-[#FF9500] font-bold mt-0.5">
                                  ₡{(apt.price / 1000).toFixed(0)}k
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Gap indicators (Cinema feature) */}
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
                              className="bg-[#34C759]/5 rounded-lg border-2 border-dashed border-[#34C759]/30 p-3 cursor-pointer hover:bg-[#34C759]/10 transition-all"
                              onClick={() => toast.info('Sugerir clientes para gap (demo)')}
                            >
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#34C759]" />
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-[#34C759]">
                                    {gap.minutes} MIN GAP
                                  </div>
                                  <div className="text-xs text-[#8E8E93]">
                                    {format(parseISO(gap.start), 'h:mm a')} -{' '}
                                    {format(parseISO(gap.end), 'h:mm a')}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions (Cinema feature) */}
                {(mockCitasStats.pending > 0 || gaps.length > 0) && (
                  <div className="mt-6 bg-[#FF9500]/10 rounded-xl border border-[#FF9500]/20 p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-[#FF9500]" />
                        <span className="font-bold text-white">QUICK ACTIONS:</span>
                      </div>
                      {mockCitasStats.pending > 0 && (
                        <button
                          onClick={() =>
                            toast.success(`${mockCitasStats.pending} confirmadas (demo)`)
                          }
                          className="px-4 py-2 bg-[#0A84FF] hover:bg-[#0A84FF]/80 rounded-lg font-medium text-sm transition-colors"
                        >
                          Confirmar ({mockCitasStats.pending})
                        </button>
                      )}
                      {gaps.length > 0 && (
                        <button
                          onClick={() => toast.info('Llenar gaps (demo)')}
                          className="px-4 py-2 bg-[#34C759] hover:bg-[#34C759]/80 rounded-lg font-medium text-sm transition-colors"
                        >
                          Llenar {gaps.length} gaps
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* All Day section */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#2C2C2E] mb-4">
                    <div className="p-2">
                      <span className="text-xs text-[#8E8E93]">All Day</span>
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className="border-l border-[#2C2C2E] p-2 min-h-[40px]"
                      />
                    ))}
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] mb-4">
                    <div />
                    {weekDays.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className="text-center border-l border-[#2C2C2E] py-2"
                      >
                        <div
                          className={`inline-flex items-center justify-center ${
                            isSameDay(day.date, today)
                              ? 'bg-[#FF3B30] text-white w-8 h-8 rounded-full font-bold'
                              : 'text-[#8E8E93]'
                          }`}
                        >
                          <span className="text-sm">{format(day.date, 'd')}</span>
                        </div>
                        <div className="text-xs text-[#8E8E93] mt-1">
                          {format(day.date, 'EEE', { locale: es })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline grid */}
                  <div className="relative">
                    {/* Hour rows */}
                    {Array.from({ length: 14 }).map((_, i) => {
                      const hour = 7 + i
                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-[#2C2C2E]"
                          style={{ minHeight: '60px' }}
                        >
                          {/* Hour label */}
                          <div className="text-xs text-[#8E8E93] text-right pr-2 pt-1">
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </div>

                          {/* Day columns */}
                          {weekDays.map((day) => {
                            const hourAppointments = day.appointments.filter((apt) => {
                              return parseISO(apt.scheduled_at).getHours() === hour
                            })
                            return (
                              <div
                                key={`${day.date.toISOString()}-${hour}`}
                                className="border-l border-[#2C2C2E] p-1 relative"
                              >
                                {hourAppointments.map((apt) => (
                                  <div
                                    key={apt.id}
                                    onClick={() => setSelectedId(apt.id)}
                                    className="bg-[#0A84FF]/80 rounded p-1.5 mb-1 cursor-pointer hover:bg-[#0A84FF] transition-colors text-xs"
                                  >
                                    <div className="font-medium text-white truncate">
                                      {apt.client.name}
                                    </div>
                                    <div className="text-[10px] text-white/80 truncate">
                                      {apt.service.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}

                    {/* Current time indicator (Week view) */}
                    {currentTime.getHours() >= 7 && currentTime.getHours() < 21 && (
                      <div
                        className="absolute inset-x-0 h-0.5 bg-[#FF3B30] z-20 pointer-events-none"
                        style={{ top: `${currentTimePercent}%` }}
                      >
                        <div className="absolute left-0 w-2 h-2 bg-[#FF3B30] rounded-full -translate-y-1/2 animate-pulse" />
                        <div className="absolute left-3 -translate-y-1/2 text-xs font-bold text-[#FF3B30] bg-[#1C1C1E] px-2 py-0.5 rounded">
                          {format(currentTime, 'h:mm a')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {viewMode === 'month' && (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-px bg-[#2C2C2E] mb-px">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="bg-[#1C1C1E] text-center text-xs text-[#8E8E93] py-2 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px bg-[#2C2C2E]">
                  {monthDays.map((day) => (
                    <motion.div
                      key={day.date.toISOString()}
                      onClick={() => {
                        setSelectedDate(day.date)
                        setViewMode('day')
                      }}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-[#1C1C1E] aspect-square p-2 cursor-pointer hover:bg-[#2C2C2E] transition-colors ${
                        !day.isCurrentMonth ? 'opacity-30' : ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center justify-center ${
                          isSameDay(day.date, today)
                            ? 'bg-[#FF3B30] text-white w-6 h-6 rounded-full font-bold text-sm'
                            : 'text-white text-sm'
                        }`}
                      >
                        {format(day.date, 'd')}
                      </div>

                      {/* Event indicators (max 3 dots) */}
                      {day.appointments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {day.appointments.slice(0, 3).map((apt, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                apt.status === 'completed'
                                  ? 'bg-[#34C759]'
                                  : apt.status === 'confirmed'
                                    ? 'bg-[#0A84FF]'
                                    : 'bg-[#FF9500]'
                              }`}
                            />
                          ))}
                          {day.appointments.length > 3 && (
                            <div className="text-[10px] text-[#8E8E93]">
                              +{day.appointments.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Mini Calendar (macOS feature) */}
        <div className="fixed top-0 right-0 w-80 h-screen bg-[#1C1C1E] border-l border-[#2C2C2E] p-6 overflow-y-auto">
          <div className="sticky top-0">
            {/* Mini calendar */}
            <div className="mb-6">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-white">
                  {format(today, 'MMMM yyyy', { locale: es })}
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-[#8E8E93] font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {miniCalendarDays.map((day) => {
                  const hasAppointments = mockCitasData.some((apt) =>
                    isSameDay(parseISO(apt.scheduled_at), day)
                  )
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day)
                        setViewMode('day')
                      }}
                      className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all ${
                        isSameDay(day, today)
                          ? 'bg-[#FF3B30] text-white font-bold'
                          : isSameDay(day, selectedDate)
                            ? 'bg-[#3A3A3C] text-white'
                            : isSameMonth(day, today)
                              ? 'text-white hover:bg-[#2C2C2E]'
                              : 'text-[#8E8E93]/50'
                      } ${hasAppointments && !isSameDay(day, today) ? 'font-bold' : ''}`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sidebar stats (Cinema feature) */}
            <div className="space-y-3 pt-4 border-t border-[#2C2C2E]">
              <div className="text-xs font-medium text-[#8E8E93] mb-3">TODAY&apos;S STATS</div>

              <div className="flex items-center justify-between p-3 bg-[#2C2C2E]/50 rounded-lg">
                <span className="text-sm text-white">Pending</span>
                <span className="text-sm font-bold text-[#FF9500]">{mockCitasStats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#2C2C2E]/50 rounded-lg">
                <span className="text-sm text-white">Confirmed</span>
                <span className="text-sm font-bold text-[#0A84FF]">{mockCitasStats.confirmed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#2C2C2E]/50 rounded-lg">
                <span className="text-sm text-white">Completed</span>
                <span className="text-sm font-bold text-[#34C759]">{mockCitasStats.completed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FF9500]/20 to-[#FF3B30]/20 rounded-lg border border-[#FF9500]/30">
                <span className="text-sm font-bold text-white">Revenue</span>
                <span className="text-lg font-bold text-[#FF9500]">
                  ₡{(mockCitasStats.totalRevenue / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment detail modal */}
      <AnimatePresence>
        {selectedId &&
          (() => {
            const apt = mockCitasData.find((a) => a.id === selectedId)
            if (!apt) return null
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-[#2C2C2E] rounded-2xl p-8 max-w-lg w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{apt.client.name}</h2>
                    <div className="flex items-center gap-2 text-[#8E8E93]">
                      <Phone className="w-4 h-4" />
                      <span>{apt.client.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-[#1C1C1E] rounded-xl">
                      <Clock className="w-5 h-5 text-[#0A84FF]" />
                      <div>
                        <div className="text-xs text-[#8E8E93]">Horario</div>
                        <div className="font-medium text-white">
                          {format(parseISO(apt.scheduled_at), 'h:mm a')} ({apt.duration_minutes}{' '}
                          min)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-[#1C1C1E] rounded-xl">
                      <Zap className="w-5 h-5 text-[#AF52DE]" />
                      <div>
                        <div className="text-xs text-[#8E8E93]">Servicio</div>
                        <div className="font-medium text-white">{apt.service.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-[#FF9500]/10 rounded-xl border border-[#FF9500]/30">
                      <DollarSign className="w-5 h-5 text-[#FF9500]" />
                      <div>
                        <div className="text-xs text-[#8E8E93]">Precio</div>
                        <div className="text-2xl font-bold text-[#FF9500]">₡{apt.price}</div>
                      </div>
                    </div>

                    {apt.client_notes && (
                      <div className="p-4 bg-[#0A84FF]/10 rounded-xl border border-[#0A84FF]/30">
                        <div className="text-xs text-[#0A84FF] mb-1">💬 Notas del cliente</div>
                        <div className="text-sm text-white">{apt.client_notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => {
                          toast.success('Confirmada (demo)')
                          setSelectedId(null)
                        }}
                        className="flex-1 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/80 rounded-xl font-medium transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          toast.success('Check-in (demo)')
                          setSelectedId(null)
                        }}
                        className="flex-1 py-3 bg-[#34C759] hover:bg-[#34C759]/80 rounded-xl font-medium transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                    <button className="px-6 py-3 bg-[#3A3A3C] hover:bg-[#48484A] rounded-xl font-medium transition-colors">
                      Editar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
      </AnimatePresence>

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
      `}</style>
    </div>
  )
}
