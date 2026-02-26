'use client'

import { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search,
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  UserRound,
  TrendingUp,
  Share2,
  History,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  Palette,
  CreditCard,
  UsersRound,
  Wrench,
  BookOpen,
  Link2,
} from 'lucide-react'
import Fuse from 'fuse.js'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/contexts/business-context'
import { useToast } from '@/components/ui/toast'
import { bookingAbsoluteUrl } from '@/lib/utils/booking-url'
import { canBarberAccessPath } from '@/lib/auth/roles'

// --- Context for opening the palette from anywhere ---

interface CommandPaletteContextType {
  open: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({ open: () => {} })

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}

// --- Command definitions ---

type CommandCategory = 'navigate' | 'create' | 'settings'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  category: CommandCategory
  keywords: string[]
  /** Path used for role-based filtering via canBarberAccessPath */
  path: string
  action: (router: ReturnType<typeof useRouter>) => void
}

const COMMANDS: Command[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    category: 'navigate',
    keywords: ['inicio', 'home', 'panel'],
    path: '/dashboard',
    action: (r) => r.push('/dashboard'),
  },
  {
    id: 'nav-citas',
    label: 'Citas',
    icon: Calendar,
    category: 'navigate',
    keywords: ['cita', 'reserva', 'agenda', 'calendario'],
    path: '/citas',
    action: (r) => r.push('/citas'),
  },
  {
    id: 'nav-servicios',
    label: 'Servicios',
    icon: Scissors,
    category: 'navigate',
    keywords: ['servicio', 'corte', 'barba', 'precio'],
    path: '/servicios',
    action: (r) => r.push('/servicios'),
  },
  {
    id: 'nav-barberos',
    label: 'Equipo',
    icon: UserRound,
    category: 'navigate',
    keywords: ['miembro del equipo', 'equipo', 'staff', 'empleado', 'barbero'],
    path: '/barberos',
    action: (r) => r.push('/barberos'),
  },
  {
    id: 'nav-clientes',
    label: 'Clientes',
    icon: Users,
    category: 'navigate',
    keywords: ['cliente', 'contacto', 'persona'],
    path: '/clientes',
    action: (r) => r.push('/clientes'),
  },
  {
    id: 'nav-analiticas',
    label: 'Analíticas',
    icon: TrendingUp,
    category: 'navigate',
    keywords: ['analytics', 'estadistica', 'reporte', 'ingreso'],
    path: '/analiticas',
    action: (r) => r.push('/analiticas'),
  },
  {
    id: 'nav-referencias',
    label: 'Referencias',
    icon: Share2,
    category: 'navigate',
    keywords: ['referencia', 'referido', 'compartir'],
    path: '/referencias',
    action: (r) => r.push('/referencias'),
  },
  {
    id: 'nav-changelog',
    label: 'Novedades',
    icon: History,
    category: 'navigate',
    keywords: ['novedad', 'cambio', 'version', 'update'],
    path: '/changelog',
    action: (r) => r.push('/changelog'),
  },
  {
    id: 'nav-configuracion',
    label: 'Configuración',
    icon: Settings,
    category: 'navigate',
    keywords: ['config', 'ajustes', 'preferencias'],
    path: '/configuracion',
    action: (r) => r.push('/configuracion'),
  },
  {
    id: 'nav-guia',
    label: 'Guía de Uso',
    icon: BookOpen,
    category: 'navigate',
    keywords: ['guia', 'ayuda', 'help', 'documentacion', 'tutorial', 'manual'],
    path: '/guia',
    action: (r) => r.push('/guia'),
  },
  // Settings subroutes
  {
    id: 'nav-config-general',
    label: 'Información General',
    description: 'Nombre, teléfono, dirección',
    icon: Settings,
    category: 'settings',
    keywords: ['nombre', 'telefono', 'direccion', 'general'],
    path: '/configuracion/general',
    action: (r) => r.push('/configuracion/general'),
  },
  {
    id: 'nav-config-horario',
    label: 'Horario de Atención',
    description: 'Días y horas de operación',
    icon: Clock,
    category: 'settings',
    keywords: ['horario', 'horarios', 'horas', 'apertura', 'cierre'],
    path: '/configuracion/horario',
    action: (r) => r.push('/configuracion/horario'),
  },
  {
    id: 'nav-config-branding',
    label: 'Marca y Estilo',
    description: 'Colores, logo y personalización',
    icon: Palette,
    category: 'settings',
    keywords: ['marca', 'logo', 'color', 'estilo', 'branding'],
    path: '/configuracion/branding',
    action: (r) => r.push('/configuracion/branding'),
  },
  {
    id: 'nav-config-equipo',
    label: 'Equipo y Accesos',
    description: 'Permisos de miembros del equipo',
    icon: UsersRound,
    category: 'settings',
    keywords: ['equipo', 'acceso', 'permiso', 'rol'],
    path: '/configuracion/equipo',
    action: (r) => r.push('/configuracion/equipo'),
  },
  {
    id: 'nav-config-pagos',
    label: 'Métodos de Pago',
    description: 'Métodos de pago aceptados',
    icon: CreditCard,
    category: 'settings',
    keywords: ['pago', 'metodo', 'cobro', 'sinpe'],
    path: '/configuracion/pagos',
    action: (r) => r.push('/configuracion/pagos'),
  },
  {
    id: 'nav-config-avanzado',
    label: 'Configuración Avanzada',
    description: 'Notificaciones, lealtad',
    icon: Wrench,
    category: 'settings',
    keywords: ['avanzado', 'notificacion', 'lealtad'],
    path: '/configuracion/avanzado',
    action: (r) => r.push('/configuracion/avanzado'),
  },
  // Quick actions
  {
    id: 'create-cita',
    label: 'Nueva Cita',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nueva', 'cita', 'reserva', 'agendar'],
    path: '/citas',
    action: (r) => r.push('/citas?intent=create'),
  },
  {
    id: 'create-cliente',
    label: 'Nuevo Cliente',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nuevo', 'cliente', 'agregar'],
    path: '/clientes',
    action: (r) => r.push('/clientes?intent=create'),
  },
  {
    id: 'create-servicio',
    label: 'Nuevo Servicio',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nuevo', 'servicio', 'agregar'],
    path: '/servicios',
    action: (r) => r.push('/servicios?intent=create'),
  },
]

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  create: 'Acciones Rápidas',
  navigate: 'Navegación',
  settings: 'Configuración',
}

const CATEGORY_COLORS: Record<CommandCategory, { bg: string; text: string }> = {
  create: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  navigate: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
  settings: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
}

// --- Component ---

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change (React pattern: adjust state during render, not in effect)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  // Global Cmd+K shortcut — lives at provider level so it always works
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const ctxValue = useMemo(() => ({ open: () => setIsOpen(true) }), [])

  return (
    <CommandPaletteContext.Provider value={ctxValue}>
      {children}
      <CommandPaletteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </CommandPaletteContext.Provider>
  )
}

function CommandPaletteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const { isBarber, isOwner, staffPermissions, slug } = useBusiness()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Dynamic commands that need context (slug, toast)
  const dynamicCommands = useMemo((): Command[] => {
    if (!slug) return []
    return [
      {
        id: 'copy-booking-link',
        label: 'Copiar Link de Reservas',
        description: 'Copia tu enlace de reservas al portapapeles',
        icon: Link2,
        category: 'create',
        keywords: ['link', 'enlace', 'reserva', 'compartir', 'copiar', 'booking', 'qr', 'url'],
        path: '/dashboard',
        action: () => {
          const url = bookingAbsoluteUrl(slug)
          navigator.clipboard
            .writeText(url)
            .then(() => {
              toast.info('Enlace copiado al portapapeles')
            })
            .catch(() => {
              toast.error('No se pudo copiar')
            })
        },
      },
    ]
  }, [slug, toast])

  const allCommands = useMemo(() => [...COMMANDS, ...dynamicCommands], [dynamicCommands])

  // Filter commands by role — barbers only see paths they have access to
  // Owners always see all commands even if they're also in the barbers table
  const allowedCommands = useMemo(() => {
    if (!isBarber || isOwner) return allCommands
    return allCommands.filter((cmd) => canBarberAccessPath(cmd.path, staffPermissions))
  }, [isBarber, isOwner, staffPermissions, allCommands])

  // Fuse.js fuzzy search — handles typos, plurals, partial matches
  const fuse = useMemo(
    () =>
      new Fuse(allowedCommands, {
        keys: [
          { name: 'label', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [allowedCommands]
  )

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Filtered & grouped results
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allowedCommands
    return fuse.search(query).map((r) => r.item)
  }, [query, allowedCommands, fuse])

  // Group by category, preserve order
  const grouped = useMemo(() => {
    const order: CommandCategory[] = ['create', 'navigate', 'settings']
    const groups: { category: CommandCategory; items: Command[] }[] = []
    for (const cat of order) {
      const items = filteredCommands.filter((c) => c.category === cat)
      if (items.length > 0) groups.push({ category: cat, items })
    }
    return groups
  }, [filteredCommands])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  const handleSelect = useCallback(
    (command: Command) => {
      command.action(router)
      onClose()
    },
    [router, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatList.length === 0) {
        if (e.key === 'Escape') onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % flatList.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + flatList.length) % flatList.length)
      } else if (e.key === 'Enter' && flatList[selectedIndex]) {
        e.preventDefault()
        handleSelect(flatList[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [flatList, selectedIndex, handleSelect, onClose]
  )

  if (!isOpen) return null

  let globalIndex = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Palette */}
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-zinc-200/60 dark:border-zinc-700/60 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-700/80">
                <Search
                  className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0"
                  strokeWidth={2.5}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar o ir a..."
                  className="flex-1 bg-transparent text-[15px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
                  aria-label="Buscar comandos"
                />
                <kbd className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-400 shadow-sm">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[420px] overflow-y-auto">
                {flatList.length === 0 ? (
                  <div className="py-14 px-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
                      <Search className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Sin resultados
                    </p>
                    <p className="text-[13px] text-muted">
                      No se encontraron comandos para &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {grouped.map((group) => (
                      <div key={group.category}>
                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {CATEGORY_LABELS[group.category]}
                        </div>
                        {group.items.map((cmd) => {
                          globalIndex++
                          const idx = globalIndex
                          const isSelected = idx === selectedIndex
                          const Icon = cmd.icon
                          const catColors = CATEGORY_COLORS[cmd.category]
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSelect(cmd)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                'relative flex w-full items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all duration-150 text-left',
                                isSelected
                                  ? 'bg-zinc-100 dark:bg-zinc-800'
                                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                              )}
                            >
                              {/* Selected indicator */}
                              {isSelected && (
                                <motion.div
                                  layoutId="cmd-palette-indicator"
                                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-zinc-900 dark:bg-white"
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors duration-150',
                                  isSelected
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                                    : cmd.category === 'create'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                )}
                              >
                                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={cn(
                                    'font-semibold truncate transition-colors duration-150',
                                    isSelected
                                      ? 'text-zinc-900 dark:text-white'
                                      : 'text-zinc-700 dark:text-zinc-200'
                                  )}
                                >
                                  {cmd.label}
                                </div>
                                {cmd.description && (
                                  <div className="text-[12px] text-muted truncate mt-0.5">
                                    {cmd.description}
                                  </div>
                                )}
                              </div>
                              {/* Category badge (only when searching) */}
                              {query.trim() && (
                                <span
                                  className={cn(
                                    'hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md',
                                    catColors.bg,
                                    catColors.text
                                  )}
                                >
                                  {CATEGORY_LABELS[cmd.category]}
                                </span>
                              )}
                              <ArrowRight
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-all duration-150',
                                  isSelected
                                    ? 'text-zinc-500 dark:text-zinc-400 translate-x-0.5'
                                    : 'text-zinc-300 dark:text-zinc-600'
                                )}
                              />
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-5 px-5 py-3 border-t border-zinc-200/80 dark:border-zinc-700/80 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <kbd className="min-w-[26px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center shadow-sm">
                    ↑↓
                  </kbd>
                  <span className="font-medium">Navegar</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="min-w-[26px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center shadow-sm">
                    ↵
                  </kbd>
                  <span className="font-medium">Ir</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono shadow-sm">
                    esc
                  </kbd>
                  <span className="font-medium">Cerrar</span>
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
