'use client'

/**
 * DashboardContentArea — client-side route-aware wrapper.
 *
 * Absorbs all pathname-dependent logic that previously lived in the
 * server layout (via `headers()` → `x-pathname`). By moving this to a
 * client component using `usePathname()`, the layout no longer needs
 * the dynamic `headers()` call, letting Next.js cache the RSC payload
 * and skip re-executing 3-4 Supabase roundtrips on every navigation.
 *
 * Responsibilities:
 * - Route-dependent padding (compact for /citas, /mi-dia)
 * - Barber access control (deny pages not in staffPermissions)
 * - Barber redirect (/dashboard → /mi-dia)
 */

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useBusiness } from '@/contexts/business-context'
import { canBarberAccessPath } from '@/lib/auth/roles'
import { PageTransition } from '@/components/dashboard/page-transition'

interface DashboardContentAreaProps {
  children: React.ReactNode
  /** Slot for TrialBanner — only rendered for owners */
  banner?: React.ReactNode
}

export function DashboardContentArea({ children, banner }: DashboardContentAreaProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { userRole, staffPermissions } = useBusiness()

  const isCompactRoute = pathname.startsWith('/citas') || pathname.startsWith('/mi-dia')
  const isCitasRoute = pathname.startsWith('/citas')
  const isBarber = userRole === 'barber'

  // Barber landing: redirect root/dashboard → /mi-dia
  useEffect(() => {
    if (isBarber && (pathname === '/dashboard' || pathname === '/')) {
      router.replace('/mi-dia')
    }
  }, [isBarber, pathname, router])

  // iOS pull-down fix for /citas: keep root canvas dark during overscroll bounce.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('citas-overscroll-fix', isCitasRoute)

    return () => {
      root.classList.remove('citas-overscroll-fix')
    }
  }, [isCitasRoute])

  // Barber page guard
  const isBarberDenied = isBarber && !canBarberAccessPath(pathname, staffPermissions)

  return (
    <div
      className={
        isCompactRoute
          ? `px-4 pt-0 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10 ${isCitasRoute ? 'relative bg-white dark:bg-zinc-950' : ''}`
          : 'px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10'
      }
    >
      {isCitasRoute && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-white dark:bg-zinc-950"
        />
      )}
      {banner}
      <PageTransition>{isBarberDenied ? <AccessDenied /> : children}</PageTransition>
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-sm w-full text-center px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Lock className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-zinc-900 dark:text-white">
          Acceso restringido
        </h2>
        <p className="mt-2 text-sm text-muted">Esta sección no está habilitada para tu rol.</p>
        <Link
          href="/mi-dia"
          className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          Ir a Mi Día
        </Link>
      </div>
    </div>
  )
}
