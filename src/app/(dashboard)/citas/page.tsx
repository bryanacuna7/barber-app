'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
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
  TrendingUp,
  Banknote
} from 'lucide-react'

// Components
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StatusBadge, type AppointmentStatus } from '@/components/ui/badge'

// Appointment components
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { MiniCalendar } from '@/components/appointments/mini-calendar'
import { AppointmentForm, type AppointmentFormData } from '@/components/appointments/appointment-form'
import { AppointmentFilters } from '@/components/appointments/appointment-filters'
import { DaySchedule } from '@/components/appointments/day-schedule'

// Utils
import { formatCurrency } from '@/lib/utils/format'

// Types
import type { Appointment, Service, Client } from '@/types'

type ViewMode = 'list' | 'calendar' | 'timeline'

type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string; phone: string; email?: string } | null
  service?: { id: string; name: string; duration_minutes: number; price: number } | null
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
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false
      }

      // Search filter
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
    const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0)

    return {
      total: today.length,
      completed: completed.length,
      pending: pending.length,
      revenue
    }
  }, [appointments, selectedDate])

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Citas
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Gestiona las citas de tu barbería
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAppointments()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button
              onClick={() => {
                setEditingAppointment(null)
                setIsFormOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva cita
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Citas hoy"
          value={stats.total.toString()}
          icon={CalendarIcon}
          description="programadas"
        />
        <StatsCard
          title="Completadas"
          value={stats.completed.toString()}
          icon={TrendingUp}
          description="finalizadas"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pending.toString()}
          icon={Clock}
          description="por atender"
        />
        <StatsCard
          title="Ingresos"
          value={formatCurrency(stats.revenue)}
          icon={Banknote}
          description="hoy"
        />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Calendar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <Card>
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
            <div className="space-y-3">
              {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map(status => {
                const count = filteredAppointments.filter(a => a.status === status).length
                return (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} size="sm" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Date Navigation + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors capitalize"
              >
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </button>
              <Button variant="ghost" size="sm" onClick={goToNextDay}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="list" icon={<List className="w-4 h-4" />}>
                  Lista
                </TabsTrigger>
                <TabsTrigger value="calendar" icon={<LayoutGrid className="w-4 h-4" />}>
                  Horario
                </TabsTrigger>
                <TabsTrigger value="timeline" icon={<Clock className="w-4 h-4" />}>
                  Línea
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filters */}
          <AppointmentFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Content based on view mode */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarIcon}
                title="Sin citas"
                description="No hay citas para este día que coincidan con los filtros"
                action={
                  <Button onClick={() => {
                    setEditingAppointment(null)
                    setIsFormOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primera cita
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <div className="grid gap-4 sm:grid-cols-2">
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
                <Card className="p-6">
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
  )
}
