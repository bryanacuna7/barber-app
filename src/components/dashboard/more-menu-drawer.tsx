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
type SectionKey = 'operacion' | 'gestion' | 'crecimiento' | 'actividad' | 'ayuda' | 'cuenta'

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

const SECTION_ORDER: SectionKey[] = [
  'operacion',
  'gestion',
  'crecimiento',
  'actividad',
  'ayuda',
  'cuenta',
]

const menuItems: MenuItem[] = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen del negocio',
    iconBg: 'bg-indigo-500',
    section: 'operacion',
    ownerOnly: true,
  },
  {
    name: 'Analíticas',
    href: '/analiticas',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    iconBg: 'bg-blue-500',
    section: 'crecimiento',
    barberPermission: 'nav_analiticas',
  },
  {
    name: 'Lealtad',
    href: '/lealtad/configuracion',
    icon: Gift,
    description: 'Programa de recompensas',
    iconBg: 'bg-amber-500',
    section: 'crecimiento',
    ownerOnly: true,
  },
  {
    name: 'Equipo',
    href: '/barberos',
    icon: Scissors,
    description: 'Gestionar equipo',
    iconBg: 'bg-violet-500',
    section: 'gestion',
    ownerOnly: true,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    description: 'Lista de clientes',
    iconBg: 'bg-rose-500',
    section: 'gestion',
    barberPermission: 'nav_clientes',
    barberMenuOnly: true,
  },
  {
    name: 'Suscripción',
    href: '/suscripcion',
    icon: CreditCard,
    description: 'Plan y facturación',
    iconBg: 'bg-emerald-500',
    section: 'cuenta',
    ownerOnly: true,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del negocio',
    iconBg: 'bg-zinc-500',
    section: 'cuenta',
    ownerOnly: true,
  },
  {
    name: 'Logros',
    href: '/barberos/logros',
    icon: Trophy,
    description: 'Logros del equipo',
    iconBg: 'bg-yellow-500',
    section: 'actividad',
  },
  {
    name: 'Desafíos',
    href: '/barberos/desafios',
    icon: Target,
    description: 'Competencias y retos',
    iconBg: 'bg-orange-500',
    section: 'actividad',
  },
  {
    name: 'Novedades',
    href: '/changelog',
    icon: History,
    description: 'Versiones y cambios',
    iconBg: 'bg-cyan-500',
    section: 'ayuda',
    ownerOnly: true,
  },
  {
    name: 'Guía de Uso',
    href: '/guia',
    icon: BookOpen,
    description: 'Aprende a usar la app',
    iconBg: 'bg-blue-500',
    section: 'ayuda',
  },
  {
    name: 'Cuenta y seguridad',
    href: '/mi-dia/cuenta',
    icon: Shield,
    description: 'Cambiar contraseña',
    iconBg: 'bg-teal-500',
    section: 'cuenta',
    barberMenuOnly: true,
  },
]

const serviciosMenuItem: MenuItem = {
  name: 'Servicios',
  href: '/servicios',
  icon: Scissors,
  description: 'Gestionar servicios y precios',
  iconBg: 'bg-violet-500',
  section: 'operacion',
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

function chunkIntoCards(items: MenuItem[]): MenuItem[][] {
  if (items.length === 0) return []

  const cards: MenuItem[][] = []
  for (let i = 0; i < items.length; i += 3) {
    cards.push(items.slice(i, i + 3))
  }

  // Avoid tiny trailing cards (e.g. 1-2 items) by merging into previous card.
  if (cards.length > 1 && cards[cards.length - 1].length < 3) {
    const trailing = cards.pop()
    if (trailing) {
      cards[cards.length - 1] = [...cards[cards.length - 1], ...trailing]
    }
  }

  return cards
}

/**
 * Build visual cards without section titles.
 * Keep growth metrics/actions together in one card when available:
 * Analíticas + Lealtad + Logros + Desafíos.
 */
function buildMenuCards(items: MenuItem[]): MenuItem[][] {
  const orderedItems = SECTION_ORDER.flatMap((section) =>
    items.filter((item) => item.section === section)
  )

  const growthClusterHrefs = [
    '/analiticas',
    '/lealtad/configuracion',
    '/barberos/logros',
    '/barberos/desafios',
  ]
  const growthClusterSet = new Set(growthClusterHrefs)
  const growthClusterItems = growthClusterHrefs
    .map((href) => orderedItems.find((item) => item.href === href))
    .filter((item): item is MenuItem => Boolean(item))

  if (growthClusterItems.length < 3) {
    return chunkIntoCards(orderedItems)
  }

  const firstClusterIndex = orderedItems.findIndex((item) => growthClusterSet.has(item.href))
  if (firstClusterIndex < 0) {
    return chunkIntoCards(orderedItems)
  }

  const remainingItems = orderedItems.filter((item) => !growthClusterSet.has(item.href))
  const remainingBeforeCount = orderedItems
    .slice(0, firstClusterIndex)
    .filter((item) => !growthClusterSet.has(item.href)).length

  const beforeCluster = remainingItems.slice(0, remainingBeforeCount)
  const afterCluster = remainingItems.slice(remainingBeforeCount)

  return [...chunkIntoCards(beforeCluster), growthClusterItems, ...chunkIntoCards(afterCluster)]
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
        'flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors',
        'active:bg-zinc-100 dark:active:bg-white/5',
        isActive && 'bg-zinc-100 dark:bg-white/5'
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
          !isLast && 'border-b border-zinc-200 dark:border-zinc-700/50'
        )}
      >
        <span
          className={cn(
            'text-[17px] leading-tight',
            isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-100'
          )}
        >
          {label}
        </span>
        <ChevronRight
          className="h-[18px] w-[18px] text-zinc-400 dark:text-zinc-500 flex-shrink-0"
          strokeWidth={2.5}
        />
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
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden dark:border-zinc-700 dark:bg-zinc-800/80">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-blue-500 flex items-center justify-center">
            <Link2 className="h-[17px] w-[17px] text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] text-zinc-900 dark:text-zinc-100">Link de Reservas</p>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
              Comparte con tus clientes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-700/50 mx-4 mb-3 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-[38px] items-center justify-center gap-1.5 bg-white text-[14px] font-medium text-zinc-700 transition-colors active:bg-zinc-100 dark:bg-zinc-700/80 dark:text-zinc-200 dark:active:bg-zinc-600"
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
            className="flex h-[38px] items-center justify-center gap-1.5 bg-white text-[14px] font-medium text-zinc-700 transition-colors active:bg-zinc-100 dark:bg-zinc-700/80 dark:text-zinc-200 dark:active:bg-zinc-600"
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

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden dark:border-zinc-700 dark:bg-zinc-800/80">
        {children}
      </div>
    </div>
  )
}

// ── User profile header ──

function UserProfileHeader() {
  let userEmail: string | undefined
  let userName: string | undefined
  let userAvatarUrl: string | undefined
  try {
    const ctx = useBusiness()
    userEmail = ctx.userEmail
    userName = ctx.userName
    userAvatarUrl = ctx.userAvatarUrl
  } catch {
    return null
  }

  const displayName = userName || userEmail?.split('@')[0] || 'Usuario'

  return (
    <div className="flex items-center gap-3 px-1 pb-1">
      {userAvatarUrl ? (
        <img
          src={userAvatarUrl}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
          <Users className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-semibold text-zinc-900 dark:text-white">
          {displayName}
        </p>
        {userEmail && (
          <p className="truncate text-[13px] text-zinc-500 dark:text-zinc-400">{userEmail}</p>
        )}
      </div>
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

  // ── Build visual cards (no card titles + min 3 items per card when possible) ──
  const menuCards = buildMenuCards(filteredItems)

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
        {/* User profile */}
        <UserProfileHeader />

        {/* Share Link block (P1: preserved with full behavior) */}
        <ShareLinkItem isBarberRole={isBarberRole} onClose={onClose} />

        {/* iOS-style grouped cards */}
        {menuCards.map((items, cardIndex) => (
          <SettingsGroup key={`menu-card-${cardIndex}`}>
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

        {/* Soporte */}
        {!isBarberRole && (
          <SettingsGroup>
            {externalLinks.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-zinc-100 dark:active:bg-white/5"
                >
                  <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-zinc-500 flex items-center justify-center">
                    <Icon className="h-[17px] w-[17px] text-white" strokeWidth={2} />
                  </div>
                  <div className="flex flex-1 items-center justify-between min-h-[44px] pr-1">
                    <span className="text-[17px] text-zinc-800 dark:text-zinc-100">
                      {item.name}
                    </span>
                    <ExternalLink className="h-[15px] w-[15px] text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                  </div>
                </a>
              )
            })}
          </SettingsGroup>
        )}

        {/* Sesión */}
        <SettingsGroup>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors',
                'active:bg-zinc-100 dark:active:bg-white/5',
                pathname === '/admin' && 'bg-zinc-100 dark:bg-white/5'
              )}
            >
              <div className="flex-shrink-0 w-[29px] h-[29px] rounded-[7px] bg-purple-500 flex items-center justify-center">
                <Shield className="h-[17px] w-[17px] text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-1 items-center justify-between min-h-[44px] pr-1 border-b border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[17px] text-zinc-800 dark:text-zinc-100">Panel Admin</span>
                <ChevronRight
                  className="h-[18px] w-[18px] text-zinc-400 dark:text-zinc-500 flex-shrink-0"
                  strokeWidth={2.5}
                />
              </div>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex w-full items-center gap-3 pl-4 pr-3 min-h-[44px] transition-colors active:bg-zinc-100 dark:active:bg-white/5"
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
