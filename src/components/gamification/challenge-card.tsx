'use client'

/**
 * Challenge Card Component
 * Displays active challenge with leaderboard, progress, and time remaining
 */

import { motion } from 'framer-motion'
import { Trophy, Clock, Target, Gift } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import {
  getChallengeTypeDisplay,
  getChallengeTimeRemaining,
  formatCurrency,
} from '@/lib/gamification/barber-gamification'
import type { ChallengeType } from '@/types/database'

interface ChallengeParticipant {
  id: string
  current_value: number
  target_value: number
  rank: number | null
  barber?: {
    id: string
    name: string
    photo_url: string | null
  }
}

interface ChallengeCardProps {
  name: string
  description: string | null
  challengeType: ChallengeType
  targetValue: number
  rewardDescription: string | null
  rewardAmount: number | null
  endsAt: string
  participants: ChallengeParticipant[]
  currentBarberId?: string
}

export function ChallengeCard({
  name,
  description,
  challengeType,
  targetValue,
  rewardDescription,
  rewardAmount,
  endsAt,
  participants,
  currentBarberId,
}: ChallengeCardProps) {
  const typeDisplay = getChallengeTypeDisplay(challengeType)
  const timeRemaining = getChallengeTimeRemaining({ ends_at: endsAt } as any)

  // Sort participants by current_value descending
  const sortedParticipants = [...participants].sort((a, b) => b.current_value - a.current_value)
  const topParticipants = sortedParticipants.slice(0, 5)
  const currentParticipant = currentBarberId
    ? sortedParticipants.find((p) => p.barber?.id === currentBarberId)
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
              {typeDisplay.icon}
            </div>
            <div>
              <CardTitle className="text-[17px]">{name}</CardTitle>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400">{typeDisplay.label}</p>
            </div>
          </div>

          {/* Time Remaining */}
          {!timeRemaining.isEnded ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5">
              <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                {timeRemaining.days > 0
                  ? `${timeRemaining.days}d ${timeRemaining.hours}h`
                  : `${timeRemaining.hours}h`}
              </span>
            </div>
          ) : (
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5">
              <span className="text-[13px] font-medium text-red-700 dark:text-red-400">
                Finalizado
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2">{description}</p>
        )}

        {/* Goal & Reward */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
              Meta:{' '}
              <span className="font-semibold">
                {challengeType === 'revenue'
                  ? formatCurrency(targetValue)
                  : targetValue.toLocaleString()}
              </span>
            </span>
          </div>
          {(rewardDescription || rewardAmount) && (
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-amber-500" />
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {rewardDescription || formatCurrency(rewardAmount!)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Barber Progress (if applicable) */}
        {currentParticipant && (
          <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-blue-700 dark:text-blue-400">
                Tu Progreso
              </span>
              <span className="text-[15px] font-bold text-blue-800 dark:text-blue-300">
                {challengeType === 'revenue'
                  ? formatCurrency(currentParticipant.current_value)
                  : currentParticipant.current_value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((currentParticipant.current_value / targetValue) * 100, 100)}%`,
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
              Tabla de Posiciones
            </h4>
          </div>

          {topParticipants.length === 0 ? (
            <p className="text-center py-4 text-[13px] text-zinc-500">No hay participantes aún</p>
          ) : (
            <div className="space-y-2">
              {topParticipants.map((participant, idx) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    participant.barber?.id === currentBarberId
                      ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30'
                      : 'bg-zinc-50 dark:bg-zinc-900'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {idx === 0 ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm">
                        1
                      </div>
                    ) : idx === 1 ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 text-white font-bold text-sm">
                        2
                      </div>
                    ) : idx === 2 ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                        3
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar
                    src={participant.barber?.photo_url}
                    alt={participant.barber?.name || 'Barbero'}
                    fallback={participant.barber?.name?.charAt(0) || 'B'}
                    size="sm"
                  />
                  <span className="flex-1 text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
                    {participant.barber?.name || 'Barbero'}
                  </span>

                  {/* Value */}
                  <span className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                    {challengeType === 'revenue'
                      ? formatCurrency(participant.current_value)
                      : participant.current_value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
