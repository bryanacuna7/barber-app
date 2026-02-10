'use client'

import { useSyncExternalStore, useCallback, useEffect, useState } from 'react'
import { setCache, getStaleCache } from '@/lib/cache'

const CACHE_KEY = 'last_online_at'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // Assume online during SSR
}

interface OnlineStatus {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineAt: string | null
}

/**
 * SSR-safe hook for online/offline detection.
 * Uses useSyncExternalStore to avoid hydration mismatches.
 * Persists lastOnlineAt timestamp to localStorage cache.
 */
export function useOnlineStatus(): OnlineStatus {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [wasOffline, setWasOffline] = useState(false)

  // Track if user went offline this session (event callback pattern for lint compliance)
  useEffect(() => {
    const handleOffline = () => setWasOffline(true)
    window.addEventListener('offline', handleOffline)
    return () => window.removeEventListener('offline', handleOffline)
  }, [])

  // Persist lastOnlineAt timestamp when online
  useEffect(() => {
    if (isOnline) {
      setCache(CACHE_KEY, new Date().toISOString(), THIRTY_DAYS)
    }
  }, [isOnline])

  const getLastOnlineAt = useCallback((): string | null => {
    const cached = getStaleCache<string>(CACHE_KEY)
    return cached?.data ?? null
  }, [])

  return {
    isOnline,
    wasOffline,
    lastOnlineAt: getLastOnlineAt(),
  }
}
