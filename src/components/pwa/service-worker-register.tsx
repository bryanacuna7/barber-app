'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production
    if (process.env.NODE_ENV !== 'production') {
      // Unregister any existing service workers in development
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister()
          })
        })
      }
      return
    }

    if (!('serviceWorker' in navigator)) return

    let updateIntervalId: ReturnType<typeof setInterval> | undefined
    let reloadOnVisibleHandler: (() => void) | undefined
    let updateOnVisibleHandler: (() => void) | undefined

    const CONTROLLER_RELOAD_KEY = 'sw_controller_reload_once'

    // When a new SW takes control, reload once to get fresh content.
    // Guarding this avoids repeated reload loops/blank flashes.
    let refreshing = false
    const handleControllerChange = () => {
      if (refreshing) return
      try {
        if (sessionStorage.getItem(CONTROLLER_RELOAD_KEY) === '1') return
        sessionStorage.setItem(CONTROLLER_RELOAD_KEY, '1')
      } catch {
        // Ignore storage errors in restricted browser contexts.
      }

      refreshing = true
      if (document.visibilityState === 'visible') {
        window.location.reload()
        return
      }

      reloadOnVisibleHandler = () => {
        if (document.visibilityState !== 'visible') return
        if (reloadOnVisibleHandler) {
          document.removeEventListener('visibilitychange', reloadOnVisibleHandler)
          reloadOnVisibleHandler = undefined
        }
        window.location.reload()
      }
      document.addEventListener('visibilitychange', reloadOnVisibleHandler)
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    // Helper: tell a waiting SW to activate immediately
    function promptSwUpdate(waiting: ServiceWorker | null) {
      if (!waiting) return
      // Avoid forcing updates while tab is backgrounded.
      if (document.visibilityState !== 'visible') return
      waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    // Helper: watch an installing SW and prompt when it's waiting
    function trackInstalling(sw: ServiceWorker) {
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW installed while old one is still controlling → prompt update
          promptSwUpdate(sw)
        }
      })
    }

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'imports' })
      .then((registration) => {
        updateOnVisibleHandler = () => {
          if (document.visibilityState !== 'visible') return
          promptSwUpdate(registration.waiting)
          registration.update().catch(() => {})
        }

        // If there's already a waiting SW (e.g., from a previous visit)
        if (registration.waiting) {
          promptSwUpdate(registration.waiting)
        } else if (registration.installing) {
          // If there's an installing SW, track it
          trackInstalling(registration.installing)
        }

        // Watch for future new SWs
        registration.addEventListener('updatefound', () => {
          const newSw = registration.installing
          if (newSw) {
            trackInstalling(newSw)
          }
        })

        // Check for SW updates when the user returns to the app (crucial for iOS PWAs)
        document.addEventListener('visibilitychange', updateOnVisibleHandler)

        // Also check periodically (every 30 minutes)
        updateIntervalId = setInterval(
          () => {
            if (document.visibilityState !== 'visible') return
            registration.update().catch(() => {})
          },
          30 * 60 * 1000
        )
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })

    return () => {
      if (updateIntervalId) {
        clearInterval(updateIntervalId)
      }
      if (reloadOnVisibleHandler) {
        document.removeEventListener('visibilitychange', reloadOnVisibleHandler)
      }
      if (updateOnVisibleHandler) {
        document.removeEventListener('visibilitychange', updateOnVisibleHandler)
      }
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return null
}
