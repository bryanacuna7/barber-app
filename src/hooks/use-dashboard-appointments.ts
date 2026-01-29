import { useQuery } from '@tanstack/react-query'

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  client: {
    name: string
    phone: string
  } | null
  service: {
    name: string
  } | null
}

interface DashboardAppointmentsResponse {
  appointments: Appointment[]
}

export function useDashboardAppointments() {
  return useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/appointments')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      return response.json() as Promise<DashboardAppointmentsResponse>
    },
    // Refetch every 60 seconds
    refetchInterval: 60000,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  })
}
