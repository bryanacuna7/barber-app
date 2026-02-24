'use client'

/**
 * Barbers Leaderboard Component
 * Shows top performing barbers
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface BarbersLeaderboardProps {
  data: Array<{
    id?: string
    name: string
    photo_url?: string | null
    avatar?: string
    appointments?: number
    revenue?: number
    value?: number
    uniqueClients?: number
    avgPerAppointment?: number
  }>
  period: 'week' | 'month' | 'year'
}

export function BarbersLeaderboard({ data, period }: BarbersLeaderboardProps) {
  void period
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-1 ring-amber-300/60 shadow-[0_10px_20px_rgba(251,191,36,0.24)]'
    }
    if (rank === 2) {
      return 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-800 ring-1 ring-zinc-200/70 shadow-[0_10px_20px_rgba(161,161,170,0.2)]'
    }
    if (rank === 3) {
      return 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 ring-1 ring-orange-300/55 shadow-[0_10px_20px_rgba(249,115,22,0.2)]'
    }
    return 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
  }

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 backdrop-blur-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base lg:text-lg">Ranking de Equipo</CardTitle>
          </div>
          <div className="text-xs lg:text-sm text-muted">Por ingresos</div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted">No hay datos para este período</div>
        ) : (
          <div className="space-y-4">
            {data.map((barber, idx) => (
              <div
                key={barber.id}
                className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/95 border border-zinc-200/70 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${getRankBadge(idx + 1)}`}
                  >
                    {idx + 1}
                  </div>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    src={barber.photo_url}
                    alt={barber.name}
                    fallback={barber.name.charAt(0)}
                    size="md"
                    className="bg-gradient-to-br from-[rgba(var(--brand-primary-rgb),0.22)] to-[rgba(var(--brand-primary-rgb),0.62)] text-white ring-1 ring-[rgba(var(--brand-primary-rgb),0.34)]"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {barber.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted truncate">
                      {barber.appointments} citas • {barber.uniqueClients} clientes
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    ₡{(barber.revenue ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-muted">
                    ₡{(barber.avgPerAppointment ?? 0).toLocaleString()} /cita
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
