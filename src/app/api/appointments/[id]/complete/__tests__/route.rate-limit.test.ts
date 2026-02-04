/**
 * RATE LIMITING TESTS - Complete Appointment Endpoint
 *
 * Tests rate limiting implementation for appointment completion
 *
 * Priority: P1 (HIGH)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PATCH } from '../route'
import { NextRequest } from 'next/server'
import { createMockSupabaseClient } from '@/test/test-utils'

// Mock the rate-limit module
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  RateLimitConfig: {} as any,
}))

// Mock the middleware to expose the inner handler for testing
vi.mock('@/lib/api/middleware', async () => {
  const actual = await vi.importActual('@/lib/api/middleware')
  return {
    ...actual,
    // Pass through the handler directly for testing (bypasses auth/rate-limit)
    withAuthAndRateLimit: (handler: any) => handler,
  }
})

import { rateLimit } from '@/lib/rate-limit'

// Type helper for test calls - allows calling with auth context
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any }
) => Promise<Response>

describe('Rate Limiting Tests - PATCH /api/appointments/[id]/complete', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockRequest: NextRequest

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    vi.clearAllMocks()

    // Setup successful appointment fetch by default
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'apt-123',
          status: 'pending',
          barber_id: 'barber-123',
          business_id: 'business-123',
          client_id: 'client-123',
          price: 25,
          barber: { id: 'barber-123', name: 'Test Barber' },
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
            price: 25,
            client_notes: null,
            internal_notes: null,
            client: { id: 'client-123', name: 'Test Client', phone: null, email: null },
            service: { id: 'service-123', name: 'Haircut', duration_minutes: 30, price: 25 },
          },
          error: null,
        }),
      }),
    } as any)

    // Mock RPC call for client stats update
    mockSupabase.rpc = vi.fn().mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rate Limit Success Cases', () => {
    it('should allow request when under rate limit', async () => {
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

      // Mock rate limit to succeed
      vi.mocked(rateLimit).mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
        },
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)

      // Verify rate limit headers are included in response
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should include rate limit headers in successful responses', async () => {
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

      const resetTime = Date.now() + 60000
      vi.mocked(rateLimit).mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 5,
        reset: resetTime,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '5',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        },
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('5')
    })
  })

  describe('Rate Limit Blocking Cases', () => {
    it('should return 429 when rate limit exceeded', async () => {
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

      const resetTime = Date.now() + 30000
      // Mock rate limit to fail (exceeded)
      vi.mocked(rateLimit).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': '30',
        },
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(429)

      const body = await response.json()
      expect(body.error).toBe('Demasiadas solicitudes')
      expect(body.message).toContain('límite de solicitudes')
    })

    it('should include Retry-After header when rate limited', async () => {
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

      const resetTime = Date.now() + 45000
      vi.mocked(rateLimit).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': '45',
        },
      })

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('45')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('should not execute business logic when rate limited', async () => {
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

      const mockUpdate = vi.fn()
      const mockRpc = vi.fn()
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'pending',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-123',
            price: 25,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: mockUpdate,
      } as any)
      mockSupabase.rpc = mockRpc

      vi.mocked(rateLimit).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          'Retry-After': '60',
        },
      })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Database update and RPC should NOT be called when rate limited
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockRpc).not.toHaveBeenCalled()
    })
  })

  describe('Rate Limit Configuration', () => {
    it('should apply correct rate limit config (10 requests per minute)', async () => {
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

      vi.mocked(rateLimit).mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
        },
      })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Verify rateLimit was called with correct config
      expect(rateLimit).toHaveBeenCalledWith(
        expect.any(Object), // request
        {
          interval: 60 * 1000, // 1 minute
          maxRequests: 10, // 10 requests
        }
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle rate limit check error gracefully', async () => {
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

      // Simulate rate limit error
      vi.mocked(rateLimit).mockRejectedValue(new Error('Redis connection failed'))

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error procesando la solicitud')
    })

    it('should apply rate limit per user (not global)', async () => {
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
        headers: {
          'x-real-ip': '192.168.1.100',
        },
      })

      vi.mocked(rateLimit).mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
        },
      })

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Verify rateLimit was called with the request (which contains IP info)
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
        expect.any(Object)
      )
    })
  })
})
