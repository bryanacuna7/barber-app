'use client'

import {
  SidebarStateProvider,
  useSidebarState,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
} from './sidebar-state'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

interface DashboardShellProps {
  businessName: string
  businessSlug?: string
  logoUrl?: string | null
  isBarber?: boolean
  children: React.ReactNode
}

export function DashboardShell({
  businessName,
  businessSlug,
  logoUrl,
  isBarber,
  children,
}: DashboardShellProps) {
  return (
    <SidebarStateProvider>
      <TooltipProvider delayDuration={200}>
        <Sidebar isBarber={isBarber} />
        <ShellContent businessName={businessName} businessSlug={businessSlug} logoUrl={logoUrl}>
          {children}
        </ShellContent>
      </TooltipProvider>
    </SidebarStateProvider>
  )
}

function ShellContent({
  businessName,
  businessSlug,
  logoUrl,
  children,
}: {
  businessName: string
  businessSlug?: string
  logoUrl?: string | null
  children: React.ReactNode
}) {
  const { collapsed } = useSidebarState()
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED

  return (
    <div
      className="min-h-screen lg:pl-[var(--sidebar-w)] max-lg:pl-0 lg:transition-[padding-left] lg:duration-300 lg:ease-in-out"
      style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}
    >
      <TopBar businessName={businessName} businessSlug={businessSlug} logoUrl={logoUrl} />
      <main id="main-content">{children}</main>
    </div>
  )
}
