'use client'

/**
 * useLongPress — detects a sustained pointer hold (default 500ms).
 *
 * Cancels if the pointer moves > 10px (user is scrolling, not pressing).
 * Prevents native browser context menu on mobile.
 * Returns spread-ready event handlers for any pressable element.
 */

import { useRef, useCallback } from 'react'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

interface LongPressOptions {
  /** Hold duration in ms before onLongPress fires. Default: 500 */
  delay?: number
  /** Called when hold threshold is reached */
  onLongPress: () => void
}

export function useLongPress({ delay = 500, onLongPress }: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only respond to primary pointer (ignore multi-touch secondary contacts)
      if (e.button !== 0 && e.pointerType !== 'touch') return
      startPos.current = { x: e.clientX, y: e.clientY }
      longPressTriggered.current = false
      timerRef.current = setTimeout(() => {
        longPressTriggered.current = true
        if (isMobileDevice()) haptics.selection()
        onLongPress()
      }, delay)
    },
    [delay, onLongPress]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current) return
      const dx = Math.abs(e.clientX - startPos.current.x)
      const dy = Math.abs(e.clientY - startPos.current.y)
      // Cancel if user moved > 10px (scrolling intent)
      if (dx > 10 || dy > 10) clear()
    },
    [clear]
  )

  const onPointerUp = useCallback(() => clear(), [clear])
  const onPointerCancel = useCallback(() => clear(), [clear])

  // Block native browser context menu so our menu renders instead
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  // If long press fired, swallow the synthetic click that follows pointerup
  const onClick = useCallback(
    (e: React.MouseEvent, originalOnClick?: (e: React.MouseEvent) => void) => {
      if (longPressTriggered.current) {
        e.stopPropagation()
        e.preventDefault()
        longPressTriggered.current = false
        return
      }
      originalOnClick?.(e)
    },
    []
  )

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onContextMenu, onClick }
}
