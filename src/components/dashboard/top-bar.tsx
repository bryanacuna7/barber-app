'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Scissors, Search, PanelLeftClose, PanelLeftOpen, Link2, Check } from 'lucide-react'
import { useSidebarState } from './sidebar-state'
import { useCommandPalette } from './command-palette'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { TopBarProfileMenu } from './profile-menu'
import { bookingAbsoluteUrl } from '@/lib/utils/booking-url'
import { useToast } from '@/components/ui/toast'

interface TopBarProps {
  businessName: string
  businessSlug?: string
  logoUrl?: string | null
}

export function TopBar({ businessName, businessSlug, logoUrl }: TopBarProps) {
  const { collapsed, toggle } = useSidebarState()
  const { open: openCommandPalette } = useCommandPalette()
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyShareLink = () => {
    if (!businessSlug) return

    navigator.clipboard
      .writeText(bookingAbsoluteUrl(businessSlug))
      .then(() => {
        setCopied(true)
        toast.info('Enlace copiado al portapapeles')
        window.setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => {
        toast.error('No se pudo copiar')
      })
  }

  return (
    <header className="hidden lg:sticky lg:top-0 lg:z-50 lg:flex lg:h-12 lg:items-center lg:gap-2 lg:border-b lg:border-zinc-200/50 lg:bg-white/80 lg:px-4 lg:backdrop-blur-md dark:lg:border-zinc-800/50 dark:lg:bg-zinc-950/80">
      {/* Toggle sidebar */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        aria-expanded={!collapsed}
        aria-controls="dashboard-sidebar"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/70 bg-white/70 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800/80 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        ) : (
          <PanelLeftClose className="h-[18px] w-[18px]" />
        )}
      </button>

      {/* Logo + business name */}
      <Link href="/dashboard" className="flex items-center gap-2.5">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <Scissors className="h-5 w-5 text-zinc-900 dark:text-white" />
        )}
        <span className="font-semibold text-sm truncate max-w-[180px] text-zinc-900 dark:text-white">
          {businessName}
        </span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={openCommandPalette}
          className="flex h-9 w-[220px] items-center gap-2 rounded-full border border-zinc-200/70 bg-zinc-50/80 px-3 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-white/[0.03] dark:text-zinc-500 dark:hover:bg-white/[0.06] xl:w-[260px]"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">Buscar...</span>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-zinc-200/70 bg-white/90 px-1.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:text-zinc-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Notification bell */}
        <NotificationBell className="h-9 w-9 border border-zinc-200/70 bg-white/70 text-zinc-500 shadow-none ring-0 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800/80 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300" />

        {/* Share booking link */}
        {businessSlug && (
          <button
            type="button"
            onClick={handleCopyShareLink}
            aria-label={copied ? 'Enlace copiado' : 'Compartir link de reservas'}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-800/80 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            <span className="hidden xl:inline">{copied ? 'Copiado' : 'Compartir'}</span>
          </button>
        )}

        {/* User profile */}
        <TopBarProfileMenu />
      </div>
    </header>
  )
}
