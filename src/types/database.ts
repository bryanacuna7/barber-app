import type { Json } from './json'

export interface Business {
  id: string
  created_at: string
  updated_at: string
  owner_id: string
  name: string
  slug: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  timezone: string
  operating_hours: OperatingHours
  booking_buffer_minutes: number
  advance_booking_days: number
  is_active: boolean
  brand_primary_color: string
  brand_secondary_color: string | null
  logo_url: string | null
}

export interface OperatingHours {
  mon?: DayHours | null
  tue?: DayHours | null
  wed?: DayHours | null
  thu?: DayHours | null
  fri?: DayHours | null
  sat?: DayHours | null
  sun?: DayHours | null
}

export interface DayHours {
  open: string
  close: string
}

export interface Service {
  id: string
  business_id: string
  created_at: string
  updated_at: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  display_order: number
  is_active: boolean
}

export interface Client {
  id: string
  business_id: string
  created_at: string
  updated_at: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  total_visits: number
  total_spent: number
  last_visit_at: string | null
}

export interface Barber {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  business_id: string
  name: string
  email: string
  bio: string | null
  photo_url: string | null
  is_active: boolean
  display_order: number
}

export interface BarberInvitation {
  id: string
  created_at: string
  business_id: string
  email: string
  token: string
  expires_at: string
  used_at: string | null
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  business_id: string
  client_id: string | null
  service_id: string | null
  created_at: string
  updated_at: string
  scheduled_at: string
  duration_minutes: number
  price: number
  status: AppointmentStatus
  confirmation_sent_at: string | null
  reminder_sent_at: string | null
  client_notes: string | null
  internal_notes: string | null
  barber_id: string | null
}

export interface AppointmentWithDetails extends Appointment {
  client: Client | null
  service: Service | null
  barber: Barber | null
}

// Insert types - only required fields, optional fields have DB defaults
export interface BusinessInsert {
  owner_id: string
  name: string
  slug: string
  phone?: string | null
  whatsapp?: string | null
  address?: string | null
  timezone?: string
  operating_hours?: Json
  booking_buffer_minutes?: number
  advance_booking_days?: number
  is_active?: boolean
  brand_primary_color?: string
  brand_secondary_color?: string | null
  logo_url?: string | null
}

export interface ServiceInsert {
  business_id: string
  name: string
  price: number
  description?: string | null
  duration_minutes?: number
  display_order?: number
  is_active?: boolean
}

export interface ClientInsert {
  business_id: string
  name: string
  phone: string
  email?: string | null
  notes?: string | null
}

export interface AppointmentInsert {
  business_id: string
  scheduled_at: string
  duration_minutes: number
  price: number
  client_id?: string | null
  service_id?: string | null
  status?: string
  confirmation_sent_at?: string | null
  reminder_sent_at?: string | null
  client_notes?: string | null
  internal_notes?: string | null
  barber_id?: string | null
}

export interface BarberInsert {
  business_id: string
  name: string
  email: string
  user_id?: string | null
  bio?: string | null
  photo_url?: string | null
  is_active?: boolean
  display_order?: number
}

// Admin types
export interface AdminUser {
  id: string
  user_id: string
  created_at: string
}

// Business with stats for admin panel
export interface BusinessWithStats extends Business {
  barber_count?: number
  service_count?: number
  appointment_count?: number
  total_revenue?: number
  owner_email?: string
}

// ============================================================================
// Subscription Types (Phase 3)
// ============================================================================

export interface SubscriptionPlan {
  id: string
  name: 'basic' | 'pro'
  display_name: string
  price_usd: number
  max_barbers: number | null      // null = ilimitado
  max_services: number | null
  max_clients: number | null
  has_branding: boolean
  is_active: boolean
  created_at: string
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

export interface BusinessSubscription {
  id: string
  business_id: string
  plan_id: string
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface BusinessSubscriptionWithPlan extends BusinessSubscription {
  plan: SubscriptionPlan
}

export type PaymentReportStatus = 'pending' | 'approved' | 'rejected'

export interface PaymentReport {
  id: string
  business_id: string
  plan_id: string
  amount_usd: number
  proof_url: string | null
  notes: string | null
  status: PaymentReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  created_at: string
}

export interface PaymentReportWithDetails extends PaymentReport {
  plan: SubscriptionPlan
  business: Pick<Business, 'id' | 'name' | 'slug'>
}

// Subscription insert types
export interface PaymentReportInsert {
  business_id: string
  plan_id: string
  amount_usd: number
  proof_url?: string | null
  notes?: string | null
}

// Subscription status response (for frontend)
export interface SubscriptionStatusResponse {
  status: SubscriptionStatus
  plan: SubscriptionPlan
  trial_ends_at: string | null
  current_period_end: string | null
  days_remaining: number | null
  usage: {
    barbers: { current: number; max: number | null }
    services: { current: number; max: number | null }
    clients: { current: number; max: number | null }
  }
  can_use_branding: boolean
}

// ============================================================================
// System Settings Types (Exchange Rate, etc.)
// ============================================================================

export interface SystemSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_by: string | null
  updated_at: string
  created_at: string
}

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

// Exchange rate response for frontend
export interface ExchangeRateResponse {
  usd_to_crc: number
  last_updated: string
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

// ============================================================================
// Notification Preferences Types
// ============================================================================

export type NotificationChannel = 'email' | 'app' | 'both'

export interface NotificationPreferences {
  id: string
  business_id: string
  channel: NotificationChannel
  email_address: string | null

  // Preferencias por tipo (business owner)
  email_trial_expiring: boolean
  email_subscription_expiring: boolean
  email_payment_status: boolean
  email_new_appointment: boolean
  email_appointment_reminder: boolean

  // Preferencias admin
  email_new_business: boolean
  email_payment_pending: boolean

  created_at: string
  updated_at: string
}

export interface NotificationPreferencesInsert {
  business_id: string
  channel?: NotificationChannel
  email_address?: string | null
  email_trial_expiring?: boolean
  email_subscription_expiring?: boolean
  email_payment_status?: boolean
  email_new_appointment?: boolean
  email_appointment_reminder?: boolean
  email_new_business?: boolean
  email_payment_pending?: boolean
}

export type Database = {
  graphql_public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          business_id: string
          client_id: string | null
          client_notes: string | null
          confirmation_sent_at: string | null
          created_at: string | null
          duration_minutes: number
          id: string
          internal_notes: string | null
          price: number
          reminder_sent_at: string | null
          scheduled_at: string
          service_id: string | null
          status: string | null
          updated_at: string | null
          barber_id: string | null
        }
        Insert: {
          business_id: string
          client_id?: string | null
          client_notes?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          duration_minutes: number
          id?: string
          internal_notes?: string | null
          price: number
          reminder_sent_at?: string | null
          scheduled_at: string
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          barber_id?: string | null
        }
        Update: {
          business_id?: string
          client_id?: string | null
          client_notes?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          internal_notes?: string | null
          price?: number
          reminder_sent_at?: string | null
          scheduled_at?: string
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          barber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
        ]
      }
      barbers: {
        Row: {
          bio: string | null
          business_id: string
          created_at: string | null
          display_order: number | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          business_id: string
          created_at?: string | null
          display_order?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          business_id?: string
          created_at?: string | null
          display_order?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barbers_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      barber_invitations: {
        Row: {
          business_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_invitations_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          advance_booking_days: number | null
          booking_buffer_minutes: number | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          operating_hours: Json | null
          owner_id: string
          phone: string | null
          slug: string
          timezone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          advance_booking_days?: number | null
          booking_buffer_minutes?: number | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          operating_hours?: Json | null
          owner_id: string
          phone?: string | null
          slug: string
          timezone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          advance_booking_days?: number | null
          booking_buffer_minutes?: number | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          operating_hours?: Json | null
          owner_id?: string
          phone?: string | null
          slug?: string
          timezone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          business_id: string
          created_at: string | null
          email: string | null
          id: string
          last_visit_at: string | null
          name: string
          notes: string | null
          phone: string
          total_spent: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name: string
          notes?: string | null
          phone: string
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clients_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
