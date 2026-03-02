'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

type ViewMode = 'cards' | 'table' | 'calendar'

interface ClientSearchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenSegmentFilter: () => void
  selectedSegment: string
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
  selectedSegment,
  statsExpanded,
  onToggleStats,
}: ClientSearchToolbarProps) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const viewDropdownRef = useRef<HTMLDivElement>(null)

  // Click-outside + Escape handler for view dropdown
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

  return (
    <div className="space-y-3 sm:rounded-[22px] sm:border sm:border-zinc-200/70 sm:dark:border-zinc-800/80 sm:bg-white/60 sm:dark:bg-white/[0.03] sm:p-3 sm:backdrop-blur-xl sm:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] sm:dark:shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
      {/* Search */}
      <Input
        type="text"
        placeholder="Buscar por nombre, teléfono o email..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        className="h-11 border border-zinc-200/70 dark:border-zinc-800/80 bg-white/65 dark:bg-white/[0.04] text-sm focus:ring-violet-400/45 focus:border-violet-400/45 backdrop-blur-xl"
      />

      {/* Controls row: View selector + Filtros button */}
      <div className="flex items-center gap-2">
        {/* Mobile/tablet: Vistas dropdown */}
        <div ref={viewDropdownRef} className="relative lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewDropdownOpen(!viewDropdownOpen)
              if (isMobileDevice()) haptics.selection()
            }}
            aria-haspopup="true"
            aria-expanded={viewDropdownOpen}
            className="h-10 px-3 gap-2 text-muted border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04]"
          >
            <CurrentViewIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentView.label}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${viewDropdownOpen ? 'rotate-180' : ''}`}
            />
          </Button>
          <AnimatePresence>
            {viewDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: animations.duration.fast }}
                className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xl z-50 p-1.5 space-y-0.5"
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

        {/* Desktop: segmented visible view selector */}
        <div className="hidden lg:flex items-center gap-1 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1">
          {viewOptions.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === mode
                  ? 'brand-tab-active'
                  : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/10'
              }`}
              aria-pressed={viewMode === mode}
              aria-label={`Ver ${label.toLowerCase()}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filtros button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onOpenSegmentFilter()
            if (isMobileDevice()) haptics.selection()
          }}
          className="h-10 px-3 gap-2 text-muted border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04]"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {selectedSegment !== 'all' && (
            <span className="bg-[var(--brand-primary)] text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
              1
            </span>
          )}
        </Button>
      </div>

      {/* Stats toggle - below controls, secondary action */}
      <button
        onClick={onToggleStats}
        className="lg:hidden flex items-center gap-2 px-1 py-1 text-xs text-muted"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${statsExpanded ? 'rotate-180' : ''}`}
        />
        <span>{statsExpanded ? 'Ocultar estadísticas' : 'Ver estadísticas'}</span>
      </button>
    </div>
  )
}
