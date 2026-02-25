/**
 * Shared Client Resolver
 *
 * Resolves authenticated user → client_id for a business.
 * Used by BOTH availability and book routes to guarantee symmetric predictions.
 *
 * Uses .limit(1) not .single() because there's no UNIQUE(business_id, user_id)
 * constraint, so duplicates are possible. Orders by created_at DESC to pick latest.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolve a client_id for prediction purposes.
 * Returns undefined if not authenticated or no client record found.
 *
 * Both availability and book routes call this same function for predictorClientId.
 */
export async function resolveClientForBusiness(
  supabase: SupabaseClient,
  businessId: string,
  authUserId: string | null
): Promise<string | undefined> {
  if (!authUserId) return undefined

  // user_id match — .limit(1) not .single() (no UNIQUE constraint)
  const { data: byUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', authUserId)
    .order('created_at', { ascending: false })
    .limit(1)

  return byUserId?.[0]?.id ?? undefined
}
