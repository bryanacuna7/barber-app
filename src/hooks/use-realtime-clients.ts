/**
 * Real-time Clients Hook
 *
 * WebSocket subscription for client changes with automatic React Query cache invalidation.
 * New bookings from public page appear instantly.
 *
 * Pattern: WebSocket → Reconnection (3 attempts) → Polling fallback
 *
 * Created: Session 113 (Phase 0 Week 3 - Real-time Infrastructure)
 */

'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { invalidateQueries } from '@/lib/react-query/config'

interface UseRealtimeClientsOptions {
  /** Business ID to filter clients */
  businessId: string
  /** Enable/disable subscription (default: true) */
  enabled?: boolean
  /** Polling interval for fallback (default: 30s) */
  pollingInterval?: number
  /** Max reconnection attempts before fallback (default: 3) */
  maxReconnectAttempts?: number
}

/**
 * Subscribe to real-time client changes
 *
 * Automatically invalidates React Query cache when clients change.
 * Falls back to polling if WebSocket connection fails.
 *
 * @example
 * ```tsx
 * function ClientsPage() {
 *   useRealtimeClients({ businessId: 'xxx' })
 *   const { data: clients } = useClients()
 *   // New client bookings appear instantly
 * }
 * ```
 */
export function useRealtimeClients({
  businessId,
  enabled = true,
  pollingInterval = 30000, // 30 seconds
  maxReconnectAttempts = 3,
}: UseRealtimeClientsOptions) {
  const isDev = process.env.NODE_ENV === 'development'
  const queryClient = useQueryClient()
  const reconnectAttempts = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !businessId) return

    const enableRealtime = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'
    const supabase = createClient()
    const shouldPollNow = () =>
      typeof document === 'undefined' || document.visibilityState === 'visible'
    const pollClients = () => {
      if (!shouldPollNow()) return
      invalidateQueries.afterClientChange(queryClient)
    }
    const startPolling = () => {
      if (pollingIntervalRef.current) return
      pollingIntervalRef.current = setInterval(() => {
        if (isDev) {
          console.log('🔄 Polling clients')
        }
        pollClients()
      }, pollingInterval)
    }
    const stopPolling = () => {
      if (!pollingIntervalRef.current) return
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (pollingIntervalRef.current) {
        pollClients()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // If realtime is disabled, use polling immediately
    if (!enableRealtime) {
      if (isDev) {
        console.log('🔄 Realtime disabled - using polling mode for clients')
      }
      startPolling()

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        stopPolling()
      }
    }

    // Realtime enabled - subscribe to WebSocket
    // Subscribe to client changes for this business
    const channel = supabase
      .channel(`clients-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'clients',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          // Real-time update received - invalidate React Query cache
          if (isDev) {
            console.log('📡 Client change detected:', payload.eventType, (payload.new as any)?.id)
          }

          // Invalidate clients queries
          invalidateQueries.afterClientChange(queryClient)

          // Reset reconnect counter on successful event
          reconnectAttempts.current = 0
        }
      )
      .subscribe((status) => {
        if (isDev) {
          console.log('🔌 Realtime subscription status (clients):', status)
        }

        if (status === 'SUBSCRIBED') {
          // Successfully connected - clear any polling fallback
          stopPolling()
          reconnectAttempts.current = 0
          if (isDev) {
            console.log('✅ Real-time clients active')
          }
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reconnectAttempts.current++

          if (isDev) {
            console.error(
              `❌ Realtime error (clients, attempt ${reconnectAttempts.current}/${maxReconnectAttempts}):`,
              status
            )
          }

          // Fallback to polling after max attempts
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            if (isDev) {
              console.warn(
                `⚠️  Falling back to polling every ${pollingInterval / 1000}s after ${maxReconnectAttempts} failed reconnection attempts`
              )
            }
            startPolling()
          }
        }

        if (status === 'CLOSED' && isDev) {
          console.log('🔌 Realtime subscription closed (clients)')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      if (isDev) {
        console.log('🧹 Cleaning up real-time clients subscription')
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      supabase.removeChannel(channel)
      stopPolling()
    }
  }, [businessId, enabled, pollingInterval, maxReconnectAttempts, queryClient, isDev])
}
