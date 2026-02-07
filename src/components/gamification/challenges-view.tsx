'use client'

/**
 * Challenges View Component
 * Fetches and displays active challenges
 */

import { useEffect, useState } from 'react'
import { ChallengeCard } from './challenge-card'
import { Loader2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type {
  BarberChallenge,
  BarberChallengeParticipant,
  Barber,
  ChallengeType,
} from '@/types/database'

interface ChallengeWithParticipants extends BarberChallenge {
  participants: Array<
    BarberChallengeParticipant & {
      barber?: Pick<Barber, 'id' | 'name' | 'photo_url'>
    }
  >
}

interface ChallengesViewProps {
  businessId: string
  barberId?: string
}

export function ChallengesView({ businessId, barberId }: ChallengesViewProps) {
  const [challenges, setChallenges] = useState<ChallengeWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChallenges()
  }, [businessId])

  async function fetchChallenges() {
    try {
      setLoading(true)
      const params = new URLSearchParams({ businessId, activeOnly: 'true' })

      const res = await fetch(`/api/gamification/barber/challenges?${params}`)
      if (!res.ok) throw new Error('Failed to fetch challenges')

      const data = await res.json()
      setChallenges(data.challenges || [])
    } catch (err) {
      console.error('Error fetching challenges:', err)
      setError('Error al cargar los desafíos')
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

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No hay desafíos activos
          </h3>
          <p className="text-[15px] text-zinc-600 dark:text-zinc-400 mb-6">
            Los desafíos te permiten competir con tus compañeros y ganar recompensas
          </p>
          {/* Owner can create challenges */}
          {!barberId && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Desafío
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <div className="space-y-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            name={challenge.name}
            description={challenge.description}
            challengeType={challenge.challenge_type as ChallengeType}
            targetValue={challenge.target_value}
            rewardDescription={challenge.reward_description}
            rewardAmount={challenge.reward_amount}
            endsAt={challenge.ends_at}
            participants={challenge.participants}
            currentBarberId={barberId}
          />
        ))}
      </div>
    </div>
  )
}
