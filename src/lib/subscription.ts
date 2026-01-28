import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  SubscriptionPlan,
  SubscriptionStatusResponse,
  SubscriptionStatus,
} from '@/types/database'

// Internal type for subscription data from DB
interface SubscriptionData {
  id: string
  business_id: string
  plan_id: string
  status: string
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  plan: SubscriptionPlan
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>

/**
 * Get the current subscription status for a business
 */
export async function getSubscriptionStatus(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<SubscriptionStatusResponse | null> {
  // Get subscription with plan
  const { data, error: subError } = await (supabase as AnySupabase)
    .from('business_subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('business_id', businessId)
    .single()

  if (subError || !data) {
    return null
  }

  const subscription = data as SubscriptionData

  // Check if trial expired and auto-degrade
  if (subscription.status === 'trial' && subscription.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at)
    if (trialEnd < new Date()) {
      await degradeToBasic(supabase, businessId)
      // Re-fetch after degradation
      return getSubscriptionStatus(supabase, businessId)
    }
  }

  // Check if paid subscription expired (3 days grace period)
  if (subscription.status === 'active' && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end)
    const gracePeriodEnd = new Date(periodEnd.getTime() + 3 * 24 * 60 * 60 * 1000)
    if (new Date() > gracePeriodEnd) {
      // Check for pending payments before downgrading
      const { count: pendingPayments } = await (supabase as AnySupabase)
        .from('payment_reports')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'pending')

      if (!pendingPayments || pendingPayments === 0) {
        await degradeToBasic(supabase, businessId)
        // Re-fetch after degradation
        return getSubscriptionStatus(supabase, businessId)
      }
    }
  }

  const plan = subscription.plan

  // Get current usage counts
  const [barbersCount, servicesCount, clientsCount] = await Promise.all([
    supabase
      .from('barbers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ])

  // Calculate days remaining
  let daysRemaining: number | null = null
  if (subscription.status === 'trial' && subscription.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at)
    const now = new Date()
    daysRemaining = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
  } else if (
    subscription.status === 'active' &&
    subscription.current_period_end
  ) {
    const periodEnd = new Date(subscription.current_period_end)
    const now = new Date()
    daysRemaining = Math.max(
      0,
      Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
  }

  return {
    status: subscription.status as SubscriptionStatus,
    plan,
    trial_ends_at: subscription.trial_ends_at,
    current_period_end: subscription.current_period_end,
    days_remaining: daysRemaining,
    usage: {
      barbers: { current: barbersCount.count || 0, max: plan.max_barbers },
      services: { current: servicesCount.count || 0, max: plan.max_services },
      clients: { current: clientsCount.count || 0, max: plan.max_clients },
    },
    can_use_branding: plan.has_branding,
  }
}

/**
 * Check if business can add another barber
 */
export async function canAddBarber(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<{ allowed: boolean; reason?: string; current: number; max: number | null }> {
  const status = await getSubscriptionStatus(supabase, businessId)
  if (!status) {
    return { allowed: false, reason: 'No subscription found', current: 0, max: null }
  }

  const { current, max } = status.usage.barbers
  if (max === null) {
    return { allowed: true, current, max }
  }

  if (current >= max) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${max} barberos en tu plan ${status.plan.display_name}. Actualiza a Pro para agregar más.`,
      current,
      max,
    }
  }

  return { allowed: true, current, max }
}

/**
 * Check if business can add another service
 */
export async function canAddService(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<{ allowed: boolean; reason?: string; current: number; max: number | null }> {
  const status = await getSubscriptionStatus(supabase, businessId)
  if (!status) {
    return { allowed: false, reason: 'No subscription found', current: 0, max: null }
  }

  const { current, max } = status.usage.services
  if (max === null) {
    return { allowed: true, current, max }
  }

  if (current >= max) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${max} servicios en tu plan ${status.plan.display_name}. Actualiza a Pro para agregar más.`,
      current,
      max,
    }
  }

  return { allowed: true, current, max }
}

/**
 * Check if business can add another client
 */
export async function canAddClient(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<{ allowed: boolean; reason?: string; current: number; max: number | null }> {
  const status = await getSubscriptionStatus(supabase, businessId)
  if (!status) {
    return { allowed: false, reason: 'No subscription found', current: 0, max: null }
  }

  const { current, max } = status.usage.clients
  if (max === null) {
    return { allowed: true, current, max }
  }

  if (current >= max) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${max} clientes en tu plan ${status.plan.display_name}. Actualiza a Pro para agregar más.`,
      current,
      max,
    }
  }

  return { allowed: true, current, max }
}

/**
 * Check if business can use branding features
 */
export async function canUseBranding(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<boolean> {
  const status = await getSubscriptionStatus(supabase, businessId)
  return status?.can_use_branding ?? false
}

/**
 * Degrade a business subscription to basic plan
 */
export async function degradeToBasic(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<void> {
  // Get basic plan ID
  const { data: basicPlan } = await (supabase as AnySupabase)
    .from('subscription_plans')
    .select('id')
    .eq('name', 'basic')
    .single()

  if (!basicPlan) {
    console.error('Basic plan not found')
    return
  }

  // Update subscription to expired with basic plan
  await (supabase as AnySupabase)
    .from('business_subscriptions')
    .update({
      status: 'expired',
      plan_id: basicPlan.id,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)
}

/**
 * Check if a paid subscription has expired (grace period: 3 days after period end)
 * Returns true if was downgraded
 */
export async function checkAndDowngradeExpiredPaid(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<boolean> {
  const { data } = await (supabase as AnySupabase)
    .from('business_subscriptions')
    .select('status, current_period_end')
    .eq('business_id', businessId)
    .single()

  if (!data) return false

  // Only check active subscriptions
  if (data.status !== 'active' || !data.current_period_end) {
    return false
  }

  const periodEnd = new Date(data.current_period_end)
  const gracePeriodEnd = new Date(periodEnd.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
  const now = new Date()

  if (now > gracePeriodEnd) {
    // Check if there's a pending payment (don't downgrade if payment is pending)
    const { count: pendingPayments } = await (supabase as AnySupabase)
      .from('payment_reports')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending')

    if (pendingPayments && pendingPayments > 0) {
      // Has pending payment, don't downgrade yet
      return false
    }

    // Downgrade to basic
    await degradeToBasic(supabase, businessId)
    return true
  }

  return false
}

/**
 * Change subscription plan (for downgrades, takes effect immediately)
 */
export async function changePlan(
  supabase: SupabaseClient<Database>,
  businessId: string,
  newPlanId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current subscription
  const { data: current } = await (supabase as AnySupabase)
    .from('business_subscriptions')
    .select('plan_id, status')
    .eq('business_id', businessId)
    .single()

  if (!current) {
    return { success: false, error: 'No subscription found' }
  }

  // Get new plan
  const { data: newPlan } = await (supabase as AnySupabase)
    .from('subscription_plans')
    .select('id, name, price_usd')
    .eq('id', newPlanId)
    .single()

  if (!newPlan) {
    return { success: false, error: 'Plan not found' }
  }

  // Get current plan
  const { data: currentPlan } = await (supabase as AnySupabase)
    .from('subscription_plans')
    .select('price_usd')
    .eq('id', current.plan_id)
    .single()

  // Determine if upgrade or downgrade
  const isDowngrade = newPlan.price_usd < (currentPlan?.price_usd || 0)

  if (isDowngrade) {
    // For downgrade: change immediately
    await (supabase as AnySupabase)
      .from('business_subscriptions')
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', businessId)

    return { success: true }
  }

  // For upgrade: requires payment (handled separately)
  return { success: false, error: 'Upgrade requires payment' }
}

/**
 * Activate a subscription after payment approval
 */
export async function activateSubscription(
  supabase: SupabaseClient<Database>,
  businessId: string,
  planId: string,
  durationDays: number = 30
): Promise<void> {
  const now = new Date()
  const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  await (supabase as AnySupabase)
    .from('business_subscriptions')
    .update({
      status: 'active',
      plan_id: planId,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_ends_at: null,
      updated_at: now.toISOString(),
    })
    .eq('business_id', businessId)
}

/**
 * Get all available plans
 */
export async function getPlans(
  supabase: SupabaseClient<Database>
): Promise<SubscriptionPlan[]> {
  const { data, error } = await (supabase as AnySupabase)
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_usd', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data as SubscriptionPlan[]
}

/**
 * Get subscription stats for admin dashboard
 */
export async function getSubscriptionStats(
  supabase: SupabaseClient<Database>
): Promise<{
  mrr: number
  trials_active: number
  active_subscriptions: number
  expired_subscriptions: number
  conversion_rate: number
}> {
  const now = new Date().toISOString()

  // Get all subscriptions with plans
  const { data: subscriptions } = await (supabase as AnySupabase)
    .from('business_subscriptions')
    .select('status, trial_ends_at, plan:subscription_plans(price_usd)')

  if (!subscriptions) {
    return {
      mrr: 0,
      trials_active: 0,
      active_subscriptions: 0,
      expired_subscriptions: 0,
      conversion_rate: 0,
    }
  }

  let mrr = 0
  let trialsActive = 0
  let activeCount = 0
  let expiredCount = 0

  for (const sub of subscriptions) {
    const plan = sub.plan as unknown as { price_usd: number } | null

    if (sub.status === 'active') {
      activeCount++
      mrr += plan?.price_usd || 0
    } else if (sub.status === 'trial') {
      if (sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date(now)) {
        trialsActive++
      }
    } else if (sub.status === 'expired') {
      expiredCount++
    }
  }

  // Conversion rate = active / (active + expired)
  const total = activeCount + expiredCount
  const conversionRate = total > 0 ? (activeCount / total) * 100 : 0

  return {
    mrr,
    trials_active: trialsActive,
    active_subscriptions: activeCount,
    expired_subscriptions: expiredCount,
    conversion_rate: Math.round(conversionRate * 10) / 10,
  }
}
