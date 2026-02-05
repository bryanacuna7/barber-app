'use client'

/**
 * Citas (Calendar) Page - Modernized Version (V2)
 *
 * Integrated with:
 * - React Query hooks (useCalendarAppointments, useServices, useClients)
 * - Real-time WebSocket updates (useRealtimeAppointments)
 * - Error boundaries (CalendarErrorBoundary for calendar views)
 * - Feature flag controlled
 *
 * Most complex page: 5 view modes (list, calendar/day, week, month, timeline)
 *
 * Created: Session 121 (Phase 1 Week 2 - Citas Modernization)
 */

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  format,
  addDays,
  isSameDay,
  isToday,
  isTomorrow,
  startOfWeek,
  endOfWeek,
  parseISO,
  isValid,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Clock,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Banknote,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'
import { toast } from 'sonner'

// Components
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge, type AppointmentStatus } from '@/components/ui/badge'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'

// Appointment components
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { MiniCalendar } from '@/components/appointments/mini-calendar'
import { AppointmentFilters } from '@/components/appointments/appointment-filters'
import { DaySchedule } from '@/components/appointments/day-schedule'
import { WeekView } from '@/components/appointments/week-view'
import { MonthView } from '@/components/appointments/month-view'
import { CitasTourWrapper } from '@/components/tours/citas-tour-wrapper'

// Lazy load AppointmentForm (heavy modal component)
const AppointmentForm = dynamic(
  () =>
    import('@/components/appointments/appointment-form').then((mod) => ({
      default: mod.AppointmentForm,
    })),
  { ssr: false }
)
import type { AppointmentFormData } from '@/components/appointments/appointment-form'

// Utils
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

// Types
import type { Appointment, Service, Client } from '@/types'

// NEW: React Query hooks
import { useCalendarAppointments } from '@/hooks/queries/useAppointments'
import { useServices } from '@/hooks/queries/useServices'
import { useClients } from '@/hooks/queries/useClients'

// NEW: Real-time WebSocket integration
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'

// NEW: Error boundaries
import { ComponentErrorBoundary, CalendarErrorBoundary } from '@/components/error-boundaries'
import { QueryError } from '@/components/ui/query-error'

// NEW: Business context for authentication data
import { useBusiness } from '@/contexts/business-context'

type ViewMode = 'list' | 'calendar' | 'week' | 'month' | 'timeline'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, 'EEEE', { locale: es })
}

// Get dynamic date label based on view mode
function getDateLabelForView(date: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'week': {
      // Show week range: "2-8 Feb 2026"
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

      // If start and end are in the same month
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${format(weekStart, 'd', { locale: es })}-${format(weekEnd, 'd MMM yyyy', { locale: es })}`
      }

      // If different months
      return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
    }

    case 'month': {
      // Show month and year: "Febrero 2026"
      return format(date, 'MMMM yyyy', { locale: es })
    }

    default: {
      // For list, calendar, timeline: show full date with day name
      return format(date, 'EEEE, d \'de\' MMMM yyyy', { locale: es })
    }
  }
}

function CitasPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize state from URL params
  const initialDate = useMemo(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const parsed = parseISO(dateParam)
      if (isValid(parsed)) return parsed
    }
    return new Date()
  }, [searchParams])

  const initialView = useMemo(() => {
    const viewParam = searchParams.get('view')
    const validViews: ViewMode[] = ['list', 'calendar', 'week', 'month', 'timeline']
    if (viewParam && validViews.includes(viewParam as ViewMode)) {
      return viewParam as ViewMode
    }
    return 'list'
  }, [searchParams])

  // State
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedSlotDateTime, setSelectedSlotDateTime] = useState<Date | undefined>(undefined)

  // NEW: Business ID from context (server-side auth passed down)
  const { businessId } = useBusiness()

  // Calculate week range for efficient batch loading
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate])
  const weekEnd = useMemo(() => endOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate])

  // NEW: React Query hooks (standardized pattern)
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useCalendarAppointments(weekStart, weekEnd, businessId)

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices(businessId)

  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients(businessId)

  // NEW: Real-time WebSocket updates
  useRealtimeAppointments({ businessId, enabled: !!businessId })

  // Extract data from new response formats
  const services = servicesData || []
  const clients = clientsData?.clients || []

  // Combined loading state
  const isLoading = appointmentsLoading || servicesLoading || clientsLoading

  // Pull to refresh handler
  const handleRefresh = async () => {
    await refetchAppointments()
  }

  // Update URL when view or date changes
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('view', viewMode)
    params.set('date', format(selectedDate, 'yyyy-MM-dd'))
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [viewMode, selectedDate, router])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard shortcuts (same as original)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ignore if modal is open
      if (isFormOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setSelectedDate((prev) => addDays(prev, -1))
          break

        case 'ArrowRight':
          e.preventDefault()
          setSelectedDate((prev) => addDays(prev, 1))
          break

        case 'ArrowUp':
          e.preventDefault()
          if (viewMode === 'week' || viewMode === 'month') {
            setSelectedDate((prev) => addDays(prev, -7))
          }
          break

        case 'ArrowDown':
          e.preventDefault()
          if (viewMode === 'week' || viewMode === 'month') {
            setSelectedDate((prev) => addDays(prev, 7))
          }
          break

        case 't':
        case 'T':
          e.preventDefault()
          setSelectedDate(new Date())
          break

        case 'n':
        case 'N':
          e.preventDefault()
          setIsFormOpen(true)
          break

        case '1':
          e.preventDefault()
          setViewMode('list')
          break

        case '2':
          e.preventDefault()
          setViewMode('calendar')
          break

        case '3':
          e.preventDefault()
          setViewMode('week')
          break

        case '4':
          e.preventDefault()
          setViewMode('month')
          break

        case '5':
          e.preventDefault()
          setViewMode('timeline')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, isFormOpen])

  // Filter appointments by status and search
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false
      }
      if (search) {
        const searchLower = search.toLowerCase()
        const clientName = apt.client?.name?.toLowerCase() || ''
        const clientPhone = apt.client?.phone || ''
        if (!clientName.includes(searchLower) && !clientPhone.includes(search)) {
          return false
        }
      }
      return true
    })
  }, [appointments, statusFilter, search])

  // Additional filter by selected date for List and Timeline views
  const dayFilteredAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => {
      return isSameDay(new Date(apt.scheduled_at), selectedDate)
    })
  }, [filteredAppointments, selectedDate])

  // Stats - Optimized single-pass calculation
  const stats = useMemo(() => {
    const clientIds = new Set<string>()

    const result = appointments.reduce(
      (acc, appointment) => {
        // Only process appointments for selected date
        if (!isSameDay(new Date(appointment.scheduled_at), selectedDate)) {
          return acc
        }

        acc.total++

        // Track unique clients
        if (appointment.client_id) {
          clientIds.add(appointment.client_id)
        }

        // Accumulate by status
        const price = Number(appointment.price) || 0

        switch (appointment.status) {
          case 'completed':
            acc.completed++
            acc.revenue += price
            break
          case 'pending':
          case 'confirmed':
            acc.pending++
            acc.expectedRevenue += price
            break
          case 'cancelled':
            acc.cancelled++
            break
        }

        return acc
      },
      {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        revenue: 0,
        expectedRevenue: 0,
      }
    )

    return {
      ...result,
      clients: clientIds.size,
    }
  }, [appointments, selectedDate])

  // Handle appointment form submission
  const handleSubmit = async (formData: AppointmentFormData): Promise<void> => {
    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : '/api/appointments'

      const response = await fetch(url, {
        method: editingAppointment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingAppointment ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente'
        )
        setIsFormOpen(false)
        setEditingAppointment(null)
        // Real-time hook will auto-refresh
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar la cita')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error('Error al guardar la cita')
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Cita eliminada exitosamente')
        // Real-time hook will auto-refresh
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al eliminar la cita')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Error al eliminar la cita')
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Estado actualizado')
        // Real-time hook will auto-refresh
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  // NEW: Handle query errors
  if (appointmentsError || servicesError || clientsError) {
    const error = appointmentsError || servicesError || clientsError
    return (
      <QueryError
        title="Error al cargar citas"
        error={error}
        onRetry={() => {
          refetchAppointments()
        }}
      />
    )
  }

  // Show loading only on initial load (not on refetch)
  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Render content based on view mode...
  // (The rest of the render logic will be added next)

  return (
    <ComponentErrorBoundary>
      <CitasTourWrapper>
        <div className="flex flex-col gap-6 pb-6">
          {/* Header with stats */}
          <ComponentErrorBoundary>
            <div className="flex flex-col gap-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Citas</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Completadas</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {stats.completed}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Pendientes</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {stats.pending}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-violet-500/10">
                      <Banknote className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Ingresos</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {formatCurrencyCompact(stats.revenue)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </ComponentErrorBoundary>

          {/* View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate((prev) => addDays(prev, viewMode === 'week' ? -7 : viewMode === 'month' ? -30 : -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate((prev) => addDays(prev, viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-2 font-medium capitalize">
                {getDateLabelForView(selectedDate, viewMode)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-1" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Día
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Semana
                  </TabsTrigger>
                  <TabsTrigger value="month">
                    <CalendarRange className="h-4 w-4 mr-1" />
                    Mes
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Clock className="h-4 w-4 mr-1" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Filters */}
          <AppointmentFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* NEW: Calendar views wrapped with CalendarErrorBoundary */}
          <CalendarErrorBoundary appointments={dayFilteredAppointments as any}>
            <PullToRefresh onRefresh={handleRefresh}>
              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {dayFilteredAppointments.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title="No hay citas"
                      description="No se encontraron citas para esta fecha"
                    />
                  ) : (
                    dayFilteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment as any}
                        onEdit={() => handleEdit(appointment as any)}
                        onDelete={() => handleDelete(appointment.id)}
                        onStatusChange={(status) => handleStatusChange(appointment.id, status)}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Calendar/Day View */}
              {viewMode === 'calendar' && (
                <DaySchedule
                  date={selectedDate}
                  appointments={dayFilteredAppointments as any[]}
                  onEdit={(apt) => handleEdit(apt as any)}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddAppointment={() => setIsFormOpen(true)}
                />
              )}

              {/* Week View */}
              {viewMode === 'week' && (
                <WeekView
                  selectedDate={selectedDate}
                  appointments={filteredAppointments as any[]}
                  onAppointmentClick={(apt) => handleEdit(apt as any)}
                  onTimeSlotClick={(slotDate) => {
                    setSelectedSlotDateTime(slotDate)
                    setIsFormOpen(true)
                  }}
                />
              )}

              {/* Month View */}
              {viewMode === 'month' && (
                <MonthView
                  selectedDate={selectedDate}
                  appointments={filteredAppointments as any[]}
                  onDateSelect={setSelectedDate}
                  onAppointmentClick={(apt) => handleEdit(apt as any)}
                />
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <div className="space-y-4">
                  {dayFilteredAppointments.length === 0 ? (
                    <EmptyState
                      icon={Clock}
                      title="No hay citas"
                      description="No se encontraron citas para esta fecha"
                    />
                  ) : (
                    dayFilteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment as any}
                        onEdit={() => handleEdit(appointment as any)}
                        onDelete={() => handleDelete(appointment.id)}
                        onStatusChange={(status) => handleStatusChange(appointment.id, status)}
                        variant="timeline"
                      />
                    ))
                  )}
                </div>
              )}
            </PullToRefresh>
          </CalendarErrorBoundary>
        </div>

        {/* Appointment Form Modal */}
        {isFormOpen && (
          <AppointmentForm
            appointment={editingAppointment}
            services={services as any}
            clients={clients as any}
            isOpen={isFormOpen}
            selectedDate={selectedSlotDateTime}
            onClose={() => {
              setIsFormOpen(false)
              setEditingAppointment(null)
              setSelectedSlotDateTime(undefined)
            }}
            onSubmit={handleSubmit}
          />
        )}
      </CitasTourWrapper>
    </ComponentErrorBoundary>
  )
}

// Wrap with Suspense for search params
export default function CitasPageV2() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <CitasPageContent />
    </Suspense>
  )
}
