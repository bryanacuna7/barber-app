/**
 * Booking URL helpers — single source of truth.
 *
 * bookingPath()        → relative, safe for render / SSR / href
 * bookingAbsoluteUrl() → absolute, ONLY inside event handlers (copy, share)
 * bookingDisplayUrl()  → short display URL for UI (slug.nexocr.pro)
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN

/** Relative path — safe for render, SSR, and `<a href>`. */
export function bookingPath(slug: string): string {
  return `/reservar/${slug}`
}

/** Absolute URL — call ONLY inside onClick / clipboard / share handlers. */
export function bookingAbsoluteUrl(slug: string): string {
  if (ROOT_DOMAIN) {
    return `https://${slug}.${ROOT_DOMAIN}`
  }
  const origin =
    typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '')
  return `${origin}/reservar/${slug}`
}

/** Short display URL for UI — no protocol, just slug.domain. */
export function bookingDisplayUrl(slug: string): string {
  if (ROOT_DOMAIN) {
    return `${slug}.${ROOT_DOMAIN}`
  }
  return `/reservar/${slug}`
}
