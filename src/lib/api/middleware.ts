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
  }
  supabase: Awaited<ReturnType<typeof createClient>>
}

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

      // Fetch business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, owner_id, name')
        .eq('owner_id', user.id)
        .single()

      if (businessError || !business) {
        console.error('❌ Business not found for user:', user.id)
        return notFoundResponse('Negocio no encontrado')
      }

      // Call handler with auth context
      return handler(request, context, {
        user: { id: user.id, email: user.email },
        business,
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
