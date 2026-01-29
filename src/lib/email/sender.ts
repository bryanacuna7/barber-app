/**
 * Email sender service using Resend
 * Handles email notifications with channel preferences
 */

import { Resend } from 'resend'
import type { NotificationChannel } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/service-client'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!)

// Check if email is configured
export const isEmailConfigured = () => {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM
}

/**
 * Get notification preferences for a business
 */
export async function getNotificationPreferences(businessId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error) {
    console.error('Error fetching notification preferences:', error)
    return null
  }

  return data
}

/**
 * Determine if email should be sent based on preferences
 */
export function shouldSendEmail(
  channel: NotificationChannel,
  notificationType: keyof typeof EMAIL_PREFERENCE_MAP
): boolean {
  // If channel is 'app', never send email
  if (channel === 'app') return false

  // If channel is 'email' or 'both', send email
  return channel === 'email' || channel === 'both'
}

// Map notification types to preference fields
const EMAIL_PREFERENCE_MAP = {
  trial_expiring: 'email_trial_expiring',
  subscription_expiring: 'email_subscription_expiring',
  payment_approved: 'email_payment_status',
  payment_rejected: 'email_payment_status',
  new_appointment: 'email_new_appointment',
  appointment_reminder: 'email_appointment_reminder',
  new_business: 'email_new_business',
  payment_pending: 'email_payment_pending',
} as const

export type EmailNotificationType = keyof typeof EMAIL_PREFERENCE_MAP

/**
 * Check if a specific email type should be sent
 */
export async function shouldSendEmailType(
  businessId: string,
  notificationType: EmailNotificationType
): Promise<boolean> {
  const prefs = await getNotificationPreferences(businessId)

  if (!prefs) return false

  // Check if channel allows email
  if (!shouldSendEmail(prefs.channel, notificationType)) return false

  // Check specific preference
  const prefField = EMAIL_PREFERENCE_MAP[notificationType]
  return prefs[prefField] === true
}

export interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
  from?: string
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping send.')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'BarberShop Pro <noreply@barbershoppro.com>',
      to: [to],
      subject,
      react,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send email notification with preference check
 */
export async function sendNotificationEmail({
  businessId,
  notificationType,
  to,
  subject,
  react,
  from,
}: {
  businessId: string
  notificationType: EmailNotificationType
} & SendEmailOptions) {
  // Check if email should be sent based on preferences
  const shouldSend = await shouldSendEmailType(businessId, notificationType)

  if (!shouldSend) {
    return { success: false, error: 'Email disabled by preferences' }
  }

  return sendEmail({ to, subject, react, from })
}
