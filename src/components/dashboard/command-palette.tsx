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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/contexts/business-context'
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
    keywords: ['miembro del equipo', 'equipo', 'staff', 'empleado'],
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
    keywords: ['horario', 'horas', 'apertura', 'cierre'],
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

// Simple fuzzy match
function matchCommand(command: Command, query: string): boolean {
  const q = query.toLowerCase()
  if (command.label.toLowerCase().includes(q)) return true
  if (command.description?.toLowerCase().includes(q)) return true
  return command.keywords.some((kw) => kw.includes(q))
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
  const { isBarber, staffPermissions } = useBusiness()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter commands by role — barbers only see paths they have access to
  const allowedCommands = useMemo(() => {
    if (!isBarber) return COMMANDS
    return COMMANDS.filter((cmd) => canBarberAccessPath(cmd.path, staffPermissions))
  }, [isBarber, staffPermissions])

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
    return allowedCommands.filter((cmd) => matchCommand(cmd, query))
  }, [query, allowedCommands])

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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Palette */}
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
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
                  className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                  aria-label="Buscar comandos"
                />
                <kbd className="inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-400">
                    Sin resultados para &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div key={group.category}>
                      <div className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {CATEGORY_LABELS[group.category]}
                      </div>
                      {group.items.map((cmd) => {
                        globalIndex++
                        const idx = globalIndex
                        const isSelected = idx === selectedIndex
                        const Icon = cmd.icon
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                              isSelected
                                ? 'bg-zinc-100 dark:bg-zinc-800'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                                cmd.category === 'create'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium text-zinc-900 dark:text-white truncate">
                                {cmd.label}
                              </div>
                              {cmd.description && (
                                <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono">
                    ↑↓
                  </kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono">
                    ↵
                  </kbd>
                  Ir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono">
                    esc
                  </kbd>
                  Cerrar
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
