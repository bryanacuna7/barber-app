import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReferralCodeCard } from '@/components/referrals/referral-code-card'
import { StatsCards } from '@/components/referrals/stats-cards'
import { MilestoneProgress } from '@/components/referrals/milestone-progress'
import { BadgesShowcase } from '@/components/referrals/badges-showcase'
import { ConversionsTable } from '@/components/referrals/conversions-table'
import { GenerateReferralCode } from '@/components/referrals/generate-referral-code'

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
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Sistema de Referencias
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Refiere otros negocios y gana recompensas increíbles
            </p>
          </div>
          <GenerateReferralCode businessId={(business as any).id} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sistema de Referencias
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Code Card */}
          <div className="lg:col-span-1">
            <ReferralCodeCard
              referralCode={data.referralCode}
              signupUrl={data.signupUrl}
              qrCodeUrl={data.qrCodeUrl}
            />
          </div>

          {/* Milestone Progress */}
          <div className="lg:col-span-2">
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
        </div>

        {/* Badges Showcase */}
        {data.earnedBadges && data.earnedBadges.length > 0 && (
          <BadgesShowcase earnedBadges={data.earnedBadges} />
        )}

        {/* Conversions Table */}
        <ConversionsTable conversions={data.conversions || []} />
      </div>
    </div>
  )
}
