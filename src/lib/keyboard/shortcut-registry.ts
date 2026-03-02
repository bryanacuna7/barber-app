/**
 * Keyboard Shortcut Registry — Singleton (plain TS, no React)
 *
 * Map-based. register() overwrites silently (safe for HMR).
 * All consumers query via getAll() / getByCategory().
 */

import type { ShortcutDefinition } from './types'

const shortcuts = new Map<string, ShortcutDefinition>()

export const shortcutRegistry = {
  /**
   * Register a shortcut. Re-registering the same ID overwrites silently.
   * Returns an unregister function.
   */
  register(def: ShortcutDefinition): () => void {
    shortcuts.set(def.id, def)
    return () => {
      shortcuts.delete(def.id)
    }
  },

  /** Get all registered shortcuts */
  getAll(): ShortcutDefinition[] {
    return Array.from(shortcuts.values())
  },

  /** Get shortcuts filtered by category */
  getByCategory(category: ShortcutDefinition['category']): ShortcutDefinition[] {
    return Array.from(shortcuts.values()).filter((s) => s.category === category)
  },

  /** Get a specific shortcut by ID */
  getById(id: string): ShortcutDefinition | undefined {
    return shortcuts.get(id)
  },

  /** Clear all (useful for tests) */
  _clear(): void {
    shortcuts.clear()
  },
}
