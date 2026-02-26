'use client'

import { useState, useCallback, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { GUIDE_SECTIONS } from '@/lib/guide/guide-content'
import { GuideSection } from '@/components/guide/guide-section'
import { GuideSearch } from '@/components/guide/guide-search'
import { GuideTocSidebar } from '@/components/guide/guide-toc-sidebar'
import { GuideTocSheet } from '@/components/guide/guide-toc-sheet'

export default function GuiaPage() {
  const [filteredIds, setFilteredIds] = useState<string[] | null>(null)

  const handleFilter = useCallback((ids: string[] | null) => {
    setFilteredIds(ids)
  }, [])

  // Scroll to hash anchor after hydration (browser can't find the element before React renders)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const visibleSections =
    filteredIds === null ? GUIDE_SECTIONS : GUIDE_SECTIONS.filter((s) => filteredIds.includes(s.id))

  return (
    <div className="min-h-screen pb-24 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="app-page-title brand-gradient-text">Guía de Uso</h1>
          </div>
        </div>
        <p className="app-page-subtitle mt-1">
          Todo lo que necesitás para sacarle el máximo a tu barbería
        </p>
      </div>

      {/* Search */}
      <GuideSearch sections={GUIDE_SECTIONS} onFilter={handleFilter} className="mb-6" />

      {/* Content: 2-column on desktop */}
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop TOC sidebar */}
        <div className="hidden lg:block">
          <GuideTocSidebar sections={GUIDE_SECTIONS} />
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {visibleSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                <BookOpen className="w-6 h-6 text-zinc-400" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Sin resultados</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Intentá con otro término de búsqueda
              </p>
            </div>
          ) : (
            visibleSections.map((section, index) => (
              <GuideSection key={section.id} section={section} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Mobile floating TOC button */}
      <GuideTocSheet sections={GUIDE_SECTIONS} />
    </div>
  )
}
