import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '@/types'

export function useClients(searchTerm?: string) {
  return useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      const url = searchTerm
        ? `/api/clients?search=${encodeURIComponent(searchTerm)}`
        : '/api/clients'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      return response.json() as Promise<Client[]>
    },
    // Keep data for 2 minutes
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; phone: string; email?: string; notes?: string }) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create client')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all client queries to refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update client')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete client')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
