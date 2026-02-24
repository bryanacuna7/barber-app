/**
 * Notification Orchestrator — Public API
 *
 * Usage:
 *   import { notify } from '@/lib/notifications/orchestrator'
 *   // or
 *   import { notify, type NotifyContext } from '@/lib/notifications'
 *
 * NOTE: The barrel re-export below is from the orchestrator module,
 * NOT from the legacy @/lib/notifications.ts file. The legacy module
 * is still imported directly by existing code (createNotification, etc.)
 * and will be gradually migrated.
 */

export { notify } from './orchestrator'
export type {
  NotificationType,
  NotifyContext,
  NotificationResult,
  ChannelResult,
  NotificationChannel,
  ChannelStatus,
  InAppPayload,
  PushPayloadParams,
  EmailPayloadParams,
} from './types'
export { isDuplicate, logNotification } from './dedup'
