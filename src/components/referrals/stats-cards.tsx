'use client'

import { Card } from '@/components/ui/card'
import { Users, UserCheck, Trophy, TrendingUp, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsCardsProps {
  totalReferrals: number
  successfulReferrals: number
  currentMilestone: number
  conversionRate: number
}

interface StatCard {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  bgColor: string
}

export function StatsCards({
  totalReferrals,
  successfulReferrals,
  currentMilestone,
  conversionRate,
}: StatsCardsProps) {
  const statsCards: StatCard[] = [
    {
      title: 'Total Referidos',
      value: totalReferrals,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Referidos Activos',
      value: successfulReferrals,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Milestone Actual',
      value: `${currentMilestone}/5`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
