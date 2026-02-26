/**
 * Services Domain Types
 *
 * Business logic types for service catalog management.
 * Module: Servicios (Simplified Hybrid + Sidebar)
 */

export interface Service {
  id: string
  name: string
  description: string
  category: string
  duration: number // minutes
  price: number
  displayOrder: number
  isActive: boolean
  icon?: string // Lucide icon name
  // Business metrics
  bookings?: number
  revenue?: number
  avgRating?: number
  popularityRank?: number
}

export interface ServiceMetrics {
  serviceId: string
  bookings: number
  revenue: number
  popularityRank: number
}

export interface ServiceStatistics {
  totalServices: number
  activeServices: number
  totalRevenue: number
  avgBookings: number
}

export type ServiceSortField =
  | 'name'
  | 'price'
  | 'duration'
  | 'bookings'
  | 'revenue'
  | 'popularityRank'

export type SortDirection = 'asc' | 'desc'
