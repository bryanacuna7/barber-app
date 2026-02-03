/**
 * CRITICAL SECURITY TESTS - Check-in Endpoint
 *
 * Tests IDOR vulnerabilities in appointment status updates
 *
 * Priority: P0 (BLOCKING)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PATCH } from '../route'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '@/test/test-utils'

// Mock the middleware to expose the inner handler for testing
vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual('@/lib/api/middleware')
  return {
    ...actual,
    // Pass through the handler directly for testing (bypasses auth/rate-limit)
    withAuthAndRateLimit: (handler: any) => handler,
  }
})

// Type helper for test calls - allows calling with auth context
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any }
) => Promise<Response>

describe('Security Tests - PATCH /api/appointments/[id]/check-in', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockRequest: NextRequest

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  describe('SEC-003: Status update IDOR protection', () => {
    it('should return 401 when barber tries to check-in appointment of different barber', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      // Request body includes barberId validation
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({ barberId: 'barber-a' }),
      })

      // Appointment belongs to barber-b, not barber-a
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'barber-b', // Different barber
            business_id: 'business-123',
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Esta cita no pertenece a este barbero')
    })

    it('should NOT update appointment when barber ownership validation fails', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({ barberId: 'barber-a' }),
      })

      const mockUpdate = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'barber-b', // Ownership mismatch
            business_id: 'business-123',
          },
          error: null,
        }),
        update: mockUpdate,
      })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Update should NOT be called due to early return on auth failure
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should allow update when barberId is not provided (owner/admin access)', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      // No barberId in body - owner/admin mode
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'any-barber',
            business_id: 'business-123',
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      mockSupabase.from().update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'apt-123', status: 'confirmed' },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Should succeed without barberId validation
      expect(response.status).toBe(200)
    })
  })

  describe('SEC-004: Cross-business appointment manipulation', () => {
    it('should return 404 when trying to update appointment from different business', async () => {
      const authenticatedBusiness = {
        id: 'business-a',
        name: 'Business A',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({ barberId: 'barber-a' }),
      })

      // Appointment belongs to business-b
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Filtered out by business_id
          error: { code: 'PGRST116' },
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Cita no encontrada')
    })

    it('should enforce business_id filter in both fetch and update queries', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      const mockEqFetch = vi.fn().mockReturnThis()
      const mockEqUpdate = vi.fn().mockReturnThis()

      // Mock fetch query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: mockEqFetch,
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'barber-123',
            business_id: 'business-123',
          },
          error: null,
        }),
      } as any)

      // Mock update query
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: mockEqUpdate,
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'apt-123', status: 'confirmed' },
            error: null,
          }),
        }),
      } as any)

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Verify business_id filter in fetch
      expect(mockEqFetch).toHaveBeenCalledWith('business_id', 'business-123')

      // Verify business_id filter in update
      expect(mockEqUpdate).toHaveBeenCalledWith('business_id', 'business-123')
    })

    it('should not leak appointment existence from other business', async () => {
      const authenticatedBusiness = {
        id: 'business-a',
        name: 'Business A',
      }

      const authenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockRequest = new NextRequest(
        'http://localhost:3000/api/appointments/apt-from-business-b/check-in',
        {
          method: 'PATCH',
        }
      )

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-from-business-b' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      const body = await response.json()

      // Generic error message, no leak
      expect(body.error).toBe('Cita no encontrada')
      expect(body.error).not.toContain('business')
      expect(body.error).not.toContain('barber')
    })
  })

  describe('SEC-007: State transition validation', () => {
    it('should reject check-in for non-pending appointments', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
      })

      // Appointment already completed
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'completed', // Invalid state for check-in
            barber_id: 'barber-123',
            business_id: 'business-123',
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Estado invalido')
      expect(body.message).toContain('Solo citas pendientes pueden hacer check-in')
    })

    it('should prevent status manipulation bypassing business logic', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
      })

      const mockUpdate = vi.fn()

      // Cancelled appointment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'cancelled',
            barber_id: 'barber-123',
            business_id: 'business-123',
          },
          error: null,
        }),
        update: mockUpdate,
      })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Update should not be called
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('SEC-008: Input validation', () => {
    it('should handle malformed barberId gracefully', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      // Malicious barberId
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: JSON.stringify({ barberId: "'; DROP TABLE appointments; --" }),
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'legitimate-barber-id',
            business_id: 'business-123',
          },
          error: null,
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Should return 401 due to barber mismatch (SQL injection safely handled as string comparison)
      expect(response.status).toBe(401)
    })

    it('should handle invalid JSON body', async () => {
      const authenticatedBusiness = {
        id: 'business-123',
        name: 'Test Business',
      }

      // Invalid JSON
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/check-in', {
        method: 'PATCH',
        body: 'invalid json{{{',
      })

      // Should continue without barberId validation (owner mode)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'barber-123',
            business_id: 'business-123',
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'apt-123', status: 'confirmed' },
            error: null,
          }),
        }),
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { business: authenticatedBusiness, supabase: mockSupabase as any } as any
      )

      // Should succeed (invalid JSON caught in try-catch, proceeds as owner)
      expect(response.status).toBe(200)
    })
  })
})
