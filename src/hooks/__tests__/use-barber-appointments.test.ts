/**
 * Unit tests for useBarberAppointments hook
 *
 * Coverage Target: 90%+
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBarberAppointments } from '../use-barber-appointments'
import { createMockAppointmentsResponse, mockFetch, mockFetchError } from '@/test/test-utils'

describe('useBarberAppointments', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Initial fetch behavior', () => {
    it('should fetch appointments on mount when enabled=true', async () => {
      const mockResponse = createMockAppointmentsResponse()
      mockFetch(mockResponse)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeInstanceOf(Date)
      expect(global.fetch).toHaveBeenCalledWith('/api/barbers/barber-123/appointments/today')
    })

    it('should NOT fetch when enabled=false', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: false,
        })
      )

      // Wait a bit to ensure no fetch
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should NOT fetch when barberId is empty', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: '',
          enabled: true,
        })
      )

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const errorMessage = 'Network error'
      mockFetchError(new Error(errorMessage))

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe(errorMessage)
      expect(result.current.data).toBeNull()
    })

    it('should handle non-OK HTTP responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Barber not found' }),
      } as Response)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'invalid-barber',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Barber not found')
      expect(result.current.data).toBeNull()
    })

    it('should handle malformed JSON responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as Response)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Error desconocido')
    })
  })

  describe('Manual refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockResponse = createMockAppointmentsResponse()
      mockFetch(mockResponse)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      // Update mock data
      const updatedResponse = createMockAppointmentsResponse({
        stats: { ...mockResponse.stats, completed: 5 },
      })
      mockFetch(updatedResponse)

      // Trigger refetch
      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.data?.stats.completed).toBe(5)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should update lastUpdated timestamp on refetch', async () => {
      mockFetch(createMockAppointmentsResponse())

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstTimestamp = result.current.lastUpdated

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Refetch
      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.lastUpdated).not.toBe(firstTimestamp)
      })

      expect(result.current.lastUpdated!.getTime()).toBeGreaterThan(firstTimestamp!.getTime())
    })

    it('should handle concurrent refetch calls', async () => {
      mockFetch(createMockAppointmentsResponse())

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      vi.clearAllMocks()

      // Trigger multiple refetches
      const refetch1 = result.current.refetch()
      const refetch2 = result.current.refetch()
      const refetch3 = result.current.refetch()

      await Promise.all([refetch1, refetch2, refetch3])

      // Should handle gracefully without errors
      expect(result.current.error).toBeNull()
    })
  })

  describe('Auto-refresh functionality', () => {
    it('should auto-refresh when autoRefresh=true', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
          autoRefresh: true,
          refreshInterval: 30000, // 30 seconds
        })
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Fast-forward again
      vi.advanceTimersByTime(30000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })

    it('should NOT auto-refresh when autoRefresh=false', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
          autoRefresh: false,
        })
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()

      // Fast-forward time
      vi.advanceTimersByTime(60000)

      // Should not trigger any additional fetches
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should use custom refresh interval', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
          autoRefresh: true,
          refreshInterval: 10000, // 10 seconds
        })
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()

      // Fast-forward by 10 seconds
      vi.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })

    it('should clean up interval on unmount', async () => {
      mockFetch(createMockAppointmentsResponse())

      const { unmount } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
          autoRefresh: true,
          refreshInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      vi.clearAllMocks()

      // Unmount
      unmount()

      // Fast-forward time
      vi.advanceTimersByTime(60000)

      // Should not trigger any fetches after unmount
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should NOT auto-refresh when enabled=false', async () => {
      mockFetch(createMockAppointmentsResponse())

      renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: false,
          autoRefresh: true,
          refreshInterval: 10000,
        })
      )

      // Fast-forward time
      vi.advanceTimersByTime(30000)

      // Should not fetch at all
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Loading states', () => {
    it('should set isLoading=true during fetch', async () => {
      let resolvePromise: (value: unknown) => void
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      global.fetch = vi.fn().mockReturnValue(fetchPromise)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      expect(result.current.isLoading).toBe(true)

      // Resolve the fetch
      resolvePromise!({
        ok: true,
        json: async () => createMockAppointmentsResponse(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should reset error when starting new fetch', async () => {
      // First fetch fails
      mockFetchError(new Error('Initial error'))

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      // Second fetch succeeds
      mockFetch(createMockAppointmentsResponse())

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Data parsing', () => {
    it('should correctly parse API response', async () => {
      const mockResponse = createMockAppointmentsResponse({
        barber: { id: 'barber-456', name: 'Juan Perez' },
        date: '2024-01-15',
        stats: { total: 10, pending: 2, confirmed: 3, completed: 5, cancelled: 0, no_show: 0 },
      })

      mockFetch(mockResponse)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-456',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(result.current.data?.barber.name).toBe('Juan Perez')
      expect(result.current.data?.stats.total).toBe(10)
      expect(result.current.data?.appointments).toBeInstanceOf(Array)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty appointments array', async () => {
      const emptyResponse = createMockAppointmentsResponse({
        appointments: [],
        stats: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 },
      })

      mockFetch(emptyResponse)

      const { result } = renderHook(() =>
        useBarberAppointments({
          barberId: 'barber-123',
          enabled: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.appointments).toEqual([])
      expect(result.current.data?.stats.total).toBe(0)
    })

    it('should handle barberId change', async () => {
      mockFetch(createMockAppointmentsResponse())

      const { result, rerender } = renderHook(
        ({ barberId }) => useBarberAppointments({ barberId, enabled: true }),
        { initialProps: { barberId: 'barber-1' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/barbers/barber-1/appointments/today')

      vi.clearAllMocks()

      // Change barberId
      rerender({ barberId: 'barber-2' })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/barbers/barber-2/appointments/today')
      })
    })
  })
})
