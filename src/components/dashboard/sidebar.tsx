'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
  { name: 'Barberos', href: '/barberos', icon: UserRound },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

interface SidebarProps {
  businessName: string
}

interface SidebarContentProps {
  businessName: string
  pathname: string
  onLogout: () => void
  onLinkClick?: () => void
}

function SidebarContent({
  businessName,
  pathname,
  onLogout,
  onLinkClick,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <Scissors className="h-6 w-6" />
          <span className="font-semibold">{businessName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  )
}

export function Sidebar({ businessName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Desktop sidebar only - mobile uses bottom nav */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white dark:lg:border-zinc-800 dark:lg:bg-zinc-900">
        <SidebarContent
          businessName={businessName}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}
