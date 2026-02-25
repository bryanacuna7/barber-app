/**
 * Role Detection + Staff Permissions
 *
 * Detects user role (admin > owner > barber > client) and provides
 * owner-configurable staff permissions for UI visibility.
 *
 * @see supabase/migrations/027_staff_permissions.sql
 * @see supabase/migrations/023_rbac_system.sql
 * @see supabase/migrations/029_client_dashboard_rls.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// =====================================================
// TYPES
// =====================================================

export type UserRole = 'owner' | 'barber' | 'admin' | 'client'

export interface StaffPermissions {
  nav_citas: boolean
  nav_servicios: boolean
  nav_clientes: boolean
  nav_analiticas: boolean
  nav_changelog: boolean
  can_create_citas: boolean
  can_view_all_citas: boolean
}

export interface ClientRecord {
  id: string
  businessId: string
}

export interface UserRoleInfo {
  role: UserRole
  businessId: string
  barberId?: string
  clientRecords?: ClientRecord[]
  isOwner: boolean
  isBarber: boolean
  isAdmin: boolean
  isClient: boolean
}

// =====================================================
// DEFAULTS
// =====================================================

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  nav_citas: true,
  nav_servicios: true,
  nav_clientes: false,
  nav_analiticas: false,
  nav_changelog: true,
  can_create_citas: true,
  can_view_all_citas: false,
}

/**
 * Pages that are ALWAYS hidden from barbers (owner-only, not configurable)
 */
export const OWNER_ONLY_PATHS = [
  '/dashboard',
  '/barberos',
  '/configuracion',
  '/lealtad',
  '/suscripcion',
]

/**
 * Maps staff_permissions keys to page paths
 */
export const PERMISSION_TO_PATH: Record<string, string> = {
  nav_citas: '/citas',
  nav_servicios: '/servicios',
  nav_clientes: '/clientes',
  nav_analiticas: '/analiticas',
  nav_changelog: '/changelog',
}

// =====================================================
// FUNCTIONS
// =====================================================

/**
 * Safely merge raw DB value with defaults.
 * Handles null, partial objects, and unknown keys.
 */
export function getStaffPermissions(raw: unknown): StaffPermissions {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STAFF_PERMISSIONS }
  }

  const obj = raw as Record<string, unknown>
  const result = { ...DEFAULT_STAFF_PERMISSIONS }

  for (const key of Object.keys(DEFAULT_STAFF_PERMISSIONS) as (keyof StaffPermissions)[]) {
    if (key in obj && typeof obj[key] === 'boolean') {
      result[key] = obj[key] as boolean
    }
  }

  return result
}

/**
 * Merge per-barber custom_permissions over business-level staff_permissions.
 * custom_permissions only contains overrides — missing keys fall back to business defaults.
 */
export function mergePermissions(
  businessPermissions: StaffPermissions,
  customPermissions: Partial<StaffPermissions> | null | undefined
): StaffPermissions {
  if (!customPermissions || typeof customPermissions !== 'object') {
    return { ...businessPermissions }
  }

  const result = { ...businessPermissions }
  for (const key of Object.keys(DEFAULT_STAFF_PERMISSIONS) as (keyof StaffPermissions)[]) {
    if (key in customPermissions && typeof customPermissions[key] === 'boolean') {
      result[key] = customPermissions[key] as boolean
    }
  }
  return result
}

/**
 * Check if a barber can access a specific pathname based on staff_permissions.
 * Returns true if allowed, false if denied.
 *
 * When customPermissions is provided, it overrides the business-level permissions
 * for any keys that are explicitly set.
 */
export function canBarberAccessPath(
  pathname: string,
  permissions: StaffPermissions,
  customPermissions?: Partial<StaffPermissions> | null
): boolean {
  // Merge custom overrides if present
  const effectivePerms = mergePermissions(permissions, customPermissions)
  // Mi Día is always allowed for barbers
  if (pathname === '/mi-dia' || pathname.startsWith('/mi-dia/')) {
    return true
  }

  // Gamification pages are always allowed for barbers (their own achievements/challenges)
  if (pathname === '/barberos/logros' || pathname === '/barberos/desafios') {
    return true
  }

  // Owner-only paths are never allowed for barbers
  if (OWNER_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false
  }

  // Check configurable paths
  for (const [permKey, path] of Object.entries(PERMISSION_TO_PATH)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return effectivePerms[permKey as keyof StaffPermissions] as boolean
    }
  }

  // Unknown paths: deny by default for barbers
  return false
}

/**
 * Detect the primary role for a user.
 *
 * Priority: admin > owner > barber
 * Owner who is also a barber → role = 'owner', isBarber = true
 *
 * Returns null if user has no role (no business, not a barber, not admin).
 */
export async function detectUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRoleInfo | null> {
  // 1. Check admin
  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const isAdmin = !!adminRecord

  // 2. Check business owner
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  const isOwner = !!business

  // 3. Check barber (robust against multiple rows / legacy null is_active)
  const { data: barberRows } = await supabase
    .from('barbers')
    .select('id, business_id, is_active')
    .eq('user_id', userId)
  const activeBarberRows = (barberRows ?? []).filter((row) => row.is_active !== false)
  const barberRecord =
    isOwner && business
      ? (activeBarberRows.find((row) => row.business_id === business.id) ?? null)
      : (activeBarberRows[0] ?? null)

  const isBarber = !!barberRecord

  // Determine primary role
  if (isAdmin && isOwner) {
    return {
      role: 'admin',
      businessId: business!.id,
      barberId: barberRecord?.id,
      isOwner: true,
      isBarber,
      isAdmin: true,
      isClient: false,
    }
  }

  if (isAdmin && !isOwner) {
    // Admin without business — handled separately in layout
    return {
      role: 'admin',
      businessId: '', // Will be handled by layout's admin-no-business UI
      barberId: barberRecord?.id,
      isOwner: false,
      isBarber,
      isAdmin: true,
      isClient: false,
    }
  }

  if (isOwner) {
    return {
      role: 'owner',
      businessId: business!.id,
      barberId: barberRecord?.id,
      isOwner: true,
      isBarber,
      isAdmin: false,
      isClient: false,
    }
  }

  if (isBarber) {
    return {
      role: 'barber',
      businessId: (barberRecord as { id: string; business_id: string }).business_id,
      barberId: barberRecord!.id,
      isOwner: false,
      isBarber: true,
      isAdmin: false,
      isClient: false,
    }
  }

  // 4. Check client (only runs if not admin/owner/barber)
  const { data: clientRecords } = await supabase
    .from('clients')
    .select('id, business_id')
    .eq('user_id', userId)

  if (clientRecords && clientRecords.length > 0) {
    return {
      role: 'client',
      businessId: clientRecords[0].business_id,
      clientRecords: clientRecords.map((c) => ({
        id: c.id,
        businessId: c.business_id,
      })),
      isOwner: false,
      isBarber: false,
      isAdmin: false,
      isClient: true,
    }
  }

  // No role found
  return null
}
