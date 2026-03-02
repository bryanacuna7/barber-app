'use client'

import { createContext, useContext, useCallback } from 'react'
import { usePreference } from '@/lib/preferences'

// ── Layout constants ──
export const SIDEBAR_WIDTH_EXPANDED = 240
export const SIDEBAR_WIDTH_COLLAPSED = 48
export const TOPBAR_HEIGHT = 48

// ── Context ──
interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (value: boolean) => void
}

const SidebarStateContext = createContext<SidebarState | null>(null)

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = usePreference('sidebar_collapsed', false)

  const toggle = useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed, setCollapsed])

  return (
    <SidebarStateContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState(): SidebarState {
  const ctx = useContext(SidebarStateContext)
  if (!ctx) throw new Error('useSidebarState must be used within SidebarStateProvider')
  return ctx
}
