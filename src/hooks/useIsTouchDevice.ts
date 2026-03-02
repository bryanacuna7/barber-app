/**
 * useIsTouchDevice — Detects touch-primary devices via pointer: coarse.
 *
 * Returns true on mobile/tablet. Used to skip context menu on touch.
 * Uses useSyncExternalStore for SSR-safe window access.
 */

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => window.matchMedia('(pointer: coarse)').matches
const getServerSnapshot = () => false

export function useIsTouchDevice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
