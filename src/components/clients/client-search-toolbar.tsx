'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Crown,
  AlertTriangle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { segmentConfig } from '@/components/clients/segment-config'
import { animations } from '@/lib/design-system'
import {
  DEFAULT_CLIENT_FILTERS,
  countActiveClientFilters,
  type ClientFilters,
  type ClientSegmentFilter,
  VISIT_RECENCY_OPTIONS,
  SPEND_RANGE_OPTIONS,
  FREQUENCY_OPTIONS,
} from '@/lib/utils/client-filters'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

type ViewMode = 'cards' | 'table' | 'calendar'

interface ClientSearchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenSegmentFilter: () => void
  filters: ClientFilters
  onFiltersChange: (filters: ClientFilters) => void
  statsExpanded: boolean
  onToggleStats: () => void
}

const viewOptions: Array<{ mode: ViewMode; icon: LucideIcon; label: string }> = [
  { mode: 'cards', icon: LayoutGrid, label: 'Lista' },
  { mode: 'table', icon: TableIcon, label: 'Tabla' },
  { mode: 'calendar', icon: CalendarIcon, label: 'Calendario' },
]

export function ClientSearchToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenSegmentFilter,
  filters,
  onFiltersChange,
  statsExpanded,
  onToggleStats,
}: ClientSearchToolbarProps) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const viewDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setViewDropdownOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setViewDropdownOpen(false)
    }
    if (viewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [viewDropdownOpen])

  const currentView = viewOptions.find((v) => v.mode === viewMode) ?? viewOptions[0]
  const CurrentViewIcon = currentView.icon
  const activeFilterCount = countActiveClientFilters(filters)

  const isQuickAll = activeFilterCount === 0
  const isQuickVip =
    filters.segment === 'vip' &&
    filters.visitRecency === 'all' &&
    filters.spendRange === 'all' &&
    filters.frequency === 'all' &&
    !filters.highRiskOnly
  const isQuickRisk =
    filters.segment === 'all' &&
    filters.visitRecency === 'all' &&
    filters.spendRange === 'all' &&
    filters.frequency === 'all' &&
    filters.highRiskOnly

  function updateFilters(partial: Partial<ClientFilters>) {
    onFiltersChange({ ...filters, ...partial })
  }

  return (
    <div className="space-y-2.5">
      {/* ── DESKTOP: Single-row Linear/Notion-style bar ── */}
      <div className="hidden lg:flex items-center gap-1.5">
        {/* Search — compact, expands on focus */}
        <div
          className={`relative flex items-center transition-all duration-300 ease-out ${
            searchFocused ? 'w-80' : 'w-60'
          }`}
        >
          <Search className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-9 w-full rounded-lg bg-zinc-100/70 dark:bg-white/[0.06] pl-9 pr-3 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:bg-zinc-100 dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-zinc-300/60 dark:focus:ring-zinc-600/50"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-0.5 rounded-md text-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <span className="h-5 w-px bg-zinc-200/80 dark:bg-zinc-700/60 mx-1" />

        {/* Quick filter pills */}
        <div className="flex items-center gap-1">
          {/* Todos */}
          <button
            onClick={() => {
              onFiltersChange(DEFAULT_CLIENT_FILTERS)
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isQuickAll
                ? 'bg-[var(--brand-primary)] text-white shadow-[0_2px_8px_rgba(var(--brand-primary-rgb),0.3)]'
                : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/[0.07]'
            }`}
          >
            Todos
          </button>

          {/* VIP */}
          <button
            onClick={() => {
              onFiltersChange({ ...DEFAULT_CLIENT_FILTERS, segment: 'vip' })
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 ${
              isQuickVip
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/25'
                : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/[0.07]'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            VIP
          </button>

          {/* En riesgo */}
          <button
            onClick={() => {
              onFiltersChange({ ...DEFAULT_CLIENT_FILTERS, highRiskOnly: true })
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 ${
              isQuickRisk
                ? 'bg-red-500/12 text-red-600 dark:text-red-400 ring-1 ring-red-500/25'
                : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/[0.07]'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            En riesgo
          </button>
        </div>

        {/* Divider */}
        <span className="h-5 w-px bg-zinc-200/80 dark:bg-zinc-700/60 mx-1" />

        {/* View switcher — icon only with tooltips */}
        <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100/70 dark:bg-white/[0.05] p-1">
          {viewOptions.map(({ mode, icon: Icon, label }) => (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange(mode)}
                  className={`h-7 w-7 flex items-center justify-center rounded-md transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-subtle hover:text-foreground hover:bg-white/70 dark:hover:bg-white/[0.08]'
                  }`}
                  aria-pressed={viewMode === mode}
                  aria-label={`Ver ${label.toLowerCase()}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Right side: Advanced filters + Clear */}
        <div className="ml-auto flex items-center gap-1.5">
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange(DEFAULT_CLIENT_FILTERS)}
              className="h-8 px-2.5 rounded-full text-xs font-medium text-muted hover:text-foreground hover:bg-zinc-100/80 dark:hover:bg-white/[0.07] transition-colors"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => setAdvancedFiltersOpen(true)}
            className={`h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 ${
              activeFilterCount > 0
                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20'
                : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/[0.07] hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-[var(--brand-primary)] text-white text-[10px] rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE: Search full width + scrollable pills ── */}
      <div className="lg:hidden space-y-2.5">
        {/* Search — full width */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl bg-zinc-100/70 dark:bg-white/[0.06] pl-10 pr-10 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:bg-zinc-100 dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-zinc-300/60 dark:focus:ring-zinc-600/50"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-1 rounded-md text-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Pills row — horizontally scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide -mx-1 px-1">
          {/* View dropdown */}
          <div ref={viewDropdownRef} className="relative shrink-0">
            <button
              onClick={() => {
                setViewDropdownOpen(!viewDropdownOpen)
                if (isMobileDevice()) haptics.selection()
              }}
              aria-haspopup="true"
              aria-expanded={viewDropdownOpen}
              className="h-9 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-medium text-muted bg-zinc-100/70 dark:bg-white/[0.06] transition-colors"
            >
              <CurrentViewIcon className="h-3.5 w-3.5" />
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${viewDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {viewDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: animations.duration.fast }}
                  className="absolute top-full left-0 mt-1.5 w-44 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xl z-50 p-1.5 space-y-0.5"
                >
                  {viewOptions.map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onViewModeChange(mode)
                        setViewDropdownOpen(false)
                        if (isMobileDevice()) haptics.selection()
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        viewMode === mode
                          ? 'brand-tab-active'
                          : 'text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                      {viewMode === mode && <Check className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator dot */}
          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />

          {/* Quick filters */}
          <button
            onClick={() => {
              onFiltersChange(DEFAULT_CLIENT_FILTERS)
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 ${
              isQuickAll
                ? 'bg-[var(--brand-primary)] text-white shadow-[0_2px_8px_rgba(var(--brand-primary-rgb),0.3)]'
                : 'text-muted bg-zinc-100/70 dark:bg-white/[0.06]'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => {
              onFiltersChange({ ...DEFAULT_CLIENT_FILTERS, segment: 'vip' })
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 transition-all duration-200 ${
              isQuickVip
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/25'
                : 'text-muted bg-zinc-100/70 dark:bg-white/[0.06]'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            VIP
          </button>

          <button
            onClick={() => {
              onFiltersChange({ ...DEFAULT_CLIENT_FILTERS, highRiskOnly: true })
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 transition-all duration-200 ${
              isQuickRisk
                ? 'bg-red-500/12 text-red-600 dark:text-red-400 ring-1 ring-red-500/25'
                : 'text-muted bg-zinc-100/70 dark:bg-white/[0.06]'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Riesgo
          </button>

          {/* Advanced filters pill */}
          <button
            onClick={() => {
              onOpenSegmentFilter()
              if (isMobileDevice()) haptics.selection()
            }}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 transition-all duration-200 ${
              activeFilterCount > 0
                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20'
                : 'text-muted bg-zinc-100/70 dark:bg-white/[0.06]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount > 0 ? (
              <span className="bg-[var(--brand-primary)] text-white text-[10px] rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center font-bold leading-none">
                {activeFilterCount}
              </span>
            ) : (
              <span>Más</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats toggle — mobile only */}
      <button
        onClick={onToggleStats}
        className="lg:hidden flex items-center gap-2 px-1 py-1 text-xs text-muted"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${statsExpanded ? 'rotate-180' : ''}`}
        />
        <span>{statsExpanded ? 'Ocultar estadísticas' : 'Ver estadísticas'}</span>
      </button>

      {/* Advanced filters sheet */}
      <Sheet open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
        <SheetContent side="bottom" centered>
          <SheetClose onClose={() => setAdvancedFiltersOpen(false)} />
          <SheetHeader>
            <SheetTitle>Filtros avanzados</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 max-h-[68vh] overflow-y-auto pr-1">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Segmento
              </label>
              <select
                value={filters.segment}
                onChange={(e) => updateFilters({ segment: e.target.value as ClientSegmentFilter })}
                className="w-full h-10 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/45"
              >
                <option value="all">Todos los segmentos</option>
                {(Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>).map(
                  (segment) => (
                    <option key={segment} value={segment}>
                      {segmentConfig[segment].label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Última visita
              </label>
              <select
                value={filters.visitRecency}
                onChange={(e) =>
                  updateFilters({ visitRecency: e.target.value as ClientFilters['visitRecency'] })
                }
                className="w-full h-10 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/45"
              >
                {VISIT_RECENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Gasto total
              </label>
              <select
                value={filters.spendRange}
                onChange={(e) =>
                  updateFilters({ spendRange: e.target.value as ClientFilters['spendRange'] })
                }
                className="w-full h-10 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/45"
              >
                {SPEND_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Frecuencia
              </label>
              <select
                value={filters.frequency}
                onChange={(e) =>
                  updateFilters({ frequency: e.target.value as ClientFilters['frequency'] })
                }
                className="w-full h-10 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400/45"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => updateFilters({ highRiskOnly: !filters.highRiskOnly })}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-left transition-colors ${
                filters.highRiskOnly
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-foreground'
                  : 'border-zinc-200/80 dark:border-zinc-800/80 text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Alto riesgo de pérdida
            </button>

            <div className="pt-2 flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => onFiltersChange(DEFAULT_CLIENT_FILTERS)}
                  className="flex-1 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 px-3 py-2 text-xs font-medium text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={() => setAdvancedFiltersOpen(false)}
                className="flex-1 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 px-3 py-2 text-xs font-medium text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
