'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Scissors,
  CreditCard,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Gift,
  LogOut,
  LayoutDashboard,
  History,
  Shield,
  Users,
  Trophy,
  Target,
  BookOpen,
  Link2,
  Copy,
  Check,
  Share2,
} from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'
import { useToast } from '@/components/ui/toast'
import { bookingAbsoluteUrl } from '@/lib/utils/booking-url'
import type { StaffPermissions, UserRole } from '@/lib/auth/roles'

interface MoreMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
  isBarber?: boolean
}

// ── Section keys for grouping after permission filtering ──
type SectionKey = 'nav' | 'business' | 'activity' | 'support' | 'account'

interface MenuItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  description: string
  /** iOS-style icon: white icon on colored rounded-square */
  iconBg: string
  /** Section this item belongs to (used AFTER filtering) */
  section: SectionKey
  barberPermission?: keyof StaffPermissions
  ownerOnly?: boolean
  barberMenuOnly?: boolean
}

const sectionLabels: Record<SectionKey, string | null> = {
  nav: null, // no header for primary nav
  business: null,
  activity: null,
  support: null,
  account: null,
}

const menuItems: MenuItem[] = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen del negocio',
    iconBg: 'bg-indigo-500',
    section: 'nav',
    ownerOnly: true,
  },
  {
    name: 'Analíticas',
    href: '/analiticas',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    iconBg: 'bg-blue-500',
    section: 'nav',
    barberPermission: 'nav_analiticas',
  },
  {
    name: 'Lealtad',
    href: '/lealtad/configuracion',
    icon: Gift,
    description: 'Programa de recompensas',
    iconBg: 'bg-amber-500',
    section: 'nav',
    ownerOnly: true,
  },
  {
    name: 'Equipo',
    href: '/barberos',
    icon: Scissors,
    description: 'Gestionar equipo',
    iconBg: 'bg-violet-500',
    section: 'nav',
    ownerOnly: true,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    description: 'Lista de clientes',
    iconBg: 'bg-rose-500',
    section: 'nav',
    barberPermission: 'nav_clientes',
    barberMenuOnly: true,
  },
  {
    name: 'Suscripción',
    href: '/suscripcion',
    icon: CreditCard,
    description: 'Plan y facturación',
    iconBg: 'bg-emerald-500',
    section: 'business',
    ownerOnly: true,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del negocio',
    iconBg: 'bg-zinc-500',
    section: 'business',
    ownerOnly: true,
  },
  {
    name: 'Logros',
    href: '/barberos/logros',
    icon: Trophy,
    description: 'Logros del equipo',
    iconBg: 'bg-yellow-500',
    section: 'activity',
  },
  {
    name: 'Desafíos',
    href: '/barberos/desafios',
    icon: Target,
    description: 'Competencias y retos',
    iconBg: 'bg-orange-500',
    section: 'activity',
  },
  {
    name: 'Novedades',
    href: '/changelog',
    icon: History,
    description: 'Versiones y cambios',
    iconBg: 'bg-cyan-500',
    section: 'activity',
    ownerOnly: true,
  },
  {
    name: 'Guía de Uso',
    href: '/guia',
    icon: BookOpen,
    description: 'Aprende a usar la app',
    iconBg: 'bg-blue-500',
    section: 'support',
  },
  {
    name: 'Cuenta y seguridad',
    href: '/mi-dia/cuenta',
    icon: Shield,
    description: 'Cambiar contraseña',
    iconBg: 'bg-teal-500',
    section: 'account',
    barberMenuOnly: true,
  },
]

const serviciosMenuItem: MenuItem = {
  name: 'Servicios',
  href: '/servicios',
  icon: Scissors,
  description: 'Gestionar servicios y precios',
  iconBg: 'bg-violet-500',
  section: 'nav',
}

const externalLinks = [
  {
    name: 'Soporte',
    href: 'https://wa.me/50687175866',
    icon: HelpCircle,
    external: true,
  },
]

function dedupeMenuItemsByHref(items: MenuItem[]): MenuItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.href)) return false
    seen.add(item.href)
    return true
  })
}

/** Group filtered items by section, preserving order */
function groupBySection(items: MenuItem[]): { key: SectionKey; items: MenuItem[] }[] {
  const order: SectionKey[] = ['nav', 'business', 'activity', 'support', 'account']
  const map = new Map<SectionKey, MenuItem[]>()
  for (const item of items) {
    const list = map.get(item.section) ?? []
    list.push(item)
    map.set(item.section, list)
  }
  return order.filter((k) => map.has(k)).map((k) => ({ key: k, items: map.get(k)! }))
}

// ── iOS-style row ──

function IOSRow({
  href,
  icon: Icon,
  iconBg,
  label,
  isActive,
  isLast,
  onClick,
}: {
  href: string
  icon: typeof LayoutDashboard
  iconBg: string
  label: string
  isActive: boolean
  isLast: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-white/5',
        isActive && 'bg-white/5'
      )}
    >
      {/* iOS colored square icon */}
      <div
        className={cn(
          'flex-shrink-0 w-[29px] h-[29px] rounded-[7px] flex items-center justify-center',
          iconBg
        )}
      >
        <Icon className="h-[17px] w-[17px] text-white" strokeWidth={2} />
      </div>

      {/* Label + chevron with separator */}
      <div
        className={cn(
          'flex flex-1 items-center justify-between min-h-[44px] pr-1',
          !isLast && 'border-b border-zinc-700/50'
        )}
      >
        <span
          className={cn('text-[17px] leading-tight', isActive ? 'text-white' : 'text-zinc-100')}
        >
          {label}
        </span>
        <ChevronRight className="h-[18px] w-[18px] text-zinc-500 flex-shrink-0" strokeWidth={2.5} />
      </div>
    </Link>
  )
}

// ── Share Link (preserved with full behavior) ──

function ShareLinkItem({ isBarberRole, onClose }: { isBarberRole: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  let slug: string | undefined
  try {
    const ctx = useBusiness()
    slug = ctx.slug
  } catch {
    slug = undefined
  }

  if (isBarberRole || !slug) return null

  const handleCopy = () => {
    const url = bookingAbsoluteUrl(slug!)
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true)
        toast.info('Enlace copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        toast.error('No se pudo copiar')
      })
  }

  const handleShare = () => {
    const url = bookingAbsoluteUrl(slug!)
    if (navigator.share) {
      navigator.share({ title: 'Link de Reservas', url }).catch(() => {})
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Reserva tu cita 💈\n👉 ${url}`)}`,
        '_blank'
      )
    }
    onClose()
  }

  return (
    <div className="mb-5">
      <div className="rounded-xl bg-zinc-800/80 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-blue-500 flex items-center justify-center">
            <Link2 className="h-[17px] w-[17px] text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] text-zinc-100">Link de Reservas</p>
            <p className="text-[13px] text-zinc-400">Comparte con tus clientes</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-zinc-700/50 mx-4 mb-3 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-[38px] items-center justify-center gap-1.5 bg-zinc-700/80 text-[14px] font-medium text-zinc-200 transition-colors active:bg-zinc-600"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-[38px] items-center justify-center gap-1.5 bg-zinc-700/80 text-[14px] font-medium text-zinc-200 transition-colors active:bg-zinc-600"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── iOS Settings-style card group ──

function SettingsGroup({ children, label }: { children: React.ReactNode; label?: string | null }) {
  return (
    <div>
      {label && (
        <p className="text-[13px] font-medium uppercase tracking-wide text-zinc-400 px-4 pb-1.5">
          {label}
        </p>
      )}
      <div className="rounded-xl bg-zinc-800/80 overflow-hidden">{children}</div>
    </div>
  )
}

// ── Main Component ──

export function MoreMenuDrawer({
  isOpen,
  onClose,
  isAdmin = false,
  isBarber = false,
}: MoreMenuDrawerProps) {
  const pathname = usePathname()

  // ── Role + permissions (UNTOUCHED logic from original) ──
  let userRole: UserRole = 'owner'
  let staffPermissions: StaffPermissions = {
    nav_citas: true,
    nav_servicios: true,
    nav_clientes: false,
    nav_analiticas: false,
    nav_changelog: true,
    can_create_citas: true,
    can_view_all_citas: false,
  }
  try {
    const ctx = useBusiness()
    userRole = ctx.userRole
    staffPermissions = ctx.staffPermissions
    isBarber = ctx.isBarber
  } catch {
    userRole = isBarber ? 'barber' : isAdmin ? 'admin' : 'owner'
  }

  const isBarberRole = userRole === 'barber'
  const isOwnerBarber = isBarber && (userRole === 'owner' || userRole === 'admin')

  // ── Filter FIRST by role/permissions (P1: preserved exactly) ──
  const filteredItems = (() => {
    if (!isBarberRole) {
      const ownerItems = menuItems.filter((item) => !item.barberMenuOnly)
      const items = isOwnerBarber ? [serviciosMenuItem, ...ownerItems] : ownerItems
      return dedupeMenuItemsByHref(items)
    }

    const items: MenuItem[] = []
    for (const item of menuItems) {
      if (item.ownerOnly) continue
      if (item.barberPermission) {
        if (staffPermissions[item.barberPermission]) {
          items.push(item)
        }
      } else {
        items.push(item)
      }
    }
    return dedupeMenuItemsByHref(items)
  })()

  // ── THEN group by section (P1: filter → group) ──
  const sections = groupBySection(filteredItems)

  const handleLinkClick = () => {
    onClose()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Más opciones" showCloseButton={false}>
      <div className="space-y-5 pb-2">
        {/* Share Link block (P1: preserved with full behavior) */}
        <ShareLinkItem isBarberRole={isBarberRole} onClose={onClose} />

        {/* iOS-style grouped sections */}
        {sections.map(({ key, items }) => (
          <SettingsGroup key={key} label={sectionLabels[key]}>
            {items.map((item, i) => (
              <IOSRow
                key={item.href}
                href={item.href}
                icon={item.icon}
                iconBg={item.iconBg}
                label={item.name}
                isActive={pathname === item.href}
                isLast={i === items.length - 1}
                onClick={handleLinkClick}
              />
            ))}
          </SettingsGroup>
        ))}

        {/* Panel Admin (P2: preserved for admins) */}
        {isAdmin && (
          <SettingsGroup>
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-white/5',
                pathname === '/admin' && 'bg-white/5'
              )}
            >
              <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-purple-500 flex items-center justify-center">
                <Shield className="h-[17px] w-[17px] text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-1 items-center justify-between min-h-[44px] pr-1">
                <span className="text-[17px] text-zinc-100">Panel Admin</span>
                <ChevronRight
                  className="h-[18px] w-[18px] text-zinc-500 flex-shrink-0"
                  strokeWidth={2.5}
                />
              </div>
            </Link>
          </SettingsGroup>
        )}

        {/* Support (external links) + Logout in one group */}
        <SettingsGroup>
          {!isBarberRole &&
            externalLinks.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-white/5"
                >
                  <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-zinc-500 flex items-center justify-center">
                    <Icon className="h-[17px] w-[17px] text-white" strokeWidth={2} />
                  </div>
                  <div className="flex flex-1 items-center justify-between min-h-[44px] pr-1 border-b border-zinc-700/50">
                    <span className="text-[17px] text-zinc-100">{item.name}</span>
                    <ExternalLink className="h-[15px] w-[15px] text-zinc-500 flex-shrink-0" />
                  </div>
                </a>
              )
            })}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex w-full items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-white/5"
          >
            <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-red-500 flex items-center justify-center">
              <LogOut className="h-[17px] w-[17px] text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-1 items-center min-h-[44px] pr-1">
              <span className="text-[17px] text-red-400">Cerrar Sesión</span>
            </div>
          </button>
        </SettingsGroup>

        {/* Version footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-1 text-center"
        >
          <p className="text-[13px] text-zinc-500">
            BarberApp v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.9.8'}
          </p>
        </motion.div>
      </div>
    </Drawer>
  )
}
