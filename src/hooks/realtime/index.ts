/**
 * Real-time Hooks - Barrel Export
 *
 * WebSocket subscriptions with automatic React Query cache invalidation.
 *
 * Created: Session 113 (Phase 0 Week 3)
 */

export { useRealtimeAppointments } from '../use-realtime-appointments'
export { useRealtimeClients } from '../use-realtime-clients'
export { useRealtimeSubscriptions } from '../use-realtime-subscriptions'

// Re-export types
export type { UseRealtimeAppointmentsOptions } from '../use-realtime-appointments'
export type { UseRealtimeClientsOptions } from '../use-realtime-clients'
export type { UseRealtimeSubscriptionsOptions } from '../use-realtime-subscriptions'
