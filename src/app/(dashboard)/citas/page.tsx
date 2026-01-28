'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { format, addDays, isSameDay, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
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
} from 'lucide-react'

// Components
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge, type AppointmentStatus } from '@/components/ui/badge'

// Appointment components
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { MiniCalendar } from '@/components/appointments/mini-calendar'
import { AppointmentForm, type AppointmentFormData } from '@/components/appointments/appointment-form'
import { AppointmentFilters } from '@/components/appointments/appointment-filters'
import { DaySchedule } from '@/components/appointments/day-schedule'
import { CitasTourWrapper } from '@/components/tours/citas-tour-wrapper'

// Utils
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

// Types
import type { Appointment, Service, Client } from '@/types'

type ViewMode = 'list' | 'calendar' | 'timeline'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, "EEEE", { locale: es })
}

export default function CitasPage() {
  // State
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  // Fetch data
  const fetchAppointments = useCallback(async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/appointments?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }, [selectedDate])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchAppointments(), fetchServices(), fetchClients()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchAppointments])

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
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

  // Stats
  const stats = useMemo(() => {
    const today = appointments.filter(a => isSameDay(new Date(a.scheduled_at), selectedDate))
    const completed = today.filter(a => a.status === 'completed')
    const pending = today.filter(a => a.status === 'pending' || a.status === 'confirmed')
    const cancelled = today.filter(a => a.status === 'cancelled')
    const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0)
    const expectedRevenue = pending.reduce((sum, a) => sum + Number(a.price), 0)
    const uniqueClients = new Set(today.map(a => a.client_id)).size

    return {
      total: today.length,
      completed: completed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      expectedRevenue,
      uniqueClients
    }
  }, [appointments, selectedDate])

  // Week days for quick navigation
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  // Appointment dates for calendar indicator
  const appointmentDates = useMemo(() => {
    return appointments.map(a => new Date(a.scheduled_at))
  }, [appointments])

  // Handlers
  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        const updated = await response.json()
        setAppointments(prev =>
          prev.map(apt => apt.id === id ? updated : apt)
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt.id !== id))
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const countryCode = cleanPhone.length === 8 ? '506' : ''
    window.open(`https://wa.me/${countryCode}${cleanPhone}`, '_blank')
  }

  const handleFormSubmit = async (data: AppointmentFormData) => {
    const method = editingAppointment ? 'PATCH' : 'POST'
    const url = editingAppointment
      ? `/api/appointments/${editingAppointment.id}`
      : '/api/appointments'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al guardar')
    }

    const result = await response.json()

    if (editingAppointment) {
      setAppointments(prev =>
        prev.map(apt => apt.id === result.id ? result : apt)
      )
    } else {
      setAppointments(prev => [...prev, result])
    }

    setEditingAppointment(null)
  }

  const handleAddAppointment = (date: Date, hour: number) => {
    setSelectedDate(new Date(date.setHours(hour, 0, 0, 0)))
    setEditingAppointment(null)
    setIsFormOpen(true)
  }

  // Navigation
  const goToPreviousDay = () => setSelectedDate(prev => addDays(prev, -1))
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1))
  const goToToday = () => setSelectedDate(new Date())

  return (
    <CitasTourWrapper>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Citas
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {stats.total} citas programadas para {isToday(selectedDate) ? 'hoy' : format(selectedDate, "d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAppointments()}
            className="hidden sm:flex"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            data-tour="appointments-new-button"
            onClick={() => {
              setEditingAppointment(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nueva Cita</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Stats - iOS Style Pills */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-3 scrollbar-hide">
          {/* Total Citas */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
              <div className="rounded-xl bg-blue-500/20 p-2.5">
                <CalendarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">
                  {stats.total}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  citas
                </p>
              </div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
              <div className="rounded-xl bg-amber-500/20 p-2.5">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">
                  {stats.pending}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  pendientes
                </p>
              </div>
            </div>
          </div>

          {/* Completadas */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
              <div className="rounded-xl bg-green-500/20 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">
                  {stats.completed}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  listas
                </p>
              </div>
            </div>
          </div>

          {/* Ingresos del día */}
          <div className="shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 min-w-[140px]">
              <div className="rounded-xl bg-emerald-500/20 p-2.5">
                <Banknote className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-none truncate">
                  {formatCurrency(stats.revenue)}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {isToday(selectedDate) ? 'hoy' : format(selectedDate, "d MMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Week Navigation - Solo mobile */}
      <div className="lg:hidden" data-tour="appointments-calendar">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-zinc-500">
            {format(weekDays[0], "d MMM", { locale: es })} - {format(weekDays[6], "d MMM", { locale: es })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const hasAppointments = appointments.some(a => isSameDay(new Date(a.scheduled_at), day))
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-1 min-w-[48px] flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : isToday(day)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className="text-lg font-bold">
                  {format(day, 'd')}
                </span>
                {hasAppointments && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-current mt-0.5 opacity-50" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Calendar (Desktop only) */}
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
          <Card data-tour="appointments-calendar">
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointmentDates={appointmentDates}
            />
          </Card>

          {/* Quick Stats for selected day */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
              Resumen del día
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map(status => {
                const count = filteredAppointments.filter(a => a.status === status).length
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2"
                  >
                    <StatusBadge status={status} size="sm" />
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Compact Header with View Toggle */}
          <div className="flex items-center justify-between">
            {/* Desktop: Date Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-base font-semibold text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors capitalize"
              >
                {getDateLabel(selectedDate)}, {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </button>
              <Button variant="ghost" size="sm" onClick={goToNextDay}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile: Simple date */}
            <p className="lg:hidden text-sm font-medium text-zinc-400 capitalize">
              {getDateLabel(selectedDate)}, {format(selectedDate, "d MMM", { locale: es })}
            </p>

            {/* View Toggle - Compact pills */}
            <div className="flex bg-zinc-800/60 rounded-xl p-1">
              {[
                { value: 'list', icon: List },
                { value: 'calendar', icon: LayoutGrid },
                { value: 'timeline', icon: Clock }
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setViewMode(value as ViewMode)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === value
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Filters - Compact */}
          <div data-tour="appointments-filters">
            <AppointmentFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>

          {/* Content based on view mode */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin dark:border-zinc-600 dark:border-t-white" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarIcon}
                title="Sin citas"
                description={
                  search || statusFilter !== 'all'
                    ? "No hay citas que coincidan con los filtros"
                    : `No hay citas programadas para ${isToday(selectedDate) ? 'hoy' : format(selectedDate, "d 'de' MMMM", { locale: es })}`
                }
                action={
                  <Button onClick={() => {
                    setEditingAppointment(null)
                    setIsFormOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear cita
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredAppointments
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .map(appointment => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onWhatsApp={handleWhatsApp}
                      />
                    ))}
                </div>
              )}

              {/* Calendar/Schedule View */}
              {viewMode === 'calendar' && (
                <Card className="p-4">
                  <DaySchedule
                    date={selectedDate}
                    appointments={filteredAppointments}
                    onAddAppointment={handleAddAppointment}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onWhatsApp={handleWhatsApp}
                  />
                </Card>
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <Card className="p-4 sm:p-6">
                  <div className="space-y-0">
                    {filteredAppointments
                      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                      .map(appointment => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          variant="timeline"
                          onStatusChange={handleStatusChange}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onWhatsApp={handleWhatsApp}
                        />
                      ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingAppointment(null)
        }}
        onSubmit={handleFormSubmit}
        appointment={editingAppointment}
        services={services}
        clients={clients}
        selectedDate={selectedDate}
      />
    </div>
    </CitasTourWrapper>
  )
}
