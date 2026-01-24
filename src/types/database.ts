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
          created_at: string | null
          id: string
          is_active: boolean | null
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
          created_at?: string | null
          id?: string
          is_active?: boolean | null
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
          created_at?: string | null
          id?: string
          is_active?: boolean | null
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
