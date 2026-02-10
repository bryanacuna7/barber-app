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
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/80 dark:bg-blue-900/20',
    },
    {
      title: 'Referidos Activos',
      value: successfulReferrals,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-900/20',
    },
    {
      title: 'Milestone Actual',
      value: `${currentMilestone}/5`,
      icon: Trophy,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/80 dark:bg-amber-900/20',
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50/80 dark:bg-violet-900/20',
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
            <Card className="h-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] p-4 lg:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-zinc-100/70 dark:hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted mb-1">{card.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 ${card.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
