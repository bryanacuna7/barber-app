'use client'

/**
 * Business Context Provider
 *
 * Provides business, user, and role data to client components.
 * Extended in Feature 0A with role detection and staff permissions.
 */

import React, { createContext, useContext } from 'react'
import type { UserRole, StaffPermissions } from '@/lib/auth/roles'

interface BusinessContextValue {
  businessId: string
  slug?: string
  userId: string
  userEmail?: string
  userRole: UserRole
  isOwner: boolean
  isBarber: boolean
  isAdmin: boolean
  barberId?: string
  staffPermissions: StaffPermissions
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

interface BusinessProviderProps {
  children: React.ReactNode
  businessId: string
  slug?: string
  userId: string
  userEmail?: string
  userRole: UserRole
  isOwner: boolean
  isBarber: boolean
  isAdmin: boolean
  barberId?: string
  staffPermissions: StaffPermissions
}

export function BusinessProvider({
  children,
  businessId,
  slug,
  userId,
  userEmail,
  userRole,
  isOwner,
  isBarber,
  isAdmin,
  barberId,
  staffPermissions,
}: BusinessProviderProps) {
  const value: BusinessContextValue = {
    businessId,
    slug,
    userId,
    userEmail,
    userRole,
    isOwner,
    isBarber,
    isAdmin,
    barberId,
    staffPermissions,
  }

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

/**
 * Hook to access business context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { businessId, userId, userRole, staffPermissions } = useBusiness()
 *   // Role-aware rendering
 *   if (userRole === 'barber' && !staffPermissions.nav_clientes) return null
 * }
 * ```
 */
export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
