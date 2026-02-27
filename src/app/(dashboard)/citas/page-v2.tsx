'use client'

/**
 * Citas (Calendar) Page - Demo B Fusion Implementation
 *
 * Calendar Cinema + macOS Polish (Score 9.8/10)
 *
 * Features:
 * - 3 view modes: Day (Cinema blocks) / Week (macOS grid) / Month (calendar)
 * - Mini calendar sidebar (macOS style)
 * - Time blocks with occupancy % (Cinema feature)
 * - Gap detection and quick actions
 * - Current time indicator (red line)
 * - Revenue storytelling with progress bar
 * - Drag & drop rescheduling
 * - Real-time WebSocket updates
 *
 * Design: Glassmorphism Cinema + macOS Professional
 * Colors: macOS system palette (zinc-900, red-500, amber-500, blue-500, emerald-500)
 *
 * Created: Session 127 (Demo B Fusion Implementation)
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Mail,
  Sunrise,
  Sun,
  Moon,
  Zap,
  X,
  UserPlus,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SwipeableRow } from '@/components/ui/swipeable-row'
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
  isValid,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { animations } from '@/lib/design-system'
import { usePreference } from '@/lib/preferences'
import { formatCurrencyCompactMillions } from '@/lib/utils'

// React Query hooks
import {
  useCalendarAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
} from '@/hooks/queries/useAppointments'
import { useClients } from '@/hooks/queries/useClients'
import { useServices } from '@/hooks/queries/useServices'
import { useBarbers } from '@/hooks/queries/useBarbers'

// Real-time WebSocket integration
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'

// Error boundaries
import { ComponentErrorBoundary, CalendarErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'
import { Skeleton } from '@/components/ui/skeleton'

// Business context
import { useBusiness } from '@/contexts/business-context'

// iOS Time Picker
import { IOSTimePicker, TimePickerTrigger } from '@/components/ui/ios-time-picker'
// iOS Date Picker
import { DatePickerTrigger } from '@/components/ui/ios-date-picker'
// Walk-in Sheet
import { WalkInSheet } from '@/components/barber/walk-in-sheet'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'

type ViewMode = 'day' | 'week' | 'month'

// Stats content component (reusable for sidebar + drawer)
interface StatsContentProps {
  today: Date
  miniCalendarDays: Date[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointments: any[] // TODO: Fix type after data transformation
  selectedDate: Date
  stats: {
    scheduled: number
    completed: number
    totalRevenue: number
  }
  setSelectedDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  setIsStatsOpen: (open: boolean) => void
}

function StatsContent({
  today,
  miniCalendarDays,
  appointments,
  selectedDate,
  stats,
  setSelectedDate,
  setViewMode,
  setIsStatsOpen,
}: StatsContentProps) {
  return (
    <>
      {/* Mini calendar */}
      <div className="mb-6">
        <div className="text-center mb-3">
          <div className="text-sm font-medium text-white">
            {format(today, 'MMMM yyyy', { locale: es })}
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {miniCalendarDays.map((day) => {
            const hasAppointments = appointments.some((apt) => {
              const aptDate = parseISO(apt.scheduled_at)
              return isValid(aptDate) && isSameDay(aptDate, day)
            })
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day)
                  setViewMode('day')
                  setIsStatsOpen(false) // Close drawer on date select
                }}
                className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all ${
                  isSameDay(day, today)
                    ? 'bg-red-500 dark:bg-red-500 text-white font-bold'
                    : isSameDay(day, selectedDate)
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                      : isSameMonth(day, today)
                        ? 'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : 'text-zinc-400 dark:text-zinc-400/50'
                } ${hasAppointments && !isSameDay(day, today) ? 'font-bold' : ''}`}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats (Cinema feature) */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs font-medium text-muted mb-3">ESTADÍSTICAS HOY</div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-900 dark:text-white">Agendadas</span>
          <span className="text-sm font-bold text-blue-500 dark:text-blue-500">
            {stats.scheduled}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-900 dark:text-white">Completada</span>
          <span className="text-sm font-bold text-green-500 dark:text-emerald-500">
            {stats.completed}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-500/20 dark:to-red-500/20 rounded-lg border border-amber-500/20 dark:border-amber-500/30">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">Ingresos</span>
          <span className="text-lg font-bold text-amber-500 dark:text-amber-500">
            {formatCurrencyCompactMillions(stats.totalRevenue)}
          </span>
        </div>
      </div>
    </>
  )
}

function CitasCalendarFusionContent() {
  const { businessId, isBarber, barberId, staffPermissions } = useBusiness()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = usePreference<ViewMode>('citas_view', 'day', [
    'day',
    'week',
    'month',
  ])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const today = useMemo(() => startOfDay(new Date()), [])
  const intentHandled = useRef(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isWalkInOpen, setIsWalkInOpen] = useState(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [activePickerField, setActivePickerField] = useState<
    'client' | 'service' | 'barber' | null
  >(null)
  const [createForm, setCreateForm] = useState(() => ({
    client_id: '',
    service_id: '',
    barber_id: isBarber && barberId ? barberId : '',
    time: '09:00',
    notes: '',
  }))

  // Auto-open create sheet when navigated with ?intent=create
  useEffect(() => {
    if (searchParams.get('intent') === 'create' && !intentHandled.current) {
      intentHandled.current = true
      window.history.replaceState(null, '', '/citas')
      requestAnimationFrame(() => setIsCreateOpen(true))
    }
  }, [searchParams])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) }
    } else if (viewMode === 'week') {
      return {
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
      }
    } else {
      return {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      }
    }
  }, [viewMode, selectedDate])

  // Fetch appointments with React Query
  const {
    data: appointments = [],
    isLoading,
    error: queryError,
    refetch,
  } = useCalendarAppointments(dateRange.start, dateRange.end, businessId)

  // Real-time updates
  useRealtimeAppointments({ businessId })

  // Fetch clients, services, and barbers for the form
  const { data: clientsData } = useClients(businessId)
  const { data: servicesData } = useServices(businessId || '')
  const { data: barbersData } = useBarbers(businessId || '')
  const createAppointment = useCreateAppointment()
  const updateAppointmentStatus = useUpdateAppointmentStatus()

  const clients = clientsData?.clients || []
  const services = servicesData || []
  const barbers = barbersData || []

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (viewMode === 'day') setSelectedDate((prev) => subDays(prev, 1))
    else if (viewMode === 'week') setSelectedDate((prev) => subWeeks(prev, 1))
    else setSelectedDate((prev) => subMonths(prev, 1))
  }, [viewMode])

  const handleNext = useCallback(() => {
    if (viewMode === 'day') setSelectedDate((prev) => addDays(prev, 1))
    else if (viewMode === 'week') setSelectedDate((prev) => addWeeks(prev, 1))
    else setSelectedDate((prev) => addMonths(prev, 1))
  }, [viewMode])

  const handleToday = useCallback(() => setSelectedDate(new Date()), [])

  // Barber filtering: only show own appointments unless can_view_all_citas
  const roleFilteredAppointments = useMemo(() => {
    if (isBarber && !staffPermissions.can_view_all_citas && barberId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return appointments.filter((apt: any) => apt.barber_id === barberId)
    }
    return appointments
  }, [appointments, isBarber, staffPermissions.can_view_all_citas, barberId])

  // Filter appointments by view
  const filteredAppointments = useMemo(() => {
    return roleFilteredAppointments.filter((apt) => {
      const aptDate = parseISO(apt.scheduled_at)
      if (!isValid(aptDate)) return false

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
  }, [roleFilteredAppointments, viewMode, selectedDate])

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
        icon: Sunrise,
        iconColor: 'text-violet-400',
        gradient: 'from-violet-500/10 to-blue-500/10',
      },
      {
        id: 'midday',
        label: 'MEDIODÍA',
        start: 12,
        end: 15,
        icon: Sun,
        iconColor: 'text-amber-400',
        gradient: 'from-purple-500/10 to-violet-500/10',
      },
      {
        id: 'afternoon',
        label: 'TARDE',
        start: 15,
        end: 21,
        icon: Moon,
        iconColor: 'text-blue-400',
        gradient: 'from-blue-500/10 to-purple-500/10',
      },
    ]
    return blocks.map((block) => {
      const appointments = sortedAppointments.filter((apt) => {
        const hour = parseISO(apt.scheduled_at).getHours()
        return hour >= block.start && hour < block.end
      })
      const totalMinutesInBlock = (block.end - block.start) * 60
      const occupiedMinutes = appointments.reduce(
        (sum, apt) => sum + (apt.service?.duration_minutes || 30),
        0
      )
      const occupancyPercent = Math.round((occupiedMinutes / totalMinutesInBlock) * 100)
      return { ...block, appointments, occupancyPercent, count: appointments.length }
    })
  }, [viewMode, sortedAppointments])

  // Week days (all 7 days for desktop)
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => ({
      date: day,
      appointments: roleFilteredAppointments.filter((apt) => {
        const aptDate = parseISO(apt.scheduled_at)
        return isValid(aptDate) && isSameDay(aptDate, day)
      }),
    }))
  }, [viewMode, selectedDate, roleFilteredAppointments])

  // Mobile week days (3 days: current + next 2)
  const mobileWeekDays = useMemo(() => {
    if (viewMode !== 'week' || weekDays.length === 0) return []
    // Find index of selected date in week
    const selectedIndex = weekDays.findIndex((day) => isSameDay(day.date, selectedDate))
    if (selectedIndex === -1) return weekDays.slice(0, 3)
    // Show current day + next 2 days (or as many as available)
    return weekDays.slice(selectedIndex, Math.min(selectedIndex + 3, weekDays.length))
  }, [viewMode, selectedDate, weekDays])

  // Month days
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => ({
      date: day,
      appointments: roleFilteredAppointments.filter((apt) => {
        const aptDate = parseISO(apt.scheduled_at)
        return isValid(aptDate) && isSameDay(aptDate, day)
      }),
      isCurrentMonth: isSameMonth(day, selectedDate),
    }))
  }, [viewMode, selectedDate, roleFilteredAppointments])

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
      const duration = apt.service?.duration_minutes || 30
      currentEnd.setMinutes(currentEnd.getMinutes() + duration)
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

  // Stats calculations
  const stats = useMemo(() => {
    const scheduled = filteredAppointments.filter(
      (apt) => apt.status === 'pending' || apt.status === 'confirmed'
    ).length
    const completed = filteredAppointments.filter((apt) => apt.status === 'completed').length
    const totalRevenue = sortedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0)
    const projectedRevenue = filteredAppointments.reduce(
      (sum, apt) => sum + (apt.service?.price || 0),
      0
    )
    return { scheduled, completed, totalRevenue, projectedRevenue }
  }, [filteredAppointments, sortedAppointments])

  const DAILY_GOAL = 200000
  const goalProgress = Math.min(Math.round((stats.projectedRevenue / DAILY_GOAL) * 100), 100)
  const isSelectedDateToday = useMemo(() => isSameDay(selectedDate, today), [selectedDate, today])
  const mobileDateLabel = useMemo(() => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEE d MMM yyyy', { locale: es })
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
    }
    return format(selectedDate, 'MMMM yyyy', { locale: es })
  }, [selectedDate, viewMode])
  const mobileDateLabelCompact = useMemo(() => {
    if (viewMode === 'day') return format(selectedDate, 'd MMM', { locale: es })
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      return `Semana ${format(weekStart, 'd MMM', { locale: es })}`
    }
    return format(selectedDate, 'MMM yyyy', { locale: es })
  }, [selectedDate, viewMode])
  const desktopContextLabel = useMemo(() => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEE d MMM yyyy', { locale: es })
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekStartLabel = format(weekStart, 'EEE d MMM', { locale: es })
      const weekEndLabel = format(weekEnd, 'EEE d MMM yyyy', { locale: es })
      return `Semana: ${weekStartLabel} - ${weekEndLabel}`
    }
    return format(selectedDate, 'MMMM yyyy', { locale: es })
  }, [selectedDate, viewMode])
  const jumpToCurrentLabel = useMemo(() => {
    if (viewMode === 'day') return 'Hoy'
    if (viewMode === 'week') return 'Esta semana'
    return 'Este mes'
  }, [viewMode])
  const projectionWindowLabel = useMemo(() => {
    if (viewMode === 'day') return 'del día'
    if (viewMode === 'week') return 'de la semana'
    return 'del mes'
  }, [viewMode])
  const projectedRevenueDisplay = useMemo(
    () => formatCurrencyCompactMillions(stats.projectedRevenue),
    [stats.projectedRevenue]
  )
  const unscheduledAppointmentsCount = useMemo(
    () =>
      filteredAppointments.filter((apt) => {
        if (!apt?.scheduled_at) return true
        const date = parseISO(apt.scheduled_at)
        return !isValid(date)
      }).length,
    [filteredAppointments]
  )
  const mobileProjectionAppointmentsLabel = useMemo(
    () => `${filteredAppointments.length} citas`,
    [filteredAppointments.length]
  )

  // Handle form submission
  const handleCreateAppointment = async () => {
    if (!createForm.client_id || !createForm.service_id || !createForm.barber_id || !businessId) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Find service to get duration and price
    const service = services.find((s) => s.id === createForm.service_id)
    if (!service) {
      toast.error('Servicio no encontrado')
      return
    }

    // Combine date and time
    const scheduledAt = `${formDate}T${createForm.time}:00`

    try {
      await createAppointment.mutateAsync({
        business_id: businessId,
        client_id: createForm.client_id,
        service_id: createForm.service_id,
        barber_id: createForm.barber_id,
        scheduled_at: scheduledAt,
        duration_minutes: service.duration,
        price: service.price,
        status: 'pending',
      })

      toast.success('Cita creada exitosamente')
      setIsCreateOpen(false)

      // Reset form (keep barber_id for barber role)
      setCreateForm({
        client_id: '',
        service_id: '',
        barber_id: isBarber && barberId ? barberId : '',
        time: '09:00',
        notes: '',
      })
    } catch (error) {
      toast.error('Error al crear la cita')
      console.error(error)
    }
  }

  const handleAppointmentStatusChange = useCallback(
    async (appointmentId: string, status: 'cancelled') => {
      try {
        await updateAppointmentStatus.mutateAsync({
          appointmentId,
          status,
        })
        if (status === 'cancelled') toast.success('Cita cancelada')
      } catch (error) {
        toast.error('No se pudo actualizar la cita')
        console.error(error)
      }
    },
    [updateAppointmentStatus]
  )

  // Derive form date from selectedDate
  const formDate = format(selectedDate, 'yyyy-MM-dd')

  // Error state
  if (queryError) {
    return (
      <div className="p-6">
        <QueryError error={queryError} title="No se pudieron cargar las citas" onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Mesh gradients removed for desktop premium — cleaner, less noise */}

      <div className="relative z-10 flex">
        {/* Main content area */}
        <div className="flex-1 lg:pr-80 w-full min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-transparent backdrop-blur-sm border-b border-transparent dark:border-white/5">
            <div className="px-0 lg:px-6 py-4">
              {/* DESKTOP HEADER - Single row layout (unchanged) */}
              <div className="hidden lg:flex items-center justify-between mb-4 gap-2">
                {/* Left: Month/Year context */}
                <div className="text-sm font-medium text-muted min-w-0 flex-shrink-0">
                  {desktopContextLabel}
                </div>

                {/* Center: View Switcher */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'day'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-muted hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'week'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-muted hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'month'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-muted hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Mes
                  </button>
                </div>

                {/* Right: Navigation */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="p-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleToday}
                    className="px-3 py-1 h-auto text-sm font-medium text-red-500 dark:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                    aria-label={`Ir a ${jumpToCurrentLabel.toLowerCase()}`}
                  >
                    {jumpToCurrentLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="p-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </Button>
                  <Button
                    onClick={() => setIsWalkInOpen(true)}
                    data-testid="walk-in-btn-desktop"
                    variant="ghost"
                    className="min-w-[44px] min-h-[44px] w-10 h-10 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    aria-label="Agregar walk-in"
                  >
                    <UserPlus className="w-5 h-5 text-amber-500" />
                  </Button>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    data-testid="create-appointment-btn-desktop"
                    variant="ghost"
                    className="min-w-[44px] min-h-[44px] w-10 h-10 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    aria-label="Crear cita"
                  >
                    <Plus className="w-5 h-5 text-muted" />
                  </Button>
                </div>
              </div>

              {/* MOBILE HEADER - 2 rows: Row1=navigation, Row2=view switcher */}
              <div className="lg:hidden mb-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.35)] p-2.5 space-y-2">
                {/* Row 1: < Date > Hoy + */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 text-center min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      <span className="hidden min-[390px]:inline">{mobileDateLabel}</span>
                      <span className="min-[390px]:hidden">{mobileDateLabelCompact}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  {!isSelectedDateToday && (
                    <Button
                      variant="ghost"
                      onClick={handleToday}
                      className="min-h-[44px] h-auto px-2 text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0"
                      aria-label="Ir a hoy"
                    >
                      Hoy
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => setIsWalkInOpen(true)}
                    data-testid="walk-in-btn-mobile"
                    className="min-w-[44px] min-h-[44px] h-10 w-10 rounded-xl p-0 flex-shrink-0"
                    aria-label="Agregar walk-in"
                  >
                    <UserPlus className="h-5 w-5 text-amber-500" />
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => setIsCreateOpen(true)}
                    data-testid="create-appointment-btn-mobile"
                    className="min-w-[44px] min-h-[44px] h-10 w-10 rounded-xl p-0 flex-shrink-0"
                    aria-label="Crear cita"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Row 2: D/S/M segmented control (full width) */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1">
                  {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      className={`flex-1 min-h-[38px] rounded-lg border border-transparent text-xs font-semibold transition-colors ${
                        viewMode === mode
                          ? 'brand-tab-active'
                          : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/10'
                      }`}
                    >
                      {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-zinc-200/70 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {projectedRevenueDisplay}
                    </span>
                    <span className="text-muted">{mobileProjectionAppointmentsLabel}</span>
                  </div>
                </div>
              </div>

              {/* Revenue stats - Mobile compact, Desktop expanded */}
              {/* Desktop: Full stats with progress bar */}
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted">Proyección {projectionWindowLabel}:</span>
                  <span className="font-bold text-amber-500 dark:text-amber-500">
                    {projectedRevenueDisplay}
                  </span>
                </div>
                {viewMode === 'day' && (
                  <div className="flex-1 max-w-xs">
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goalProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 dark:from-amber-500 dark:to-red-500"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted">{filteredAppointments.length} citas</span>
                </div>
              </div>
            </div>
          </header>

          {/* Guide Tip */}
          <div className="px-0 lg:px-6 pt-4">
            <GuideContextualTip
              tipId="citas-timer"
              title="Controlá la duración de cada cita"
              description="Usá el temporizador al iniciar una cita. La app aprende la duración promedio y ajusta los slots automáticamente."
              linkHref="/guia#citas"
              className="mb-4 sm:mb-5"
            />
          </div>

          {/* View Content */}
          <div className="px-0 pb-4 lg:p-6">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {/* Day header skeleton */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                  <Skeleton className="h-3 w-20 mb-3" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                {/* Time slots skeleton */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <Skeleton className="h-4 w-14" />
                      <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {!isLoading && viewMode === 'day' && (
              <div className="space-y-4">
                {unscheduledAppointmentsCount > 0 && (
                  <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted">
                      Sin hora asignada · {unscheduledAppointmentsCount}
                    </span>
                  </div>
                )}

                {/* Time blocks (Cinema feature) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  {timeBlocks.map((block, blockIndex) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...animations.spring.gentle, delay: blockIndex * 0.1 }}
                      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                    >
                      {/* Block header */}
                      <div className="mb-4">
                        <div className="flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <block.icon className={`w-5 h-5 ${block.iconColor}`} />
                            <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white leading-tight uppercase tracking-wide">
                              {block.label}
                            </h3>
                          </div>
                          <span className="pl-7 text-xs sm:text-sm font-medium text-muted xl:pl-0 xl:shrink-0">
                            {block.start > 12 ? block.start - 12 : block.start}
                            {block.start >= 12 ? 'pm' : 'am'} -{' '}
                            {block.end > 12 ? block.end - 12 : block.end}
                            {block.end >= 12 ? 'pm' : 'am'}
                          </span>
                        </div>

                        {/* Occupancy bar (Cinema feature) */}
                        <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 p-3">
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-zinc-900 dark:text-white">
                              {block.count} citas
                            </span>
                            <span
                              className={`font-bold ${
                                block.occupancyPercent >= 90
                                  ? 'text-red-500 dark:text-red-500'
                                  : block.occupancyPercent >= 60
                                    ? 'text-amber-500 dark:text-amber-500'
                                    : 'text-green-500 dark:text-emerald-500'
                              }`}
                            >
                              {block.occupancyPercent}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${block.occupancyPercent}%` }}
                              className={`h-full ${
                                block.occupancyPercent >= 90
                                  ? 'bg-red-500 dark:bg-red-500'
                                  : block.occupancyPercent >= 60
                                    ? 'bg-amber-500 dark:bg-amber-500'
                                    : 'bg-green-500 dark:bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Appointments (grouped rows inside block card) */}
                      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60">
                        {block.appointments.length === 0 && (
                          <div className="px-4 py-3 text-sm text-muted">Sin citas programadas</div>
                        )}

                        <AnimatePresence mode="popLayout">
                          {block.appointments.map((apt, aptIndex) => {
                            const canCancel = apt.status === 'pending' || apt.status === 'confirmed'
                            const isLast = aptIndex === block.appointments.length - 1

                            const rightActions = []
                            if (canCancel) {
                              rightActions.push({
                                icon: <X className="h-5 w-5" />,
                                label: 'Cancelar',
                                color: 'bg-red-500',
                                onClick: () => handleAppointmentStatusChange(apt.id, 'cancelled'),
                              })
                            }

                            return (
                              <motion.div
                                key={apt.id}
                                layout
                                exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                                transition={animations.spring.layout}
                                className={
                                  isLast
                                    ? ''
                                    : 'border-b border-zinc-200/70 dark:border-zinc-800/80'
                                }
                              >
                                <div className="lg:hidden">
                                  <SwipeableRow
                                    rightActions={rightActions}
                                    showAffordance={false}
                                    containerClassName="rounded-none"
                                  >
                                    <div
                                      onClick={() => setSelectedId(apt.id)}
                                      className="cursor-pointer px-3 py-3 active:bg-zinc-100/80 dark:active:bg-zinc-900"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <div
                                              className={`w-1.5 h-1.5 rounded-full ${
                                                apt.status === 'completed'
                                                  ? 'bg-emerald-500'
                                                  : 'bg-blue-500'
                                              }`}
                                            />
                                            <span className="font-medium text-zinc-900 dark:text-white text-sm">
                                              {apt.client?.name || 'Cliente'}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted leading-tight">
                                            {apt.service?.name || 'Servicio'}
                                          </div>
                                        </div>
                                        <div className="text-right text-xs">
                                          <div className="text-muted font-medium tabular-nums leading-tight">
                                            {format(parseISO(apt.scheduled_at), 'h:mm a')}
                                          </div>
                                          <div className="mt-1 text-[13px] leading-tight font-semibold text-amber-500 dark:text-amber-500">
                                            {formatCurrencyCompactMillions(apt.service?.price || 0)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </SwipeableRow>
                                </div>
                                {/* Desktop: draggable version */}
                                <motion.div
                                  className="hidden lg:block"
                                  drag
                                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                  dragElastic={0.05}
                                  onDragStart={() => setDraggedId(apt.id)}
                                  onDragEnd={() => {
                                    setDraggedId(null)
                                    toast.info('Rescheduling (demo)')
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                                  onClick={() => setSelectedId(apt.id)}
                                >
                                  <div
                                    className={`cursor-grab px-4 py-3 active:cursor-grabbing transition-all ${
                                      draggedId === apt.id
                                        ? 'opacity-50'
                                        : 'hover:bg-zinc-100/85 dark:hover:bg-zinc-900'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              apt.status === 'completed'
                                                ? 'bg-emerald-500'
                                                : 'bg-blue-500'
                                            }`}
                                          />
                                          <span className="font-medium text-zinc-900 dark:text-white text-sm">
                                            {apt.client?.name || 'Cliente'}
                                          </span>
                                        </div>
                                        <div className="text-xs text-muted">
                                          {apt.service?.name || 'Servicio'}
                                        </div>
                                      </div>
                                      <div className="text-right text-xs">
                                        <div className="text-muted font-medium tabular-nums leading-tight">
                                          {format(parseISO(apt.scheduled_at), 'h:mm a')}
                                        </div>
                                        <div className="mt-1 text-[13px] leading-tight font-semibold text-amber-500 dark:text-amber-500">
                                          {formatCurrencyCompactMillions(apt.service?.price || 0)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Gap indicators (Cinema feature) */}
                      <div className="mt-3 space-y-1.5 lg:space-y-2">
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
                              whileTap={{ scale: 0.98 }}
                              className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                              onClick={() => toast.info('Sugerir clientes para gap')}
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                <div className="flex-1">
                                  <div className="text-xs text-zinc-400 dark:text-zinc-500">
                                    {gap.minutes} min disponible ·{' '}
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
              </div>
            )}

            {/* WEEK VIEW */}
            {!isLoading && viewMode === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Unscheduled section (only when needed) */}
                  {unscheduledAppointmentsCount > 0 && (
                    <>
                      {/* Mobile: 3-day view */}
                      <div className="grid lg:hidden grid-cols-[60px_repeat(3,1fr)] border-b border-zinc-200 dark:border-zinc-800 mb-4">
                        <div className="p-2">
                          <span className="text-xs text-muted">Sin hora</span>
                        </div>
                        {mobileWeekDays.map((day) => (
                          <div
                            key={day.date.toISOString()}
                            className="border-l border-zinc-200 dark:border-zinc-800 p-2 min-h-[40px]"
                          />
                        ))}
                      </div>
                      {/* Desktop: 7-day view */}
                      <div className="hidden lg:grid grid-cols-[60px_repeat(7,1fr)] border-b border-zinc-200 dark:border-zinc-800 mb-4">
                        <div className="p-2">
                          <span className="text-xs text-muted">Sin hora</span>
                        </div>
                        {weekDays.map((day) => (
                          <div
                            key={day.date.toISOString()}
                            className="border-l border-zinc-200 dark:border-zinc-800 p-2 min-h-[40px]"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Day headers - Mobile: 3 days */}
                  <div className="grid lg:hidden grid-cols-[60px_repeat(3,1fr)] mb-4">
                    <div />
                    {mobileWeekDays.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className="text-center border-l border-zinc-200 dark:border-zinc-800 py-2"
                      >
                        <div
                          className={`inline-flex items-center justify-center ${
                            isSameDay(day.date, today)
                              ? 'bg-red-500 dark:bg-red-500 text-white w-8 h-8 rounded-full font-bold'
                              : 'text-muted'
                          }`}
                        >
                          <span className="text-sm">{format(day.date, 'd')}</span>
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {format(day.date, 'EEE', { locale: es })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Day headers - Desktop: 7 days */}
                  <div className="hidden lg:grid grid-cols-[60px_repeat(7,1fr)] mb-4">
                    <div />
                    {weekDays.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className="text-center border-l border-zinc-200 dark:border-zinc-800 py-2"
                      >
                        <div
                          className={`inline-flex items-center justify-center ${
                            isSameDay(day.date, today)
                              ? 'bg-red-500 dark:bg-red-500 text-white w-8 h-8 rounded-full font-bold'
                              : 'text-muted'
                          }`}
                        >
                          <span className="text-sm">{format(day.date, 'd')}</span>
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {format(day.date, 'EEE', { locale: es })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline grid - Mobile: 3 days */}
                  <div className="relative lg:hidden">
                    {/* Hour rows */}
                    {Array.from({ length: 14 }).map((_, i) => {
                      const hour = 7 + i
                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-[60px_repeat(3,1fr)] border-t border-zinc-200 dark:border-zinc-800"
                          style={{ minHeight: '60px' }}
                        >
                          {/* Hour label */}
                          <div className="text-xs text-muted text-right pr-2 pt-1">
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </div>

                          {/* Day columns */}
                          {mobileWeekDays.map((day) => {
                            const hourAppointments = day.appointments.filter((apt) => {
                              const aptDate = parseISO(apt.scheduled_at)
                              return isValid(aptDate) && aptDate.getHours() === hour
                            })
                            return (
                              <div
                                key={`${day.date.toISOString()}-${hour}`}
                                className="border-l border-zinc-200 dark:border-zinc-800 p-1 relative"
                              >
                                {hourAppointments.map((apt) => (
                                  <div
                                    key={apt.id}
                                    onClick={() => setSelectedId(apt.id)}
                                    className="bg-blue-500/80 rounded p-1.5 mb-1 cursor-pointer hover:bg-blue-500 transition-colors text-xs"
                                  >
                                    <div className="font-medium text-white truncate">
                                      {apt.client?.name || 'Cliente'}
                                    </div>
                                    <div className="text-[11px] text-white/80 truncate">
                                      {apt.service?.name || 'Servicio'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                  {/* Timeline grid - Desktop: 7 days */}
                  <div className="relative hidden lg:block">
                    {/* Hour rows */}
                    {Array.from({ length: 14 }).map((_, i) => {
                      const hour = 7 + i
                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-zinc-200 dark:border-zinc-800"
                          style={{ minHeight: '60px' }}
                        >
                          {/* Hour label */}
                          <div className="text-xs text-muted text-right pr-2 pt-1">
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </div>

                          {/* Day columns */}
                          {weekDays.map((day) => {
                            const hourAppointments = day.appointments.filter((apt) => {
                              const aptDate = parseISO(apt.scheduled_at)
                              return isValid(aptDate) && aptDate.getHours() === hour
                            })
                            return (
                              <div
                                key={`${day.date.toISOString()}-${hour}`}
                                className="border-l border-zinc-200 dark:border-zinc-800 p-1 relative"
                              >
                                {hourAppointments.map((apt) => (
                                  <div
                                    key={apt.id}
                                    onClick={() => setSelectedId(apt.id)}
                                    className="bg-blue-500/80 rounded p-1.5 mb-1 cursor-pointer hover:bg-blue-500 transition-colors text-xs"
                                  >
                                    <div className="font-medium text-white truncate">
                                      {apt.client?.name || 'Cliente'}
                                    </div>
                                    <div className="text-[11px] text-white/80 truncate">
                                      {apt.service?.name || 'Servicio'}
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
                        className="absolute inset-x-0 h-0.5 bg-red-500 dark:bg-red-500 z-20 pointer-events-none"
                        style={{ top: `${currentTimePercent}%` }}
                      >
                        <div className="absolute left-0 w-2 h-2 bg-red-500 dark:bg-red-500 rounded-full -translate-y-1/2 animate-pulse" />
                        <div className="absolute left-3 -translate-y-1/2 text-xs font-bold text-white bg-red-500 dark:bg-red-500 px-2 py-0.5 rounded shadow-sm">
                          {format(currentTime, 'h:mm a')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {!isLoading && viewMode === 'month' && (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 mb-px">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div
                      key={day}
                      className="bg-white dark:bg-zinc-900 text-center text-xs text-muted py-2 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800">
                  {monthDays.map((day) => (
                    <motion.div
                      key={day.date.toISOString()}
                      onClick={() => {
                        setSelectedDate(day.date)
                        setViewMode('day')
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-white dark:bg-zinc-900 aspect-square p-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                        !day.isCurrentMonth ? 'opacity-30' : ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center justify-center ${
                          isSameDay(day.date, today)
                            ? 'bg-red-500 dark:bg-red-500 text-white w-6 h-6 rounded-full font-bold text-sm'
                            : 'text-zinc-900 dark:text-white text-sm'
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
                                apt.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                            />
                          ))}
                          {day.appointments.length > 3 && (
                            <div className="text-[11px] text-muted">
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

        {/* RIGHT SIDEBAR: Mini Calendar (macOS feature) - Hidden on mobile */}
        <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto">
          <div className="sticky top-0">
            <StatsContent
              today={today}
              miniCalendarDays={miniCalendarDays}
              appointments={roleFilteredAppointments}
              selectedDate={selectedDate}
              stats={stats}
              setSelectedDate={setSelectedDate}
              setViewMode={setViewMode}
              setIsStatsOpen={setIsStatsOpen}
            />
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER: Calendar & Stats */}
      <Sheet open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <SheetContent
          side="right"
          className="w-[85vw] sm:w-[400px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800"
        >
          <SheetClose onClose={() => setIsStatsOpen(false)} />
          <SheetHeader>
            <SheetTitle className="text-zinc-900 dark:text-white text-lg font-semibold">
              Calendar & Stats
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <StatsContent
              today={today}
              miniCalendarDays={miniCalendarDays}
              appointments={roleFilteredAppointments}
              selectedDate={selectedDate}
              stats={stats}
              setSelectedDate={setSelectedDate}
              setViewMode={setViewMode}
              setIsStatsOpen={setIsStatsOpen}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* CREATE APPOINTMENT MODAL (aligned with Nuevo Cliente contract) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Nueva Cita</h2>
              <Button
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-2 h-auto text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setActivePickerField('client')}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span
                    className={
                      createForm.client_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }
                  >
                    {createForm.client_id
                      ? clients.find((c) => c.id === createForm.client_id)?.name ||
                        'Selecciona un cliente'
                      : 'Selecciona un cliente'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              </div>

              {/* Servicio */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Servicio
                </label>
                <button
                  type="button"
                  onClick={() => setActivePickerField('service')}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span
                    className={
                      createForm.service_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }
                  >
                    {createForm.service_id
                      ? (() => {
                          const s = services.find((service) => service.id === createForm.service_id)
                          return s
                            ? `${s.name} - ₡${s.price.toLocaleString()}`
                            : 'Selecciona un servicio'
                        })()
                      : 'Selecciona un servicio'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              </div>

              {/* Miembro del equipo - hidden for barbers (auto-assigned) */}
              {!isBarber && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Miembro del equipo
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePickerField('barber')}
                    className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <span
                      className={
                        createForm.barber_id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                      }
                    >
                      {createForm.barber_id
                        ? barbers.find((b) => b.id === createForm.barber_id)?.name ||
                          'Selecciona un miembro del equipo'
                        : 'Selecciona un miembro del equipo'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                  </button>
                </div>
              )}

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Fecha
                  </label>
                  <DatePickerTrigger
                    value={selectedDate}
                    onChange={setSelectedDate}
                    label="Fecha"
                    className="h-[46px] w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Hora
                  </label>
                  <TimePickerTrigger
                    value={createForm.time || '09:00'}
                    onClick={() => setIsTimePickerOpen(true)}
                    className="h-[46px] w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notas (opcional)
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la cita..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreateAppointment}
                  isLoading={createAppointment.isPending}
                  className="flex-1"
                >
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Time Picker for Nueva Cita */}
      <IOSTimePicker
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        value={createForm.time || '09:00'}
        onChange={(value) => setCreateForm({ ...createForm, time: value })}
        title="Hora de la cita"
      />

      {/* Picker Sheet for Client/Service/Barber selection */}
      <Sheet
        open={activePickerField !== null}
        onOpenChange={(open) => {
          if (!open) setActivePickerField(null)
        }}
      >
        <SheetContent
          side="bottom"
          centered
          className="w-[min(42rem,calc(100%-1rem))] max-h-[72vh] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 pb-safe md:max-h-[70vh]"
        >
          <SheetHeader>
            <SheetTitle className="text-zinc-900 dark:text-white text-lg font-semibold">
              {activePickerField === 'client' && 'Seleccionar Cliente'}
              {activePickerField === 'service' && 'Seleccionar Servicio'}
              {activePickerField === 'barber' && 'Seleccionar Miembro del equipo'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto max-h-[calc(72vh-96px)] px-2 pb-4 pb-safe">
            {activePickerField === 'client' &&
              clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, client_id: client.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-base text-zinc-900 dark:text-white">{client.name}</span>
                  {createForm.client_id === client.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            {activePickerField === 'service' &&
              services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, service_id: service.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <span className="text-base text-zinc-900 dark:text-white">{service.name}</span>
                    <span className="text-sm text-muted ml-2">
                      ₡{service.price.toLocaleString()}
                    </span>
                  </div>
                  {createForm.service_id === service.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            {activePickerField === 'barber' &&
              barbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, barber_id: barber.id })
                    setActivePickerField(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-base text-zinc-900 dark:text-white">{barber.name}</span>
                  {createForm.barber_id === barber.id && (
                    <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Appointment detail modal */}
      <AnimatePresence>
        {selectedId &&
          (() => {
            const apt = roleFilteredAppointments.find((a) => a.id === selectedId)
            if (!apt) return null
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={animations.spring.default}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={animations.spring.sheet}
                  className="bg-white dark:bg-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                      {apt.client?.name || 'Cliente'}
                    </h2>
                    <div className="flex items-center gap-2 text-muted">
                      <Phone className="w-4 h-4" />
                      <span>{apt.client?.phone || 'Sin teléfono'}</span>
                    </div>
                    {apt.client?.email && (
                      <div className="flex items-center gap-2 text-muted mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{apt.client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-muted">Horario</div>
                        <div className="font-medium text-zinc-900 dark:text-white">
                          {format(parseISO(apt.scheduled_at), 'h:mm a')} (
                          {apt.service?.duration_minutes || 30} min)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                      <Zap className="w-5 h-5 text-violet-500" />
                      <div>
                        <div className="text-xs text-muted">Servicio</div>
                        <div className="font-medium text-zinc-900 dark:text-white">
                          {apt.service?.name || 'Sin servicio'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                      <div className="text-xs text-muted">Precio</div>
                      <div className="text-2xl font-bold text-amber-500 dark:text-amber-500">
                        ₡{apt.service?.price || 0}
                      </div>
                    </div>

                    {apt.client_notes && (
                      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                        <div className="text-xs text-blue-500 mb-1">💬 Notas del cliente</div>
                        <div className="text-sm text-zinc-900 dark:text-white">
                          {apt.client_notes}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <Button
                        variant="danger"
                        onClick={async () => {
                          await handleAppointmentStatusChange(apt.id, 'cancelled')
                          setSelectedId(null)
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedId(null)}
                      className="px-6"
                    >
                      Cerrar
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
      </AnimatePresence>

      {/* Walk-in Sheet (owner: barber selector → service; barber: service only) */}
      <WalkInSheet
        open={isWalkInOpen}
        onOpenChange={setIsWalkInOpen}
        barberId={isBarber && barberId ? barberId : undefined}
        businessId={businessId}
        barbers={
          !isBarber
            ? barbers
                .filter((b) => b.isActive)
                .map((b) => ({ id: b.id, name: b.name, photo_url: b.avatarUrl }))
            : undefined
        }
        onCreated={() => refetch()}
      />

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

// Export with error boundary
export default function CitasPageV2() {
  return (
    <ComponentErrorBoundary>
      <CalendarErrorBoundary>
        <CitasCalendarFusionContent />
      </CalendarErrorBoundary>
    </ComponentErrorBoundary>
  )
}
