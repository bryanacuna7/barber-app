'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface EarnedBadge {
  id: string
  claimed_at: string
  milestone: {
    badge_icon: string
    badge_name: string
  }
}

interface BadgesShowcaseProps {
  earnedBadges: EarnedBadge[]
}

export function BadgesShowcase({ earnedBadges }: BadgesShowcaseProps) {
  if (earnedBadges.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          🏆 Badges Desbloqueados
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {earnedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 rounded-lg p-6 mb-2 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-2">{badge.milestone.badge_icon}</div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {badge.milestone.badge_name}
                </div>
              </div>
              <Badge variant="default" className="text-xs">
                {new Date(badge.claimed_at).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
