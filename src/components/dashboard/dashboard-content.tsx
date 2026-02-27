'use client'

import { useState, useCallback } from 'react'
import { Clock, ArrowRight, Sparkles, Calendar, Users, Globe, Info, X } from 'lucide-react'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { formatCurrencyCompactMillions, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardTourWrapper } from '@/components/tours/dashboard-tour-wrapper'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useDashboardAppointments } from '@/hooks/use-dashboard-appointments'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { ShareBookingLink } from '@/components/share/share-booking-link'
import { bookingPath } from '@/lib/utils/booking-url'
import { useBusiness } from '@/contexts/business-context'

const TIP_ID = 'dashboard-welcome'

function useDashboardTipDismiss() {
  const { businessId, userId } = useBusiness()
  const key = `guide-tip-${businessId}-${userId}-${TIP_ID}`
  const [dismissed, setDismissed] = useState(() =>
    typeof window === 'undefined' ? true : localStorage.getItem(key) === 'true'
  )
  const dismiss = useCallback(() => {
    localStorage.setItem(key, 'true')
    setDismissed(true)
  }, [key])
  return { dismissed, dismiss }
}

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: appointmentsData, isLoading: appointmentsLoading } = useDashboardAppointments()
  const { dismissed: tipDismissed, dismiss: dismissTip } = useDashboardTipDismiss()

  // Real-time: WebSocket invalidates dashboard queries when appointments change
  useRealtimeAppointments({
    businessId: stats?.business?.id || '',
    enabled: !!stats?.business?.id,
  })

  // Show loading state only for stats (appointments load lazily)
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin" />
          <p className="mt-4 text-zinc-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show error state if stats failed to load
  if (statsError || !stats) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-zinc-500 mt-2">
          {statsError instanceof Error ? statsError.message : 'No se pudieron cargar los datos'}
        </p>
      </div>
    )
  }

  const upcomingAppointments = appointmentsData?.appointments || []
  const dashboardStatusLabel: Record<string, string> = {
    pending: 'Agendada',
    confirmed: 'Agendada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
  }

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <DashboardTourWrapper>
      <div className="min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="app-page-title">
              <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
                {greeting}
              </span>
            </h1>
            <p className="app-page-subtitle mt-0.5">
              Bienvenido a{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {stats.business.name}
              </span>
            </p>
          </div>
        </div>

        {/* Inline tip — compact, dashboard-only */}
        {!tipDismissed && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30"
            role="status"
          >
            <Info
              className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0"
              strokeWidth={1.75}
            />
            <p className="flex-1 text-[13px] sm:text-sm text-blue-700 dark:text-blue-300">
              Primera vez?{' '}
              <Link
                href="/guia#primeros-pasos"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver la guía
              </Link>
            </p>
            <button
              type="button"
              onClick={dismissTip}
              aria-label="Cerrar consejo"
              className="shrink-0 grid place-items-center h-7 w-7 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div data-tour="dashboard-stats">
          <DashboardStats
            todayAppointments={stats.todayAppointments}
            todayRevenue={formatCurrencyCompactMillions(stats.todayRevenue)}
            monthRevenue={formatCurrencyCompactMillions(stats.monthRevenue)}
            monthAppointments={stats.monthAppointments}
            totalClients={stats.totalClients}
          />
        </div>

        {/* Divider */}
        {stats.business.slug && (
          <div className="h-px bg-gradient-to-r from-blue-500/20 via-emerald-500/10 to-transparent" />
        )}

        {/* Share Booking Link Card */}
        {stats.business.slug && (
          <Card variant="elevated" className="relative overflow-hidden" data-tour="dashboard-share">
            <div className="absolute inset-x-0 top-0 h-1 bg-zinc-900 dark:bg-white" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <Globe className="h-5 w-5" />
                Comparte tu Link de Reservas
              </CardTitle>
              <CardDescription>Tus clientes pueden reservar 24/7 desde este enlace</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareBookingLink
                bookingPath={bookingPath(stats.business.slug)}
                slug={stats.business.slug}
                businessName={stats.business.shareName || stats.business.name}
                variant="full"
              />
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments */}
        <Card variant="elevated" className="overflow-hidden" data-tour="dashboard-appointments">
          <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="min-w-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base sm:text-lg leading-tight">
                Próximas Citas Hoy
              </CardTitle>
            </div>
            <Link href="/citas" className="ml-1 sm:ml-2 shrink-0">
              <Button
                variant="gradient"
                size="sm"
                className="gap-1.5 text-sm min-h-[44px] whitespace-nowrap"
              >
                Ver todo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {appointmentsLoading ? (
              // Loading skeleton
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded ml-auto" />
                      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 relative">
                {/* Círculo decorativo de fondo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-32 w-32 rounded-full bg-blue-50/30 dark:bg-blue-950/20 blur-2xl animate-pulse" />
                </div>

                {/* Icono con floating animation */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 shadow-lg animate-float">
                  <Sparkles className="h-8 w-8 text-zinc-400" />

                  {/* Círculo de pulso */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-zinc-300/50 dark:border-zinc-700/50 animate-[pulse-ring_2s_ease-in-out_infinite]" />
                </div>

                <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-white relative">
                  Sin citas agendadas
                </p>
                <p className="mt-1 text-base text-zinc-500 text-center relative">
                  No hay más citas programadas para hoy
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {upcomingAppointments.map((apt, index) => {
                  const client = apt.client
                  const service = apt.service

                  return (
                    <div
                      key={apt.id}
                      className="group relative overflow-hidden flex items-center justify-between p-4 transition-[transform,opacity] duration-300 hover:scale-[1.005] hover:translate-x-1"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {/* Gradient overlay en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 dark:from-blue-950/0 dark:via-blue-950/30 dark:to-blue-950/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Contenido con z-index relative */}
                      <div className="relative flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 ring-2 ring-white/50 dark:ring-zinc-900/50 shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-base font-bold text-zinc-600 dark:text-zinc-300">
                            {client?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-zinc-900 dark:text-white">
                            {client?.name || 'Cliente'}
                          </p>
                          <p className="text-sm text-zinc-500">{service?.name || 'Servicio'}</p>
                        </div>
                      </div>
                      <div className="relative text-right">
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          {formatTime(apt.scheduled_at)}
                        </p>
                        <p className="text-[12px] font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          {dashboardStatusLabel[apt.status] || 'Agendada'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="glass" className="hidden lg:block" data-tour="dashboard-quick-actions">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:gap-3 grid-cols-3">
              <Link href="/citas" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-[border-color,box-shadow,transform] duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors shadow-sm group-hover:shadow-md">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                    Nueva Cita
                  </span>
                </div>
              </Link>
              <Link href="/servicios" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-[border-color,box-shadow,transform] duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors shadow-sm group-hover:shadow-md">
                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                    Servicios
                  </span>
                </div>
              </Link>
              <Link href="/clientes" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-[border-color,box-shadow,transform] duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors shadow-sm group-hover:shadow-md">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                    Clientes
                  </span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardTourWrapper>
  )
}
