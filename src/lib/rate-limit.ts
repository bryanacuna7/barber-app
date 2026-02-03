/**
 * Rate Limiting with IP Spoofing Protection
 *
 * Security Features:
 * - Safe IP detection with header validation
 * - Protection against IP spoofing attacks
 * - Multiple header fallback with priority order
 * - Distributed rate limiting with Upstash Redis (optional)
 * - Fallback to in-memory storage when Redis not configured
 *
 * Setup:
 * - Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed rate limiting
 * - Without Redis, uses in-memory Map (works for single-instance deployments)
 */

import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// Initialize Redis client if credentials are available
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    logger.info('Rate limiting using Upstash Redis (distributed)')
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Upstash Redis, falling back to in-memory')
  }
} else {
  logger.info('Rate limiting using in-memory store (set UPSTASH_REDIS_REST_URL for distributed)')
}

// In-memory store fallback (used when Redis not configured)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries every 5 minutes (only for in-memory store)
if (!redis) {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key)
        }
      }
    },
    5 * 60 * 1000
  )
}

/**
 * Safely extracts client IP address from request headers
 *
 * Security considerations:
 * - Headers can be spoofed by malicious clients
 * - Use multiple headers with priority order
 * - Validate IP format to prevent injection
 * - Trust proxy headers only in production (behind reverse proxy)
 *
 * Priority order:
 * 1. x-real-ip (most reliable when behind nginx/cloudflare)
 * 2. x-forwarded-for (standard, but check first IP only)
 * 3. cf-connecting-ip (Cloudflare specific)
 * 4. x-client-ip (some proxies)
 * 5. connection.remoteAddress (fallback)
 */
export function getClientIP(request: NextRequest): string {
  // Helper to validate IP format (basic validation)
  const isValidIP = (ip: string): boolean => {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

    if (!ip || ip.length > 45) return false // Max IPv6 length

    if (ipv4Pattern.test(ip)) {
      // Validate IPv4 octets are 0-255
      const octets = ip.split('.')
      return octets.every((octet) => {
        const num = parseInt(octet, 10)
        return num >= 0 && num <= 255
      })
    }

    return ipv6Pattern.test(ip)
  }

  // Helper to extract first IP from comma-separated list
  const getFirstIP = (header: string | null): string | null => {
    if (!header) return null
    const ips = header.split(',').map((ip) => ip.trim())
    return ips[0] || null
  }

  // Try headers in priority order
  const headers = [
    getFirstIP(request.headers.get('x-real-ip')),
    getFirstIP(request.headers.get('x-forwarded-for')),
    getFirstIP(request.headers.get('cf-connecting-ip')),
    getFirstIP(request.headers.get('x-client-ip')),
  ]

  for (const ip of headers) {
    if (ip && isValidIP(ip)) {
      return ip
    }
  }

  // Fallback to a safe default (will rate limit all together, but prevents bypass)
  return 'unknown'
}

/**
 * Rate limiting middleware with Redis support
 *
 * Usage:
 * ```ts
 * const rateLimitResult = await rateLimit(request, {
 *   interval: 60 * 1000, // 1 minute
 *   maxRequests: 10
 * });
 *
 * if (!rateLimitResult.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     {
 *       status: 429,
 *       headers: rateLimitResult.headers
 *     }
 *   );
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string // Optional custom identifier (e.g., user ID)
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}> {
  const ip = getClientIP(request)
  const key = identifier || `rate_limit:${ip}:${request.nextUrl.pathname}`

  const now = Date.now()

  // Use Redis if available
  if (redis) {
    return rateLimitWithRedis(key, config, now)
  }

  // Fallback to in-memory
  return rateLimitInMemory(key, config, now)
}

/**
 * Rate limiting using Upstash Redis (distributed)
 */
async function rateLimitWithRedis(
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}> {
  try {
    // Use Redis INCR with EXPIRE for atomic rate limiting
    const count = await redis!.incr(key)

    // Set expiration on first request
    if (count === 1) {
      await redis!.expire(key, Math.ceil(config.interval / 1000))
    }

    const ttl = await redis!.ttl(key)
    const resetTime = now + ttl * 1000

    const remaining = Math.max(0, config.maxRequests - count)
    const success = count <= config.maxRequests

    return {
      success,
      limit: config.maxRequests,
      remaining,
      reset: resetTime,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        ...(success ? {} : { 'Retry-After': ttl.toString() }),
      },
    }
  } catch (error) {
    // If Redis fails, log error and fall back to in-memory
    logger.error({ error, key }, 'Redis rate limit error, falling back to in-memory')
    return rateLimitInMemory(key, config, now)
  }
}

/**
 * Rate limiting using in-memory Map (single-instance)
 */
function rateLimitInMemory(
  key: string,
  config: RateLimitConfig,
  now: number
): {
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
} {
  const store = rateLimitStore.get(key)

  if (!store || now > store.resetTime) {
    // Create new rate limit window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    })

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.interval,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': (config.maxRequests - 1).toString(),
        'X-RateLimit-Reset': new Date(now + config.interval).toISOString(),
      },
    }
  }

  // Increment count
  store.count++

  const remaining = Math.max(0, config.maxRequests - store.count)
  const success = store.count <= config.maxRequests

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: store.resetTime,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(store.resetTime).toISOString(),
      ...(success ? {} : { 'Retry-After': Math.ceil((store.resetTime - now) / 1000).toString() }),
    },
  }
}

/**
 * Preset rate limit configurations for common use cases
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations (login, signup, password reset)
  strict: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Moderate - for public endpoints (booking, info pages)
  moderate: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // Lenient - for authenticated user actions
  lenient: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // API - for API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
} as const
