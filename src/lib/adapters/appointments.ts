/**
 * Appointments Data Adapter
 *
 * Transforms Supabase appointments data to UI-friendly format for Mi Día module.
 * Handles JOINs with clients, services, and barbers.
 *
 * Module: Mi Día (Dashboard Intelligence)
 * Demo: preview-b (Visual + Power Hybrid)
 */

import { format } from 'date-fns'
import { Database } from '@/types/supabase'

// Supabase types (from schema)
type SupabaseAppointment = Database['public']['Tables']['appointments']['Row']
type SupabaseClient = Database['public']['Tables']['clients']['Row']
type SupabaseService = Database['public']['Tables']['services']['Row']
type SupabaseBarber = Database['public']['Tables']['barbers']['Row']

// UI types (for demos/components)
export interface UIAppointment {
  id: string
  clientName: string
  clientPhone: string
  time: string // HH:mm format
  service: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  barberName: string
  barberId: string
  duration: number
  price: number
  scheduledAt: Date
  notes?: string
}

// Extended appointment with JOIN data
export interface AppointmentWithRelations extends SupabaseAppointment {
  clients?: SupabaseClient | null
  services?: SupabaseService | null
  barbers?: SupabaseBarber | null
}

/**
 * Adapt single appointment from Supabase to UI format
 */
export function adaptAppointment(row: AppointmentWithRelations): UIAppointment {
  return {
    id: row.id,
    clientName: row.clients?.name || 'Unknown Client',
    clientPhone: row.clients?.phone || '',
    time: format(new Date(row.scheduled_at), 'HH:mm'),
    service: row.services?.name || 'Unknown Service',
    status: row.status as UIAppointment['status'],
    barberName: row.barbers?.name || 'Unassigned',
    barberId: row.barber_id || '',
    duration: row.duration_minutes,
    price: Number(row.price),
    scheduledAt: new Date(row.scheduled_at),
    notes: row.client_notes || undefined,
  }
}

/**
 * Adapt multiple appointments
 */
export function adaptAppointments(rows: AppointmentWithRelations[]): UIAppointment[] {
  return rows.map(adaptAppointment)
}

/**
 * Supabase query for Mi Día page (today's appointments)
 *
 * @example
 * ```ts
 * const { data, error } = await supabase
 *   .from('appointments')
 *   .select(getMiDiaQuery())
 *   .eq('business_id', businessId)
 *   .gte('scheduled_at', startOfDay)
 *   .lte('scheduled_at', endOfDay)
 *   .order('scheduled_at', { ascending: true })
 * ```
 */
export function getMiDiaQuery() {
  return `
    *,
    clients (
      id,
      name,
      phone
    ),
    services (
      id,
      name,
      duration_minutes
    ),
    barbers (
      id,
      name
    )
  `
}

/**
 * Group appointments by time slot for Mi Día timeline view
 */
export function groupAppointmentsByHour(
  appointments: UIAppointment[]
): Record<string, UIAppointment[]> {
  return appointments.reduce(
    (acc, appt) => {
      const hour = appt.time.split(':')[0] + ':00'
      if (!acc[hour]) {
        acc[hour] = []
      }
      acc[hour].push(appt)
      return acc
    },
    {} as Record<string, UIAppointment[]>
  )
}

/**
 * Calculate statistics for Mi Día dashboard
 */
export function calculateDayStats(appointments: UIAppointment[]) {
  const total = appointments.length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length
  const pending = appointments.filter((a) => a.status === 'pending').length
  const completed = appointments.filter((a) => a.status === 'completed').length
  const revenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0)

  return {
    total,
    confirmed,
    pending,
    completed,
    revenue,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  }
}
