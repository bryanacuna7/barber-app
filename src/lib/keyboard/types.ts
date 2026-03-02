/**
 * Keyboard Shortcuts — Shared Types
 *
 * Used by shortcut-registry (plain TS singleton) and shortcut-provider (React).
 */

export interface ShortcutDefinition {
  /** Unique identifier */
  id: string
  /** Display format: '⌘K', 'N', '1' */
  keys: string
  /** KeyboardEvent.key match value: 'k', 'n', '1' */
  key: string
  /** Modifier requirements */
  modifiers?: {
    meta?: boolean
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
  }
  /** Spanish description */
  description: string
  /** Grouping for shortcuts help modal */
  category: 'navigation' | 'action' | 'palette'
  /** Handler */
  action: () => void
  /** Runtime enable check (e.g., role-based) */
  enabled?: () => boolean
}
