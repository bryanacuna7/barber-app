'use client'

import { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, ArrowRight, Pin, PinOff, Keyboard } from 'lucide-react'
import Fuse from 'fuse.js'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { animations, reducedMotion as reducedMotionTokens } from '@/lib/design-system'
import { useBusiness } from '@/contexts/business-context'
import { useToast } from '@/components/ui/toast'
import { usePreference } from '@/lib/preferences'
import { CommandShortcutsHelp } from './command-shortcuts-help'
import { actionRegistry, registerAllActions, migrateCommandIds } from '@/lib/actions'
import type { ActionDefinition, ActionCategory, ActionContext } from '@/lib/actions'

// --- Context for opening the palette from anywhere ---

interface CommandPaletteContextType {
  open: () => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  open: () => {},
  toggle: () => {},
})

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}

// --- Registry-driven command data ---

// Ensure actions are registered before palette renders (idempotent)
registerAllActions()
migrateCommandIds()

const PALETTE_CATEGORIES: ActionCategory[] = ['create', 'navigate', 'settings']

const CATEGORY_LABELS: Record<string, string> = {
  create: 'Acciones Rápidas',
  navigate: 'Navegación',
  settings: 'Configuración',
  entity: 'Acciones',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  create: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  navigate: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
  settings: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
  entity: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-700 dark:text-violet-300',
  },
}

const RECENT_KEY = 'command_palette_recent_ids_v1'
const PINNED_KEY = 'command_palette_pinned_ids_v1'
const MAX_RECENT = 8
const MAX_PINNED = 6

function sanitizeStringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    unique.add(trimmed)
    if (unique.size >= max) break
  }
  return Array.from(unique)
}

function listsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// --- Component ---

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openVersion, setOpenVersion] = useState(0)
  const [showShortcutsHelpGlobal, setShowShortcutsHelpGlobal] = useState(false)
  const pathname = usePathname()

  // Close on route change (React pattern: adjust state during render, not in effect)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  // Listen for global shortcut:open-help event (fired by ShortcutProvider)
  useEffect(() => {
    function handleOpenHelp() {
      setShowShortcutsHelpGlobal(true)
    }
    window.addEventListener('shortcut:open-help', handleOpenHelp)
    return () => window.removeEventListener('shortcut:open-help', handleOpenHelp)
  }, [])

  const ctxValue = useMemo(
    () => ({
      open: () => {
        setOpenVersion((version) => version + 1)
        setIsOpen(true)
      },
      toggle: () => {
        setIsOpen((prev) => {
          if (prev) return false
          setOpenVersion((version) => version + 1)
          return true
        })
      },
    }),
    []
  )

  return (
    <CommandPaletteContext.Provider value={ctxValue}>
      {children}
      <CommandPaletteModal
        key={openVersion}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpenShortcutsHelp={() => setShowShortcutsHelpGlobal(true)}
      />
      <CommandShortcutsHelp
        isOpen={showShortcutsHelpGlobal}
        onClose={() => setShowShortcutsHelpGlobal(false)}
      />
    </CommandPaletteContext.Provider>
  )
}

function CommandPaletteModal({
  isOpen,
  onClose,
  onOpenShortcutsHelp,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenShortcutsHelp: () => void
}) {
  const router = useRouter()
  const { isBarber, isOwner, staffPermissions, slug, businessId } = useBusiness()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentPref, setRecentPref] = usePreference<string[]>(RECENT_KEY, [])
  const [pinnedPref, setPinnedPref] = usePreference<string[]>(PINNED_KEY, [])
  const inputRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const recentIds = useMemo(() => sanitizeStringList(recentPref, MAX_RECENT), [recentPref])
  const pinnedIds = useMemo(() => sanitizeStringList(pinnedPref, MAX_PINNED), [pinnedPref])

  // ActionContext for executing actions — decoupled from useRouter
  const actionCtx = useMemo(
    (): ActionContext => ({
      navigate: (path: string) => router.push(path),
      businessId: businessId ?? '',
      slug: slug ?? undefined,
      toast: {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
      },
    }),
    [router, businessId, slug, toast]
  )

  // Get visible global-scope actions from registry (centralized permission filtering)
  const visibleActions = useMemo(() => {
    const actions = actionRegistry.getVisibleActions({
      scope: 'global',
      isOwner: isOwner ?? false,
      isBarber: isBarber ?? false,
      staffPermissions: staffPermissions ?? undefined,
    })
    // Hide booking link when slug is unavailable
    if (!slug) return actions.filter((a) => a.id !== 'business.copy-booking-link')
    return actions
  }, [isOwner, isBarber, staffPermissions, slug])

  const commandMap = useMemo(() => {
    return new Map(visibleActions.map((action) => [action.id, action]))
  }, [visibleActions])

  const validPinnedIds = useMemo(
    () => pinnedIds.filter((id) => commandMap.has(id)).slice(0, MAX_PINNED),
    [pinnedIds, commandMap]
  )

  const validRecentIds = useMemo(
    () => recentIds.filter((id) => commandMap.has(id)).slice(0, MAX_RECENT),
    [recentIds, commandMap]
  )

  // Keep localStorage clean when commands/permissions change
  useEffect(() => {
    if (!listsEqual(validPinnedIds, pinnedIds)) {
      setPinnedPref(validPinnedIds)
    }
  }, [validPinnedIds, pinnedIds, setPinnedPref])

  useEffect(() => {
    if (!listsEqual(validRecentIds, recentIds)) {
      setRecentPref(validRecentIds)
    }
  }, [validRecentIds, recentIds, setRecentPref])

  const contextualView = query.trim().length === 0

  const favoriteCommands = useMemo(() => {
    if (!contextualView) return []
    return validPinnedIds
      .map((id) => commandMap.get(id))
      .filter((cmd): cmd is ActionDefinition => Boolean(cmd && cmd.pinEligible !== false))
  }, [validPinnedIds, commandMap, contextualView])

  const recentCommands = useMemo(() => {
    if (!contextualView) return []
    const pinnedSet = new Set(validPinnedIds)
    return validRecentIds
      .filter((id) => !pinnedSet.has(id))
      .map((id) => commandMap.get(id))
      .filter((cmd): cmd is ActionDefinition => Boolean(cmd))
  }, [validRecentIds, validPinnedIds, commandMap, contextualView])

  const contextHiddenIds = useMemo(() => {
    if (!contextualView) return new Set<string>()
    return new Set([...favoriteCommands, ...recentCommands].map((cmd) => cmd.id))
  }, [contextualView, favoriteCommands, recentCommands])

  // Fuse.js fuzzy search over visible actions
  const fuse = useMemo(
    () =>
      new Fuse(visibleActions, {
        keys: [
          { name: 'label', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [visibleActions]
  )

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return visibleActions
    return fuse.search(query).map((r) => r.item)
  }, [query, visibleActions, fuse])

  const commandsForCategories = useMemo(() => {
    if (!contextualView) return filteredCommands
    return filteredCommands.filter((command) => !contextHiddenIds.has(command.id))
  }, [filteredCommands, contextualView, contextHiddenIds])

  // Group by category, preserve order
  const grouped = useMemo(() => {
    const groups: { category: ActionCategory; items: ActionDefinition[] }[] = []
    for (const cat of PALETTE_CATEGORIES) {
      const items = commandsForCategories.filter((command) => command.category === cat)
      if (items.length > 0) groups.push({ category: cat, items })
    }
    return groups
  }, [commandsForCategories])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const groupedItems = grouped.flatMap((group) => group.items)
    if (!contextualView) return groupedItems
    return [...favoriteCommands, ...recentCommands, ...groupedItems]
  }, [grouped, contextualView, favoriteCommands, recentCommands])

  const activeIndex = flatList.length === 0 ? 0 : Math.min(selectedIndex, flatList.length - 1)

  const indexByCommandId = useMemo(() => {
    return new Map(flatList.map((command, index) => [command.id, index]))
  }, [flatList])

  // Focus input + scroll lock on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [isOpen, onClose])

  const pushRecent = useCallback(
    (commandId: string) => {
      const next = [commandId, ...recentIds.filter((id) => id !== commandId)].slice(0, MAX_RECENT)
      setRecentPref(next)
    },
    [recentIds, setRecentPref]
  )

  const togglePinned = useCallback(
    (commandId: string) => {
      const isPinned = pinnedIds.includes(commandId)
      const next = isPinned
        ? pinnedIds.filter((id) => id !== commandId)
        : [commandId, ...pinnedIds.filter((id) => id !== commandId)].slice(0, MAX_PINNED)
      setPinnedPref(next)
    },
    [pinnedIds, setPinnedPref]
  )

  const clearRecents = useCallback(() => {
    setRecentPref([])
  }, [setRecentPref])

  const handleSelect = useCallback(
    (action: ActionDefinition) => {
      pushRecent(action.id)
      action.execute(actionCtx)
      onClose()
    },
    [actionCtx, onClose, pushRecent]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        onOpenShortcutsHelp()
        return
      }

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
      } else if (e.key === 'Enter' && flatList[activeIndex]) {
        e.preventDefault()
        handleSelect(flatList[activeIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [flatList, activeIndex, handleSelect, onClose, onOpenShortcutsHelp]
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotionTokens.spring.default.duration }
                : { duration: animations.duration.normal }
            }
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -20 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -20 }}
              transition={
                prefersReducedMotion
                  ? { duration: reducedMotionTokens.spring.default.duration }
                  : animations.spring.snappy
              }
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input */}
              <div className="flex items-center gap-4 border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-700/80">
                <Search
                  className="h-5 w-5 shrink-0 text-zinc-400 dark:text-zinc-500"
                  strokeWidth={2.5}
                />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar o ir a..."
                  className="flex-1 bg-transparent text-[15px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
                  aria-label="Buscar comandos"
                />
                <kbd className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[10px] text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[420px] overflow-y-auto">
                {flatList.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Search className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="mb-1 text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
                      Sin resultados
                    </p>
                    <p className="text-[13px] text-muted">
                      No se encontraron comandos para &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {contextualView && favoriteCommands.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Favoritos
                        </div>
                        {favoriteCommands.map((cmd) => {
                          const rowIndex = indexByCommandId.get(cmd.id) ?? 0
                          return (
                            <CommandRow
                              key={cmd.id}
                              command={cmd}
                              categoryColor={CATEGORY_COLORS[cmd.category]}
                              index={rowIndex}
                              isSelected={rowIndex === activeIndex}
                              showCategoryBadge={query.trim().length > 0}
                              isPinned={pinnedIds.includes(cmd.id)}
                              onSelect={handleSelect}
                              onTogglePinned={togglePinned}
                              onHover={setSelectedIndex}
                            />
                          )
                        })}
                      </div>
                    )}

                    {contextualView && recentCommands.length > 0 && (
                      <div>
                        <div className="mt-1 flex items-center justify-between px-3 py-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Recientes
                          </span>
                          <button
                            type="button"
                            onClick={clearRecents}
                            className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                          >
                            Limpiar
                          </button>
                        </div>
                        {recentCommands.map((cmd) => {
                          const rowIndex = indexByCommandId.get(cmd.id) ?? 0
                          return (
                            <CommandRow
                              key={cmd.id}
                              command={cmd}
                              categoryColor={CATEGORY_COLORS[cmd.category]}
                              index={rowIndex}
                              isSelected={rowIndex === activeIndex}
                              showCategoryBadge={query.trim().length > 0}
                              isPinned={pinnedIds.includes(cmd.id)}
                              onSelect={handleSelect}
                              onTogglePinned={togglePinned}
                              onHover={setSelectedIndex}
                            />
                          )
                        })}
                      </div>
                    )}

                    {contextualView &&
                      (favoriteCommands.length > 0 || recentCommands.length > 0) && (
                        <div className="mx-3 my-2 h-px bg-zinc-200/80 dark:bg-zinc-700/80" />
                      )}

                    {grouped.map((group) => (
                      <div key={group.category}>
                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {CATEGORY_LABELS[group.category]}
                        </div>
                        {group.items.map((cmd) => {
                          const rowIndex = indexByCommandId.get(cmd.id) ?? 0
                          return (
                            <CommandRow
                              key={cmd.id}
                              command={cmd}
                              categoryColor={CATEGORY_COLORS[group.category]}
                              index={rowIndex}
                              isSelected={rowIndex === activeIndex}
                              showCategoryBadge={query.trim().length > 0}
                              isPinned={pinnedIds.includes(cmd.id)}
                              onSelect={handleSelect}
                              onTogglePinned={togglePinned}
                              onHover={setSelectedIndex}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-4 border-t border-zinc-200/80 px-5 py-3 text-[11px] text-muted dark:border-zinc-700/80">
                <span className="flex items-center gap-1.5">
                  <kbd className="min-w-[26px] rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-center font-mono shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    ↑↓
                  </kbd>
                  <span className="font-medium">Navegar</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="min-w-[26px] rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-center font-mono shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    ↵
                  </kbd>
                  <span className="font-medium">Ir</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    esc
                  </kbd>
                  <span className="font-medium">Cerrar</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenShortcutsHelp()}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Atajos</span>
                  <kbd className="rounded border border-zinc-200 bg-white px-1 py-0.5 font-mono text-[9px] dark:border-zinc-700 dark:bg-zinc-900">
                    ?
                  </kbd>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function CommandRow({
  command,
  categoryColor,
  index,
  isSelected,
  showCategoryBadge,
  isPinned,
  onSelect,
  onTogglePinned,
  onHover,
}: {
  command: ActionDefinition
  categoryColor: { bg: string; text: string }
  index: number
  isSelected: boolean
  showCategoryBadge: boolean
  isPinned: boolean
  onSelect: (action: ActionDefinition) => void
  onTogglePinned: (commandId: string) => void
  onHover: (index: number) => void
}) {
  const Icon = command.icon

  return (
    <div
      className={cn(
        'relative flex items-stretch gap-2 rounded-xl px-3 py-2 transition-colors duration-150',
        isSelected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
      )}
      onMouseEnter={() => onHover(index)}
    >
      {isSelected && (
        <motion.div
          layoutId="cmd-palette-indicator"
          className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-zinc-900 dark:bg-white"
          transition={animations.spring.indicator}
        />
      )}

      <button
        type="button"
        onClick={() => onSelect(command)}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-150',
            isSelected
              ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900'
              : command.category === 'create'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'truncate font-semibold transition-colors duration-150',
              isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-200'
            )}
          >
            {command.label}
          </div>
          {command.description && (
            <div className="mt-0.5 truncate text-[12px] text-muted">{command.description}</div>
          )}
        </div>

        {showCategoryBadge && (
          <span
            className={cn(
              'hidden rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline',
              categoryColor.bg,
              categoryColor.text
            )}
          >
            {CATEGORY_LABELS[command.category]}
          </span>
        )}

        <ArrowRight
          className={cn(
            'h-4 w-4 shrink-0 transition-colors duration-150',
            isSelected
              ? 'translate-x-0.5 text-zinc-500 dark:text-zinc-400'
              : 'text-zinc-300 dark:text-zinc-600'
          )}
        />
      </button>

      {command.pinEligible !== false && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePinned(command.id)
          }}
          aria-label={
            isPinned
              ? `Quitar ${command.label} de favoritos`
              : `Fijar ${command.label} en favoritos`
          }
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
            isPinned
              ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/40'
              : 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
          )}
        >
          {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
