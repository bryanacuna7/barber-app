'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
  { name: 'Config', href: '/configuracion', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* iOS-style blur background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-t border-zinc-200/50 dark:bg-zinc-900/70 dark:border-zinc-800/50" />

      {/* Safe area padding for iPhone */}
      <div className="relative flex items-center justify-around px-2 pt-2 pb-safe">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                // Minimum 44px touch target (Apple HIG) - adjusted for 5 items
                'relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-[#007AFF] dark:text-[#0A84FF]'
                  : 'text-zinc-400 dark:text-zinc-500 active:text-zinc-600 dark:active:text-zinc-400'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/15"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative z-10 flex items-center justify-center w-6 h-6"
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              <motion.span
                animate={{
                  fontWeight: isActive ? 600 : 500,
                }}
                className="relative z-10 text-[10px] mt-0.5"
              >
                {item.name}
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
