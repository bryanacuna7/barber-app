/**
 * Calendar Data Adapter
 *
 * Transforms Supabase appointments data to calendar-friendly format for Citas module.
 * Handles time block visualization, gap analysis, and scheduling intelligence.
 *
 * Module: Citas (Calendar Cinema + macOS)
 * Demo: preview-b-fusion
 */

import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { Database } from '@/types/supabase'

type SupabaseAppointment = Database['public']['Tables']['appointments']['Row']

// UI types for calendar
export interface UICalendarEvent {
  id: string
  title: string // Client name + Service
  start: Date
  end: Date
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  clientName: string
  serviceName: string
  barberName: string
  barberId: string
  price: number
  color: string // Based on status
}

// Time block for Cinema view
export interface UITimeBlock {
  label: 'MAÑANA' | 'MEDIODÍA' | 'TARDE' | 'NOCHE'
  startHour: number
  endHour: number
  appointments: UICalendarEvent[]
  occupancy: number // % of slots filled
  revenue: number
}

// Gap opportunity (Cinema feature)
export interface UIGap {
  startTime: Date
  endTime: Date
  duration: number // minutes
  opportunity: 'short' | 'medium' | 'long' // < 30min, 30-60min, > 60min
}

/**
 * Adapt appointment to calendar event
 */
export function adaptToCalendarEvent(
  row: SupabaseAppointment,
  clientName: string,
  serviceName: string,
  barberName: string
): UICalendarEvent {
  const start = new Date(row.scheduled_at)
  const end = new Date(start.getTime() + row.duration_minutes * 60000)

  return {
    id: row.id,
    title: `${clientName} - ${serviceName}`,
    start,
    end,
    status: row.status as UICalendarEvent['status'],
    clientName,
    serviceName,
    barberName,
    barberId: row.barber_id || '',
    price: Number(row.price),
    color: getStatusColor(row.status),
  }
}

/**
 * Get color based on appointment status
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#FFA500', // orange
    confirmed: '#4CAF50', // green
    completed: '#2196F3', // blue
    cancelled: '#9E9E9E', // gray
    no_show: '#F44336', // red
  }
  return colors[status] || '#9E9E9E'
}

/**
 * Group appointments into time blocks (Cinema feature)
 */
export function groupIntoTimeBlocks(appointments: UICalendarEvent[]): UITimeBlock[] {
  const blocks: UITimeBlock[] = [
    { label: 'MAÑANA', startHour: 8, endHour: 12, appointments: [], occupancy: 0, revenue: 0 },
    { label: 'MEDIODÍA', startHour: 12, endHour: 15, appointments: [], occupancy: 0, revenue: 0 },
    { label: 'TARDE', startHour: 15, endHour: 18, appointments: [], occupancy: 0, revenue: 0 },
    { label: 'NOCHE', startHour: 18, endHour: 21, appointments: [], occupancy: 0, revenue: 0 },
  ]

  appointments.forEach((appt) => {
    const hour = appt.start.getHours()
    const block = blocks.find((b) => hour >= b.startHour && hour < b.endHour)
    if (block) {
      block.appointments.push(appt)
      block.revenue += appt.price
    }
  })

  // Calculate occupancy (simplified: # appointments / available slots)
  blocks.forEach((block) => {
    const hours = block.endHour - block.startHour
    const maxSlots = hours * 4 // Assuming 15-min slots
    block.occupancy = Math.min((block.appointments.length / maxSlots) * 100, 100)
  })

  return blocks
}

/**
 * Find scheduling gaps (Cinema feature)
 */
export function findGaps(
  appointments: UICalendarEvent[],
  businessStart: number = 8,
  businessEnd: number = 21
): UIGap[] {
  const gaps: UIGap[] = []
  const sorted = [...appointments].sort((a, b) => a.start.getTime() - b.start.getTime())

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    const gapStart = current.end
    const gapEnd = next.start
    const duration = (gapEnd.getTime() - gapStart.getTime()) / 60000

    if (duration >= 15) {
      gaps.push({
        startTime: gapStart,
        endTime: gapEnd,
        duration,
        opportunity: duration < 30 ? 'short' : duration < 60 ? 'medium' : 'long',
      })
    }
  }

  return gaps
}

/**
 * Supabase query for calendar view
 *
 * @example
 * ```ts
 * const { data, error } = await supabase
 *   .from('appointments')
 *   .select(getCalendarQuery())
 *   .eq('business_id', businessId)
 *   .gte('scheduled_at', startDate)
 *   .lte('scheduled_at', endDate)
 * ```
 */
export function getCalendarQuery() {
  return `
    *,
    clients (name),
    services (name),
    barbers (name)
  `
}

/**
 * Generate week view data (macOS Calendar feature)
 */
export function generateWeekView(date: Date): {
  week: Date[]
  label: string
} {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 })
  const week = eachDayOfInterval({ start, end })

  return {
    week,
    label: format(start, 'MMM d') + ' - ' + format(end, 'MMM d, yyyy'),
  }
}

/**
 * Calculate day statistics for revenue progress (Cinema feature)
 */
export function calculateDayStats(appointments: UICalendarEvent[]) {
  const totalRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0)

  const targetRevenue = 50000 // Example target
  const progress = Math.min((totalRevenue / targetRevenue) * 100, 100)

  return {
    totalRevenue,
    targetRevenue,
    progress,
    completedAppointments: appointments.filter((a) => a.status === 'completed').length,
    pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
  }
}

/**
 * Filter appointments by barber (for multi-barber calendar)
 */
export function filterByBarber(
  appointments: UICalendarEvent[],
  barberId: string
): UICalendarEvent[] {
  return appointments.filter((appt) => appt.barberId === barberId)
}
