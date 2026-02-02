'use client'

import { Card } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, Gift, BarChart3, DollarSign, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface GlobalStatsCardsProps {
  totalReferrals: number
  activeConversions: number
  conversionRate: string
  totalRewardsClaimed: number
  avgReferralsPerUser: string
  revenueImpact: number
}

interface StatCard {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  bgColor: string
  description?: string
}

export function GlobalStatsCards({
  totalReferrals,
  activeConversions,
  conversionRate,
  totalRewardsClaimed,
  avgReferralsPerUser,
  revenueImpact,
}: GlobalStatsCardsProps) {
  const statsCards: StatCard[] = [
    {
      title: 'Total Referidos',
      value: totalReferrals,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Todos los referidos registrados',
    },
    {
      title: 'Conversiones Activas',
      value: activeConversions,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Referidos activos confirmados',
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Porcentaje de conversión exitosa',
    },
    {
      title: 'Recompensas Reclamadas',
      value: totalRewardsClaimed,
      icon: Gift,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Total de rewards claimed',
    },
    {
      title: 'Promedio por Usuario',
      value: avgReferralsPerUser,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Referidos promedio por negocio',
    },
    {
      title: 'Impacto en Revenue',
      value: `$${revenueImpact.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'Ahorro total para referidos',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsCards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {card.value}
                </p>
                {card.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{card.description}</p>
                )}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
