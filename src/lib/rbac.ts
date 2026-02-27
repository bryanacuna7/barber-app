/**
 * RBAC (Role-Based Access Control) System
 *
 * Provides role and permission management for barber app.
 *
 * @see supabase/migrations/023_rbac_system.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'

// =====================================================
// TYPES
// =====================================================

/**
 * Available roles in the system
 */
export type Role = 'owner' | 'admin' | 'staff' | 'recepcionista'

/**
 * Available permissions in the system
 */
export type Permission =
  // Appointments
  | 'read_all_appointments'
  | 'read_own_appointments'
  | 'write_all_appointments'
  | 'write_own_appointments'
  | 'delete_appointments'
  // Barbers/Staff
  | 'manage_barbers'
  | 'view_barbers'
  // Clients
  | 'manage_clients'
  | 'view_clients'
  // Services
  | 'manage_services'
  | 'view_services'
  // Reports
  | 'view_all_reports'
  | 'view_own_reports'
  // Business
  | 'manage_business_settings'

/**
 * Permission resource categories
 */
export type PermissionResource =
  | 'appointments'
  | 'barbers'
  | 'clients'
  | 'services'
  | 'reports'
  | 'business'

/**
 * Permission with metadata
 */
export interface PermissionWithMetadata {
  permission_name: string
  permission_description: string | null
  resource: PermissionResource
}

// =====================================================
// PERMISSION CHECKS
// =====================================================

/**
 * Check if a user has a specific permission
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @param permission - Permission name to check
 * @returns true if user has permission, false otherwise
 *
 * @example
 * ```typescript
 * const canViewAll = await hasPermission(supabase, user.id, 'read_all_appointments')
 * if (!canViewAll) {
 *   return unauthorizedResponse('No tienes permiso')
 * }
 * ```
 */
export async function hasPermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('user_has_permission', {
      p_user_id: userId,
      p_permission_name: permission,
    })

    if (error) {
      console.error('❌ Error checking permission:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('❌ Unexpected error in hasPermission:', error)
    return false
  }
}

/**
 * Check if a user has ANY of the specified permissions
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @param permissions - Array of permissions to check (OR logic)
 * @returns true if user has at least one permission, false otherwise
 *
 * @example
 * ```typescript
 * const canView = await hasAnyPermission(
 *   supabase,
 *   user.id,
 *   ['read_all_appointments', 'read_own_appointments']
 * )
 * ```
 */
export async function hasAnyPermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  try {
    for (const permission of permissions) {
      const hasPerm = await hasPermission(supabase, userId, permission)
      if (hasPerm) return true
    }
    return false
  } catch (error) {
    console.error('❌ Unexpected error in hasAnyPermission:', error)
    return false
  }
}

/**
 * Check if a user has ALL of the specified permissions
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @param permissions - Array of permissions to check (AND logic)
 * @returns true if user has all permissions, false otherwise
 *
 * @example
 * ```typescript
 * const canManage = await hasAllPermissions(
 *   supabase,
 *   user.id,
 *   ['write_all_appointments', 'delete_appointments']
 * )
 * ```
 */
export async function hasAllPermissions(
  supabase: SupabaseClient<Database>,
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  try {
    for (const permission of permissions) {
      const hasPerm = await hasPermission(supabase, userId, permission)
      if (!hasPerm) return false
    }
    return true
  } catch (error) {
    console.error('❌ Unexpected error in hasAllPermissions:', error)
    return false
  }
}

// =====================================================
// USER ROLE & PERMISSIONS
// =====================================================

/**
 * Get all permissions for a user
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns Array of permissions with metadata
 *
 * @example
 * ```typescript
 * const permissions = await getUserPermissions(supabase, user.id)
 * console.log(`User has ${permissions.length} permissions`)
 * ```
 */
export async function getUserPermissions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PermissionWithMetadata[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId,
    })

    if (error) {
      console.error('❌ Error fetching user permissions:', error)
      return []
    }

    return (data || []) as PermissionWithMetadata[]
  } catch (error) {
    console.error('❌ Unexpected error in getUserPermissions:', error)
    return []
  }
}

/**
 * Get user's role
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns User's role or null if not found
 *
 * @example
 * ```typescript
 * const role = await getUserRole(supabase, user.id)
 * if (role === 'owner') {
 *   // Allow full access
 * }
 * ```
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Role | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_role', {
      p_user_id: userId,
    })

    if (error) {
      console.error('❌ Error fetching user role:', error)
      return null
    }

    return (data as Role) || null
  } catch (error) {
    console.error('❌ Unexpected error in getUserRole:', error)
    return null
  }
}

/**
 * Check if user is owner of the business
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param businessOwnerId - Business owner ID
 * @returns true if user is owner
 *
 * @example
 * ```typescript
 * const isOwner = await isBusinessOwner(supabase, user.id, business.owner_id)
 * ```
 */
export async function isBusinessOwner(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessOwnerId: string
): Promise<boolean> {
  return userId === businessOwnerId
}

// =====================================================
// BARBER-SPECIFIC CHECKS
// =====================================================

/**
 * Get barber ID from user ID
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param businessId - Business ID
 * @returns Barber ID or null if not found
 *
 * @example
 * ```typescript
 * const barberId = await getBarberIdFromUserId(supabase, user.id, business.id)
 * ```
 */
export async function getBarberIdFromUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .single()

    if (error) {
      logger.error({ userId, businessId, error }, 'Error fetching barber ID from user ID')
      return null
    }

    return data?.id || null
  } catch (error) {
    logger.error({ userId, businessId, error }, 'Unexpected error in getBarberIdFromUserId')
    return null
  }
}

/**
 * Check if user can access barber's appointments
 *
 * Validates:
 * 1. User is business owner (can access all)
 * 2. User has read_all_appointments permission (recepcionista, admin)
 * 3. User is the barber themselves (read own appointments)
 *
 * @param supabase - Supabase client
 * @param userId - User ID requesting access
 * @param barberId - Barber ID whose appointments are being accessed
 * @param businessId - Business ID
 * @param businessOwnerId - Business owner ID
 * @returns true if user can access appointments
 *
 * @example
 * ```typescript
 * const canAccess = await canAccessBarberAppointments(
 *   supabase,
 *   user.id,
 *   barberId,
 *   business.id,
 *   business.owner_id
 * )
 *
 * if (!canAccess) {
 *   return unauthorizedResponse('No tienes permiso')
 * }
 * ```
 */
export async function canAccessBarberAppointments(
  supabase: SupabaseClient<Database>,
  userId: string,
  barberId: string,
  businessId: string,
  businessOwnerId: string
): Promise<boolean> {
  try {
    // 1. Check if user is business owner
    if (userId === businessOwnerId) {
      return true
    }

    // 2. Check if user has read_all_appointments permission
    const hasReadAll = await hasPermission(supabase, userId, 'read_all_appointments')
    if (hasReadAll) {
      return true
    }

    // 3. Check if user is the barber themselves
    const userBarberId = await getBarberIdFromUserId(supabase, userId, businessId)
    if (userBarberId === barberId) {
      return true
    }

    return false
  } catch (error) {
    logger.error(
      { userId, barberId, businessId, error },
      'Unexpected error in canAccessBarberAppointments'
    )
    return false
  }
}

/**
 * Check if user can modify barber's appointments (write operations)
 *
 * Validates:
 * 1. User is business owner (can modify all)
 * 2. User has write_all_appointments permission (admin, recepcionista)
 * 3. User is the barber themselves AND has write_own_appointments permission
 *
 * Used for: complete, check-in, no-show, cancel endpoints
 *
 * @param supabase - Supabase client
 * @param userId - User ID requesting modification
 * @param barberId - Barber ID whose appointments are being modified
 * @param businessId - Business ID
 * @param businessOwnerId - Business owner ID
 * @returns true if user can modify appointments
 *
 * @example
 * ```typescript
 * const canModify = await canModifyBarberAppointments(
 *   supabase,
 *   user.id,
 *   barberId,
 *   business.id,
 *   business.owner_id
 * )
 *
 * if (!canModify) {
 *   logSecurity('unauthorized', 'high', { ... })
 *   return unauthorizedResponse('No tienes permiso para modificar esta cita')
 * }
 * ```
 */
export async function canModifyBarberAppointments(
  supabase: SupabaseClient<Database>,
  userId: string,
  barberId: string,
  businessId: string,
  businessOwnerId: string
): Promise<boolean> {
  try {
    // 1. Check if user is business owner
    if (userId === businessOwnerId) {
      return true
    }

    // 2. Check if user has write_all_appointments permission
    const hasWriteAll = await hasPermission(supabase, userId, 'write_all_appointments')
    if (hasWriteAll) {
      return true
    }

    // 3. Check if user is the barber themselves AND has write_own_appointments
    const userBarberId = await getBarberIdFromUserId(supabase, userId, businessId)
    if (userBarberId === barberId) {
      const hasWriteOwn = await hasPermission(supabase, userId, 'write_own_appointments')
      return hasWriteOwn
    }

    return false
  } catch (error) {
    logger.error(
      { userId, barberId, businessId, error },
      'Unexpected error in canModifyBarberAppointments'
    )
    return false
  }
}

// =====================================================
// ROLE METADATA
// =====================================================

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const roleNames: Record<Role, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    staff: 'Personal',
    recepcionista: 'Recepcionista',
  }
  return roleNames[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    owner: 'Propietario del negocio con acceso completo',
    admin: 'Administrador del sistema con casi todos los permisos',
    staff: 'Personal (miembros del equipo/estilistas) que ven sus propias citas',
    recepcionista: 'Recepcionista que gestiona citas y clientes',
  }
  return descriptions[role] || ''
}

/**
 * Get all available roles
 */
export function getAllRoles(): Role[] {
  return ['owner', 'admin', 'staff', 'recepcionista']
}
