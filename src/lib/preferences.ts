/**
 * View/UI preference persistence via localStorage
 * Used by Ola 1 UI simplification to remember user's preferred view modes
 *
 * usePreference() uses useSyncExternalStore for SSR-safe hydration
 * without calling setState in effects.
 */

import { useSyncExternalStore, useCallback } from 'react'

const PREFIX = 'bsp_pref_'

// Notify subscribers when a preference changes
const listeners = new Set<() => void>()
function emitChange() {
  listeners.forEach((l) => l())
}

export function getPreference<T>(key: string, defaultValue: T, validValues?: T[]): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return defaultValue
    const parsed = JSON.parse(raw) as T
    if (validValues && !validValues.includes(parsed)) return defaultValue
    return parsed
  } catch {
    return defaultValue
  }
}

export function setPreference<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
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
