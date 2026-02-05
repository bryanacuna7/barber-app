/**
 * Barberos Page V2 - Modernized with React Query + Error Boundaries
 *
 * Pattern: Client Component with Business Context
 * Feature flag: NEXT_PUBLIC_FF_NEW_BARBEROS=true
 *
 * Changes from original:
 * - Server Component → Client Component
 * - Server auth → Business Context
 * - Added error boundaries
 * - Ready for React Query hooks integration
 */

'use client'

import { Suspense } from 'react'
import { BarbersManagement } from '@/components/barbers/barbers-management'
import { AchievementsView } from '@/components/gamification/achievements-view'
import { ChallengesView } from '@/components/gamification/challenges-view'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { UserRound, Trophy, Target } from 'lucide-react'
import { useBusiness } from '@/contexts/business-context'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { useBarbers } from '@/hooks/queries/useBarbers'

function BarberosContent() {
  const { businessId, userId } = useBusiness()

  // Get barber profile if user is a barber (not just owner)
  const { data: barbers = [] } = useBarbers(businessId)
  const currentBarber = barbers.find((b) => b.userId === userId)

  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue="equipo" className="w-full">
        {/* Tabs Navigation */}
        <TabsList className="mb-6">
          <TabsTrigger value="equipo" icon={<UserRound className="h-4 w-4" />}>
            Equipo
          </TabsTrigger>
          <TabsTrigger value="logros" icon={<Trophy className="h-4 w-4" />}>
            Logros
          </TabsTrigger>
          <TabsTrigger value="desafios" icon={<Target className="h-4 w-4" />}>
            Desafíos
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="equipo">
          <ComponentErrorBoundary>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                </div>
              }
            >
              <BarbersManagement />
            </Suspense>
          </ComponentErrorBoundary>
        </TabsContent>

        <TabsContent value="logros">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                🏆 Logros de Barberos
              </h1>
              <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
                Desbloquea logros completando hitos y mejorando tu desempeño
              </p>
            </div>

            {/* Achievements View */}
            <ComponentErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                  </div>
                }
              >
                <AchievementsView businessId={businessId} barberId={currentBarber?.id} />
              </Suspense>
            </ComponentErrorBoundary>
          </div>
        </TabsContent>

        <TabsContent value="desafios">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                🎯 Desafíos Activos
              </h1>
              <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
                Compite con tus compañeros y gana recompensas
              </p>
            </div>

            {/* Challenges View */}
            <ComponentErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                  </div>
                }
              >
                <ChallengesView businessId={businessId} barberId={currentBarber?.id} />
              </Suspense>
            </ComponentErrorBoundary>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function BarberosPageV2() {
  return (
    <ComponentErrorBoundary>
      <BarberosContent />
    </ComponentErrorBoundary>
  )
}
