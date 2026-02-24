import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarbersManagement } from '@/components/barbers/barbers-management'
import { AchievementsView } from '@/components/gamification/achievements-view'
import { ChallengesView } from '@/components/gamification/challenges-view'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { UserRound, Trophy, Target } from 'lucide-react'

/**
 * Barbers Page with Tabs
 * - Equipo: Manage barber staff
 * - Logros: Barber achievements
 * - Desafíos: Active challenges
 */
export default async function BarberosPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard')
  }

  // Get barber (if user is a barber)
  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', business.id)
    .single()

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
          <BarbersManagement />
        </TabsContent>

        <TabsContent value="logros">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                🏆 Logros de Equipo
              </h1>
              <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
                Desbloquea logros completando hitos y mejorando tu desempeño
              </p>
            </div>

            {/* Achievements View */}
            <AchievementsView businessId={business.id} barberId={barber?.id} />
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
            <ChallengesView businessId={business.id} barberId={barber?.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
