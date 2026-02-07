/**
 * Mobile-specific utilities and helpers
 */

/**
 * Check if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * Check if the device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false

  return /Android/.test(navigator.userAgent)
}

/**
 * Check if the device is mobile (touch-capable)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768
}

/**
 * Get safe area insets for iOS devices
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !isIOS()) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const computedStyle = getComputedStyle(document.documentElement)

  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}

/**
 * Prevent pull-to-refresh on mobile browsers
 */
export function preventPullToRefresh() {
  if (typeof window === 'undefined') return

  let lastY = 0

  const touchStartHandler = (e: TouchEvent) => {
    lastY = e.touches[0].clientY
  }

  const touchMoveHandler = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const isScrollingUp = currentY > lastY
    const isAtTop = window.scrollY === 0

    if (isAtTop && isScrollingUp) {
      e.preventDefault()
    }

    lastY = currentY
  }

  document.addEventListener('touchstart', touchStartHandler, { passive: false })
  document.addEventListener('touchmove', touchMoveHandler, { passive: false })

  return () => {
    document.removeEventListener('touchstart', touchStartHandler)
    document.removeEventListener('touchmove', touchMoveHandler)
  }
}

/**
 * Lock scroll (useful for modals on mobile)
 */
export function lockScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
}

/**
 * Unlock scroll
 */
export function unlockScroll() {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.height = ''
}

/**
 * Vibrate device if supported
 */
export function vibrate(pattern: number | number[] = 50) {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return false

  return navigator.vibrate(pattern)
}

/**
 * Semantic haptic feedback patterns for common UI interactions
 */
export const haptics = {
  /** Light tap feedback for button presses */
  tap: () => vibrate(10),
  /** Success confirmation (form submit, action complete) */
  success: () => vibrate([10, 30, 10]),
  /** Warning/attention (destructive action confirmation) */
  warning: () => vibrate([20, 50, 20]),
  /** Error feedback */
  error: () => vibrate(40),
  /** Selection change (picker wheel, toggle) */
  selection: () => vibrate(5),
}
