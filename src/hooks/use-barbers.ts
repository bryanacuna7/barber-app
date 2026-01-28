import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Barber } from '@/types'

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const response = await fetch('/api/barbers')
      if (!response.ok) {
        throw new Error('Failed to fetch barbers')
      }
      return response.json() as Promise<Barber[]>
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const response = await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create barber')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
  })
}

export function useUpdateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Barber> }) => {
      const response = await fetch(`/api/barbers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update barber')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
  })
}

export function useDeleteBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/barbers/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete barber')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
  })
}
