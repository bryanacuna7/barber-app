import { useEffect, useRef } from 'react'

const ICON_SIZE = 64
const BADGE_SIZE = 24
const BADGE_FONT_SIZE = 14
const DEBOUNCE_MS = 500

/**
 * Draws a numeric badge on the favicon.
 *
 * - count=0: restores original /api/pwa/icon?size=64
 * - count>0: draws red badge circle with number
 * - count>9: shows "9+"
 * - Debounces updates by 500ms to avoid flicker
 */
export function useFaviconBadge(count: number): void {
  const originalHref = useRef<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const renderTokenRef = useRef(0)

  useEffect(() => {
    // Capture original favicon href on first mount
    if (originalHref.current === null) {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      originalHref.current = link?.href ?? '/api/pwa/icon?size=64'
    }

    // Debounce updates
    if (timerRef.current) clearTimeout(timerRef.current)

    const token = ++renderTokenRef.current

    timerRef.current = setTimeout(() => {
      if (count <= 0) {
        restoreOriginal(originalHref.current!)
        return
      }

      drawBadge(count, originalHref.current!, canvasRef, token, renderTokenRef)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [count])

  // Restore original on unmount
  useEffect(() => {
    return () => {
      if (originalHref.current) {
        restoreOriginal(originalHref.current)
      }
    }
  }, [])
}

function getOrCreateLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

function restoreOriginal(href: string) {
  const link = getOrCreateLink()
  link.href = href
}

function drawBadge(
  count: number,
  originalHref: string,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  token: number,
  renderTokenRef: React.MutableRefObject<number>
) {
  const img = new Image()
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    // Ignore stale async draws from previous counts.
    if (token !== renderTokenRef.current) return

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    const canvas = canvasRef.current
    canvas.width = ICON_SIZE
    canvas.height = ICON_SIZE

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw original icon
    ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE)
    ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE)

    // Draw badge circle
    const badgeX = ICON_SIZE - BADGE_SIZE / 2
    const badgeY = BADGE_SIZE / 2

    ctx.beginPath()
    ctx.arc(badgeX, badgeY, BADGE_SIZE / 2, 0, Math.PI * 2)
    ctx.fillStyle = '#EF4444'
    ctx.fill()

    // Draw badge border
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw text
    const label = count > 9 ? '9+' : String(count)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${BADGE_FONT_SIZE}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, badgeX, badgeY + 1)

    // Apply to favicon
    const link = getOrCreateLink()
    link.href = canvas.toDataURL('image/png')
  }

  img.onerror = () => {
    // If original icon fails to load, skip badge
  }

  img.src = originalHref
}
