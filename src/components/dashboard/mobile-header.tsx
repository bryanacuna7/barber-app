'use client'

import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface MobileHeaderProps {
  businessName: string
  logoUrl?: string | null
}

export function MobileHeader({ businessName, logoUrl }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200/50 bg-white/60 px-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/60 lg:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <Scissors className="h-5 w-5" />
        )}
        <span className="max-w-[160px] truncate font-semibold text-zinc-900 dark:text-white">
          {businessName}
        </span>
      </Link>

      {/* Notification bell */}
      <NotificationBell />
    </header>
  )
}
