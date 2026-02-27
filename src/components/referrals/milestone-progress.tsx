'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Milestone {
  id: string
  milestone_number: number
  referrals_required: number
  reward_description: string
  badge_name: string
  badge_icon: string
  tier: string
}

interface NextMilestone {
  number: number
  remaining: number
  reward: string
  referrals_required: number
}

interface MilestoneProgressProps {
  currentReferrals: number
  currentMilestone: number
  nextMilestone: NextMilestone | null
  milestones: Milestone[]
}

export function MilestoneProgress({
  currentReferrals,
  currentMilestone,
  nextMilestone,
  milestones,
}: MilestoneProgressProps) {
  const progress = nextMilestone ? (currentReferrals / nextMilestone.referrals_required) * 100 : 100

  const getTierColor = (tier: string) => {
    const colors = {
      bronze:
        'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700',
      silver: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600',
      gold: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700',
      platinum:
        'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700',
      legendary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    }
    return colors[tier as keyof typeof colors] || colors.bronze
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6 space-y-6 h-full">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            Progreso de Milestones
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {currentReferrals} referidos exitosos • Milestone {currentMilestone}/5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              Progreso al siguiente milestone
            </span>
            {nextMilestone && (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {nextMilestone.remaining} más para desbloquear
              </span>
            )}
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          {nextMilestone && (
            <p className="text-xs text-center text-zinc-600 dark:text-zinc-400 italic">
              Próxima recompensa: {nextMilestone.reward}
            </p>
          )}
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.map((milestone, index) => {
            const isUnlocked = currentReferrals >= milestone.referrals_required
            const isCurrent =
              !isUnlocked &&
              (index === 0 || currentReferrals >= milestones[index - 1].referrals_required)

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card
                  className={`p-4 text-center transition-transform hover:scale-105 ${
                    isUnlocked
                      ? `${getTierColor(milestone.tier)} border-2 shadow-lg`
                      : 'bg-zinc-50 dark:bg-zinc-800 opacity-50 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {isUnlocked ? (
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-full">
                        <Lock className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-2xl mb-1">{milestone.badge_icon}</div>
                  <div className="text-xs font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
                    {milestone.badge_name}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    {milestone.referrals_required} referidos
                  </div>
                  <div className="text-[10px] leading-tight text-zinc-700 dark:text-zinc-300">
                    {milestone.reward_description.split('(')[0]}
                  </div>
                  {isCurrent && (
                    <Badge className="mt-2 text-[10px] py-0.5" variant="default">
                      Próximo
                    </Badge>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}
