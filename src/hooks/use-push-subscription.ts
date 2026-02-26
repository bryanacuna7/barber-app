'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

/**
 * Convert a base64 VAPID public key to Uint8Array for pushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

interface UsePushSubscriptionReturn {
  /** Browser supports push notifications */
  isSupported: boolean
  /** Current Notification.permission state */
  permission: NotificationPermission | 'unsupported'
  /** User has an active push subscription on this device */
  isSubscribed: boolean
  /** Request permission and subscribe */
  subscribe: () => Promise<boolean>
  /** Unsubscribe from push */
  unsubscribe: () => Promise<boolean>
  /** Loading state during subscribe/unsubscribe */
  loading: boolean
  /** Last error message for debugging */
  error: string | null
}

function checkPushSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function subscribeToPushSupport() {
  return () => {}
}

function getPushSupportServerSnapshot(): boolean {
  return false
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  // useSyncExternalStore keeps SSR/client hydration snapshots consistent.
  const isSupported = useSyncExternalStore(
    subscribeToPushSupport,
    checkPushSupport,
    getPushSupportServerSnapshot
  )
  const permission: NotificationPermission | 'unsupported' = isSupported
    ? Notification.permission
    : 'unsupported'
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return

    let mounted = true

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        if (mounted) {
          setIsSubscribed(!!sub)
        }
      })
      .catch((err) => {
        console.error('Push initialization error:', err)
      })

    return () => {
      mounted = false
    }
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setLoading(true)
    setError(null)
    try {
      // Step 1: Request notification permission
      const perm = await Notification.requestPermission()

      if (perm !== 'granted') {
        setError(`Permiso denegado: ${perm}`)
        setLoading(false)
        return false
      }

      // Step 2: Get SW registration
      let registration: ServiceWorkerRegistration
      try {
        registration = await navigator.serviceWorker.ready
      } catch (swErr: any) {
        setError(`Service Worker no disponible: ${swErr?.message || swErr}`)
        setLoading(false)
        return false
      }

      // Step 3: Subscribe to push via PushManager
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setError('VAPID key no configurada')
        setLoading(false)
        return false
      }

      let subscription: PushSubscription
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        })
      } catch (pushErr: any) {
        setError(`PushManager.subscribe falló: ${pushErr?.message || pushErr}`)
        setLoading(false)
        return false
      }

      // Step 4: Send subscription to server
      const subJson = subscription.toJSON()
      let res: Response
      try {
        res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
          }),
        })
      } catch (fetchErr: any) {
        setError(`Error de red al guardar: ${fetchErr?.message || fetchErr}`)
        await subscription.unsubscribe()
        setLoading(false)
        return false
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        setError(`Servidor respondió ${res.status}: ${body}`)
        await subscription.unsubscribe()
        setLoading(false)
        return false
      }

      setIsSubscribed(true)
      setLoading(false)
      return true
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(`Error inesperado: ${msg}`)
      console.error('Push subscribe error:', err)
      setLoading(false)
      return false
    }
  }, [isSupported])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // 1. Tell server to deactivate
        const res = await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        if (!res.ok) {
          // Server failed — don't unsubscribe browser-side to stay in sync
          setLoading(false)
          return false
        }

        // 2. Unsubscribe from browser
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      setLoading(false)
      return true
    } catch (err) {
      console.error('Push unsubscribe error:', err)
      setLoading(false)
      return false
    }
  }, [isSupported])

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    loading,
    error,
  }
}
