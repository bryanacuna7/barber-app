'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sunrise, Sun, Moon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
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
import { usePreference } from '@/lib/preferences'
import { formatCurrencyCompactMillions } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Appointment } from '@/types/domain'
import { useSelection } from '@/hooks/useSelection'
import { BulkActionsToolbar } from '@/components/ui/bulk-actions-toolbar'

// React Query hooks
import { useCalendarAppointments, useCreateAppointment } from '@/hooks/queries/useAppointments'
import { useOptimisticAppointmentStatus } from '@/hooks/queries/useOptimisticAppointments'
import { useClients } from '@/hooks/queries/useClients'
import { useServices } from '@/hooks/queries/useServices'
import { useBarbers } from '@/hooks/queries/useBarbers'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { ComponentErrorBoundary, CalendarErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'
import { useBusiness } from '@/contexts/business-context'
import { WalkInSheet } from '@/components/barber/walk-in-sheet'
import { GuideContextualTip } from '@/components/guide/guide-contextual-tip'

// Extracted sub-components
import { CalendarHeader } from '@/components/calendar/calendar-header'
import { CalendarDayView } from '@/components/calendar/calendar-day-view'
import { CalendarWeekView } from '@/components/calendar/calendar-week-view'
import { CalendarMonthView } from '@/components/calendar/calendar-month-view'
import { CalendarStatsPanel } from '@/components/calendar/calendar-stats-panel'
import { CreateAppointmentSheet } from '@/components/calendar/create-appointment-sheet'
import { AppointmentDetailModal } from '@/components/calendar/appointment-detail-modal'
import { ClientEffects } from '@/components/dashboard/client-effects'
import { useSavedFilters, type SavedFilter } from '@/hooks/useSavedFilters'
import { SavedFilterBar } from '@/components/ui/saved-filter-bar'

type ViewMode = 'day' | 'week' | 'month'
type StatusFilter = 'all' | 'scheduled' | 'completed'

interface CitasFilterState {
  statusFilter: StatusFilter
}

const CITAS_FILTER_PRESETS: SavedFilter<CitasFilterState>[] = [
  { id: 'all', label: 'Todas', filter: { statusFilter: 'all' } },
  { id: 'scheduled', label: 'Agendadas', filter: { statusFilter: 'scheduled' } },
  { id: 'completed', label: 'Completadas', filter: { statusFilter: 'completed' } },
]

const DEFAULT_CITAS_FILTER: CitasFilterState = { statusFilter: 'all' }

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

  // Saved filter presets
  const savedFilters = useSavedFilters<CitasFilterState>({
    pageKey: 'citas',
    defaultFilter: DEFAULT_CITAS_FILTER,
    builtInPresets: CITAS_FILTER_PRESETS,
  })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    savedFilters.activeFilter.statusFilter
  )

  const handleApplyCitasPreset = (presetId: string) => {
    savedFilters.applyPreset(presetId)
    const preset = savedFilters.presets.find((p) => p.id === presetId)
    if (preset) setStatusFilter(preset.filter.statusFilter)
  }

  const handleSaveCitasPreset = (label: string) => {
    savedFilters.savePreset(label, { statusFilter })
  }

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
      return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }
    }
  }, [viewMode, selectedDate])

  // Fetch appointments with React Query
  const {
    data: appointments = [],
    isLoading,
    error: queryError,
    refetch,
  } = useCalendarAppointments(dateRange.start, dateRange.end, businessId)

  useRealtimeAppointments({ businessId })

  const { data: clientsData } = useClients(businessId)
  const { data: servicesData } = useServices(businessId || '')
  const { data: barbersData } = useBarbers(businessId || '')
  const createAppointment = useCreateAppointment()
  const updateAppointmentStatus = useOptimisticAppointmentStatus()

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

  // Barber filtering
  const roleFilteredAppointments = useMemo(() => {
    if (isBarber && !staffPermissions.can_view_all_citas && barberId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return appointments.filter((apt: any) => apt.barber_id === barberId)
    }
    return appointments
  }, [appointments, isBarber, staffPermissions.can_view_all_citas, barberId])

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
      .filter((apt) => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'scheduled')
          return apt.status === 'pending' || apt.status === 'confirmed'
        if (statusFilter === 'completed') return apt.status === 'completed'
        return true
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [filteredAppointments, statusFilter])

  const selection = useSelection(sortedAppointments)
  const clearSelection = selection.clear

  useEffect(() => {
    if (viewMode !== 'day') {
      clearSelection()
    }
  }, [viewMode, clearSelection])

  // Time blocks (Cinema feature - day view only)
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
      const blockAppointments = sortedAppointments.filter((apt) => {
        const hour = parseISO(apt.scheduled_at).getHours()
        return hour >= block.start && hour < block.end
      })
      const totalMinutesInBlock = (block.end - block.start) * 60
      const occupiedMinutes = blockAppointments.reduce(
        (sum, apt) => sum + (apt.service?.duration_minutes || 30),
        0
      )
      const occupancyPercent = Math.round((occupiedMinutes / totalMinutesInBlock) * 100)
      return {
        ...block,
        appointments: blockAppointments,
        occupancyPercent,
        count: blockAppointments.length,
      }
    })
  }, [viewMode, sortedAppointments])

  // Week days
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

  const mobileWeekDays = useMemo(() => {
    if (viewMode !== 'week' || weekDays.length === 0) return []
    const selectedIndex = weekDays.findIndex((day) => isSameDay(day.date, selectedDate))
    if (selectedIndex === -1) return weekDays.slice(0, 3)
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

  const currentTimePercent = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalMinutes = (hours - 7) * 60 + minutes
    const dayTotalMinutes = (21 - 7) * 60
    return (totalMinutes / dayTotalMinutes) * 100
  }, [currentTime])

  // Stats
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

  // Header labels
  const mobileDateLabel = useMemo(() => {
    if (viewMode === 'day') return format(selectedDate, 'EEE d MMM yyyy', { locale: es })
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const we = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `${format(ws, 'd MMM', { locale: es })} - ${format(we, 'd MMM yyyy', { locale: es })}`
    }
    return format(selectedDate, 'MMMM yyyy', { locale: es })
  }, [selectedDate, viewMode])

  const mobileDateLabelCompact = useMemo(() => {
    if (viewMode === 'day') return format(selectedDate, 'd MMM', { locale: es })
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 })
      return `Semana ${format(ws, 'd MMM', { locale: es })}`
    }
    return format(selectedDate, 'MMM yyyy', { locale: es })
  }, [selectedDate, viewMode])

  const desktopContextLabel = useMemo(() => {
    if (viewMode === 'day') return format(selectedDate, 'EEE d MMM yyyy', { locale: es })
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const we = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `Semana: ${format(ws, 'EEE d MMM', { locale: es })} - ${format(we, 'EEE d MMM yyyy', { locale: es })}`
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

  // Derive form date from selectedDate
  const formDate = format(selectedDate, 'yyyy-MM-dd')

  // Handlers
  const handleCreateAppointment = async () => {
    if (!createForm.client_id || !createForm.service_id || !createForm.barber_id || !businessId) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }
    const service = services.find((s) => s.id === createForm.service_id)
    if (!service) {
      toast.error('Servicio no encontrado')
      return
    }
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
        await updateAppointmentStatus.mutateAsync({ appointmentId, status })
        if (status === 'cancelled') toast.success('Cita cancelada')
      } catch (error) {
        toast.error('No se pudo actualizar la cita')
        console.error(error)
      }
    },
    [updateAppointmentStatus]
  )

  async function handleBulkAction(actionId: string, ids: string[]) {
    if (ids.length === 0) return

    const statusByActionId: Record<string, Appointment['status']> = {
      'appointment.confirm': 'confirmed',
      'appointment.complete': 'completed',
      'appointment.cancel': 'cancelled',
    }

    const status = statusByActionId[actionId]
    if (!status) {
      toast.info('Acción masiva no disponible')
      return
    }

    const results = await Promise.allSettled(
      ids.map((appointmentId) => updateAppointmentStatus.mutateAsync({ appointmentId, status }))
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failureCount = results.length - successCount

    if (successCount > 0) {
      clearSelection()
      toast.success(
        successCount === 1 ? '1 cita actualizada' : `${successCount} citas actualizadas`
      )
    }

    if (failureCount > 0) {
      toast.error(
        failureCount === 1 ? '1 cita no se pudo actualizar' : `${failureCount} citas fallaron`
      )
    }
  }

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
      <ClientEffects title="Citas" />
      <div className="relative z-10 flex">
        {/* Main content area */}
        <div className="flex-1 lg:pr-80 w-full min-w-0">
          <CalendarHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onCreateOpen={() => setIsCreateOpen(true)}
            onWalkInOpen={() => setIsWalkInOpen(true)}
            isSelectedDateToday={isSelectedDateToday}
            desktopContextLabel={desktopContextLabel}
            mobileDateLabel={mobileDateLabel}
            mobileDateLabelCompact={mobileDateLabelCompact}
            jumpToCurrentLabel={jumpToCurrentLabel}
            projectedRevenueDisplay={projectedRevenueDisplay}
            mobileProjectionAppointmentsLabel={mobileProjectionAppointmentsLabel}
            projectionWindowLabel={projectionWindowLabel}
            goalProgress={goalProgress}
            appointmentCount={filteredAppointments.length}
          />

          {/* Saved Filter Presets */}
          <div className="hidden lg:block px-4 lg:px-6 pt-2">
            <SavedFilterBar
              presets={savedFilters.presets}
              activePresetId={savedFilters.activePresetId}
              onApplyPreset={handleApplyCitasPreset}
              onDeletePreset={savedFilters.deletePreset}
              onSavePreset={handleSaveCitasPreset}
              canSave={statusFilter !== 'all'}
            />
          </div>

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
            {isLoading && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                  <Skeleton className="h-3 w-20 mb-3" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
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

            {!isLoading && viewMode === 'day' && (
              <CalendarDayView
                timeBlocks={timeBlocks}
                gaps={gaps}
                unscheduledCount={unscheduledAppointmentsCount}
                selectedId={selectedId}
                onSelectId={setSelectedId}
                draggedId={draggedId}
                onDragId={setDraggedId}
                onStatusChange={handleAppointmentStatusChange}
                isBarber={isBarber}
                onWalkIn={() => setIsWalkInOpen(true)}
                isSelected={selection.isSelected}
                onToggleSelect={selection.toggle}
                selectionCount={selection.count}
              />
            )}

            {!isLoading && viewMode === 'week' && (
              <CalendarWeekView
                weekDays={weekDays}
                mobileWeekDays={mobileWeekDays}
                selectedDate={selectedDate}
                currentTime={currentTime}
                currentTimePercent={currentTimePercent}
                isSelectedDateToday={isSelectedDateToday}
                unscheduledCount={unscheduledAppointmentsCount}
                filteredAppointments={filteredAppointments}
                onSelectDate={setSelectedDate}
                onSelectAppointment={setSelectedId}
              />
            )}

            {!isLoading && viewMode === 'month' && (
              <CalendarMonthView
                monthDays={monthDays}
                today={today}
                onDayClick={(date) => {
                  setSelectedDate(date)
                  setViewMode('day')
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Mini Calendar (macOS feature) - Hidden on mobile */}
        <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto">
          <div className="sticky top-0">
            <CalendarStatsPanel
              today={today}
              miniCalendarDays={miniCalendarDays}
              appointments={roleFilteredAppointments}
              selectedDate={selectedDate}
              stats={stats}
              setSelectedDate={setSelectedDate}
              setViewMode={setViewMode}
              onCloseDrawer={() => setIsStatsOpen(false)}
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
            <SheetTitle className="text-foreground text-lg font-semibold">
              Calendar & Stats
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CalendarStatsPanel
              today={today}
              miniCalendarDays={miniCalendarDays}
              appointments={roleFilteredAppointments}
              selectedDate={selectedDate}
              stats={stats}
              setSelectedDate={setSelectedDate}
              setViewMode={setViewMode}
              onCloseDrawer={() => setIsStatsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Appointment */}
      <CreateAppointmentSheet
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        clients={clients}
        services={services}
        barbers={barbers}
        formDate={formDate}
        onDateChange={setSelectedDate}
        selectedDate={selectedDate}
        onSubmit={handleCreateAppointment}
        isPending={createAppointment.isPending}
        isBarber={isBarber}
        barberId={barberId ?? null}
        activePickerField={activePickerField}
        setActivePickerField={setActivePickerField}
        isTimePickerOpen={isTimePickerOpen}
        setIsTimePickerOpen={setIsTimePickerOpen}
      />

      {/* Appointment Detail */}
      <AppointmentDetailModal
        selectedId={selectedId}
        appointments={roleFilteredAppointments}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleAppointmentStatusChange}
      />

      {/* Walk-in Sheet */}
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

      <BulkActionsToolbar
        count={selection.count}
        entityType="appointment"
        onAction={handleBulkAction}
        selectedIds={Array.from(selection.selected)}
        onClear={selection.clear}
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

export default function CitasPage() {
  return (
    <ComponentErrorBoundary>
      <CalendarErrorBoundary>
        <CitasCalendarFusionContent />
      </CalendarErrorBoundary>
    </ComponentErrorBoundary>
  )
}
