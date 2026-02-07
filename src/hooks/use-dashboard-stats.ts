import { useQuery } from '@tanstack/react-query'

interface DashboardStats {
  todayAppointments: number
  todayRevenue: number
  monthAppointments: number
  monthRevenue: number
  totalClients: number
  business: {
    id: string
    name: string
    slug: string
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch('/api/dashboard/stats', {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
        }
        return response.json() as Promise<DashboardStats>
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Dashboard stats request timed out after 10 seconds')
        }
        throw error
      }
    },
    // Refetch every 30 seconds for fresh stats
    refetchInterval: 30000,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Retry only once
    retry: 1,
  })
}
