'use client'

import { Calendar, Banknote, Users } from 'lucide-react'
import { StatsCard } from './stats-card'

interface DashboardStatsProps {
  todayAppointments: number
  todayRevenue: string
  monthRevenue: string
  monthAppointments: number
  totalClients: number
}

export function DashboardStats({
  todayAppointments,
  todayRevenue,
  monthRevenue,
  monthAppointments,
  totalClients,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatsCard
        title="Citas Hoy"
        value={todayAppointments}
        icon={Calendar}
        description="programadas"
        variant="info"
      />
      <StatsCard
        title="Ingresos Hoy"
        value={todayRevenue}
        icon={Banknote}
        description="generados"
        variant="success"
      />
      <StatsCard
        title="Ingresos Mes"
        value={monthRevenue}
        icon={Banknote}
        description={`${monthAppointments} citas`}
      />
      <StatsCard
        title="Clientes"
        value={totalClients}
        icon={Users}
        description="registrados"
      />
    </div>
  )
}
