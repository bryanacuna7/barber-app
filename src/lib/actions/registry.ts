/**
 * Action Registry — Singleton
 *
 * Map-based, idempotent (safe for HMR/rerender).
 * All consumers (palette, context menu, bulk toolbar, shortcuts) use
 * getVisibleActions() for centralized permission filtering.
 *
 * Search powered by Fuse.js (already installed).
 */

import Fuse from 'fuse.js'
import { canBarberAccessPath } from '@/lib/auth/roles'
import type { ActionDefinition, VisibilityContext } from './types'

class ActionRegistry {
  private actions = new Map<string, ActionDefinition>()
  private fuseInstance: Fuse<ActionDefinition> | null = null

  /** Register (or overwrite) an action. Idempotent — safe for HMR. */
  register(def: ActionDefinition): void {
    this.actions.set(def.id, def)
    this.fuseInstance = null // invalidate search index
  }

  getById(id: string): ActionDefinition | undefined {
    return this.actions.get(id)
  }

  getAll(): ActionDefinition[] {
    return Array.from(this.actions.values())
  }

  /** Fuzzy search over registered actions using Fuse.js */
  search(query: string): ActionDefinition[] {
    if (!query.trim()) return this.getAll()

    if (!this.fuseInstance) {
      this.fuseInstance = new Fuse(this.getAll(), {
        keys: [
          { name: 'label', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.35,
        includeScore: true,
      })
    }

    return this.fuseInstance.search(query).map((r) => r.item)
  }

  /**
   * Centralized permission-filtered query.
   * All UI consumers call this — no independent filtering.
   */
  getVisibleActions(ctx: VisibilityContext): ActionDefinition[] {
    return this.getAll().filter((action) => {
      // Scope filter
      if (ctx.scope === 'global' && action.scope !== 'global') return false
      if (ctx.scope === 'entity' && action.scope !== 'entity') return false

      // Barber permission filter
      if (ctx.isBarber && !ctx.isOwner) {
        if (action.path && ctx.staffPermissions) {
          if (!canBarberAccessPath(action.path, ctx.staffPermissions)) return false
        }
        if (action.requiredPermission && ctx.staffPermissions) {
          if (!ctx.staffPermissions[action.requiredPermission]) return false
        }
      }

      return true
    })
  }

  /** Entity-scoped actions for a specific entity type */
  getVisibleForEntity(ctx: VisibilityContext & { entityType: string }): ActionDefinition[] {
    return this.getVisibleActions({ ...ctx, scope: 'entity' }).filter(
      (action) => action.entityType === ctx.entityType
    )
  }

  /** Bulkable entity actions for a specific entity type */
  getVisibleBulkable(ctx: VisibilityContext & { entityType: string }): ActionDefinition[] {
    return this.getVisibleForEntity(ctx).filter((action) => action.bulkable)
  }

  /** Clear all registrations (for testing) */
  _clear(): void {
    this.actions.clear()
    this.fuseInstance = null
  }
}

export const actionRegistry = new ActionRegistry()
