/**
 * localStorage TTL Cache
 *
 * Lightweight caching layer to reduce Supabase egress on free tier.
 * Supports stale-while-revalidate: returns cached data immediately,
 * then revalidates in the background.
 *
 * Created: Session 139 (Egress Management Phase 2)
 */

const CACHE_PREFIX = 'bsp_cache_'

interface CacheEntry<T> {
  data: T
  ts: number // timestamp when cached
  ttl: number // TTL in ms
}

/**
 * Get cached data if fresh, or null if expired/missing.
 */
export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.ts > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

/**
 * Get cached data even if stale (for stale-while-revalidate pattern).
 * Returns { data, isStale } or null if no cache exists.
 */
export function getStaleCache<T>(key: string): { data: T; isStale: boolean } | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    const isStale = Date.now() - entry.ts > entry.ttl
    return { data: entry.data, isStale }
  } catch {
    return null
  }
}

/**
 * Set data in cache with TTL.
 */
export function setCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Remove a specific cache entry.
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key)
  } catch {
    // ignore
  }
}

/**
 * Clear all bsp_cache_ entries.
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}

// Common TTL constants
export const CACHE_TTL = {
  /** 2 minutes — subscription status, trial info */
  SHORT: 2 * 60 * 1000,
  /** 5 minutes — business settings, plans, exchange rates */
  MEDIUM: 5 * 60 * 1000,
  /** 15 minutes — notification preferences, rarely-changing config */
  LONG: 15 * 60 * 1000,
} as const
