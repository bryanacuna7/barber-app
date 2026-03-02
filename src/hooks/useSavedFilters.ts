import { useState, useCallback, useMemo } from 'react'

/**
 * Saved Filters Hook
 *
 * Persists filter state + user-created presets to localStorage.
 * Uses versioned keys (`_v1`) with safe JSON parsing.
 *
 * @see Plan: Fase 1C — Saved Filters
 */

export interface SavedFilter<T> {
  id: string
  label: string
  filter: T
  /** System presets can't be deleted */
  isBuiltIn?: boolean
}

interface UseSavedFiltersConfig<T> {
  /** Page identifier for localStorage key (e.g., 'clientes', 'citas') */
  pageKey: string
  /** Default filter state when nothing is selected */
  defaultFilter: T
  /** System presets (always present, not deletable) */
  builtInPresets: SavedFilter<T>[]
}

interface UseSavedFiltersReturn<T> {
  activeFilter: T
  setActiveFilter: (filter: T) => void
  presets: SavedFilter<T>[]
  savePreset: (label: string, filter: T) => void
  deletePreset: (id: string) => void
  activePresetId: string | null
  applyPreset: (id: string) => void
}

function storageKey(pageKey: string, suffix: string) {
  return `bsp_pref_filters_${pageKey}_${suffix}_v1`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeActiveFilter<T>(value: unknown, defaultFilter: T): T {
  if (isRecord(defaultFilter)) {
    if (!isRecord(value)) return { ...defaultFilter } as T
    return { ...defaultFilter, ...value } as T
  }

  if (Array.isArray(defaultFilter)) {
    return Array.isArray(value) ? (value as T) : defaultFilter
  }

  return typeof value === typeof defaultFilter ? (value as T) : defaultFilter
}

function sanitizeActivePresetId(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function sanitizeUserPresets<T>(value: unknown): SavedFilter<T>[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is SavedFilter<T> =>
      isRecord(item) &&
      typeof item.id === 'string' &&
      typeof item.label === 'string' &&
      'filter' in item
  )
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    console.warn(`[useSavedFilters] Corrupted localStorage key "${key}" — reset to default`)
    return fallback
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function useSavedFilters<T>(config: UseSavedFiltersConfig<T>): UseSavedFiltersReturn<T> {
  const { pageKey, defaultFilter, builtInPresets } = config
  const activeKey = storageKey(pageKey, 'active')
  const presetsKey = storageKey(pageKey, 'presets')
  const activeIdKey = storageKey(pageKey, 'active_id')

  // Active filter state
  const [activeFilter, setActiveFilterState] = useState<T>(() =>
    sanitizeActiveFilter(safeRead<unknown>(activeKey, defaultFilter), defaultFilter)
  )

  // Active preset ID
  const [activePresetId, setActivePresetId] = useState<string | null>(() =>
    sanitizeActivePresetId(safeRead<unknown>(activeIdKey, null))
  )

  // User-created presets
  const [userPresets, setUserPresets] = useState<SavedFilter<T>[]>(() =>
    sanitizeUserPresets<T>(safeRead<unknown>(presetsKey, []))
  )

  // All presets = built-in + user
  const presets = useMemo(
    () => [...builtInPresets.map((p) => ({ ...p, isBuiltIn: true })), ...userPresets],
    [builtInPresets, userPresets]
  )

  const setActiveFilter = useCallback(
    (filter: T) => {
      setActiveFilterState(filter)
      safeWrite(activeKey, filter)
      // Clear active preset since this is a manual filter change
      setActivePresetId(null)
      safeWrite(activeIdKey, null)
    },
    [activeKey, activeIdKey]
  )

  const applyPreset = useCallback(
    (id: string) => {
      const preset = [...builtInPresets, ...userPresets].find((p) => p.id === id)
      if (!preset) return
      setActiveFilterState(preset.filter)
      safeWrite(activeKey, preset.filter)
      setActivePresetId(id)
      safeWrite(activeIdKey, id)
    },
    [builtInPresets, userPresets, activeKey, activeIdKey]
  )

  const savePreset = useCallback(
    (label: string, filter: T) => {
      const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const newPreset: SavedFilter<T> = { id, label, filter }
      const updated = [...userPresets, newPreset]
      setUserPresets(updated)
      safeWrite(presetsKey, updated)
    },
    [userPresets, presetsKey]
  )

  const deletePreset = useCallback(
    (id: string) => {
      const updated = userPresets.filter((p) => p.id !== id)
      setUserPresets(updated)
      safeWrite(presetsKey, updated)
      // If deleting the active preset, clear selection
      if (activePresetId === id) {
        setActivePresetId(null)
        safeWrite(activeIdKey, null)
      }
    },
    [userPresets, presetsKey, activePresetId, activeIdKey]
  )

  return {
    activeFilter,
    setActiveFilter,
    presets,
    savePreset,
    deletePreset,
    activePresetId,
    applyPreset,
  }
}
