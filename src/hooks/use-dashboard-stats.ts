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
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json() as Promise<DashboardStats>
    },
    // Refetch every 30 seconds for fresh stats
    refetchInterval: 30000,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  })
}
