'use client'

import { Clock, ArrowRight, Sparkles, Calendar, Users, CreditCard } from 'lucide-react'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrencyCompactMillions, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardTourWrapper } from '@/components/tours/dashboard-tour-wrapper'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useDashboardAppointments } from '@/hooks/use-dashboard-appointments'

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: appointmentsData, isLoading: appointmentsLoading } = useDashboardAppointments()

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

  // TODO: Get subscription status (will be added later)
  const showPaymentAction = false

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <DashboardTourWrapper>
      <div className="min-h-screen space-y-8">
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
          <Link
            href={`/reservar/${stats.business.slug}`}
            target="_blank"
            className="app-page-subtitle group inline-flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-all duration-200 hover:gap-3 focus-ring rounded-md"
          >
            Ver página pública
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

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
                  Sin citas pendientes
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
                      className="group relative overflow-hidden flex items-center justify-between p-4 transition-all duration-300 hover:scale-[1.005] hover:translate-x-1"
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
                        <p
                          className={`text-[12px] font-medium uppercase tracking-wide ${
                            apt.status === 'confirmed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
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
        <Card variant="glass" data-tour="dashboard-quick-actions">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-2 sm:gap-3 ${showPaymentAction ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}
            >
              {showPaymentAction && (
                <Link href="/suscripcion" className="block">
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 px-3 py-4 hover:from-amber-100 hover:to-amber-150 dark:from-amber-900/20 dark:to-amber-800/20 dark:hover:from-amber-900/30 dark:hover:to-amber-800/30 transition-colors ring-1 ring-amber-200 dark:ring-amber-700">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 dark:bg-amber-600">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100 text-center">
                      Reportar Pago
                    </span>
                  </div>
                </Link>
              )}
              <Link href="/citas" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors shadow-sm group-hover:shadow-md">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                    Nueva Cita
                  </span>
                </div>
              </Link>
              <Link href="/servicios" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors shadow-sm group-hover:shadow-md">
                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white text-center">
                    Servicios
                  </span>
                </div>
              </Link>
              <Link href="/clientes" className="block group focus-ring rounded-2xl">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 dark:bg-zinc-800/50 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-98">
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
