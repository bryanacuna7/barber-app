'use client'

import { Banknote, Users } from 'lucide-react'
import { StatsCard } from './stats-card'
import { HeroStatsCard } from './hero-stats-card'

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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr]">
      {/* Hero: Citas Hoy + Ingresos Hoy — full-width mobile, 2fr desktop */}
      <div className="col-span-2 lg:col-span-1">
        <HeroStatsCard
          left={{
            label: 'Citas Hoy',
            value: todayAppointments,
            description: 'programadas',
          }}
          right={{
            label: 'Ingresos Hoy',
            value: todayRevenue,
            description: 'generados',
          }}
        />
      </div>

      {/* Secondary: Ingresos Mes */}
      <StatsCard
        title="Ingresos Mes"
        value={monthRevenue}
        icon={Banknote}
        description={`${monthAppointments} citas`}
        valueClassName="text-[22px] sm:text-[36px]"
      />

      {/* Secondary: Clientes */}
      <StatsCard
        title="Clientes"
        value={totalClients}
        icon={Users}
        description="registrados"
        valueClassName="text-[26px] sm:text-[36px]"
      />
    </div>
  )
}
