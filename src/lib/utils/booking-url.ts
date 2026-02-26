/**
 * Booking URL helpers — single source of truth.
 *
 * bookingPath()        → relative, safe for render / SSR / href
 * bookingAbsoluteUrl() → absolute, ONLY inside event handlers (copy, share)
 */

/** Relative path — safe for render, SSR, and `<a href>`. */
export function bookingPath(slug: string): string {
  return `/reservar/${slug}`
}

/** Absolute URL — call ONLY inside onClick / clipboard / share handlers. */
export function bookingAbsoluteUrl(slug: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '')
  return `${origin}/reservar/${slug}`
}
