/**
 * React Query Hooks - Clients (Clientes)
 *
 * Standardized hooks for client data management with React Query.
 * Uses centralized query keys and automatic real-time synchronization.
 *
 * Updated: Session 120 (Phase 1 Week 1 - Clientes Modernization)
 * Pattern: Same as Mi Día (useBarberDayAppointments) and Analytics (useBusinessAnalytics)
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { showSuccessToast, showErrorToast } from '@/lib/react-query/error-handlers'
import type { Client } from '@/types'

/* ==================== TYPES ==================== */

/**
 * API Response format from /api/clients
 * Uses pagination format consistent with other paginated endpoints
 */
export interface ClientsApiResponse {
  data: Client[]
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
}

/**
 * Normalized response for hook consumers
 * Provides a cleaner interface while maintaining compatibility
 */
export interface ClientsListResponse {
  clients: Client[]
  total: number
  pagination: {
    offset: number
    limit: number
    hasMore: boolean
  }
}

export interface CreateClientInput {
  name: string
  phone: string
  email?: string
  notes?: string
}

export type UpdateClientInput = Partial<CreateClientInput>

type ApiErrorPayload = {
  message?: string
  error?: string
}

async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage

  try {
    const payload = (await response.json()) as ApiErrorPayload
    message = payload.message || payload.error || fallbackMessage
  } catch {
    // Keep fallback when response body is empty or not JSON
  }

  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = response.status
  throw error
}

/* ==================== QUERIES ==================== */

/**
 * Fetch all clients for a business
 *
 * @example
 * ```tsx
 * function ClientsPage() {
 *   const { data, isLoading, error } = useClients(businessId)
 *   return <ClientList clients={data?.clients} />
 * }
 * ```
 */
export function useClients(businessId: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.list(businessId || ''),
    queryFn: async (): Promise<ClientsListResponse> => {
      if (!businessId) throw new Error('Business ID required')

      const response = await fetch(`/api/clients?businessId=${businessId}`)

      if (!response.ok) {
        await throwApiError(response, 'Failed to fetch clients')
      }

      // API returns { data: Client[], pagination: { total, offset, limit, hasMore } }
      const apiResponse: ClientsApiResponse = await response.json()

      // Transform to normalized response format
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
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes (clients change less frequently than appointments)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single client detail
 *
 * @example
 * ```tsx
 * function ClientProfile({ clientId }) {
 *   const { data: client } = useClient(clientId)
 *   return <ProfileEditor client={client} />
 * }
 * ```
 */
export function useClient(clientId: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required')

      const response = await fetch(`/api/clients/${clientId}`)

      if (!response.ok) {
        await throwApiError(response, 'Failed to fetch client')
      }

      return response.json() as Promise<Client>
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes (detail view doesn't change as often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch client statistics (visits, spending, etc.)
 *
 * @example
 * ```tsx
 * function ClientStats({ clientId }) {
 *   const { data: stats } = useClientStats(clientId)
 *   return <StatsCards {...stats} />
 * }
 * ```
 */
export function useClientStats(clientId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.clients.detail(clientId || ''), 'stats'],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required')

      const response = await fetch(`/api/clients/${clientId}/stats`)

      if (!response.ok) {
        await throwApiError(response, 'Failed to fetch client stats')
      }

      return response.json()
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

/* ==================== MUTATIONS ==================== */

/**
 * Create new client
 *
 * @example
 * ```tsx
 * function CreateClientForm() {
 *   const createClient = useCreateClient()
 *
 *   const handleSubmit = async (data) => {
 *     await createClient.mutateAsync(data)
 *   }
 * }
 * ```
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        await throwApiError(response, 'Failed to create client')
      }

      return response.json() as Promise<Client>
    },
    onSuccess: (newClient) => {
      // Invalidate all client queries to show new client
      invalidateQueries.afterClientChange(queryClient)

      showSuccessToast(`Cliente ${newClient.name} creado exitosamente`)
    },
    onError: (error: Error) => {
      showErrorToast('Error al crear cliente', error.message)
    },
  })
}

/**
 * Update existing client
 *
 * @example
 * ```tsx
 * function EditClientForm({ clientId }) {
 *   const updateClient = useUpdateClient()
 *
 *   const handleSave = async (data) => {
 *     await updateClient.mutateAsync({ id: clientId, data })
 *   }
 * }
 * ```
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientInput }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        await throwApiError(response, 'Failed to update client')
      }

      return response.json() as Promise<Client>
    },
    onSuccess: () => {
      // Invalidate affected queries
      invalidateQueries.afterClientChange(queryClient)

      showSuccessToast('Cliente actualizado exitosamente')
    },
    onError: (error: Error) => {
      showErrorToast('Error al actualizar cliente', error.message)
    },
  })
}

/**
 * Delete client
 *
 * @example
 * ```tsx
 * function DeleteClientButton({ clientId }) {
 *   const deleteClient = useDeleteClient()
 *
 *   const handleDelete = async () => {
 *     await deleteClient.mutateAsync(clientId)
 *   }
 * }
 * ```
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        await throwApiError(response, 'Failed to delete client')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all client queries to remove deleted client
      invalidateQueries.afterClientChange(queryClient)

      showSuccessToast('Cliente eliminado exitosamente')
    },
    onError: (error: Error) => {
      showErrorToast('Error al eliminar cliente', error.message)
    },
  })
}
