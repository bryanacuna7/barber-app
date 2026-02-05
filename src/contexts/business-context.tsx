'use client'

/**
 * Business Context Provider
 *
 * Provides business and user authentication data to client components.
 * This solves the issue where client pages need businessId but can't
 * access server-side auth directly.
 *
 * Created: Session 122 - Fix for JSON parsing error in Clientes/Citas pages
 */

import React, { createContext, useContext } from 'react'

interface BusinessContextValue {
  businessId: string
  userId: string
  userEmail?: string
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

interface BusinessProviderProps {
  children: React.ReactNode
  businessId: string
  userId: string
  userEmail?: string
}

export function BusinessProvider({
  children,
  businessId,
  userId,
  userEmail
}: BusinessProviderProps) {
  const value: BusinessContextValue = {
    businessId,
    userId,
    userEmail,
  }

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

/**
 * Hook to access business context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { businessId, userId } = useBusiness()
 *   const { data: clients } = useClients(businessId)
 *   return <ClientList clients={clients} />
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
