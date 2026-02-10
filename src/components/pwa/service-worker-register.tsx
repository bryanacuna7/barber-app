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

    // When a new SW takes control, reload to get fresh content
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    // Helper: tell a waiting SW to activate immediately
    function promptSwUpdate(waiting: ServiceWorker) {
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
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // If there's already a waiting SW (e.g., from a previous visit)
        if (registration.waiting) {
          promptSwUpdate(registration.waiting)
          return
        }

        // If there's an installing SW, track it
        if (registration.installing) {
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
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update()
          }
        })

        // Also check periodically (every 30 minutes)
        setInterval(
          () => {
            registration.update()
          },
          30 * 60 * 1000
        )
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  }, [])

  return null
}
