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

export function useRealtimeServices({
  businessId,
  enabled = true,
  onError,
}: UseRealtimeServicesOptions) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RealtimeStatus>('CONNECTING')
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectCountRef = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const MAX_RECONNECT_ATTEMPTS = 3

  // Polling fallback (60s interval - less aggressive than appointments)
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return

    console.log('[Services Real-time] Starting polling fallback (60s interval)')

    pollingIntervalRef.current = setInterval(() => {
      console.log('[Services Real-time] Polling for changes...')
      invalidateQueries.afterServiceChange(queryClient)
    }, 60000) // 60 seconds - services change less frequently
  }, [queryClient])

  useEffect(() => {
    if (!enabled || !businessId) {
      console.log('[Services Real-time] Disabled or no businessId')
      return
    }

    console.log(`[Services Real-time] Initializing for business: ${businessId}`)

    const supabase = createClient()

    // WebSocket subscription
    const channel = supabase
      .channel(`services:business_id=eq.${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'services',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log('[Services Real-time] Change detected:', payload)

          // Invalidate relevant queries
          invalidateQueries.afterServiceChange(queryClient)

          // Reset reconnect counter on successful event
          reconnectCountRef.current = 0
        }
      )
      .subscribe((status) => {
        console.log('[Services Real-time] Status:', status)
        setStatus(status as RealtimeStatus)

        if (status === 'SUBSCRIBED') {
          // Clear polling fallback if exists
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          reconnectCountRef.current = 0
          console.log('[Services Real-time] ✅ WebSocket connected')
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reconnectCountRef.current++
          console.warn(
            `[Services Real-time] ⚠️ Connection error (attempt ${reconnectCountRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          )

          if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
            console.warn('[Services Real-time] ⚠️ Max reconnect attempts reached, switching to polling')
            startPolling()
          }
        }
      })

    channelRef.current = channel

    // Cleanup
    return () => {
      console.log('[Services Real-time] Cleaning up')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [businessId, enabled, queryClient, startPolling])

  return {
    status,
    isConnected: status === 'SUBSCRIBED',
    isPolling: !!pollingIntervalRef.current,
  }
}
