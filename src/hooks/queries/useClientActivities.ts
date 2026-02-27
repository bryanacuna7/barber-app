'use client'

import { useQuery } from '@tanstack/react-query'

interface ClientActivity {
  id: string
  type: 'appointment' | 'registered'
  title: string
  description: string
  date: string
  amount?: number
  status?: string
}

interface UseClientActivitiesOptions {
  clientId: string | null
  enabled?: boolean
}

export function useClientActivities({ clientId, enabled = true }: UseClientActivitiesOptions) {
  return useQuery({
    queryKey: ['client-activities', clientId],
    queryFn: async (): Promise<ClientActivity[]> => {
      if (!clientId) return []

      const response = await fetch(
        `/api/appointments?client_id=${clientId}&limit=20&status=completed`
      )

      if (!response.ok) return []

      const data = await response.json()
      const appointments = data.data || data

      return (
        appointments as Array<{
          id: string
          scheduled_at: string
          price: number
          status: string
          service?: { name: string } | null
        }>
      ).map((apt) => ({
        id: apt.id,
        type: 'appointment' as const,
        title: 'Servicio completado',
        description: apt.service?.name || 'Servicio',
        date: apt.scheduled_at,
        amount: apt.price,
        status: apt.status,
      }))
    },
    enabled: enabled && !!clientId,
    staleTime: 60_000,
  })
}
