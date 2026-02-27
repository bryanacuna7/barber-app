/**
 * React Query Hook — All Clients (No Pagination)
 *
 * Fetches the complete client list for a business using limit=0.
 * Used by useClientMetrics for accurate KPIs and insights.
 *
 * Separate from useClients (which uses default limit=20 for paginated list views).
 * Both share the ['clients'] query key prefix, so invalidateQueries.afterClientChange
 * invalidates both caches.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import type { Client } from '@/types'
import type { ClientsListResponse } from './useClients'

interface UseAllClientsOptions {
  enabled?: boolean
}

interface ClientsApiResponse {
  data: Client[]
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
}

export function useAllClients(businessId: string | null, options?: UseAllClientsOptions) {
  return useQuery({
    // Under ['clients'] prefix so afterClientChange invalidation catches it
    queryKey: ['clients', 'list', 'all', businessId || ''],
    queryFn: async (): Promise<ClientsListResponse> => {
      if (!businessId) throw new Error('Business ID required')

      const response = await fetch(`/api/clients?businessId=${businessId}&limit=0`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch all clients')
      }

      const apiResponse: ClientsApiResponse = await response.json()

      return {
        clients: apiResponse.data,
        total: apiResponse.pagination.total,
        pagination: {
          offset: apiResponse.pagination.offset,
          limit: apiResponse.pagination.limit,
          hasMore: apiResponse.pagination.hasMore,
        },
      }
    },
    enabled: (options?.enabled ?? true) && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
