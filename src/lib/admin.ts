import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, AdminUser } from '@/types/database'

/**
 * Verifies if the current authenticated user is an admin
 * @param supabase - Supabase client (server or client)
 * @returns AdminUser if user is admin, null otherwise
 */
export async function verifyAdmin(
  supabase: SupabaseClient<Database>
): Promise<AdminUser | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !adminUser) {
    return null
  }

  return adminUser as AdminUser
}

/**
 * Check if a user ID is an admin (useful for service role queries)
 * @param supabase - Supabase service client
 * @param userId - User ID to check
 * @returns true if user is admin
 */
export async function isUserAdmin(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}
