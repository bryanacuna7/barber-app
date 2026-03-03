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

type HapticKind = 'selection' | 'tap' | 'success' | 'warning' | 'error'

function getVibrationPattern(kind: HapticKind): number | number[] {
  const android = isAndroid()

  switch (kind) {
    case 'selection':
      return android ? 12 : 6
    case 'tap':
      return android ? 16 : 10
    case 'success':
      return android ? [18, 32, 18] : [10, 30, 10]
    case 'warning':
      return android ? [26, 42, 20] : [20, 50, 20]
    case 'error':
      return android ? 52 : 40
    default:
      return 10
  }
}

// Singleton AudioContext reused across ticks to avoid iOS limits
let _audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    type WinWithWebkit = Window & { webkitAudioContext?: typeof AudioContext }
    const AC = window.AudioContext ?? (window as WinWithWebkit).webkitAudioContext
    if (!AC) return null
    if (!_audioCtx || _audioCtx.state === 'closed') _audioCtx = new AC()
    return _audioCtx
  } catch {
    return null
  }
}

/**
 * Call this inside a direct touch/click handler to unlock AudioContext on iOS.
 * Must run within the synchronous call stack of a user gesture — do NOT call from setTimeout.
 */
export function warmupAudioHaptics() {
  if (!isIOS()) return
  const ctx = getAudioCtx()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
}

function playTick(ctx: AudioContext) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  const t = ctx.currentTime
  osc.frequency.value = 600
  gain.gain.setValueAtTime(0.12, t)
  gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.05)
  osc.start(t)
  osc.stop(t + 0.05)
}

/**
 * Plays a subtle audio tick on iOS Safari PWA where navigator.vibrate is not supported.
 * Not true haptic — but gives audible feedback when scrolling the time picker.
 */
function audioTick(): boolean {
  if (!isIOS()) return false
  const ctx = getAudioCtx()
  if (!ctx) return false
  try {
    if (ctx.state === 'suspended') {
      // resume() is async — play after it resolves
      ctx
        .resume()
        .then(() => playTick(ctx))
        .catch(() => {})
    } else {
      playTick(ctx)
    }
    return true
  } catch {
    return false
  }
}

function triggerBridgeHaptic(kind: HapticKind): boolean {
  if (typeof window === 'undefined') return false

  type TelegramBridge = {
    WebApp?: {
      HapticFeedback?: {
        selectionChanged?: () => void
        impactOccurred?: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
        notificationOccurred?: (type: 'success' | 'warning' | 'error') => void
      }
    }
  }

  type WebkitBridge = {
    messageHandlers?: Record<string, { postMessage: (message: unknown) => void }>
  }

  type ReactNativeBridge = {
    postMessage?: (message: string) => void
  }

  const win = window as Window & {
    Telegram?: TelegramBridge
    webkit?: WebkitBridge
    ReactNativeWebView?: ReactNativeBridge
  }

  const tg = win.Telegram?.WebApp?.HapticFeedback
  if (tg) {
    if (kind === 'selection' && tg.selectionChanged) {
      tg.selectionChanged()
      return true
    }
    if ((kind === 'tap' || kind === 'warning') && tg.impactOccurred) {
      tg.impactOccurred(kind === 'warning' ? 'medium' : 'light')
      return true
    }
    if ((kind === 'success' || kind === 'error') && tg.notificationOccurred) {
      tg.notificationOccurred(kind === 'success' ? 'success' : 'error')
      return true
    }
  }

  const handlers = win.webkit?.messageHandlers
  if (handlers) {
    const payload = { type: 'haptic', kind }
    if (handlers.haptic?.postMessage) {
      handlers.haptic.postMessage(payload)
      return true
    }
    if (kind === 'selection' && handlers.selectionChanged?.postMessage) {
      handlers.selectionChanged.postMessage(payload)
      return true
    }
    if (handlers.impactOccurred?.postMessage) {
      handlers.impactOccurred.postMessage(payload)
      return true
    }
  }

  const rnBridge = win.ReactNativeWebView?.postMessage
  if (rnBridge) {
    rnBridge(JSON.stringify({ type: 'haptic', kind }))
    return true
  }

  return false
}

/**
 * Semantic haptic feedback patterns for common UI interactions
 */
export const haptics = {
  /** Light tap feedback for button presses */
  tap: () => triggerBridgeHaptic('tap') || vibrate(getVibrationPattern('tap')) || audioTick(),
  /** Success confirmation (form submit, action complete) */
  success: () =>
    triggerBridgeHaptic('success') || vibrate(getVibrationPattern('success')) || audioTick(),
  /** Warning/attention (destructive action confirmation) */
  warning: () =>
    triggerBridgeHaptic('warning') || vibrate(getVibrationPattern('warning')) || audioTick(),
  /** Error feedback */
  error: () => triggerBridgeHaptic('error') || vibrate(getVibrationPattern('error')) || audioTick(),
  /** Selection change (picker wheel, toggle) */
  selection: () =>
    triggerBridgeHaptic('selection') || vibrate(getVibrationPattern('selection')) || audioTick(),
}
