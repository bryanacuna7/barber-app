'use client'

/**
 * Barbers Leaderboard Component
 * Shows top performing barbers
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Trophy, TrendingUp } from 'lucide-react'
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
  return (
    <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 backdrop-blur-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base lg:text-lg">Ranking de Barberos</CardTitle>
          </div>
          <div className="text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">Por ingresos</div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay datos para este período
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((barber, idx) => (
              <div
                key={barber.id}
                className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {idx === 0 ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-lg">
                      1
                    </div>
                  ) : idx === 1 ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 text-white font-bold text-lg">
                      2
                    </div>
                  ) : idx === 2 ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-lg">
                      3
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    src={barber.photo_url}
                    alt={barber.name}
                    fallback={barber.name.charAt(0)}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {barber.name}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                      {barber.appointments} citas • {barber.uniqueClients} clientes
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    ₡{barber.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    ₡{barber.avgPerAppointment.toLocaleString()} /cita
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
