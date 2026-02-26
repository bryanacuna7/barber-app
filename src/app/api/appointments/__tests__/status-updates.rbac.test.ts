/**
 * RBAC Security Tests - Appointment Status Update Endpoints
 *
 * Tests RBAC-based IDOR protection for:
 * - /api/appointments/[id]/complete
 * - /api/appointments/[id]/check-in
 * - /api/appointments/[id]/no-show
 *
 * Validates:
 * - canModifyBarberAppointments() is used for authorization
 * - Owner can modify any appointment
 * - Users with write_all_appointments can modify any appointment
 * - Users with write_own_appointments can only modify own appointments
 * - Security logging on unauthorized attempts
 *
 * Priority: P0 (BLOCKING) - IDOR Vulnerability #2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '@/test/test-utils'

// Import handlers
import { PATCH as COMPLETE_PATCH } from '../[id]/complete/route'
import { PATCH as CHECKIN_PATCH } from '../[id]/check-in/route'
import { PATCH as NOSHOW_PATCH } from '../[id]/no-show/route'

// Mock middleware to bypass auth/rate-limit for testing
vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual('@/lib/api/middleware')
  return {
    ...actual,
    withAuthAndRateLimit: (handler: any) => handler,
  }
})

// Mock RBAC module
vi.mock('@/lib/rbac', () => ({
  canModifyBarberAppointments: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
  logSecurity: vi.fn(),
}))

// Mock notification orchestrator (used by complete route - imports Resend at module load)
vi.mock('@/lib/notifications/orchestrator', () => ({
  notify: vi.fn().mockResolvedValue(undefined),
}))

// Mock push sender (used by complete and no-show routes)
vi.mock('@/lib/push/sender', () => ({
  sendPushToBusinessOwner: vi.fn().mockResolvedValue(undefined),
  sendPushToUser: vi.fn().mockResolvedValue(undefined),
}))

// Mock Supabase service client (used by complete route)
vi.mock('@/lib/supabase/service-client', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

// Import mocked functions for spy assertions
import { canModifyBarberAppointments } from '@/lib/rbac'
import { logSecurity } from '@/lib/logger'

// Type helper for test calls
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any }
) => Promise<Response>

describe('RBAC Security Tests - Appointment Status Updates', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    vi.clearAllMocks()
  })

  const setupMockAppointment = (status: string = 'confirmed') => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'apt-123',
          status,
          barber_id: 'barber-b',
          business_id: 'business-123',
          client_id: 'client-123',
          price: 50.0,
          barber: {
            id: 'barber-b',
            name: 'Barber B',
          },
        },
        error: null,
      }),
    } as any)
  }

  const setupMockUpdate = () => {
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'completed',
            scheduled_at: '2026-02-04T10:00:00Z',
            duration_minutes: 30,
            price: 50,
            client_notes: null,
            internal_notes: null,
            client: { id: 'client-123', name: 'Test Client', phone: null, email: null },
            service: { id: 'service-123', name: 'Haircut', duration_minutes: 30, price: 50 },
          },
          error: null,
        }),
      }),
    } as any)
  }

  describe('SEC-012: RBAC Protection - Complete Endpoint', () => {
    it('should allow owner to complete any appointment', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-owner', email: 'owner@test.com' }

      setupMockAppointment()
      setupMockUpdate()
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      // Mock RBAC to allow (owner)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      const response = await (COMPLETE_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(canModifyBarberAppointments).toHaveBeenCalledWith(
        mockSupabase,
        'user-owner',
        'barber-b',
        'business-123',
        'user-owner'
      )
    })

    it('should allow user with write_all_appointments permission', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-admin', email: 'admin@test.com' }

      setupMockAppointment()
      setupMockUpdate()
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      // Mock RBAC to allow (write_all_appointments permission)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      const response = await (COMPLETE_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(canModifyBarberAppointments).toHaveBeenCalled()
    })

    it('should block staff without permission from completing other barber appointments', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-barber-a', email: 'barber-a@test.com' }

      setupMockAppointment()

      // Mock RBAC to deny (different barber, no write_all permission)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      const response = await (COMPLETE_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No tienes permiso para completar esta cita')

      // Verify security logging
      expect(logSecurity).toHaveBeenCalledWith('unauthorized', 'high', {
        userId: 'user-barber-a',
        userEmail: 'barber-a@test.com',
        requestedBarberId: 'barber-b',
        barberName: 'Barber B',
        appointmentId: 'apt-123',
        businessId: 'business-123',
        endpoint: '/api/appointments/[id]/complete',
        action: 'complete_appointment',
      })
    })
  })

  describe('SEC-013: RBAC Protection - Check-In Endpoint', () => {
    it('should allow owner to check-in any appointment', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-owner', email: 'owner@test.com' }

      setupMockAppointment('pending')
      setupMockUpdate()

      // Mock RBAC to allow (owner)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
      })

      const response = await (CHECKIN_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(canModifyBarberAppointments).toHaveBeenCalled()
    })

    it('should block staff without permission from checking-in other barber appointments', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-barber-a', email: 'barber-a@test.com' }

      setupMockAppointment('pending')

      // Mock RBAC to deny
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
      })

      const response = await (CHECKIN_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No tienes permiso para hacer check-in de esta cita')

      // Verify security logging
      expect(logSecurity).toHaveBeenCalledWith('unauthorized', 'high', {
        userId: 'user-barber-a',
        userEmail: 'barber-a@test.com',
        requestedBarberId: 'barber-b',
        barberName: 'Barber B',
        appointmentId: 'apt-123',
        businessId: 'business-123',
        endpoint: '/api/appointments/[id]/check-in',
        action: 'check_in_appointment',
      })
    })
  })

  describe('SEC-014: RBAC Protection - No-Show Endpoint', () => {
    it('should allow owner to mark any appointment as no-show', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-owner', email: 'owner@test.com' }

      setupMockAppointment('confirmed')
      setupMockUpdate()

      // Mock RBAC to allow (owner)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/no-show', {
        method: 'PATCH',
      })

      const response = await (NOSHOW_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(canModifyBarberAppointments).toHaveBeenCalled()
    })

    it('should allow recepcionista with write_all_appointments to mark no-show', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-recep', email: 'recep@test.com' }

      setupMockAppointment('confirmed')
      setupMockUpdate()

      // Mock RBAC to allow (write_all_appointments permission)
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/no-show', {
        method: 'PATCH',
      })

      const response = await (NOSHOW_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(canModifyBarberAppointments).toHaveBeenCalled()
    })

    it('should block staff without permission from marking other barber appointments as no-show', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-barber-a', email: 'barber-a@test.com' }

      setupMockAppointment('confirmed')

      // Mock RBAC to deny
      vi.mocked(canModifyBarberAppointments).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/appointments/apt-123/no-show', {
        method: 'PATCH',
      })

      const response = await (NOSHOW_PATCH as unknown as TestHandler)(
        request,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user, business, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No tienes permiso para marcar esta cita como no-show')

      // Verify security logging
      expect(logSecurity).toHaveBeenCalledWith('unauthorized', 'high', {
        userId: 'user-barber-a',
        userEmail: 'barber-a@test.com',
        requestedBarberId: 'barber-b',
        barberName: 'Barber B',
        appointmentId: 'apt-123',
        businessId: 'business-123',
        endpoint: '/api/appointments/[id]/no-show',
        action: 'mark_no_show',
      })
    })
  })

  describe('SEC-015: RBAC Function Integration', () => {
    it('should call canModifyBarberAppointments with correct parameters for all endpoints', async () => {
      const business = { id: 'business-123', owner_id: 'user-owner', name: 'Test Business' }
      const user = { id: 'user-staff', email: 'staff@test.com' }

      const endpoints = [
        { handler: COMPLETE_PATCH, path: 'complete' },
        { handler: CHECKIN_PATCH, path: 'check-in' },
        { handler: NOSHOW_PATCH, path: 'no-show' },
      ]

      for (const endpoint of endpoints) {
        vi.clearAllMocks()

        setupMockAppointment()
        vi.mocked(canModifyBarberAppointments).mockResolvedValue(false)

        const request = new NextRequest(
          `http://localhost:3000/api/appointments/apt-123/${endpoint.path}`,
          {
            method: 'PATCH',
          }
        )

        await (endpoint.handler as unknown as TestHandler)(
          request,
          { params: Promise.resolve({ id: 'apt-123' }) },
          { user, business, supabase: mockSupabase as any }
        )

        // Verify RBAC function was called with exact parameters
        expect(canModifyBarberAppointments).toHaveBeenCalledWith(
          mockSupabase,
          'user-staff', // userId
          'barber-b', // barberId from appointment
          'business-123', // businessId
          'user-owner' // businessOwnerId
        )
      }
    })
  })
})
