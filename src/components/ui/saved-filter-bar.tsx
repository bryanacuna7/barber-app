'use client'

import { useState, useRef } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { animations } from '@/lib/design-system'
import type { SavedFilter } from '@/hooks/useSavedFilters'

interface SavedFilterBarProps<T> {
  presets: SavedFilter<T>[]
  activePresetId: string | null
  onApplyPreset: (id: string) => void
  onDeletePreset: (id: string) => void
  onSavePreset: (label: string) => void
  /** Whether we can save (e.g., has unsaved filter changes) */
  canSave?: boolean
}

export function SavedFilterBar<T>({
  presets,
  activePresetId,
  onApplyPreset,
  onDeletePreset,
  onSavePreset,
  canSave = true,
}: SavedFilterBarProps<T>) {
  const [isNaming, setIsNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStartNaming = () => {
    setIsNaming(true)
    setNewName('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSave = () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setIsNaming(false)
      return
    }
    onSavePreset(trimmed)
    setIsNaming(false)
    setNewName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setIsNaming(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
      {presets.map((preset) => {
        const isActive = preset.id === activePresetId
        return (
          <div
            key={preset.id}
            className={cn(
              'group relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium transition-all',
              isActive
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
            )}
          >
            <button
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-1 py-0.5"
            >
              {isActive && <Check className="h-3 w-3" />}
              <span>{preset.label}</span>
            </button>
            {/* Delete button for user presets (not built-in) */}
            {!preset.isBuiltIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeletePreset(preset.id)
                }}
                className={cn(
                  'ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'hover:bg-white/20 dark:hover:bg-black/20'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                )}
                aria-label={`Eliminar filtro ${preset.label}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        )
      })}

      {/* Save new preset */}
      <AnimatePresence mode="wait">
        {isNaming ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={animations.spring.snappy}
            className="flex items-center gap-1 overflow-hidden"
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="Nombre del filtro"
              className="w-28 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
              maxLength={20}
            />
          </motion.div>
        ) : (
          canSave && (
            <motion.button
              key="add"
              type="button"
              onClick={handleStartNaming}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
              aria-label="Guardar filtro actual"
            >
              <Plus className="h-3 w-3" />
              <span>Guardar</span>
            </motion.button>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
