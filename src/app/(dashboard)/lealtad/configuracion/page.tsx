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
import { Gift, Sparkles, Users, ChevronLeft } from 'lucide-react'
import { LoyaltyConfigWrapper } from '@/components/loyalty/loyalty-config-wrapper'
import { LoyaltyPreview } from '@/components/loyalty/loyalty-preview'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'
import type { ProgramType, ReferralRewardType } from '@/types'

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
    programType: data.program_type as ProgramType,
    pointsPerCurrencyUnit: data.points_per_currency_unit,
    pointsExpiryDays: data.points_expiry_days,
    freeServiceAfterVisits: data.free_service_after_visits,
    discountAfterVisits: data.discount_after_visits,
    discountPercentage: data.discount_percentage,
    referralRewardType: data.referral_reward_type as ReferralRewardType,
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
      {/* Mobile Section Header */}
      <header className="mb-4 lg:hidden ios-group-card px-3 py-2">
        <div className="flex min-h-[44px] items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200/70 transition-colors active:bg-zinc-300/80 dark:bg-white/10 dark:active:bg-white/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold text-zinc-900 dark:text-white">
              Programa de Lealtad
            </h1>
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

      {/* Stats Cards - Only show if program exists and has data */}
      {program &&
        stats &&
        (stats.enrolledClients > 0 ||
          stats.totalPointsAwarded > 0 ||
          stats.totalRewardsRedeemed > 0) && (
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

      {/* Empty State when no program or no stats */}
      {program && stats && stats.enrolledClients === 0 && stats.totalPointsAwarded === 0 && (
        <Card className="mt-4 mb-5 border-border/50 bg-muted/20 p-6 text-center lg:mb-6 lg:mt-0">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Activa el programa y tus clientes comenzarán a acumular puntos
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los primeros datos aparecerán aquí después de la primera reserva
          </p>
        </Card>
      )}

      {/* Main Content - Side by side on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Configuration Form + Mobile Preview Button */}
        <Suspense fallback={<ConfigFormSkeleton />}>
          <LoyaltyConfigWrapper businessId={business.id} initialProgram={program} />
        </Suspense>

        {/* Right Column: Preview (Desktop only - sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <LoyaltyPreview program={program} />
          </div>
        </div>
      </div>
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
