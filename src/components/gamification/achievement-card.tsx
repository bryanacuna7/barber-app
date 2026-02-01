'use client'

/**
 * Achievement Card Component
 * Displays individual achievement with progress, icon, and earned status
 */

import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { getTierBadgeClass, getTierColor } from '@/lib/gamification/barber-gamification'
import type { AchievementTier } from '@/types/database'

interface AchievementCardProps {
  name: string
  description: string
  icon: string
  tier: AchievementTier
  progress: number
  current: number
  threshold: number
  isEarned: boolean
  earnedAt?: string | null
}

export function AchievementCard({
  name,
  description,
  icon,
  tier,
  progress,
  current,
  threshold,
  isEarned,
  earnedAt,
}: AchievementCardProps) {
  const tierColor = getTierColor(tier)
  const tierBadge = getTierBadgeClass(tier)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-4 transition-all ${
        isEarned
          ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50'
      }`}
    >
      {/* Earned Badge */}
      {isEarned && (
        <div className="absolute -right-2 -top-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-3xl ${
            isEarned ? tierBadge : 'bg-zinc-100 dark:bg-zinc-800 grayscale'
          }`}
        >
          {isEarned ? icon : <Lock className="h-6 w-6 text-zinc-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Tier */}
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold text-[15px] ${
                isEarned ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {name}
            </h3>
            <span className={`text-xs font-medium uppercase ${tierColor}`}>{tier}</span>
          </div>

          {/* Description */}
          <p
            className={`text-[13px] mb-3 ${
              isEarned ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-500 dark:text-zinc-500'
            }`}
          >
            {description}
          </p>

          {/* Progress */}
          {!isEarned && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {current.toLocaleString()} / {threshold.toLocaleString()}
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {Math.floor(progress)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${tierBadge}`}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          {isEarned && earnedAt && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Ganado:{' '}
              {new Date(earnedAt).toLocaleDateString('es-CR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
