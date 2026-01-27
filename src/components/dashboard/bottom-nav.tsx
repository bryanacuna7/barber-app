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
      <div className="px-4 pb-safe">
        <div className="mx-auto flex max-w-[420px] items-center justify-between gap-1 rounded-[28px] bg-zinc-900/85 px-2.5 py-2 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-white/70 transition-all',
                  isActive ? 'text-white' : 'hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 rounded-[22px] ring-1 ring-white/10"
                    style={{
                      backgroundColor: 'rgba(var(--brand-primary-rgb), 0.25)',
                      boxShadow: '0 0 20px rgba(var(--brand-primary-rgb), 0.15)'
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{ scale: isActive ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="relative z-10 flex h-7 w-7 items-center justify-center"
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                </motion.div>

                <motion.span
                  animate={{ fontWeight: isActive ? 600 : 500 }}
                  className="relative z-10 text-[10px] leading-none"
                >
                  {item.name}
                </motion.span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
