'use client'

/**
 * Client Bottom Nav — 3-tab navigation for /mi-cuenta
 *
 * Tabs: Inicio, Reservar, Perfil
 * Follows Apple HIG: 44px touch targets, single nav bar, active indicator pill.
 * Mirrors the dashboard bottom-nav.tsx pattern but without + button or action sheet.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, CalendarPlus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { useClientContext } from '@/contexts/client-context'

export function ClientBottomNav() {
  const pathname = usePathname() || ''
  const { businessSlug } = useClientContext()

  const tabs = [
    { name: 'Inicio', href: '/mi-cuenta', icon: Home },
    { name: 'Reservar', href: `/reservar/${businessSlug}`, icon: CalendarPlus, external: true },
    { name: 'Perfil', href: '/mi-cuenta/perfil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="px-2 pb-3 pb-safe-offset-3">
        <div className="mx-auto flex max-w-[95%] items-center justify-around gap-0 rounded-full bg-white/80 dark:bg-black/60 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),0_-2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-black/10 dark:border-zinc-800/80">
          {tabs.map((tab) => {
            const isActive =
              !tab.external && (pathname === tab.href || pathname.startsWith(`${tab.href}/`))

            return (
              <Link
                key={tab.name}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.name}
                onClick={() => {
                  if (isMobileDevice()) haptics.selection()
                }}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                  isActive
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="clientNavIndicator"
                    className="absolute inset-0 rounded-full nav-indicator"
                    transition={animations.spring.snappy}
                  />
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={animations.spring.default}
                  className="relative z-10 flex h-[26px] w-[26px] items-center justify-center"
                >
                  <tab.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                <span
                  className="relative z-10 text-[11px] leading-none tracking-tight"
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  {tab.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
