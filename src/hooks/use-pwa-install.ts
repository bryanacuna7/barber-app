'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getPreference, setPreference } from '@/lib/preferences'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallState {
  /** True if we can show an install prompt (Android or iOS, not dismissed, not installed) */
  canPrompt: boolean
  /** True if app is running in standalone/installed mode */
  isInstalled: boolean
  /** True if user is on iOS (needs manual instructions) */
  isIOS: boolean
  /** Trigger native install prompt (Android/Chrome only) */
  promptInstall: () => void
  /** Dismiss the install prompt (persists to preferences) */
  dismiss: () => void
}

const VISIT_THRESHOLD = 3
const PREF_KEY_DISMISSED = 'pwa_install_dismissed'
const PREF_KEY_VISITS = 'pwa_visit_count'

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  // Standard iOS detection (iPhone, older iPad, iPod)
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)) return true
  // Modern iPadOS (13+) reports as MacIntel with multi-touch support
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true
  return false
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // Check display-mode media query (standard)
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // Check iOS standalone (Safari-specific)
  if ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true)
    return true
  return false
}

/**
 * Hook for PWA install prompt logic.
 * - Android/Chrome: captures beforeinstallprompt event
 * - iOS: detects platform for manual instructions
 * - Respects visit threshold (show after N visits)
 * - Persists dismissal preference
 */
export function usePWAInstall(): PWAInstallState {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [hasNativePrompt, setHasNativePrompt] = useState(false)
  // Lazy initializers: hydration mismatch acceptable (component only renders when canPrompt=true)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return detectStandalone()
  })
  const [isIOS] = useState(() => detectIOS())
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return getPreference(PREF_KEY_DISMISSED, 'no', ['yes', 'no']) === 'yes'
  })
  const [hasEnoughVisits] = useState(() => {
    if (typeof window === 'undefined') return false
    const visits = getPreference(PREF_KEY_VISITS, 0)
    const newVisits = (typeof visits === 'number' ? visits : 0) + 1
    return newVisits >= VISIT_THRESHOLD
  })

  useEffect(() => {
    // Persist visit count increment (side effect only, state already computed in lazy init)
    const visits = getPreference(PREF_KEY_VISITS, 0)
    const newVisits = (typeof visits === 'number' ? visits : 0) + 1
    setPreference(PREF_KEY_VISITS, newVisits)

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setHasNativePrompt(true)
    }

    // Listen for app installed
    const handleInstalled = () => {
      setIsInstalled(true)
      deferredPrompt.current = null
      setHasNativePrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = useCallback(() => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt()
      deferredPrompt.current.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
        }
        deferredPrompt.current = null
        setHasNativePrompt(false)
      })
    }
  }, [])

  const dismiss = useCallback(() => {
    setPreference(PREF_KEY_DISMISSED, 'yes')
    setIsDismissed(true)
  }, [])

  // canPrompt: not installed, not dismissed, enough visits, and either native prompt or iOS
  const canPrompt = !isInstalled && !isDismissed && hasEnoughVisits && (hasNativePrompt || isIOS)

  return {
    canPrompt,
    isInstalled,
    isIOS,
    promptInstall,
    dismiss,
  }
}
