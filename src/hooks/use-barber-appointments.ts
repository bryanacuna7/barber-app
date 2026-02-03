'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TodayAppointmentsResponse } from '@/types/custom'

interface UseBarberAppointmentsOptions {
  barberId: string
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseBarberAppointmentsReturn {
  data: TodayAppointmentsResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

/**
 * Hook to fetch today's appointments for a barber
 * Supports auto-refresh and manual refetch
 */
export function useBarberAppointments({
  barberId,
  enabled = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds default
}: UseBarberAppointmentsOptions): UseBarberAppointmentsReturn {
  const [data, setData] = useState<TodayAppointmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!enabled || !barberId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/barbers/${barberId}/appointments/today`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const result: TodayAppointmentsResponse = await response.json()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar citas')
      setError(error)
      console.error('Error fetching barber appointments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [barberId, enabled])

  // Initial fetch
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !enabled) return

    const interval = setInterval(() => {
      fetchAppointments()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchAppointments])

  return {
    data,
    isLoading,
    error,
    refetch: fetchAppointments,
    lastUpdated,
  }
}
