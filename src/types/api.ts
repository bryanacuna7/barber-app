export interface TimeSlot {
  time: string
  datetime: string
  available: boolean
}

export interface BookingRequest {
  service_id: string
  barber_id: string // Required for multi-barber
  scheduled_at: string
  client_name: string
  client_phone: string
  client_email?: string
  notes?: string
}

export interface BookingResponse {
  success: boolean
  appointment_id?: string
  message?: string
}

export interface DashboardStats {
  today: {
    appointments: number
    revenue: number
  }
  week: {
    appointments: number
    revenue: number
  }
  month: {
    appointments: number
    revenue: number
    no_show_rate: number
    average_ticket: number
    retention_rate: number
  }
}

export interface SlotDiscount {
  type: 'percent' | 'fixed'
  value: number
  label: string
  ruleId: string
}

export interface EnrichedTimeSlot extends TimeSlot {
  discount: SlotDiscount | null
}

export interface BookingPricing {
  original_price: number
  final_price: number
  discount_applied: boolean
  discount_label?: string
  discount_amount?: number
  reason: string
}

export interface ApiError {
  error: string
  message: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
