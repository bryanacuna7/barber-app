/**
 * Real-time Business Subscriptions Hook
 *
 * WebSocket subscription for business subscription changes with automatic React Query cache invalidation.
 * Critical for feature gating - trial expiration, payment verification, plan changes.
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

interface UseRealtimeSubscriptionsOptions {
  /** Business ID to filter subscriptions */
  businessId: string
  /** Enable/disable subscription (default: true) */
  enabled?: boolean
  /** Polling interval for fallback (default: 60s - less critical) */
  pollingInterval?: number
  /** Max reconnection attempts before fallback (default: 3) */
  maxReconnectAttempts?: number
  /** Callback when subscription status changes */
  onStatusChange?: (newStatus: 'active' | 'past_due' | 'cancelled') => void
}

/**
 * Subscribe to real-time business subscription changes
 *
 * Automatically invalidates React Query cache and settings queries when subscription changes.
 * Falls back to polling if WebSocket connection fails.
 *
 * Critical for:
 * - Trial expiration detection
 * - Payment verification
 * - Feature gating (lock features on cancelled/past_due)
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   useRealtimeSubscriptions({
 *     businessId: 'xxx',
 *     onStatusChange: (status) => {
 *       if (status === 'cancelled') {
 *         toast.error('Subscription cancelled - features locked')
 *       }
 *     }
 *   })
 *   const { data: subscription } = useBusinessSubscription()
 * }
 * ```
 */
export function useRealtimeSubscriptions({
  businessId,
  enabled = true,
  pollingInterval = 60000, // 60 seconds (less frequent - not as critical as appointments)
  maxReconnectAttempts = 3,
  onStatusChange,
}: UseRealtimeSubscriptionsOptions) {
  const queryClient = useQueryClient()
  const reconnectAttempts = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    if (!enabled || !businessId) return

    const enableRealtime = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'
    const supabase = createClient()

    // If realtime is disabled, use polling immediately
    if (!enableRealtime) {
      console.log('🔄 Realtime disabled - using polling mode for subscriptions')
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Polling subscriptions (dev mode)')
        invalidateQueries.afterBusinessSettingsChange(queryClient)
      }, pollingInterval)

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }

    // Realtime enabled - subscribe to WebSocket
    // Subscribe to business_subscriptions changes for this business
    const channel = supabase
      .channel(`business-subscriptions-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'business_subscriptions',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          // Real-time update received - invalidate React Query cache
          console.log(
            '📡 Subscription change detected:',
            payload.eventType,
            (payload.new as any)?.status || (payload.old as any)?.status
          )

          // Invalidate business settings queries (includes subscription)
          invalidateQueries.afterBusinessSettingsChange(queryClient)

          // Trigger callback if status changed
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const oldStatus = (payload.old as any).status
            const newStatus = (payload.new as any).status

            if (oldStatus !== newStatus && onStatusChange) {
              console.warn('⚠️  Subscription status changed:', oldStatus, '→', newStatus)
              onStatusChange(newStatus)
            }
          }

          // Reset reconnect counter on successful event
          reconnectAttempts.current = 0
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime subscription status (business_subscriptions):', status)

        if (status === 'SUBSCRIBED') {
          // Successfully connected - clear any polling fallback
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = undefined
          }
          reconnectAttempts.current = 0
          console.log('✅ Real-time subscriptions active')
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reconnectAttempts.current++

          console.error(
            `❌ Realtime error (subscriptions, attempt ${reconnectAttempts.current}/${maxReconnectAttempts}):`,
            status
          )

          // Fallback to polling after max attempts
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.warn(
              `⚠️  Falling back to polling every ${pollingInterval / 1000}s after ${maxReconnectAttempts} failed reconnection attempts`
            )

            // Start polling fallback
            pollingIntervalRef.current = setInterval(() => {
              console.log('🔄 Polling subscriptions (WebSocket fallback)')
              invalidateQueries.afterBusinessSettingsChange(queryClient)
            }, pollingInterval)
          }
        }

        if (status === 'CLOSED') {
          console.log('🔌 Realtime subscription closed (business_subscriptions)')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions subscription')
      supabase.removeChannel(channel)

      // Clear polling if active
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [businessId, enabled, pollingInterval, maxReconnectAttempts, queryClient, onStatusChange])
}
