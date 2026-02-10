import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReferralCodeCard } from '@/components/referrals/referral-code-card'
import { StatsCards } from '@/components/referrals/stats-cards'
import { MilestoneProgress } from '@/components/referrals/milestone-progress'
import { BadgesShowcase } from '@/components/referrals/badges-showcase'
import { ConversionsTable } from '@/components/referrals/conversions-table'
import { GenerateReferralCode } from '@/components/referrals/generate-referral-code'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

/**
 * Referencias Page
 * Sistema de referencias para business owners
 * Permite compartir código de referido y ganar recompensas
 */
export default async function ReferenciasPage() {
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

  // Get referral stats directly from Supabase (no need for API route)
  const { data: referralStats } = await supabase
    .from('business_referrals')
    .select('*')
    .eq('business_id', (business as any).id)
    .single()

  // Get all milestones
  const { data: milestones } = await supabase
    .from('referral_milestones')
    .select('*')
    .eq('is_active', true)
    .order('milestone_number', { ascending: true })

  // Get earned badges (rewards claimed)
  const { data: claimedRewards } = await supabase
    .from('referral_rewards_claimed')
    .select(
      `
      id,
      claimed_at,
      applied_at,
      expires_at,
      milestone:referral_milestones(
        milestone_number,
        badge_name,
        badge_icon,
        tier,
        reward_description
      )
    `
    )
    .eq('business_id', (business as any).id)
    .order('claimed_at', { ascending: false })

  // Get conversions (referidos)
  const { data: conversions } = await supabase
    .from('referral_conversions')
    .select(
      `
      id,
      referral_code,
      status,
      created_at,
      converted_at,
      referred_business:businesses!referral_conversions_referred_business_id_fkey(
        id,
        name,
        slug
      )
    `
    )
    .eq('referrer_business_id', (business as any).id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const currentSuccessful = referralStats?.successful_referrals || 0
  const totalReferrals = referralStats?.total_referrals || 0

  // Find next milestone
  const nextMilestone = milestones?.find((m: any) => m.referrals_required > currentSuccessful)

  // Calculate conversion rate
  const conversionRate =
    totalReferrals > 0 ? ((currentSuccessful / totalReferrals) * 100).toFixed(1) : '0.0'

  // Calculate progress to next milestone
  const progressToNext = nextMilestone
    ? {
        number: nextMilestone.milestone_number,
        referralsRequired: nextMilestone.referrals_required,
        remaining: nextMilestone.referrals_required - currentSuccessful,
        reward: nextMilestone.reward_description,
        percentage: Math.min(
          100,
          (currentSuccessful / nextMilestone.referrals_required) * 100
        ).toFixed(1),
      }
    : null

  // Format conversions with proper types
  const formattedConversions =
    conversions?.map((c) => ({
      id: c.id,
      referred_business: c.referred_business,
      status: c.status as 'pending' | 'trial' | 'active' | 'churned',
      created_at: c.created_at,
      converted_at: c.converted_at,
      referral_code: c.referral_code,
    })) || []

  // Build data object
  const data = {
    totalReferrals,
    successfulReferrals: currentSuccessful,
    currentMilestone: referralStats?.current_milestone || 0,
    pointsBalance: referralStats?.points_balance || 0,
    conversionRate,
    referralCode: referralStats?.referral_code || null,
    qrCodeUrl: referralStats?.qr_code_url || null,
    signupUrl: referralStats?.referral_code
      ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralStats.referral_code}`
      : null,
    nextMilestone: progressToNext,
    earnedBadges: claimedRewards || [],
    conversions: formattedConversions,
    milestones: milestones || [],
    businessName: (business as any).name,
  }

  // Check if referral code exists
  if (!data.referralCode) {
    return (
      <div className="space-y-6 pb-24 lg:pb-6 mx-auto w-full max-w-[1280px]">
        <div>
          <h1 className="app-page-title">Sistema de Referencias</h1>
          <p className="app-page-subtitle mt-1 lg:hidden">
            Refiere otros negocios y gana recompensas increíbles
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
          <GenerateReferralCode businessId={(business as any).id} />
          {/* Desktop: Show milestones preview alongside CTA */}
          <div className="hidden lg:block">
            <div className="h-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-white mb-4">
                Recompensas por Nivel
              </h3>
              <div className="space-y-3">
                {[
                  { refs: 1, reward: '20% descuento', tier: 'bronze' },
                  { refs: 3, reward: '1 mes gratis', tier: 'silver' },
                  { refs: 5, reward: '2 meses gratis', tier: 'gold' },
                  { refs: 10, reward: '4 meses gratis', tier: 'platinum' },
                  { refs: 20, reward: '1 año gratis', tier: 'diamond' },
                ].map((m) => (
                  <div
                    key={m.refs}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-white/[0.04] p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-800/70 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {m.refs}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {m.reward}
                      </p>
                      <p className="text-xs text-muted">
                        {m.refs} referido{m.refs > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6 mx-auto w-full max-w-[1280px]">
      {/* Header */}
      <div>
        <h1 className="app-page-title">Sistema de Referencias</h1>
        <p className="app-page-subtitle mt-1 lg:hidden">
          Refiere otros negocios y gana recompensas increíbles
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalReferrals={data.totalReferrals}
        successfulReferrals={data.successfulReferrals}
        currentMilestone={data.currentMilestone}
        conversionRate={parseFloat(data.conversionRate)}
      />

      {/* Referral Code Card — always visible (primary action) */}
      <ReferralCodeCard
        referralCode={data.referralCode}
        signupUrl={data.signupUrl}
        qrCodeUrl={data.qrCodeUrl}
      />

      {/* Milestone Progress — collapsible on mobile */}
      <CollapsibleSection
        title="Progreso de Hitos"
        badge={data.nextMilestone ? `${data.nextMilestone.remaining} restantes` : undefined}
      >
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <MilestoneProgress
            currentReferrals={data.successfulReferrals}
            currentMilestone={data.currentMilestone}
            nextMilestone={
              data.nextMilestone
                ? {
                    number: data.nextMilestone.number,
                    remaining: data.nextMilestone.remaining,
                    reward: data.nextMilestone.reward,
                    referrals_required: data.nextMilestone.referralsRequired,
                  }
                : null
            }
            milestones={data.milestones}
          />
        </div>
      </CollapsibleSection>

      {/* Badges Showcase — collapsible on mobile */}
      {data.earnedBadges && data.earnedBadges.length > 0 && (
        <CollapsibleSection title="Insignias Ganadas" badge={data.earnedBadges.length}>
          <BadgesShowcase earnedBadges={data.earnedBadges} />
        </CollapsibleSection>
      )}

      {/* Conversions Table — collapsible on mobile */}
      <CollapsibleSection title="Conversiones" badge={data.conversions?.length || 0}>
        <ConversionsTable conversions={data.conversions || []} />
      </CollapsibleSection>
    </div>
  )
}
