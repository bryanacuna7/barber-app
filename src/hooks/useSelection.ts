/**
 * useSelection — Multi-select state with shift-click range support
 *
 * Supports: toggle, toggleAll, range select (shift+click), clear.
 * Used by bulk actions toolbar on clients/appointments lists.
 */

import { useState, useCallback, useRef, useMemo } from 'react'

interface UseSelectionReturn {
  selected: Set<string>
  toggle: (id: string, event?: { shiftKey: boolean }) => void
  toggleAll: () => void
  clear: () => void
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  count: number
}

export function useSelection<T extends { id: string }>(items: T[]): UseSelectionReturn {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const anchorIndexRef = useRef<number | null>(null)
  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items])
  const visibleSelected = useMemo(
    () => new Set(Array.from(selected).filter((id) => itemIds.has(id))),
    [selected, itemIds]
  )

  const toggle = useCallback(
    (id: string, event?: { shiftKey: boolean }) => {
      const currentIndex = items.findIndex((item) => item.id === id)
      if (currentIndex === -1) return

      const anchorIndex = anchorIndexRef.current
      if (
        event?.shiftKey &&
        anchorIndex !== null &&
        anchorIndex >= 0 &&
        anchorIndex < items.length
      ) {
        // Range select: select all items between anchor and current
        const start = Math.min(anchorIndex, currentIndex)
        const end = Math.max(anchorIndex, currentIndex)
        setSelected((prev) => {
          const next = new Set(Array.from(prev).filter((selectedId) => itemIds.has(selectedId)))
          for (let i = start; i <= end; i++) {
            next.add(items[i].id)
          }
          return next
        })
      } else {
        // Standard toggle
        setSelected((prev) => {
          const next = new Set(Array.from(prev).filter((selectedId) => itemIds.has(selectedId)))
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        })
      }

      anchorIndexRef.current = currentIndex
    },
    [items, itemIds]
  )

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const visiblePrev = new Set(Array.from(prev).filter((id) => itemIds.has(id)))

      if (visiblePrev.size === items.length) {
        // All visible selected -> clear visible
        return new Set()
      }

      // Select all visible
      return new Set(items.map((item) => item.id))
    })
  }, [items, itemIds])

  const clear = useCallback(() => {
    setSelected(new Set())
    anchorIndexRef.current = null
  }, [])

  const isSelected = useCallback((id: string) => visibleSelected.has(id), [visibleSelected])

  const isAllSelected = useMemo(
    () => items.length > 0 && visibleSelected.size === items.length,
    [items.length, visibleSelected.size]
  )

  return {
    selected: visibleSelected,
    toggle,
    toggleAll,
    clear,
    isSelected,
    isAllSelected,
    count: visibleSelected.size,
  }
}
