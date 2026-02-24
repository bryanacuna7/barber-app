/**
 * Domain Types - Central Export
 *
 * Business logic types for all 7 UI/UX redesign modules.
 * These types represent the domain model, not database structure.
 *
 * Created: Session 110 (Pre-Implementation Requirements)
 */

// Appointments domain (Mi Día)
export * from './appointments'

// Services domain (Servicios)
export * from './services'

// Clients domain (Clientes)
export * from './clients'

// Barbers domain (Equipo)
export * from './barbers'

// Analytics domain (Reportes)
export * from './analytics'

// Calendar domain (Citas) — explicit exports to avoid DayStatistics collision
export type {
  CalendarView,
  TimeBlockLabel,
  GapOpportunity,
  CalendarEvent,
  TimeBlock,
  SchedulingGap,
  DaySchedule,
  WeekView,
} from './calendar'

// Settings domain (Configuración)
export * from './settings'

/**
 * Common types used across multiple domains
 */

export type SortDirection = 'asc' | 'desc'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}
