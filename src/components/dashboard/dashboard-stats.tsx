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
  sparklines?: {
    revenue: number[]
    clients: number[]
    revenueWeeklyTrend: number
    clientWeeklyChange: number
  }
}

export function DashboardStats({
  todayAppointments,
  todayRevenue,
  monthRevenue,
  monthAppointments,
  totalClients,
  sparklines,
}: DashboardStatsProps) {
  const revTrend = sparklines?.revenueWeeklyTrend ?? 0
  const cliChange = sparklines?.clientWeeklyChange ?? 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr] lg:items-stretch">
      {/* Hero: Citas Hoy + Ingresos Hoy — full-width mobile, 2fr desktop */}
      <div className="col-span-2 lg:col-span-1">
        <HeroStatsCard
          className="lg:h-full"
          activeDay={todayAppointments > 0}
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
        className="lg:h-full"
        title="Ingresos Mes"
        value={monthRevenue}
        icon={Banknote}
        description={`${monthAppointments} citas`}
        valueClassName="text-[clamp(1.1rem,6.2vw,1.45rem)] sm:text-[36px]"
        sparkline={
          sparklines
            ? {
                id: 'revenue',
                data: sparklines.revenue,
                color: '#10b981',
                ariaLabel: 'Tendencia de ingresos últimos 7 días',
                trendLabel:
                  revTrend === 0
                    ? undefined
                    : `${revTrend > 0 ? '+' : ''}${revTrend}% vs semana ant.`,
                trendPositive: revTrend >= 0,
              }
            : undefined
        }
      />

      {/* Secondary: Clientes */}
      <StatsCard
        className="lg:h-full"
        title="Clientes"
        value={totalClients}
        icon={Users}
        description="registrados"
        valueClassName="text-[26px] sm:text-[36px]"
        sparkline={
          sparklines
            ? {
                id: 'clients',
                data: sparklines.clients,
                color: '#3b82f6',
                ariaLabel: 'Tendencia de nuevos clientes últimos 7 días',
                trendLabel:
                  cliChange === 0
                    ? undefined
                    : `${cliChange > 0 ? '+' : ''}${cliChange} esta semana`,
                trendPositive: cliChange >= 0,
              }
            : undefined
        }
      />
    </div>
  )
}
