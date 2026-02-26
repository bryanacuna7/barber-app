/**
 * Client-side analytics event tracking.
 * Fire-and-forget — never blocks UI, never throws.
 */
export function trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, metadata }),
  }).catch(() => {
    // Silently fail — analytics should never block the user
  })
}
