/**
 * Test utilities and helpers for Mi Día feature tests
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'
import type {
  TodayAppointment,
  TodayAppointmentsResponse,
  AppointmentStatusUpdateResponse,
} from '@/types/custom'

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options })
}

/**
 * Test data factories for consistent test fixtures
 */

export function createMockClient(overrides?: Partial<TodayAppointment['client']>) {
  return {
    id: 'client-123',
    name: 'John Doe',
    phone: '+506 8888-8888',
    email: 'john@example.com',
    ...overrides,
  }
}

export function createMockService(overrides?: Partial<TodayAppointment['service']>) {
  return {
    id: 'service-123',
    name: 'Corte Regular',
    duration_minutes: 30,
    price: 15000,
    ...overrides,
  }
}

export function createMockAppointment(overrides?: Partial<TodayAppointment>): TodayAppointment {
  const baseTime = new Date()
  baseTime.setHours(10, 0, 0, 0)

  return {
    id: `apt-${Math.random().toString(36).substr(2, 9)}`,
    scheduled_at: baseTime.toISOString(),
    duration_minutes: 30,
    price: 15000,
    status: 'pending',
    client_notes: null,
    internal_notes: null,
    started_at: null,
    actual_duration_minutes: null,
    payment_method: null,
    client: createMockClient(),
    service: createMockService(),
    ...overrides,
  }
}

export function createMockAppointmentsResponse(
  overrides?: Partial<TodayAppointmentsResponse>
): TodayAppointmentsResponse {
  const appointments = [
    createMockAppointment({
      scheduled_at: new Date('2024-01-15T09:00:00Z').toISOString(),
      status: 'pending',
    }),
    createMockAppointment({
      scheduled_at: new Date('2024-01-15T10:30:00Z').toISOString(),
      status: 'confirmed',
    }),
    createMockAppointment({
      scheduled_at: new Date('2024-01-15T14:00:00Z').toISOString(),
      status: 'completed',
    }),
  ]

  return {
    appointments,
    barber: {
      id: 'barber-123',
      name: 'Carlos Miembro del equipo',
    },
    date: '2024-01-15',
    stats: {
      total: 3,
      pending: 1,
      confirmed: 1,
      completed: 1,
      cancelled: 0,
      no_show: 0,
    },
    ...overrides,
  }
}

export function createMockStatusUpdateResponse(
  overrides?: Partial<AppointmentStatusUpdateResponse>
): AppointmentStatusUpdateResponse {
  return {
    id: 'apt-123',
    status: 'confirmed',
    scheduled_at: new Date().toISOString(),
    duration_minutes: 30,
    price: 15000,
    client_notes: null,
    internal_notes: null,
    client: createMockClient(),
    service: createMockService(),
    ...overrides,
  }
}

/**
 * Mock fetch utility for API tests
 */
export function mockFetch(response: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  } as Response)
}

export function mockFetchError(error: Error) {
  global.fetch = vi.fn().mockRejectedValue(error)
}

/**
 * Wait for async updates
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Supabase mock client for API route tests
 */
export function createMockSupabaseClient() {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  return {
    from: vi.fn().mockReturnValue(mockQuery),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}

/**
 * Test authentication context
 */
export function createMockAuthContext(overrides?: {
  userId?: string
  businessId?: string
  barberId?: string
}) {
  return {
    userId: overrides?.userId || 'user-123',
    businessId: overrides?.businessId || 'business-123',
    barberId: overrides?.barberId || 'barber-123',
  }
}

/**
 * MSW request handlers for API mocking
 */
export const apiHandlers = {
  getTodayAppointments: (barberId: string, response: TodayAppointmentsResponse) => ({
    url: `/api/barbers/${barberId}/appointments/today`,
    method: 'GET',
    response,
  }),

  checkInAppointment: (appointmentId: string, response: AppointmentStatusUpdateResponse) => ({
    url: `/api/appointments/${appointmentId}/check-in`,
    method: 'PATCH',
    response,
  }),

  completeAppointment: (appointmentId: string, response: AppointmentStatusUpdateResponse) => ({
    url: `/api/appointments/${appointmentId}/complete`,
    method: 'PATCH',
    response,
  }),

  noShowAppointment: (appointmentId: string, response: AppointmentStatusUpdateResponse) => ({
    url: `/api/appointments/${appointmentId}/no-show`,
    method: 'PATCH',
    response,
  }),
}

/**
 * Assert helpers for common test scenarios
 */
export const assertHelpers = {
  isValidUUID: (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  },

  isValidISODate: (value: string) => {
    const date = new Date(value)
    return !isNaN(date.getTime()) && date.toISOString() === value
  },

  isValidAppointmentStatus: (status: string) => {
    return ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(status)
  },
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { vi, expect, describe, it, test, beforeEach, afterEach } from 'vitest'
