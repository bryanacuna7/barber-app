/**
 * Notification Orchestrator — Type Definitions
 *
 * Re-exports canonical NotificationType from the existing module and defines
 * the orchestrator-specific interfaces (context, results, channels).
 */

import type { NotificationType } from '@/lib/notifications'

// Re-export the canonical type so consumers only import from this barrel
export type { NotificationType }

// ─── Channels ────────────────────────────────────────────────────────────────

export type NotificationChannel = 'push' | 'email' | 'in_app' | 'whatsapp'

// ─── Orchestrator Context ────────────────────────────────────────────────────

export interface NotifyContext {
  /** Business that owns/triggers this notification. Used for preference lookup. */
  businessId: string

  /** Optional appointment reference for dedup and notification_log FK. */
  appointmentId?: string

  /** Recipient auth user ID (for push subs, in-app notifications, and dedup). */
  userId?: string

  /** Recipient email address (for email channel). */
  recipientEmail?: string

  /** Recipient phone (for WhatsApp deep link generation). */
  recipientPhone?: string

  /** Template variables — arbitrary data passed to email templates and in-app title/body. */
  data: Record<string, unknown>
}

// ─── Per-channel result ──────────────────────────────────────────────────────

export type ChannelStatus = 'sent' | 'failed' | 'retried' | 'deduped' | 'skipped'

export interface ChannelResult {
  channel: NotificationChannel
  status: ChannelStatus
  /** Machine-readable error code when status is 'failed' or 'retried'. */
  errorCode?: string
  /** Sanitized error message (no PII, max 500 chars). */
  errorMessage?: string
}

// ─── Aggregate result ────────────────────────────────────────────────────────

export interface NotificationResult {
  event: NotificationType
  channels: ChannelResult[]
  /** True when at least one channel succeeded. */
  success: boolean
}

// ─── In-app notification payload (mirrors createNotification params) ─────────

export interface InAppPayload {
  title: string
  message: string
  referenceType?: string
  referenceId?: string
}

// ─── Push payload (mirrors PushPayload from push/sender) ─────────────────────

export interface PushPayloadParams {
  title: string
  body: string
  url?: string
  tag?: string
}

// ─── Email payload ───────────────────────────────────────────────────────────

export interface EmailPayloadParams {
  to: string
  subject: string
  react: React.ReactElement
}
