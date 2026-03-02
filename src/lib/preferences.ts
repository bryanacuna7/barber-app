/**
 * View/UI preference persistence via localStorage
 * Used by Ola 1 UI simplification to remember user's preferred view modes
 *
 * usePreference() uses useSyncExternalStore for SSR-safe hydration
 * without calling setState in effects.
 */

import { useSyncExternalStore, useCallback } from 'react'

const PREFIX = 'bsp_pref_'
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>()

// Notify subscribers when a preference changes
const listeners = new Set<() => void>()
function emitChange() {
  listeners.forEach((l) => l())
}

export function getPreference<T>(key: string, defaultValue: T, validValues?: T[]): T {
  if (typeof window === 'undefined') return defaultValue
  const storageKey = PREFIX + key
  try {
    const raw = localStorage.getItem(storageKey)
    const cached = snapshotCache.get(storageKey)

    if (cached && cached.raw === raw) {
      const cachedValue = cached.value as T
      if (validValues && !validValues.includes(cachedValue)) return defaultValue
      return cachedValue
    }

    if (!raw) {
      snapshotCache.set(storageKey, { raw: null, value: defaultValue })
      return defaultValue
    }

    const parsed = JSON.parse(raw) as T
    if (validValues && !validValues.includes(parsed)) {
      snapshotCache.set(storageKey, { raw, value: defaultValue })
      return defaultValue
    }

    snapshotCache.set(storageKey, { raw, value: parsed })
    return parsed
  } catch {
    snapshotCache.set(storageKey, { raw: null, value: defaultValue })
    return defaultValue
  }
}

export function setPreference<T>(key: string, value: T): void {
  const storageKey = PREFIX + key
  try {
    const raw = JSON.stringify(value)
    localStorage.setItem(storageKey, raw)
    snapshotCache.set(storageKey, { raw, value })
  } catch {
    /* silent — localStorage may be full or disabled */
  }
}

/**
 * React hook for persisted preferences. SSR-safe via useSyncExternalStore.
 * Returns [value, setValue] like useState. Changes persist to localStorage.
 */
export function usePreference<T>(
  key: string,
  defaultValue: T,
  validValues?: T[]
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => getPreference(key, defaultValue, validValues),
    () => defaultValue
  )

  const setValue = useCallback(
    (newValue: T) => {
      setPreference(key, newValue)
      emitChange()
    },
    [key]
  )

  return [value, setValue]
}
