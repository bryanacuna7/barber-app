/**
 * Settings Data Adapter
 *
 * Transforms Supabase business/barber data to UI-friendly format for Configuración module.
 * Handles business settings, branding, schedules, and team management.
 *
 * Module: Configuración (Bento Grid Luxury)
 * Demo: demo-a
 */

// Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseBusiness = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseBarber = any

// UI types for settings
export interface UIBusinessSettings {
  id: string
  name: string
  slug: string
  phone: string
  whatsapp: string
  address: string
  timezone: string

  // Operating hours
  operatingHours: {
    [key: string]: {
      // 'mon', 'tue', etc.
      open: string // HH:mm
      close: string // HH:mm
      isClosed: boolean
    }
  }

  // Booking configuration
  bookingConfig: {
    bufferMinutes: number
    advanceBookingDays: number
  }

  // Branding
  branding: {
    primaryColor: string
    logoUrl?: string
    faviconUrl?: string
  }

  // Status
  isActive: boolean
}

// Team member for settings
export interface UITeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'owner' | 'barber'
  isActive: boolean
  avatarUrl?: string
}

/**
 * Adapt business from Supabase to UI format
 */
export function adaptBusinessSettings(row: SupabaseBusiness): UIBusinessSettings {
  // Parse operating_hours from JSONB
  const operatingHours = parseOperatingHours(row.operating_hours as any)

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    address: row.address || '',
    timezone: row.timezone || 'America/Costa_Rica',
    operatingHours,
    bookingConfig: {
      bufferMinutes: row.booking_buffer_minutes || 0,
      advanceBookingDays: row.advance_booking_days || 30,
    },
    branding: {
      primaryColor: row.brand_primary_color || '#27272A',
      logoUrl: row.brand_logo_url || row.logo_url || undefined,
      faviconUrl: row.brand_favicon_url || undefined,
    },
    isActive: row.is_active,
  }
}

/**
 * Parse operating hours from JSONB to typed format
 */
function parseOperatingHours(hours: any): UIBusinessSettings['operatingHours'] {
  const defaultHours = {
    open: '09:00',
    close: '18:00',
    isClosed: false,
  }

  // Handle different JSONB formats
  if (!hours || typeof hours !== 'object') {
    return {
      mon: defaultHours,
      tue: defaultHours,
      wed: defaultHours,
      thu: defaultHours,
      fri: defaultHours,
      sat: defaultHours,
      sun: { ...defaultHours, isClosed: true },
    }
  }

  // If JSONB has structure like { monday: {start: "09:00", end: "18:00"} }
  const dayMap: Record<string, string> = {
    monday: 'mon',
    tuesday: 'tue',
    wednesday: 'wed',
    thursday: 'thu',
    friday: 'fri',
    saturday: 'sat',
    sunday: 'sun',
  }

  const result: UIBusinessSettings['operatingHours'] = {}

  Object.entries(dayMap).forEach(([fullDay, shortDay]) => {
    const dayData = hours[fullDay] || hours[shortDay]
    if (dayData) {
      result[shortDay] = {
        open: dayData.start || dayData.open || '09:00',
        close: dayData.end || dayData.close || '18:00',
        isClosed: dayData.closed || dayData.isClosed || false,
      }
    } else {
      result[shortDay] = shortDay === 'sun' ? { ...defaultHours, isClosed: true } : defaultHours
    }
  })

  return result
}

/**
 * Adapt barber to team member format
 */
export function adaptTeamMember(row: SupabaseBarber): UITeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role as 'owner' | 'barber',
    isActive: row.is_active,
    avatarUrl: row.avatar_url || undefined,
  }
}

/**
 * Adapt multiple team members
 */
export function adaptTeamMembers(rows: SupabaseBarber[]): UITeamMember[] {
  return rows.map(adaptTeamMember)
}

/**
 * Supabase query for business settings (only columns used by adapter)
 */
export function getBusinessSettingsQuery() {
  return 'id, name, slug, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, logo_url, is_active'
}

/**
 * Supabase query for team members (only columns used by adapter)
 */
export function getTeamMembersQuery() {
  return 'id, name, email, phone, role, is_active, avatar_url, user_id'
}

/**
 * Format operating hours for display
 */
export function formatOperatingHours(hours: UIBusinessSettings['operatingHours']): string {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return days
    .map((day, i) => {
      const schedule = hours[day]
      if (schedule.isClosed) return `${dayNames[i]}: Closed`
      return `${dayNames[i]}: ${schedule.open} - ${schedule.close}`
    })
    .join('\n')
}

/**
 * Validate business settings before save
 */
export function validateBusinessSettings(settings: Partial<UIBusinessSettings>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (settings.name && settings.name.length < 2) {
    errors.push('Business name must be at least 2 characters')
  }

  if (settings.slug && !/^[a-z0-9-]+$/.test(settings.slug)) {
    errors.push('Slug must only contain lowercase letters, numbers, and hyphens')
  }

  if (settings.phone && !/^\+?[\d\s-()]+$/.test(settings.phone)) {
    errors.push('Invalid phone number format')
  }

  if (settings.bookingConfig) {
    if (settings.bookingConfig.bufferMinutes < 0) {
      errors.push('Buffer minutes cannot be negative')
    }
    if (settings.bookingConfig.advanceBookingDays < 1) {
      errors.push('Advance booking days must be at least 1')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
