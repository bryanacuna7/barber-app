/**
 * Loyalty Configuration Page
 * Business owners configure their loyalty program here
 *
 * Features:
 * - Toggle enabled/disabled
 * - Quick Start: 4 preset templates
 * - Custom Mode: Modify any parameter
 * - Live preview (desktop only)
 */

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Gift, Sparkles, Users, TrendingUp, ChevronLeft } from 'lucide-react'
import { LoyaltyConfigForm } from '@/components/loyalty/loyalty-config-form'
import { LoyaltyPreview } from '@/components/loyalty/loyalty-preview'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

export const metadata = {
  title: 'Configuración de Lealtad | BarberShop Pro',
  description: 'Configura tu programa de lealtad para recompensar a tus clientes',
}

async function getLoyaltyProgram(businessId: string): Promise<LoyaltyProgram | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (!data) return null

  // Transform snake_case from DB to camelCase for component
  return {
    id: data.id,
    businessId: data.business_id,
    enabled: data.enabled,
    programType: data.program_type,
    pointsPerCurrencyUnit: data.points_per_currency_unit,
    pointsExpiryDays: data.points_expiry_days,
    freeServiceAfterVisits: data.free_service_after_visits,
    discountAfterVisits: data.discount_after_visits,
    discountPercentage: data.discount_percentage,
    referralRewardType: data.referral_reward_type,
    referralRewardAmount: data.referral_reward_amount,
    refereeRewardAmount: data.referee_reward_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

async function getLoyaltyStats(businessId: string) {
  const supabase = await createClient()

  // Total enrolled clients
  const { count: enrolledCount } = await supabase
    .from('client_loyalty_status')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  // Total points awarded
  const { data: totalPointsData } = await supabase
    .from('client_loyalty_status')
    .select('lifetime_points')
    .eq('business_id', businessId)

  const totalPoints =
    (totalPointsData as { lifetime_points: number }[] | null)?.reduce(
      (sum, row) => sum + (row.lifetime_points || 0),
      0
    ) || 0

  // Total rewards redeemed
  const { count: rewardsCount } = await supabase
    .from('loyalty_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .in('transaction_type', ['redeemed_discount', 'redeemed_free_service'])

  return {
    enrolledClients: enrolledCount || 0,
    totalPointsAwarded: totalPoints,
    totalRewardsRedeemed: rewardsCount || 0,
  }
}

export default async function LoyaltyConfigPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  // Get loyalty program (if exists)
  const program = await getLoyaltyProgram(business.id)

  // Get stats (if program exists)
  const stats = program ? await getLoyaltyStats(business.id) : null

  return (
    <>
      {/* Mobile Header - Fixed */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl lg:hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex h-14 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 transition-colors active:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold">Programa de Lealtad</h1>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="mb-5 hidden lg:mb-6 lg:block">
        <h1 className="text-2xl font-bold tracking-tight">Programa de Lealtad</h1>
        <p className="text-sm text-muted-foreground">
          Configura recompensas para tus clientes más fieles
        </p>
      </div>

      {/* Stats Cards (if program exists) - Horizontal scroll on mobile */}
      {program && stats && (
        <div className="mb-5 lg:mb-6">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
            <Card className="min-w-[150px] flex-shrink-0 border-border/50 bg-card/80 p-4 backdrop-blur-sm lg:min-w-0 lg:p-5">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="rounded-full bg-primary/10 p-2 lg:p-2.5">
                  <Users className="h-4 w-4 text-primary lg:h-5 lg:w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground lg:text-xs">Inscritos</p>
                  <p className="text-xl font-bold lg:text-2xl">{stats.enrolledClients}</p>
                </div>
              </div>
            </Card>

            <Card className="min-w-[150px] flex-shrink-0 border-border/50 bg-card/80 p-4 backdrop-blur-sm lg:min-w-0 lg:p-5">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="rounded-full bg-amber-500/10 p-2 lg:p-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 lg:h-5 lg:w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground lg:text-xs">Puntos</p>
                  <p className="text-xl font-bold lg:text-2xl">
                    {stats.totalPointsAwarded.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="min-w-[150px] flex-shrink-0 border-border/50 bg-card/80 p-4 backdrop-blur-sm lg:min-w-0 lg:p-5">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="rounded-full bg-emerald-500/10 p-2 lg:p-2.5">
                  <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400 lg:h-5 lg:w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground lg:text-xs">Canjeados</p>
                  <p className="text-xl font-bold lg:text-2xl">{stats.totalRewardsRedeemed}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content - Full Width */}
      <Suspense fallback={<ConfigFormSkeleton />}>
        <LoyaltyConfigForm businessId={business.id} initialProgram={program} />
      </Suspense>

      {/* Info Banner (only if no program) */}
      {!program && (
        <Card className="mt-6 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">¿Por qué activar un programa de lealtad?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Los programas de lealtad aumentan la retención de clientes en un 30% promedio.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  Incrementa frecuencia de visitas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  Fomenta referidos orgánicos
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  Diferenciación vs competencia
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}

function ConfigFormSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 p-5 backdrop-blur-sm lg:p-6">
      <div className="animate-pulse space-y-4 lg:space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-muted lg:w-48" />
          <div className="h-4 w-48 rounded bg-muted lg:w-96" />
        </div>
        <div className="h-10 w-full rounded bg-muted lg:h-12" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
          <div className="h-32 rounded-2xl bg-muted lg:h-36" />
          <div className="h-32 rounded-2xl bg-muted lg:h-36" />
          <div className="h-32 rounded-2xl bg-muted lg:h-36" />
          <div className="h-32 rounded-2xl bg-muted lg:h-36" />
        </div>
        <div className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </Card>
  )
}
