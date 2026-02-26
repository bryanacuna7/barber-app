import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { rateLimit, type RateLimitConfig } from '@/lib/rate-limit'

// Types
export type AuthContext = {
  user: {
    id: string
    email?: string
  }
  business: {
    id: string
    owner_id: string
    name?: string
    timezone?: string | null
    operating_hours?: unknown
    smart_duration_enabled?: boolean | null
  }
  /** 'owner' if user owns the business, 'barber' if linked via barbers table */
  role: 'owner' | 'barber'
  /** barber row ID (only set when role === 'barber') */
  barberId?: string
  supabase: Awaited<ReturnType<typeof createClient>>
}

// --- Business Lookup LRU Cache ---
const CACHE_TTL_MS = 20_000 // 20 seconds
const CACHE_MAX_ENTRIES = 100

type CachedBusinessLookup = {
  business: AuthContext['business']
  role: 'owner' | 'barber'
  barberId?: string
  timestamp: number
  lastAccess: number
}

const businessCache = new Map<string, CachedBusinessLookup>()

function getCachedBusiness(userId: string): CachedBusinessLookup | null {
  const entry = businessCache.get(userId)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL_MS) {
    businessCache.delete(userId)
    return null
  }

  entry.lastAccess = now
  return entry
}

function setCachedBusiness(
  userId: string,
  data: Omit<CachedBusinessLookup, 'timestamp' | 'lastAccess'>
) {
  // LRU eviction: remove oldest entry if at capacity
  if (businessCache.size >= CACHE_MAX_ENTRIES) {
    let oldestKey: string | null = null
    let oldestAccess = Infinity
    for (const [key, entry] of businessCache) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess
        oldestKey = key
      }
    }
    if (oldestKey) businessCache.delete(oldestKey)
  }

  const now = Date.now()
  businessCache.set(userId, { ...data, timestamp: now, lastAccess: now })
}

// Extended business select — includes fields commonly needed by analytics routes
const BUSINESS_SELECT = 'id, owner_id, name, timezone, operating_hours, smart_duration_enabled'

export type AuthHandler<T = any> = (
  request: Request,
  context: T,
  auth: AuthContext
) => Promise<Response> | Response

// Error responses
export function unauthorizedResponse(message = 'No autorizado') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function notFoundResponse(message = 'No encontrado') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function errorResponse(message = 'Error interno del servidor', status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function rateLimitResponse(headers: Record<string, string>) {
  return NextResponse.json(
    {
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Por favor, inténtalo más tarde.',
    },
    {
      status: 429,
      headers,
    }
  )
}

/**
 * Middleware that authenticates user and fetches their business
 * Reduces ~30 lines of boilerplate per route
 *
 * Usage:
 * ```typescript
 * export const GET = withAuth(async (request, context, { user, business, supabase }) => {
 *   // Your logic here - user and business are guaranteed
 *   const data = await supabase.from('table').select()
 *   return NextResponse.json(data)
 * })
 * ```
 */
export function withAuth<T = any>(handler: AuthHandler<T>) {
  return async (request: Request, context: T) => {
    try {
      const supabase = await createClient()

      // Authenticate user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('❌ Auth error:', authError?.message)
        return unauthorizedResponse('No autenticado')
      }

      // Fetch business — check cache first, then DB
      let business: AuthContext['business'] | null = null
      let role: 'owner' | 'barber' = 'owner'
      let barberId: string | undefined

      // Check LRU cache (20s TTL)
      const cached = getCachedBusiness(user.id)
      if (cached) {
        business = cached.business
        role = cached.role
        barberId = cached.barberId
      } else {
        // 1. Try as business owner (fast path)
        const { data: ownerBusiness } = (await supabase
          .from('businesses')
          .select(BUSINESS_SELECT)
          .eq('owner_id', user.id)
          .single()) as any

        if (ownerBusiness) {
          business = ownerBusiness
          role = 'owner'
        } else {
          // 2. Try as barber — look up business via barbers table
          const { data: barber } = await supabase
            .from('barbers')
            .select('id, business_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

          if (barber) {
            const { data: barberBusiness } = (await supabase
              .from('businesses')
              .select(BUSINESS_SELECT)
              .eq('id', barber.business_id)
              .single()) as any

            if (barberBusiness) {
              business = barberBusiness
              role = 'barber'
              barberId = barber.id
            }
          }
        }

        // Populate cache on successful lookup
        if (business) {
          setCachedBusiness(user.id, { business, role, barberId })
        }
      }

      if (!business) {
        console.error('❌ Business not found for user:', user.id)
        return notFoundResponse('Negocio no encontrado')
      }

      // Call handler with auth context
      return handler(request, context, {
        user: { id: user.id, email: user.email },
        business,
        role,
        barberId,
        supabase,
      })
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return errorResponse('Error procesando la solicitud')
    }
  }
}

/**
 * Middleware for routes that don't require business context
 * Only authenticates the user
 */
export function withAuthOnly<T = any>(
  handler: (
    request: Request,
    context: T,
    auth: Omit<AuthContext, 'business'>
  ) => Promise<Response> | Response
) {
  return async (request: Request, context: T) => {
    try {
      const supabase = await createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return unauthorizedResponse('No autenticado')
      }

      return handler(request, context, {
        user: { id: user.id, email: user.email },
        supabase,
      })
    } catch (error) {
      console.error('❌ Auth middleware error:', error)
      return errorResponse('Error procesando la solicitud')
    }
  }
}

/**
 * Middleware that applies rate limiting to a handler
 *
 * Can be used standalone or composed with withAuth
 *
 * Usage examples:
 * ```typescript
 * // Standalone rate limiting (no auth)
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // Your logic here
 *   },
 *   { interval: 60 * 1000, maxRequests: 10 }
 * )
 *
 * // Composed with withAuth
 * export const PATCH = withRateLimit(
 *   withAuth(async (request, context, { user, business, supabase }) => {
 *     // Your logic here
 *   }),
 *   { interval: 60 * 1000, maxRequests: 10 }
 * )
 * ```
 */
export function withRateLimit<T = any>(
  handler: (request: Request, context: T) => Promise<Response> | Response,
  config: RateLimitConfig
) {
  return async (request: Request, context: T) => {
    try {
      // Apply rate limiting
      const result = await rateLimit(request as NextRequest, config)

      if (!result.success) {
        console.warn(
          `Rate limit exceeded for ${request.url}. Remaining: ${result.remaining}, Reset: ${new Date(result.reset).toISOString()}`
        )
        return rateLimitResponse(result.headers)
      }

      // Call the handler
      const response = await handler(request, context)

      // Add rate limit headers to successful responses
      const headers = new Headers(response.headers)
      Object.entries(result.headers).forEach(([key, value]) => {
        headers.set(key, value)
      })

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      console.error('❌ Rate limit middleware error:', error)
      return errorResponse('Error procesando la solicitud')
    }
  }
}

/**
 * Combined middleware: Authentication + Rate Limiting
 *
 * Applies rate limiting before authentication.
 * Useful for protecting auth endpoints from brute force.
 *
 * Usage:
 * ```typescript
 * export const PATCH = withAuthAndRateLimit(
 *   async (request, context, { user, business, supabase }) => {
 *     // Your logic here
 *   },
 *   { interval: 60 * 1000, maxRequests: 10 }
 * )
 * ```
 */
export function withAuthAndRateLimit<T = any>(handler: AuthHandler<T>, config: RateLimitConfig) {
  return withRateLimit(withAuth(handler), config)
}
