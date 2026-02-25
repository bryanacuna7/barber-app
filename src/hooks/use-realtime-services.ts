/**
 * Real-time Services Hook
 *
 * WebSocket subscription for services table changes with graceful degradation
 * Pattern: WebSocket → Retry (3x) → Polling fallback (60s)
 *
 * Less critical than appointments/clients (services change infrequently)
 * but maintains consistent pattern across all modules.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { invalidateQueries } from '@/lib/react-query/config'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeStatus = 'CONNECTING' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

interface UseRealtimeServicesOptions {
  businessId: string
  enabled?: boolean
  onError?: (error: Error) => void
}

export function useRealtimeServices({ businessId, enabled = true }: UseRealtimeServicesOptions) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RealtimeStatus>('CONNECTING')
  const [isPolling, setIsPolling] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectCountRef = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const MAX_RECONNECT_ATTEMPTS = 3

  // Stable ref for queryClient to avoid re-running effect
  const queryClientRef = useRef(queryClient)

  useEffect(() => {
    queryClientRef.current = queryClient
  }, [queryClient])

  const pollServices = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return
    }
    invalidateQueries.afterServiceChange(queryClientRef.current)
  }, [])

  // Polling fallback (60s interval - less aggressive than appointments)
  // Uses queueMicrotask for setState to avoid synchronous setState inside effect body
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return
    queueMicrotask(() => setIsPolling(true))

    pollingIntervalRef.current = setInterval(() => {
      pollServices()
    }, 60000)
  }, [pollServices])

  const stopPolling = useCallback(() => {
    if (!pollingIntervalRef.current) return
    clearInterval(pollingIntervalRef.current)
    pollingIntervalRef.current = null
    queueMicrotask(() => setIsPolling(false))
  }, [])

  useEffect(() => {
    if (!enabled || !businessId) return

    const enableRealtime = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !pollingIntervalRef.current) return
      pollServices()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // If realtime is disabled, use polling immediately
    if (!enableRealtime) {
      startPolling()

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        stopPolling()
      }
    }

    const supabase = createClient()

    const channel = supabase
      .channel(`services:business_id=eq.${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          invalidateQueries.afterServiceChange(queryClientRef.current)
          reconnectCountRef.current = 0
        }
      )
      .subscribe((status) => {
        setStatus(status as RealtimeStatus)

        if (status === 'SUBSCRIBED') {
          stopPolling()
          reconnectCountRef.current = 0
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reconnectCountRef.current++
          if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
            startPolling()
          }
        }
      })

    channelRef.current = channel

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      stopPolling()
    }
  }, [businessId, enabled, pollServices, startPolling, stopPolling])

  return {
    status,
    isConnected: status === 'SUBSCRIBED',
    isPolling,
  }
}
