export interface RouteBreadcrumb {
  label: string
  href?: string
}

export interface RouteMeta {
  title: string
  subtitle?: string
  breadcrumbs?: RouteBreadcrumb[]
}

export const DASHBOARD_ROUTE_META: Record<
  '/dashboard' | '/clientes' | '/servicios' | '/analiticas',
  RouteMeta
> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Resumen operativo de tu barbería',
  },
  '/clientes': {
    title: 'Clientes',
    subtitle: 'Gestiona tu base de clientes y seguimiento',
  },
  '/servicios': {
    title: 'Servicios',
    subtitle: 'Configura catálogo, duración y precios',
  },
  '/analiticas': {
    title: 'Analíticas',
    subtitle: 'Visualiza el rendimiento de tu barbería',
  },
} as const

export function getDashboardRouteMeta(path: keyof typeof DASHBOARD_ROUTE_META) {
  return DASHBOARD_ROUTE_META[path]
}
