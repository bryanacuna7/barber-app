/**
 * RACE CONDITION TESTS - Client Stats Updates
 *
 * Tests that increment_client_stats() function prevents race conditions
 * when multiple appointments are completed concurrently for the same client
 *
 * Priority: P0 (BLOCKING) - CWE-915
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
    withAuthAndRateLimit: (handler: any) => handler,
  }
})

// Mock RBAC to focus on race condition testing
vi.mock('@/lib/rbac', () => ({
  canModifyBarberAppointments: vi.fn().mockResolvedValue(true),
}))

// Type helper for test calls
type TestHandler = (
  request: any,
  context: any,
  auth: { user: any; business: any; supabase: any }
) => Promise<Response>

describe('Race Condition Tests - Client Stats Updates', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockRequest: NextRequest

  const authenticatedBusiness = {
    id: 'business-123',
    owner_id: 'owner-123',
    name: 'Test Business',
  }

  const authenticatedUser = {
    id: 'barber-123',
    email: 'barber@test.com',
  }

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  describe('SEC-016: Atomic Client Stats Updates', () => {
    it('should call increment_client_stats RPC instead of manual update', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-123/complete', {
        method: 'PATCH',
      })

      // Mock appointment fetch
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-123',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-123',
            price: 50.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      // Mock RPC call
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-123' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)

      // Verify RPC was called with correct parameters
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: 'client-123',
        p_visits_increment: 1,
        p_spent_increment: 50.0,
        p_last_visit_timestamp: expect.any(String),
      })
    })

    it('should use atomic function instead of fetch-then-update pattern', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-456/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-456',
            status: 'pending',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-456',
            price: 75.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-456' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Verify NO manual fetch of client stats
      const fromCalls = mockSupabase.from.mock.calls
      const clientTableCalls = fromCalls.filter((call: any) => call[0] === 'clients')
      expect(clientTableCalls.length).toBe(0)

      // Verify RPC was used instead
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', expect.any(Object))
    })

    it('should handle RPC errors gracefully without failing appointment completion', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-789/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-789',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-789',
            price: 100.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      // Mock RPC error
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Client not found', code: 'P0001' },
      })
      mockSupabase.rpc = mockRpc

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-789' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      // Appointment should still be marked as completed
      expect(response.status).toBe(200)

      // Stats error should be logged but not fail the request
      expect(mockRpc).toHaveBeenCalled()
    })

    it('should pass correct price even when price is 0', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-free/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-free',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-free',
            price: 0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-free' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: 'client-free',
        p_visits_increment: 1,
        p_spent_increment: 0,
        p_last_visit_timestamp: expect.any(String),
      })
    })

    it('should skip stats update when client_id is null', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/appointments/apt-no-client/complete',
        {
          method: 'PATCH',
        }
      )

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-no-client',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: null,
            price: 50.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn()
      mockSupabase.rpc = mockRpc

      const response = await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-no-client' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(response.status).toBe(200)
      expect(mockRpc).not.toHaveBeenCalled()
    })
  })

  describe('SEC-017: Concurrent Appointment Completions (Simulated)', () => {
    it('should handle multiple concurrent completions for the same client', async () => {
      // This test simulates what happens when multiple appointments are completed
      // at the same time for the same client. The atomic function should handle this.

      const clientId = 'client-concurrent'
      const appointments = [
        { id: 'apt-1', price: 30.0 },
        { id: 'apt-2', price: 50.0 },
        { id: 'apt-3', price: 40.0 },
      ]

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })

      // Simulate concurrent completions
      const completionPromises = appointments.map(async (apt) => {
        const mockSupabaseInstance = createMockSupabaseClient()

        mockSupabaseInstance.from.mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: apt.id,
              status: 'confirmed',
              barber_id: 'barber-123',
              business_id: 'business-123',
              client_id: clientId,
              price: apt.price,
              barber: { id: 'barber-123', name: 'Test Barber' },
            },
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        })

        mockSupabaseInstance.rpc = mockRpc

        const request = new NextRequest(
          `http://localhost:3000/api/appointments/${apt.id}/complete`,
          { method: 'PATCH' }
        )

        return (PATCH as unknown as TestHandler)(
          request,
          { params: Promise.resolve({ id: apt.id }) },
          {
            user: authenticatedUser,
            business: authenticatedBusiness,
            supabase: mockSupabaseInstance as any,
          }
        )
      })

      // Execute all completions concurrently
      const responses = await Promise.all(completionPromises)

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })

      // RPC should have been called 3 times (once per appointment)
      expect(mockRpc).toHaveBeenCalledTimes(3)

      // Verify each call had correct parameters
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: clientId,
        p_visits_increment: 1,
        p_spent_increment: 30.0,
        p_last_visit_timestamp: expect.any(String),
      })
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: clientId,
        p_visits_increment: 1,
        p_spent_increment: 50.0,
        p_last_visit_timestamp: expect.any(String),
      })
      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: clientId,
        p_visits_increment: 1,
        p_spent_increment: 40.0,
        p_last_visit_timestamp: expect.any(String),
      })
    })
  })

  describe('SEC-018: Data Integrity Verification', () => {
    it('should increment total_visits by exactly 1 per completion', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-visit/complete', {
        method: 'PATCH',
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-visit',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-visit',
            price: 60.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-visit' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: 'client-visit',
        p_visits_increment: 1, // Always 1 per completion
        p_spent_increment: 60.0,
        p_last_visit_timestamp: expect.any(String),
      })
    })

    it('should increment total_spent by exact appointment price', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/appointments/apt-spent/complete', {
        method: 'PATCH',
      })

      const appointmentPrice = 123.45

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-spent',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-spent',
            price: appointmentPrice,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-spent' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      expect(mockRpc).toHaveBeenCalledWith('increment_client_stats', {
        p_client_id: 'client-spent',
        p_visits_increment: 1,
        p_spent_increment: appointmentPrice, // Exact price, not rounded
        p_last_visit_timestamp: expect.any(String),
      })
    })

    it('should update last_visit_at with current timestamp', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/appointments/apt-timestamp/complete',
        {
          method: 'PATCH',
        }
      )

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'apt-timestamp',
            status: 'confirmed',
            barber_id: 'barber-123',
            business_id: 'business-123',
            client_id: 'client-timestamp',
            price: 50.0,
            barber: { id: 'barber-123', name: 'Test Barber' },
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })

      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      mockSupabase.rpc = mockRpc

      const beforeCall = new Date().toISOString()

      await (PATCH as unknown as TestHandler)(
        mockRequest,
        { params: Promise.resolve({ id: 'apt-timestamp' }) },
        { user: authenticatedUser, business: authenticatedBusiness, supabase: mockSupabase as any }
      )

      const afterCall = new Date().toISOString()

      const rpcCall = mockRpc.mock.calls[0][1] as any
      const timestamp = rpcCall.p_last_visit_timestamp

      // Timestamp should be ISO string and between before/after call
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(timestamp >= beforeCall).toBe(true)
      expect(timestamp <= afterCall).toBe(true)
    })
  })
})
