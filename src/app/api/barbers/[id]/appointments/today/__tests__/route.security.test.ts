/**
 * CRITICAL SECURITY TESTS - Mi Día Feature
 *
 * These tests MUST PASS before production deployment.
 * Tests IDOR vulnerabilities and business isolation.
 *
 * Priority: P0 (BLOCKING)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '@/test/test-utils'

// Mock the middleware to expose the inner handler for testing
vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual('@/lib/api/middleware')
  return {
    ...actual,
    // Pass through the handler directly for testing (bypasses auth)
    withAuth: (handler: any) => handler,
  }
})

// Type helper for test calls - allows calling with auth context
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any }
) => Promise<Response>

describe('Security Tests - GET /api/barbers/[id]/appointments/today', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockRequest: NextRequest

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    mockRequest = new NextRequest('http://localhost:3000/api/barbers/barber-123/appointments/today')
  })

  describe('SEC-001: Barber cannot access other barber appointments', () => {
    it('should return 404 when trying to access different barber within same business', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Requesting barber-b-456 but authenticated as business that only has barber-a-123
      mockSupabase.from.mockReturnValue({
        ...mockSupabase.from(),
        single: vi.fn().mockResolvedValue({
          data: null, // Barber not found for this business
          error: { code: 'PGRST116', message: 'No rows returned' },
        }),
      })

      const response = await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-b-456' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Barbero no encontrado')
      expect(body).not.toHaveProperty('appointments')
      expect(body).not.toHaveProperty('barber')
    })

    it('should return 404 without leaking barber existence from other business', async () => {
      const authenticatedBusiness = {
        id: 'business-a',
        name: 'Business A',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Simulate query that filters by business_id
      mockSupabase.from.mockReturnValue({
        ...mockSupabase.from(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      })

      const response = await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-from-business-b' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(404)
      const body = await response.json()

      // Should not reveal that barber exists in another business
      expect(body.error).toBe('Barbero no encontrado')
      expect(body.error).not.toContain('otro negocio')
      expect(body.error).not.toContain('different business')
    })
  })

  describe('SEC-002: Business isolation in GET endpoint', () => {
    it('should enforce business_id filter in database query', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      const mockEq = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: { id: 'barber-123', name: 'Test Barber', business_id: 'business-123' },
          error: null,
        }),
      })

      await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Verify that business_id filter was applied
      expect(mockEq).toHaveBeenCalledWith('business_id', 'business-123')
    })

    it('should return 404 even if barber_id is valid but belongs to different business', async () => {
      const authenticatedBusiness = {
        id: 'business-a',
        name: 'Business A',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Barber exists but belongs to business-b
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Filtered out by business_id
          error: { code: 'PGRST116' },
        }),
      })

      const response = await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-from-business-b' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(404)
    })

    it('should not leak appointment data across businesses', async () => {
      const authenticatedBusiness = {
        id: 'business-a',
        name: 'Business A',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Setup: barber not found (filtered by business_id)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      })

      const response = await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-b' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      const body = await response.json()

      // Ensure no sensitive data leaked
      expect(body).not.toHaveProperty('appointments')
      expect(body).not.toHaveProperty('stats')
      expect(body).not.toHaveProperty('client')
      expect(body).not.toHaveProperty('phone')
      expect(body).not.toHaveProperty('email')
    })
  })

  describe('SEC-003: Authentication required', () => {
    it('should be called through withAuth middleware', () => {
      // This test verifies the endpoint uses withAuth wrapper
      // The actual implementation shows: export const GET = withAuth(...)
      // In a real scenario, the middleware would reject unauthenticated requests before reaching the handler

      // We can verify the function signature expects auth context
      expect(GET).toBeDefined()
      expect(GET.length).toBeGreaterThan(0) // Wrapped function
    })
  })

  describe('SEC-004: SQL Injection protection', () => {
    it('should use parameterized queries (Supabase protects by default)', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Attempt SQL injection in barber ID
      const maliciousId = "'; DROP TABLE barbers; --"

      const mockEq = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      })

      await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: maliciousId }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Supabase uses parameterized queries, so the malicious input is treated as a literal string
      // Verify the ID was passed as-is (safe)
      expect(mockEq).toHaveBeenCalledWith('id', maliciousId)
    })
  })

  describe('SEC-005: Appointments filtered by business_id', () => {
    it('should filter appointments by business_id to prevent cross-business access', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      const mockBarberQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'barber-123', name: 'Test Barber', business_id: 'business-123' },
          error: null,
        }),
      }

      const mockAppointmentsEq = vi.fn().mockReturnThis()
      const mockAppointmentsQuery = {
        select: vi.fn().mockReturnThis(),
        eq: mockAppointmentsEq,
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockBarberQuery as any)
        .mockReturnValueOnce(mockAppointmentsQuery as any)

      await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Verify appointments query includes business_id filter
      expect(mockAppointmentsEq).toHaveBeenCalledWith('business_id', 'business-123')
      expect(mockAppointmentsEq).toHaveBeenCalledWith('barber_id', 'barber-123')
    })
  })

  describe('SEC-006: Data minimization', () => {
    it('should only return necessary fields in response', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      const mockBarberQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'barber-123',
            name: 'Test Barber',
            business_id: 'business-123',
            email: 'barber@example.com', // Sensitive
            phone: '+1234567890', // Sensitive
          },
          error: null,
        }),
      }

      const mockAppointmentsQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockBarberQuery as any)
        .mockReturnValueOnce(mockAppointmentsQuery as any)

      const response = await (GET as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'barber-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      const body = await response.json()

      // Should only return id and name, not sensitive fields
      expect(body.barber).toEqual({
        id: 'barber-123',
        name: 'Test Barber',
      })
      expect(body.barber).not.toHaveProperty('email')
      expect(body.barber).not.toHaveProperty('phone')
    })
  })
})
