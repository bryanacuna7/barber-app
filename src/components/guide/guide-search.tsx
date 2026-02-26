'use client'

/**
 * GuideSearch — Fuse.js-powered inline search that filters guide sections.
 *
 * Usage:
 *   import { GuideSearch } from '@/components/guide/guide-search'
 *   <GuideSearch sections={GUIDE_SECTIONS} onFilter={(ids) => setVisibleIds(ids)} />
 */

import { useState, useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Fuse, { type IFuseOptions } from 'fuse.js'
import { type GuideSection } from '@/lib/guide/guide-content'
import { cn } from '@/lib/utils/cn'

interface GuideSearchProps {
  sections: GuideSection[]
  /**
   * Called with a filtered array of section IDs, or null when the query is
   * empty (meaning all sections should be shown).
   */
  onFilter: (ids: string[] | null) => void
  className?: string
}

/** Flatten a section into a Fuse-searchable document. */
interface SearchDoc {
  id: string
  title: string
  subtitle: string
  steps: string
  keywords: string
}

function buildSearchDocs(sections: GuideSection[]): SearchDoc[] {
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    steps: s.steps.map((st) => `${st.text} ${st.detail ?? ''}`).join(' '),
    keywords: s.searchKeywords.join(' '),
  }))
}

const FUSE_OPTIONS: IFuseOptions<SearchDoc> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'subtitle', weight: 0.2 },
    { name: 'keywords', weight: 0.25 },
    { name: 'steps', weight: 0.15 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
}

export function GuideSearch({ sections, onFilter, className }: GuideSearchProps) {
  const [query, setQuery] = useState('')
  const [resultCount, setResultCount] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build Fuse instance once — sections are static data.
  const fuseRef = useRef<Fuse<SearchDoc>>(new Fuse(buildSearchDocs(sections), FUSE_OPTIONS))

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) {
        setResultCount(null)
        onFilter(null)
        return
      }

      const results = fuseRef.current.search(trimmed)
      const ids = results.map((r) => r.item.id)
      setResultCount(ids.length)
      onFilter(ids)
    },
    [onFilter]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 200)
  }

  const handleClear = () => {
    setQuery('')
    setResultCount(null)
    onFilter(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const hasQuery = query.length > 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Input row */}
      <div className="relative flex items-center">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Buscar en la guía..."
          aria-label="Buscar secciones de la guía"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            // Layout
            'w-full min-h-[44px] pl-10 pr-10 py-2.5',
            // Shape & border
            'rounded-xl border border-zinc-200 dark:border-zinc-700',
            // Background & text
            'bg-white dark:bg-zinc-900',
            'text-zinc-900 dark:text-white',
            'text-[15px] leading-[20px]',
            // Placeholder
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
            'dark:focus:border-blue-400',
            // Hide native search clear button
            '[&::-webkit-search-cancel-button]:hidden',
            'transition-[border-color,box-shadow] duration-150'
          )}
        />

        {/* Clear button */}
        {hasQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'flex items-center justify-center w-5 h-5 rounded-full',
              'bg-zinc-300 dark:bg-zinc-600',
              'text-zinc-600 dark:text-zinc-300',
              'hover:bg-zinc-400 dark:hover:bg-zinc-500',
              'transition-colors duration-150'
            )}
          >
            <X className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Results count */}
      {hasQuery && resultCount !== null && (
        <p
          className="text-xs text-zinc-500 dark:text-zinc-400 pl-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultCount === 0
            ? 'Sin resultados'
            : `${resultCount} de ${sections.length} sección${resultCount !== 1 ? 'es' : ''}`}
        </p>
      )}
    </div>
  )
}
