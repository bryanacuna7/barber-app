/**
 * Calendar Domain Types
 *
 * Business logic types for calendar and scheduling management.
 * Module: Citas (Calendar Cinema + macOS)
 */

import { AppointmentStatus } from './appointments'

export type CalendarView = 'day' | 'week' | 'month'
export type TimeBlockLabel = 'MAÑANA' | 'MEDIODÍA' | 'TARDE' | 'NOCHE'
export type GapOpportunity = 'short' | 'medium' | 'long'

export interface CalendarEvent {
  id: string
  title: string // Client name + Service
  start: Date
  end: Date
  status: AppointmentStatus
  clientName: string
  serviceName: string
  barberName: string
  barberId: string
  price: number
  color: string // Based on status
}

export interface TimeBlock {
  label: TimeBlockLabel
  startHour: number
  endHour: number
  appointments: CalendarEvent[]
  occupancy: number // % of slots filled
  revenue: number
}

export interface SchedulingGap {
  startTime: Date
  endTime: Date
  duration: number // minutes
  opportunity: GapOpportunity // < 30min, 30-60min, > 60min
}

export interface DaySchedule {
  date: Date
  appointments: CalendarEvent[]
  timeBlocks: TimeBlock[]
  gaps: SchedulingGap[]
  statistics: DayStatistics
}

export interface DayStatistics {
  totalRevenue: number
  targetRevenue: number
  progress: number // 0-100
  completedAppointments: number
  pendingAppointments: number
}

export interface WeekView {
  week: Date[]
  label: string // "Feb 3 - Feb 9, 2026"
}
