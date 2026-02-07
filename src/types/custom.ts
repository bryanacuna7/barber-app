/**
 * Custom TypeScript types for BarberShop Pro
 *
 * This file contains type definitions that extend or complement
 * the auto-generated Supabase types from database.ts
 */

import type { Database } from './database'

// =============================================================================
// Database Table Row Types (Aliases for convenience)
// =============================================================================

export type Business = Database['public']['Tables']['businesses']['Row']
export type Barber = Database['public']['Tables']['barbers']['Row']
export type BarberInvitation = Database['public']['Tables']['barber_invitations']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type PaymentReport = Database['public']['Tables']['payment_reports']['Row']

// Gamification types
export type BarberAchievement = Database['public']['Tables']['barber_achievements']['Row']
export type BarberChallenge = Database['public']['Tables']['barber_challenges']['Row']
export type BarberChallengeParticipant =
  Database['public']['Tables']['barber_challenge_participants']['Row']

// =============================================================================
// Subscription Types
// =============================================================================

export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus
  plan: SubscriptionPlan
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  is_trial: boolean
  trial_days_left: number | null
  has_access: boolean
  days_remaining: number | null
  usage?: {
    clients: { current: number; max: number }
    barbers: { current: number; max: number }
    services: { current: number; max: number }
  }
  can_use_branding?: boolean
}

// =============================================================================
// System Settings JSON Values (stored in system_settings.value)
// =============================================================================

export interface ExchangeRateValue {
  usd_to_crc: number
  last_updated: string
  notes?: string
}

export interface UsdBankAccountValue {
  enabled: boolean
  bank_name: string
  account_number: string
  account_holder: string
  notes?: string
}

export interface SupportWhatsAppValue {
  number: string
  display_number: string
  message_template?: string
}

export interface SinpeDetailsValue {
  phone_number: string
  account_name: string
  notes?: string
}

export interface ExchangeRateResponse {
  rate?: number
  usd_to_crc: number
  last_updated: string
}

// =============================================================================
// Notification Types
// =============================================================================

export type NotificationChannel = 'app' | 'email' | 'both' | 'in_app' | 'sms' | 'whatsapp' | 'push'

export interface NotificationPreferences {
  channel: 'app' | 'email' | 'both'
  email_address: string | null
  email_trial_expiring: boolean
  email_subscription_expiring: boolean
  email_payment_status: boolean
  email_new_appointment: boolean
}

// =============================================================================
// Business Operating Hours Types
// =============================================================================

export interface DayHours {
  open: string // HH:MM format
  close: string // HH:MM format
}

export interface OperatingHours {
  mon: DayHours | null
  tue: DayHours | null
  wed: DayHours | null
  thu: DayHours | null
  fri: DayHours | null
  sat: DayHours | null
  sun: DayHours | null
}

// =============================================================================
// Appointment Types
// =============================================================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show'

export interface AppointmentWithDetails extends Appointment {
  client?: Client
  barber?: Barber
  service?: Service
  business?: Business
}

// =============================================================================
// Gamification Types
// Note: Main types are defined in src/lib/gamification/barber-gamification.ts
// These are re-exported here for convenience
// =============================================================================

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary'

export type AchievementCategory = 'revenue' | 'appointments' | 'clients' | 'streak' | 'special'

export type ChallengeType = 'revenue' | 'appointments' | 'clients' | 'team_total'

// =============================================================================
// Badge Variant Type (for UI components)
// =============================================================================

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'pending'
  | 'outline'

// =============================================================================
// Loyalty Program Types
// Note: ProgramType is defined in src/lib/gamification/loyalty-calculator.ts
// Re-export it here for convenience
// =============================================================================

export type ProgramType = 'points' | 'visits' | 'referral' | 'hybrid'

export type ReferralRewardType = 'points' | 'discount' | 'free_service'

// =============================================================================
// Referral Conversion Types
// =============================================================================

export interface ReferralConversion {
  id: string
  referred_business: {
    name: string
    id?: string
    slug?: string
  } | null
  status: 'pending' | 'trial' | 'active' | 'churned'
  created_at: string
  converted_at: string | null
  referral_code?: string
}

export interface AdminReferralConversion {
  id: string
  referralCode: string
  status: 'pending' | 'active' | 'expired'
  createdAt: string
  convertedAt: string | null
  referrerBusiness: {
    id: string
    name: string
    slug: string
  }
  referredBusiness: {
    id: string
    name: string
    slug: string
  }
}

// =============================================================================
// Gamification Extended Types
// =============================================================================

export interface AchievementWithProgress {
  id: string
  key: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  category: AchievementCategory
  threshold: number
  reward_points: number
  unlocks_feature: string | null
  is_secret: boolean
  progress: number
  current: number
  is_earned: boolean
  earned_at: string | null
  display_order?: number
}

// =============================================================================
// Mi Dia (Staff View) Types
// =============================================================================

/**
 * Client info included in today's appointments
 */
export interface TodayAppointmentClient {
  id: string
  name: string
  phone: string | null
  email: string | null
}

/**
 * Service info included in today's appointments
 */
export interface TodayAppointmentService {
  id: string
  name: string
  duration_minutes: number
  price: number
}

/**
 * Single appointment in the Mi Dia view
 */
export interface TodayAppointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  client_notes: string | null
  internal_notes: string | null
  client: TodayAppointmentClient | null
  service: TodayAppointmentService | null
}

/**
 * Response from GET /api/barbers/[id]/appointments/today
 */
export interface TodayAppointmentsResponse {
  appointments: TodayAppointment[]
  barber: {
    id: string
    name: string
  }
  date: string
  stats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    no_show: number
  }
}

/**
 * Response from appointment status update actions (check-in, complete, no-show)
 */
export interface AppointmentStatusUpdateResponse {
  id: string
  status: string
  scheduled_at: string
  duration_minutes: number
  price: number
  client_notes: string | null
  internal_notes: string | null
  client: TodayAppointmentClient | null
  service: TodayAppointmentService | null
}
