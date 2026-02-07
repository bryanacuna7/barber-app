/**
 * Settings Domain Types
 *
 * Business logic types for business configuration and team management.
 * Module: Configuración (Bento Grid Luxury)
 */

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DaySchedule {
  open: string // HH:mm
  close: string // HH:mm
  isClosed: boolean
}

export interface OperatingHours {
  [key: string]: DaySchedule // mon, tue, wed, etc.
}

export interface BookingConfiguration {
  bufferMinutes: number
  advanceBookingDays: number
}

export interface Branding {
  primaryColor: string
  logoUrl?: string
  faviconUrl?: string
}

export interface BusinessSettings {
  id: string
  name: string
  slug: string
  phone: string
  whatsapp: string
  address: string
  timezone: string
  operatingHours: OperatingHours
  bookingConfig: BookingConfiguration
  branding: Branding
  isActive: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'owner' | 'barber'
  isActive: boolean
  avatarUrl?: string
}

export interface SettingsValidationResult {
  valid: boolean
  errors: string[]
}

export type SettingsSectionId = 'general' | 'schedule' | 'branding' | 'team' | 'advanced'
