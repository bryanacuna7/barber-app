/**
 * CRITICAL SECURITY TESTS - Complete Endpoint
 *
 * Tests IDOR vulnerabilities and atomic operations for appointment completion
 *
 * Priority: P0 (BLOCKING)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PATCH } from '../route'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '@/test/test-utils'
import { canModifyBarberAppointments } from '@/lib/rbac'

// Mock the middleware to expose the inner handler for testing
vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual('@/lib/api/middleware')
  return {
    ...actual,
    // Pass through the handler directly for testing (bypasses auth/rate-limit)
    withAuthAndRateLimit: (handler: any) => handler,
  }
})

// Mock RBAC
vi.mock('@/lib/rbac', () => ({
  canModifyBarberAppointments: vi.fn().mockResolvedValue(true),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  logSecurity: vi.fn(),
}))

// Mock push sender
vi.mock('@/lib/push/sender', () => ({
  sendPushToBusinessOwner: vi.fn().mockResolvedValue(undefined),
  sendPushToUser: vi.fn().mockResolvedValue(undefined),
}))

// Mock notifications orchestrator
vi.mock('@/lib/notifications/orchestrator', () => ({
  notify: vi.fn().mockResolvedValue(undefined),
}))

// Mock service client
vi.mock('@/lib/supabase/service-client', () => ({
  createServiceClient: vi.fn().mockReturnValue({
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
  }),
}))

// Type helper for test calls - allows calling with auth context
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any; role?: string; barberId?: string }
) => Promise<Response>

describe('Security Tests - PATCH /api/appointments/[id]/complete', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockRequest: NextRequest

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    vi.mocked(canModifyBarberAppointments).mockResolvedValue(true)
  })

  describe('SEC-003: IDOR Protection in Complete Endpoint', () => {
    it('should return 401 when barber tries to complete appointment of different barber', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'owner-999',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-barber-a',
        email: 'barber-a@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      // Override RBAC mock: barber-a is NOT allowed to modify barber-b's appointment
      vi.mocked(canModifyBarberAppointments).mockResolvedValueOnce(false)

      // Appointment belongs to barber-b, not barber-a
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'confirmed',
            barber_id: 'barber-b',
            business_id: 'business-123',
            client_id: 'client-123',
            price: 50.0,
            barber: {
              id: 'barber-b',
              email: 'barber-b@test.com', // Different barber
            },
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No tienes permiso para completar esta cita')
    })

    it('should allow business owner to complete any appointment', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-owner',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-owner', // Owner ID matches business owner_id
        email: 'owner@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      // Setup successful completion
      const mockUpdate = vi.fn().mockReturnValue({
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
      })

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'apt-123',
              status: 'confirmed',
              barber_id: 'barber-b',
              business_id: 'business-123',
              client_id: 'client-123',
              price: 50.0,
              barber: {
                id: 'barber-b',
                email: 'barber-b@test.com',
              },
            },
            error: null,
          }),
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any)

      // Mock RPC call for client stats
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
    })
  })

  describe('SEC-004: Race Condition Protection - Atomic Client Stats', () => {
    it('should use atomic RPC call for client stats updates', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'barber@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      // Mock successful fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-456',
            price: 75.5,
            barber: {
              id: 'barber-123',
              email: 'barber@test.com',
            },
          },
          error: null,
        }),
      } as any)

      // Mock successful update
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
              price: 75.5,
              client_notes: null,
              internal_notes: null,
              client: { id: 'client-456', name: 'Test Client', phone: null, email: null },
              service: { id: 'service-123', name: 'Haircut', duration_minutes: 30, price: 75.5 },
            },
            error: null,
          }),
        }),
      } as any)

      // Mock RPC for atomic stats update
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Verify atomic RPC was called with correct parameters
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: 'client-456',
        p_visits_increment: 1,
        p_spent_increment: 75.5,
        p_last_visit_timestamp: expect.any(String),
      })
    })

    it('should NOT use fetch-then-update pattern for client stats (prevents race conditions)', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'barber@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      // Track all .from() calls
      const fromCalls: string[] = []
      mockSupabase.from = vi.fn((table: string) => {
        fromCalls.push(table)
        if (table === 'appointments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'apt-123',
                status: 'confirmed',
                barber_id: 'barber-123',
                business_id: 'business-123',
                client_id: 'client-456',
                price: 75.5,
                barber: {
                  id: 'barber-123',
                  email: 'barber@test.com',
                },
              },
              error: null,
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'apt-123',
                  status: 'completed',
                  scheduled_at: '2026-02-04T10:00:00Z',
                  duration_minutes: 30,
                  price: 75.5,
                  client_notes: null,
                  internal_notes: null,
                  client: { id: 'client-456', name: 'Test Client', phone: null, email: null },
                  service: {
                    id: 'service-123',
                    name: 'Haircut',
                    duration_minutes: 30,
                    price: 75.5,
                  },
                },
                error: null,
              }),
            }),
          } as any
        }
        return {} as any
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Verify clients table was NOT accessed directly (would indicate vulnerable fetch-then-update pattern)
      expect(fromCalls).not.toContain('clients')

      // Verify atomic RPC was used instead
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_client_stats', expect.any(Object))
    })

    it('should continue even if stats update fails (graceful degradation)', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'barber@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-456',
            price: 75.5,
            barber: {
              id: 'barber-123',
              email: 'barber@test.com',
            },
          },
          error: null,
        }),
      } as any)

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
              price: 75.5,
              client_notes: null,
              internal_notes: null,
              client: { id: 'client-456', name: 'Test Client', phone: null, email: null },
              service: { id: 'service-123', name: 'Haircut', duration_minutes: 30, price: 75.5 },
            },
            error: null,
          }),
        }),
      } as any)

      // RPC fails but appointment should still be marked complete
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Stats update failed', code: 'RPC_ERROR' },
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Should still return 200 even if stats update fails
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('completed')
    })
  })

  describe('SEC-007: State Transition Validation', () => {
    it('should reject completion of cancelled appointments', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'barber@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'cancelled', // Invalid state
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-456',
            price: 75.5,
            barber: {
              id: 'barber-123',
              email: 'barber@test.com',
            },
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Estado invalido')
    })

    it('should reject completion of already completed appointments', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        owner_id: 'user-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'barber@test.com',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'completed', // Already completed
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-456',
            price: 75.5,
            barber: {
              id: 'barber-123',
              email: 'barber@test.com',
            },
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Estado invalido')
    })
  })
})
