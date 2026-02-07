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
  const queryClient = useQueryClient()
  const reconnectAttempts = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled || !businessId) return

    const enableRealtime = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'
    const supabase = createClient()

    // If realtime is disabled, use polling immediately
    if (!enableRealtime) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Realtime disabled - using polling mode for clients')
      }
      pollingIntervalRef.current = setInterval(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Polling clients (dev mode)')
        }
        invalidateQueries.afterClientChange(queryClient)
      }, pollingInterval)

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
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
          if (process.env.NODE_ENV === 'development') {
            console.log('📡 Client change detected:', payload.eventType, payload.new?.id)
          }

          // Invalidate clients queries
          invalidateQueries.afterClientChange(queryClient)

          // Reset reconnect counter on successful event
          reconnectAttempts.current = 0
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Realtime subscription status (clients):', status)
        }

        if (status === 'SUBSCRIBED') {
          // Successfully connected - clear any polling fallback
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = undefined
          }
          reconnectAttempts.current = 0
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Real-time clients active')
          }
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reconnectAttempts.current++

          if (process.env.NODE_ENV === 'development') {
            console.error(
              `❌ Realtime error (clients, attempt ${reconnectAttempts.current}/${maxReconnectAttempts}):`,
              status
            )
          }

          // Fallback to polling after max attempts
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `⚠️  Falling back to polling every ${pollingInterval / 1000}s after ${maxReconnectAttempts} failed reconnection attempts`
              )
            }

            // Start polling fallback
            pollingIntervalRef.current = setInterval(() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Polling clients (WebSocket fallback)')
              }
              invalidateQueries.afterClientChange(queryClient)
            }, pollingInterval)
          }
        }

        if (status === 'CLOSED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔌 Realtime subscription closed (clients)')
          }
        }
      })

    // Cleanup subscription on unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 Cleaning up real-time clients subscription')
      }
      supabase.removeChannel(channel)

      // Clear polling if active
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [businessId, enabled, pollingInterval, maxReconnectAttempts, queryClient])
}
