import { Clock, ArrowRight, Sparkles, Calendar, Users, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatTime } from '@/lib/utils'
import { getSubscriptionStatus } from '@/lib/subscription'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('owner_id', user!.id)
    .single()

  if (!business) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-zinc-500 mt-2">No se encontró tu negocio</p>
      </div>
    )
  }

  // Get today's date range
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  // Get start of month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  // Fetch stats in parallel
  const [
    { count: todayAppointments },
    { data: todayRevenue },
    { count: monthAppointments },
    { data: monthRevenue },
    { count: totalClients },
    { data: upcomingAppointments },
  ] = await Promise.all([
    // Today's appointments count
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .in('status', ['pending', 'confirmed', 'completed']),

    // Today's revenue
    supabase
      .from('appointments')
      .select('price')
      .eq('business_id', business.id)
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .eq('status', 'completed'),

    // Month's appointments
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .gte('scheduled_at', startOfMonth)
      .in('status', ['pending', 'confirmed', 'completed']),

    // Month's revenue
    supabase
      .from('appointments')
      .select('price')
      .eq('business_id', business.id)
      .gte('scheduled_at', startOfMonth)
      .eq('status', 'completed'),

    // Total clients
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id),

    // Upcoming appointments today
    supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        client:clients(name, phone),
        service:services(name)
      `)
      .eq('business_id', business.id)
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', endOfDay)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_at', { ascending: true })
      .limit(5),
  ])

  const todayRevenueTotal = todayRevenue?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0
  const monthRevenueTotal = monthRevenue?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0

  // Get subscription status
  const subscriptionStatus = await getSubscriptionStatus(supabase, business.id)

  // Determine if we should show "Reportar Pago" quick action
  const showPaymentAction =
    subscriptionStatus &&
    (subscriptionStatus.status === 'expired' ||
      (subscriptionStatus.status === 'active' &&
        subscriptionStatus.days_remaining !== null &&
        subscriptionStatus.days_remaining <= 7) ||
      (subscriptionStatus.status === 'trial' &&
        subscriptionStatus.days_remaining !== null &&
        subscriptionStatus.days_remaining <= 3))

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
            {greeting}
          </h1>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Bienvenido a <span className="font-medium text-zinc-700 dark:text-zinc-300">{business.name}</span>
          </p>
        </div>
        <Link
          href={`/reservar/${business.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-[15px] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          Ver página pública
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid - Client Component */}
      <DashboardStats
        todayAppointments={todayAppointments || 0}
        todayRevenue={formatCurrency(todayRevenueTotal)}
        monthRevenue={formatCurrency(monthRevenueTotal)}
        monthAppointments={monthAppointments || 0}
        totalClients={totalClients || 0}
      />

      {/* Upcoming Appointments */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-[17px]">Próximas Citas Hoy</CardTitle>
          </div>
          <Link href="/citas">
            <Button variant="ghost" size="sm" className="gap-1.5 text-[13px]">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!upcomingAppointments || upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Sparkles className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="mt-4 text-[17px] font-medium text-zinc-900 dark:text-white">
                Sin citas pendientes
              </p>
              <p className="mt-1 text-[15px] text-zinc-500 text-center">
                No hay más citas programadas para hoy
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {upcomingAppointments.map((apt, index) => {
                const client = apt.client as { name: string; phone: string } | null
                const service = apt.service as { name: string } | null

                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700">
                        <span className="text-[15px] font-bold text-zinc-600 dark:text-zinc-300">
                          {client?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                          {client?.name || 'Cliente'}
                        </p>
                        <p className="text-[13px] text-zinc-500">
                          {service?.name || 'Servicio'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[17px] font-bold text-zinc-900 dark:text-white">
                        {formatTime(apt.scheduled_at)}
                      </p>
                      <p className={`text-[12px] font-medium uppercase tracking-wide ${
                        apt.status === 'confirmed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-[17px]">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-2 sm:gap-3 ${showPaymentAction ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
            {showPaymentAction && (
              <Link href="/suscripcion" className="block">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 px-3 py-4 hover:from-amber-100 hover:to-amber-150 dark:from-amber-900/20 dark:to-amber-800/20 dark:hover:from-amber-900/30 dark:hover:to-amber-800/30 transition-colors ring-1 ring-amber-200 dark:ring-amber-700">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 dark:bg-amber-600">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[13px] font-medium text-amber-900 dark:text-amber-100 text-center">
                    Reportar Pago
                  </span>
                </div>
              </Link>
            )}
            <Link href="/citas" className="block">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[13px] font-medium text-zinc-900 dark:text-white text-center">
                  Nueva Cita
                </span>
              </div>
            </Link>
            <Link href="/servicios" className="block">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-[13px] font-medium text-zinc-900 dark:text-white text-center">
                  Servicios
                </span>
              </div>
            </Link>
            <Link href="/clientes" className="block">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-4 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[13px] font-medium text-zinc-900 dark:text-white text-center">
                  Clientes
                </span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
