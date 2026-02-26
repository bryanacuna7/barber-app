'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Scissors } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface MobileHeaderProps {
  businessName: string
  logoUrl?: string | null
}

export function MobileHeader({ businessName, logoUrl }: MobileHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const shouldHideHeader =
    pathname === '/citas' ||
    pathname.startsWith('/citas/') ||
    pathname === '/clientes' ||
    pathname.startsWith('/clientes/') ||
    pathname === '/barberos' ||
    pathname.startsWith('/barberos/') ||
    pathname === '/servicios' ||
    pathname.startsWith('/servicios/') ||
    pathname === '/mi-dia' ||
    pathname.startsWith('/mi-dia/')

  if (shouldHideHeader) {
    return null
  }

  const titleByExactPath: Record<string, string> = {
    '/dashboard': businessName,
    '/citas': 'Citas',
    '/clientes': 'Clientes',
    '/servicios': 'Servicios',
    '/barberos': 'Equipo',
    '/barberos/logros': 'Logros',
    '/barberos/desafios': 'Desafíos',
    '/analiticas': 'Analíticas',
    '/configuracion': 'Configuración',
    '/configuracion/general': 'Información General',
    '/configuracion/horario': 'Horario y Reservas',
    '/configuracion/branding': 'Marca y Estilo',
    '/configuracion/equipo': 'Equipo y Accesos',
    '/configuracion/pagos': 'Métodos de Pago',
    '/configuracion/avanzado': 'Configuración Avanzada',
    '/configuracion/promociones': 'Slots Promocionales',
    '/suscripcion': 'Suscripción',
    '/changelog': 'Novedades',
    '/referencias': 'Referencias',
    '/lealtad/configuracion': 'Lealtad',
    '/guia': 'Guía de Uso',
  }

  const topLevelRoutes = new Set([
    '/dashboard',
    '/citas',
    '/clientes',
    '/servicios',
    '/barberos',
    '/analiticas',
    '/configuracion',
    '/suscripcion',
    '/changelog',
    '/referencias',
    '/mi-dia',
    '/lealtad/configuracion',
    '/guia',
  ])

  const parentFallbackByPrefix: Array<[string, string]> = [
    ['/barberos/', '/barberos'],
    ['/clientes/', '/clientes'],
    ['/citas/', '/citas'],
    ['/servicios/', '/servicios'],
    ['/analiticas/', '/analiticas'],
    ['/configuracion/', '/configuracion'],
    ['/referencias/', '/referencias'],
    ['/suscripcion/', '/suscripcion'],
    ['/changelog/', '/changelog'],
    ['/lealtad/', '/lealtad/configuracion'],
  ]

  function getTitle(currentPath: string) {
    if (titleByExactPath[currentPath]) return titleByExactPath[currentPath]

    for (const [prefix, title] of [
      ['/barberos/', 'Equipo'],
      ['/clientes/', 'Clientes'],
      ['/citas/', 'Citas'],
      ['/servicios/', 'Servicios'],
      ['/analiticas/', 'Analíticas'],
      ['/configuracion/', 'Configuración'],
      ['/suscripcion/', 'Suscripción'],
      ['/changelog/', 'Novedades'],
      ['/referencias/', 'Referencias'],
      ['/lealtad/', 'Lealtad'],
    ] as const) {
      if (currentPath.startsWith(prefix)) return title
    }

    return businessName
  }

  function getBackFallback(currentPath: string) {
    for (const [prefix, fallback] of parentFallbackByPrefix) {
      if (!currentPath.startsWith(prefix)) continue

      // Avoid self-loop for top-level routes such as /lealtad/configuracion.
      if (fallback !== currentPath) return fallback
      break
    }

    // Top-level pages outside of dashboard home should always have a
    // predictable path back to the main dashboard.
    if (currentPath !== '/dashboard' && topLevelRoutes.has(currentPath)) {
      return '/dashboard'
    }

    const segments = currentPath.split('/').filter(Boolean)
    if (segments.length > 0) return `/${segments[0]}`
    return '/dashboard'
  }

  function handleBack() {
    const fallback = getBackFallback(pathname)
    // Always use router.push for known parent routes — router.back() is unreliable
    // in SPAs because document.referrer doesn't update on client-side navigations,
    // causing unpredictable behavior (full reloads, wrong destination).
    router.push(fallback)
  }

  const currentTitle = getTitle(pathname)
  const isDashboardHome = pathname === '/dashboard'
  const showBack = !isDashboardHome

  return (
    <header
      className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 lg:hidden"
      style={{
        marginTop: 'calc(env(safe-area-inset-top) * -1)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {isDashboardHome ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <Scissors className="h-5 w-5" />
            )}
            <span className="max-w-[160px] truncate font-semibold text-zinc-900 dark:text-white">
              {currentTitle}
            </span>
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Volver"
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
              {currentTitle}
            </span>
          </div>
        )}

        {/* Notification bell */}
        <NotificationBell />
      </div>
    </header>
  )
}
