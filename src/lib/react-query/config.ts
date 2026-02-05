/**
 * React Query Configuration
 *
 * Global configuration for @tanstack/react-query.
 * Handles caching, retries, and error handling.
 *
 * Created: Session 110 (Pre-Implementation Requirements)
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create QueryClient with optimized defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Caching strategy
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 min
        gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 min (was cacheTime in v4)

        // Retry strategy
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.status === 401 || error?.status === 403) {
            return false
          }
          // Retry network errors up to 3 times
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * 2 ** attemptIndex, 30000)
        },

        // Refetch strategy
        refetchOnWindowFocus: false, // Don't refetch on window focus (too aggressive)
        refetchOnMount: true, // Refetch on component mount if stale
        refetchOnReconnect: true, // Refetch on reconnect

        // Error handling
        throwOnError: false, // Don't throw errors globally (handle per component)
      },

      mutations: {
        // Mutations don't retry by default
        retry: false,

        // Error handling
        throwOnError: false,
      },
    },
  })
}

/**
 * Query key factory for consistent key management
 */
export const queryKeys = {
  // Appointments (Mi Día)
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.appointments.lists(), filters] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
    barberToday: (barberId: string) =>
      [...queryKeys.appointments.all, 'barber-today', barberId] as const,
  },

  // Services (Servicios)
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.services.lists(), filters] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.services.details(), id] as const,
    metrics: (id: string) => [...queryKeys.services.detail(id), 'metrics'] as const,
  },

  // Clients (Clientes)
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    timeline: (id: string) => [...queryKeys.clients.detail(id), 'timeline'] as const,
  },

  // Barbers (Barberos)
  barbers: {
    all: ['barbers'] as const,
    lists: () => [...queryKeys.barbers.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.barbers.lists(), filters] as const,
    details: () => [...queryKeys.barbers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.barbers.details(), id] as const,
    metrics: (id: string) => [...queryKeys.barbers.detail(id), 'metrics'] as const,
  },

  // Analytics (Reportes)
  analytics: {
    all: ['analytics'] as const,
    // Legacy: date range based (start/end ISO strings)
    period: (start: string, end: string) =>
      [...queryKeys.analytics.all, 'period', start, end] as const,
    insights: (start: string, end: string) =>
      [...queryKeys.analytics.period(start, end), 'insights'] as const,
    // Modern: period based ('week' | 'month' | 'year')
    byPeriod: (period: 'week' | 'month' | 'year') =>
      [...queryKeys.analytics.all, 'by-period', period] as const,
  },

  // Calendar (Citas)
  calendar: {
    all: ['calendar'] as const,
    views: () => [...queryKeys.calendar.all, 'view'] as const,
    view: (date: string, barberId?: string) =>
      barberId
        ? ([...queryKeys.calendar.views(), date, barberId] as const)
        : ([...queryKeys.calendar.views(), date] as const),
  },

  // Settings (Configuración)
  settings: {
    all: ['settings'] as const,
    business: () => [...queryKeys.settings.all, 'business'] as const,
    team: () => [...queryKeys.settings.all, 'team'] as const,
  },
} as const

/**
 * Cache invalidation helpers
 */
export const invalidateQueries = {
  // Invalidate after appointment changes
  afterAppointmentChange: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  },

  // Invalidate after client changes
  afterClientChange: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
  },

  // Invalidate after service changes
  afterServiceChange: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  },

  // Invalidate after barber changes
  afterBarberChange: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.barbers.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.team() })
  },

  // Invalidate after business settings change
  afterBusinessSettingsChange: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.business() })
  },
}

/**
 * Optimistic update helpers
 */
export const optimisticUpdates = {
  // Update appointment status optimistically
  appointmentStatus: (queryClient: QueryClient, appointmentId: string, newStatus: string) => {
    queryClient.setQueryData(queryKeys.appointments.detail(appointmentId), (old: any) =>
      old ? { ...old, status: newStatus } : old
    )
  },

  // Update service active status optimistically
  serviceStatus: (queryClient: QueryClient, serviceId: string, isActive: boolean) => {
    queryClient.setQueryData(queryKeys.services.detail(serviceId), (old: any) =>
      old ? { ...old, isActive } : old
    )
  },
}
