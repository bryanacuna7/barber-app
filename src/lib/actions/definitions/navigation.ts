/**
 * Navigation + Settings + Utility actions
 *
 * 10 navigation actions, 6 settings subroutes, 1 utility (copy booking link).
 */

import {
  LayoutDashboard,
  Calendar,
  Scissors,
  UserRound,
  Users,
  TrendingUp,
  Share2,
  History,
  Settings,
  BookOpen,
  Clock,
  Palette,
  CreditCard,
  UsersRound,
  Wrench,
  Link2,
} from 'lucide-react'
import { actionRegistry } from '../registry'
import type { ActionDefinition } from '../types'
import { bookingAbsoluteUrl } from '@/lib/utils/booking-url'

const navigationActions: ActionDefinition[] = [
  {
    id: 'nav.dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    category: 'navigate',
    keywords: ['inicio', 'home', 'panel'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/dashboard',
    execute: (ctx) => ctx.navigate('/dashboard'),
  },
  {
    id: 'nav.citas',
    label: 'Citas',
    icon: Calendar,
    category: 'navigate',
    keywords: ['cita', 'reserva', 'agenda', 'calendario'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/citas',
    execute: (ctx) => ctx.navigate('/citas'),
  },
  {
    id: 'nav.servicios',
    label: 'Servicios',
    icon: Scissors,
    category: 'navigate',
    keywords: ['servicio', 'corte', 'barba', 'precio'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/servicios',
    execute: (ctx) => ctx.navigate('/servicios'),
  },
  {
    id: 'nav.equipo',
    label: 'Equipo',
    icon: UserRound,
    category: 'navigate',
    keywords: ['miembro del equipo', 'equipo', 'staff', 'empleado', 'barbero'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/barberos',
    execute: (ctx) => ctx.navigate('/barberos'),
  },
  {
    id: 'nav.clientes',
    label: 'Clientes',
    icon: Users,
    category: 'navigate',
    keywords: ['cliente', 'contacto', 'persona'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/clientes',
    execute: (ctx) => ctx.navigate('/clientes'),
  },
  {
    id: 'nav.analiticas',
    label: 'Analíticas',
    icon: TrendingUp,
    category: 'navigate',
    keywords: ['analytics', 'estadistica', 'reporte', 'ingreso'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/analiticas',
    execute: (ctx) => ctx.navigate('/analiticas'),
  },
  {
    id: 'nav.referencias',
    label: 'Referencias',
    icon: Share2,
    category: 'navigate',
    keywords: ['referencia', 'referido', 'compartir'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/referencias',
    execute: (ctx) => ctx.navigate('/referencias'),
  },
  {
    id: 'nav.changelog',
    label: 'Novedades',
    icon: History,
    category: 'navigate',
    keywords: ['novedad', 'cambio', 'version', 'update'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/changelog',
    execute: (ctx) => ctx.navigate('/changelog'),
  },
  {
    id: 'nav.configuracion',
    label: 'Configuración',
    icon: Settings,
    category: 'navigate',
    keywords: ['config', 'ajustes', 'preferencias'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion',
    execute: (ctx) => ctx.navigate('/configuracion'),
  },
  {
    id: 'nav.guia',
    label: 'Guía de Uso',
    icon: BookOpen,
    category: 'navigate',
    keywords: ['guia', 'ayuda', 'help', 'documentacion', 'tutorial', 'manual'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/guia',
    execute: (ctx) => ctx.navigate('/guia'),
  },
]

const settingsActions: ActionDefinition[] = [
  {
    id: 'settings.general',
    label: 'Información General',
    description: 'Nombre, teléfono, dirección',
    icon: Settings,
    category: 'settings',
    keywords: ['nombre', 'telefono', 'direccion', 'general'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/general',
    execute: (ctx) => ctx.navigate('/configuracion/general'),
  },
  {
    id: 'settings.horario',
    label: 'Horario de Atención',
    description: 'Días y horas de operación',
    icon: Clock,
    category: 'settings',
    keywords: ['horario', 'horarios', 'horas', 'apertura', 'cierre'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/horario',
    execute: (ctx) => ctx.navigate('/configuracion/horario'),
  },
  {
    id: 'settings.branding',
    label: 'Marca y Estilo',
    description: 'Colores, logo y personalización',
    icon: Palette,
    category: 'settings',
    keywords: ['marca', 'logo', 'color', 'estilo', 'branding'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/branding',
    execute: (ctx) => ctx.navigate('/configuracion/branding'),
  },
  {
    id: 'settings.equipo',
    label: 'Equipo y Accesos',
    description: 'Permisos de miembros del equipo',
    icon: UsersRound,
    category: 'settings',
    keywords: ['equipo', 'acceso', 'permiso', 'rol'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/equipo',
    execute: (ctx) => ctx.navigate('/configuracion/equipo'),
  },
  {
    id: 'settings.pagos',
    label: 'Métodos de Pago',
    description: 'Métodos de pago aceptados',
    icon: CreditCard,
    category: 'settings',
    keywords: ['pago', 'metodo', 'cobro', 'sinpe'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/pagos',
    execute: (ctx) => ctx.navigate('/configuracion/pagos'),
  },
  {
    id: 'settings.avanzado',
    label: 'Configuración Avanzada',
    description: 'Notificaciones, lealtad',
    icon: Wrench,
    category: 'settings',
    keywords: ['avanzado', 'notificacion', 'lealtad'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/configuracion/avanzado',
    execute: (ctx) => ctx.navigate('/configuracion/avanzado'),
  },
]

const utilityActions: ActionDefinition[] = [
  {
    id: 'business.copy-booking-link',
    label: 'Copiar Link de Reservas',
    description: 'Copia tu enlace de reservas al portapapeles',
    icon: Link2,
    category: 'create',
    keywords: ['link', 'enlace', 'reserva', 'compartir', 'copiar', 'booking', 'qr', 'url'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/dashboard',
    execute: (ctx) => {
      if (!ctx.slug) return
      const url = bookingAbsoluteUrl(ctx.slug)
      navigator.clipboard
        .writeText(url)
        .then(() => ctx.toast.info('Enlace copiado al portapapeles'))
        .catch(() => ctx.toast.error('No se pudo copiar'))
    },
  },
]

export function registerNavigationActions(): void {
  for (const action of [...navigationActions, ...settingsActions, ...utilityActions]) {
    actionRegistry.register(action)
  }
}
