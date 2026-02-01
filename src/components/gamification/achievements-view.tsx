'use client'

/**
 * Achievements View Component
 * Fetches and displays achievements grouped by category
 */

import { useEffect, useState } from 'react'
import { AchievementCard } from './achievement-card'
import { groupAchievementsByCategory } from '@/lib/gamification/barber-gamification'
import { Loader2, TrendingUp, Calendar, Users, Award, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { AchievementCategory, BarberAchievement } from '@/types/database'

interface AchievementWithProgress extends BarberAchievement {
  is_earned: boolean
  earned_at: string | null
  progress: number
  current: number
  threshold: number
}

interface AchievementsViewProps {
  businessId: string
  barberId?: string
}

const categoryIcons: Record<AchievementCategory, React.ReactNode> = {
  revenue: <TrendingUp className="h-5 w-5" />,
  appointments: <Calendar className="h-5 w-5" />,
  clients: <Users className="h-5 w-5" />,
  streak: <Award className="h-5 w-5" />,
  special: <Sparkles className="h-5 w-5" />,
}

const categoryNames: Record<AchievementCategory, string> = {
  revenue: 'Ingresos',
  appointments: 'Citas',
  clients: 'Clientes',
  streak: 'Rachas',
  special: 'Especiales',
}

export function AchievementsView({ businessId, barberId }: AchievementsViewProps) {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [businessId, barberId])

  async function fetchAchievements() {
    try {
      setLoading(true)
      const params = new URLSearchParams({ businessId })
      if (barberId) params.append('barberId', barberId)

      const res = await fetch(`/api/gamification/barber/achievements?${params}`)
      if (!res.ok) throw new Error('Failed to fetch achievements')

      const data = await res.json()
      setAchievements(data.achievements || [])
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError('Error al cargar los logros')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const grouped = groupAchievementsByCategory(achievements)
  const earnedCount = achievements.filter((a) => a.is_earned).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mb-1">Progreso Total</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {earnedCount} / {totalCount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mb-1">Completado</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalCount > 0 ? Math.floor((earnedCount / totalCount) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {Object.entries(grouped).map(([category, categoryAchievements]) => {
        if (categoryAchievements.length === 0) return null

        const cat = category as AchievementCategory
        const earnedInCategory = categoryAchievements.filter((a) => a.is_earned).length

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {categoryIcons[cat]}
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
                  {categoryNames[cat]}
                </h2>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  {earnedInCategory} / {categoryAchievements.length} desbloqueados
                </p>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              {categoryAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  tier={achievement.tier}
                  progress={achievement.progress}
                  current={achievement.current}
                  threshold={achievement.threshold}
                  isEarned={achievement.is_earned}
                  earnedAt={achievement.earned_at}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
