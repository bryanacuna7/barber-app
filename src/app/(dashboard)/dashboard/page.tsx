import { Calendar, Banknote, Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatTime } from '@/lib/utils'
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Bienvenido de vuelta, {business.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/reservar/${business.slug}`}
            target="_blank"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          >
            Ver página pública →
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Citas Hoy"
          value={todayAppointments || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Ingresos Hoy"
          value={formatCurrency(todayRevenueTotal)}
          icon={Banknote}
        />
        <StatsCard
          title="Ingresos del Mes"
          value={formatCurrency(monthRevenueTotal)}
          icon={Banknote}
          description={`${monthAppointments || 0} citas`}
        />
        <StatsCard
          title="Total Clientes"
          value={totalClients || 0}
          icon={Users}
        />
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximas Citas Hoy</CardTitle>
          <Link href="/citas">
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!upcomingAppointments || upcomingAppointments.length === 0 ? (
            <p className="text-center py-8 text-zinc-500">
              No hay citas programadas para hoy
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const client = apt.client as { name: string; phone: string } | null
                const service = apt.service as { name: string } | null

                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {service?.name || 'Servicio'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {formatTime(apt.scheduled_at)}
                      </p>
                      <p className="text-sm text-zinc-500">
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
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/servicios">
            <Button variant="outline">Agregar Servicio</Button>
          </Link>
          <Link href="/clientes">
            <Button variant="outline">Ver Clientes</Button>
          </Link>
          <Link href="/configuracion">
            <Button variant="outline">Configuración</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
