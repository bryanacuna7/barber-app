'use client'

import { useState, useEffect, useCallback } from 'react'

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
}

function checkPushSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const [isSupported] = useState(() => checkPushSupport())
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    checkPushSupport() ? Notification.permission : 'unsupported'
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    })
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setLoading(true)
    try {
      // 1. Request notification permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setLoading(false)
        return false
      }

      // 2. Get SW registration
      const registration = await navigator.serviceWorker.ready

      // 3. Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('VAPID public key not configured')
        setLoading(false)
        return false
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })

      // 4. Send subscription to server
      const subJson = subscription.toJSON()
      const res = await fetch('/api/push/subscribe', {
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

      if (!res.ok) {
        // Server failed to save — unsubscribe from browser too
        await subscription.unsubscribe()
        setLoading(false)
        return false
      }

      setIsSubscribed(true)
      setLoading(false)
      return true
    } catch (err) {
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
  }
}
