'use client'

/**
 * Client Context Provider
 *
 * Provides client, business, and user data to /mi-cuenta client components.
 * Handles multi-business clients with business switching via localStorage.
 *
 * @see src/app/(client)/layout.tsx
 * @see supabase/migrations/029_client_dashboard_rls.sql
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

export interface ClientBusiness {
  id: string
  name: string
  slug: string
  brandColor: string | null
  logoUrl: string | null
}

export interface ClientInfo {
  id: string
  businessId: string
  name: string
  email: string | null
  phone: string | null
}

interface ClientContextValue {
  userId: string
  clientId: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  businessId: string
  businessName: string
  businessSlug: string
  businesses: ClientBusiness[]
  isMultiBusiness: boolean
  switchBusiness: (businessId: string) => void
}

const ClientContext = createContext<ClientContextValue | undefined>(undefined)

const STORAGE_KEY = 'client-selected-business'

interface ClientProviderProps {
  children: React.ReactNode
  userId: string
  clients: ClientInfo[]
  businesses: ClientBusiness[]
  initialBusinessId?: string
}

export function ClientProvider({
  children,
  userId,
  clients,
  businesses,
  initialBusinessId,
}: ClientProviderProps) {
  // Initialize with localStorage value (client) or server-provided fallback
  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    if (typeof window !== 'undefined' && !initialBusinessId) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && businesses.some((b) => b.id === stored)) {
          return stored
        }
      } catch {
        // localStorage may throw in private browsing
      }
    }
    return initialBusinessId || businesses[0]?.id || ''
  })

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) ?? businesses[0]
  const activeClient = clients.find((c) => c.businessId === activeBusinessId) ?? clients[0]

  const switchBusiness = useCallback(
    (businessId: string) => {
      if (businesses.some((b) => b.id === businessId)) {
        setActiveBusinessId(businessId)
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, businessId)
        }
      }
    },
    [businesses]
  )

  const value: ClientContextValue = {
    userId,
    clientId: activeClient?.id ?? '',
    clientName: activeClient?.name ?? '',
    clientEmail: activeClient?.email ?? null,
    clientPhone: activeClient?.phone ?? null,
    businessId: activeBusiness?.id ?? '',
    businessName: activeBusiness?.name ?? '',
    businessSlug: activeBusiness?.slug ?? '',
    businesses,
    isMultiBusiness: businesses.length > 1,
    switchBusiness,
  }

  return (
    <ClientContext.Provider value={value}>
      <ThemeProvider primaryColor={activeBusiness?.brandColor ?? '#4F46E5'} />
      {children}
    </ClientContext.Provider>
  )
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}
