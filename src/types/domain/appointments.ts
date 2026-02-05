/**
 * Appointments Domain Types
 *
 * Business logic types for appointment management.
 * Module: Mi Día (Dashboard Intelligence)
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  time: string // HH:mm format
  service: string
  status: AppointmentStatus
  barberName: string
  barberId: string
  duration: number // minutes
  price: number
  scheduledAt: Date
  notes?: string
}

export interface DayStatistics {
  total: number
  confirmed: number
  pending: number
  completed: number
  revenue: number
  completionRate: number // 0-100
}

export interface TimeSlot {
  hour: string // "09:00", "10:00", etc.
  appointments: Appointment[]
}
