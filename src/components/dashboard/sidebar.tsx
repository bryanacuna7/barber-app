'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  UserRound,
  TrendingUp,
  Share2,
  History,
  CalendarClock,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarState, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from './sidebar-state'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface NavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
}

const baseNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/citas', icon: Calendar },
  { name: 'Servicios', href: '/servicios', icon: Scissors },
  { name: 'Equipo', href: '/barberos', icon: UserRound },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Analíticas', href: '/analiticas', icon: TrendingUp },
  { name: 'Referencias', href: '/referencias', icon: Share2 },
  { name: 'Novedades', href: '/changelog', icon: History },
  { name: 'Guía', href: '/guia', icon: BookOpen },
]

const sidebarSections = [
  { id: 'operacion', label: 'Operación', items: ['/dashboard', '/citas', '/mi-dia', '/servicios'] },
  { id: 'gestion', label: 'Gestión', items: ['/barberos', '/clientes'] },
  { id: 'crecimiento', label: 'Crecimiento', items: ['/analiticas', '/referencias'] },
  { id: 'ayuda', label: 'Ayuda', items: ['/changelog', '/guia'] },
] as const

const SIDEBAR_TRANSITION_MS = 220
const SIDEBAR_TRANSITION_EASE = 'cubic-bezier(0.2, 0, 0, 1)'
const LABEL_STAGGER_MS = 25
const BASE_TRANSITION_STYLE = {
  transitionDuration: `${SIDEBAR_TRANSITION_MS}ms`,
  transitionTimingFunction: SIDEBAR_TRANSITION_EASE,
}

interface SidebarProps {
  isBarber?: boolean
}

interface SidebarContentProps {
  isBarber?: boolean
  collapsed: boolean
  pathname: string
  onLinkClick?: () => void
}

function NavItemEntry({
  item,
  isActive,
  collapsed,
  itemIndex,
  sectionLength,
  onLinkClick,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  itemIndex: number
  sectionLength: number
  onLinkClick?: () => void
}) {
  const labelDelay = collapsed
    ? Math.min(sectionLength - itemIndex - 1, 4) * 20
    : Math.min(itemIndex, 4) * LABEL_STAGGER_MS

  const content = (
    <Link
      href={item.href}
      onClick={onLinkClick}
      aria-label={collapsed ? item.name : undefined}
      className={cn(
        'group relative flex items-center rounded-xl text-sm font-medium transition-[background-color,color,padding,gap,width,height]',
        collapsed ? 'mx-auto h-8 w-8 justify-center p-0 rounded-lg' : 'w-full gap-3 px-3 py-2',
        isActive
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : collapsed
            ? 'text-zinc-600 hover:bg-zinc-100/90 dark:text-zinc-500 dark:hover:bg-zinc-800/80'
            : 'text-zinc-600 hover:bg-zinc-100/90 dark:text-zinc-500 dark:hover:bg-zinc-800/80'
      )}
      style={BASE_TRANSITION_STYLE}
    >
      <item.icon
        className={cn(
          'h-4 w-4 shrink-0 transition-opacity',
          isActive
            ? 'opacity-100'
            : collapsed
              ? 'opacity-85 group-hover:opacity-100'
              : 'opacity-70 group-hover:opacity-100'
        )}
        style={BASE_TRANSITION_STYLE}
      />
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-[max-width,opacity]',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100'
        )}
        style={{
          ...BASE_TRANSITION_STYLE,
          transitionDelay: `${labelDelay}ms`,
        }}
      >
        {item.name}
      </span>
    </Link>
  )

  if (!collapsed) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{item.name}</TooltipContent>
    </Tooltip>
  )
}

// ── Sidebar content ──

function SidebarContent({
  isBarber = false,
  collapsed,
  pathname,
  onLinkClick,
}: SidebarContentProps) {
  const navigation = isBarber
    ? [
        baseNavigation[0],
        baseNavigation[1],
        { name: 'Mi Día', href: '/mi-dia', icon: CalendarClock },
        ...baseNavigation.slice(2),
      ]
    : baseNavigation
  const navigationByHref = new Map(navigation.map((item) => [item.href, item]))
  const visibleSections = sidebarSections.flatMap((section) => {
    const sectionItems = section.items
      .map((href) => navigationByHref.get(href))
      .filter((item): item is NavItem => Boolean(item))

    if (sectionItems.length === 0) return []
    return [{ ...section, items: sectionItems }]
  })

  return (
    <>
      {/* Navigation */}
      <nav
        className={cn(
          'scrollbar-hide flex-1 overflow-y-auto py-3 transition-[padding]',
          collapsed ? 'space-y-0 px-0' : 'space-y-3 px-0'
        )}
        style={BASE_TRANSITION_STYLE}
      >
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.id}>
            {collapsed && sectionIndex > 0 && (
              <div className="mx-2 my-2.5 h-px bg-zinc-300/75 dark:bg-white/15" />
            )}
            <section
              className={cn(
                'overflow-hidden transition-[padding,border-radius,margin] duration-200',
                collapsed
                  ? 'mx-2 rounded-none bg-transparent p-0'
                  : 'mx-3 rounded-2xl border border-zinc-200/70 bg-white/55 p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-zinc-800/70 dark:bg-white/[0.03] dark:shadow-[0_10px_24px_rgba(0,0,0,0.24)]'
              )}
              style={BASE_TRANSITION_STYLE}
            >
              <div
                className={cn(
                  'overflow-hidden border-b border-zinc-200/70 px-1.5 dark:border-zinc-800/70 transition-[max-height,opacity,margin,padding]',
                  collapsed ? 'mb-0 max-h-0 pb-0 opacity-0' : 'mb-1.5 max-h-8 pb-1.5 opacity-100'
                )}
                style={BASE_TRANSITION_STYLE}
              >
                <p className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.label}
                </p>
              </div>

              <div className={cn(collapsed ? 'space-y-1.5 py-0.5' : 'space-y-0.5')}>
                {section.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <NavItemEntry
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      collapsed={collapsed}
                      itemIndex={itemIndex}
                      sectionLength={section.items.length}
                      onLinkClick={onLinkClick}
                    />
                  )
                })}
              </div>
            </section>
          </div>
        ))}
      </nav>
    </>
  )
}

// ── Main Sidebar component ──

export function Sidebar({ isBarber = false }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed } = useSidebarState()

  return (
    <aside
      id="dashboard-sidebar"
      data-tour="sidebar"
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col lg:overflow-hidden lg:after:content-[''] lg:after:absolute lg:after:inset-y-0 lg:after:right-0 lg:after:w-px lg:after:bg-zinc-200/50 dark:lg:after:bg-zinc-800/50 bg-gradient-to-b from-white/30 via-white/70 to-white/90 dark:from-zinc-900/30 dark:via-zinc-900/70 dark:to-zinc-900/90 backdrop-blur-md transition-[width]"
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        ...BASE_TRANSITION_STYLE,
      }}
    >
      <SidebarContent isBarber={isBarber} collapsed={collapsed} pathname={pathname} />
    </aside>
  )
}
