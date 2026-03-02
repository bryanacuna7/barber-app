/**
 * Action Registry — Barrel + Registration
 *
 * registerAllActions() is called once (idempotent guard).
 * Migrates v2 favorites/recents IDs to namespaced format.
 */

export { actionRegistry } from './registry'
export type {
  ActionDefinition,
  ActionContext,
  ActionCategory,
  ActionEntityType,
  ExecutionModel,
  VisibilityContext,
} from './types'

import { registerNavigationActions } from './definitions/navigation'
import { registerAppointmentActions } from './definitions/appointment-actions'
import { registerClientActions } from './definitions/client-actions'
import { registerServiceActions } from './definitions/service-actions'
import { actionRegistry } from './registry'

let registered = false

/** Register all actions. Idempotent — safe to call multiple times. */
export function registerAllActions(): void {
  if (registered) return
  registered = true
  registerNavigationActions()
  registerAppointmentActions()
  registerClientActions()
  registerServiceActions()
}

// --- v2 → v3 ID migration ---

const LEGACY_ID_MAP: Record<string, string> = {
  'nav-dashboard': 'nav.dashboard',
  'nav-citas': 'nav.citas',
  'nav-servicios': 'nav.servicios',
  'nav-barberos': 'nav.equipo',
  'nav-clientes': 'nav.clientes',
  'nav-analiticas': 'nav.analiticas',
  'nav-referencias': 'nav.referencias',
  'nav-changelog': 'nav.changelog',
  'nav-configuracion': 'nav.configuracion',
  'nav-guia': 'nav.guia',
  'nav-config-general': 'settings.general',
  'nav-config-horario': 'settings.horario',
  'nav-config-branding': 'settings.branding',
  'nav-config-equipo': 'settings.equipo',
  'nav-config-pagos': 'settings.pagos',
  'nav-config-avanzado': 'settings.avanzado',
  'create-cita': 'appointment.create',
  'create-cliente': 'client.create',
  'create-servicio': 'service.create',
  'copy-booking-link': 'business.copy-booking-link',
}

const MIGRATION_FLAG = 'bsp_pref_cmd_ids_migrated_v3'

/**
 * Migrate v2 pinned/recent IDs to v3 namespaced format.
 * Runs once, gated by localStorage flag.
 */
export function migrateCommandIds(): void {
  if (typeof window === 'undefined') return

  try {
    if (localStorage.getItem(MIGRATION_FLAG) === 'true') return

    // usePreference() prefixes keys with `bsp_pref_` internally.
    const pinnedKey = 'bsp_pref_command_palette_pinned_ids_v1'
    const recentKey = 'bsp_pref_command_palette_recent_ids_v1'
    const registeredIds = new Set(actionRegistry.getAll().map((action) => action.id))

    for (const key of [pinnedKey, recentKey]) {
      const raw = localStorage.getItem(key)
      if (!raw) continue

      try {
        const ids = JSON.parse(raw) as string[]
        if (!Array.isArray(ids)) continue

        const migrated = ids
          .map((id) => LEGACY_ID_MAP[id] ?? id)
          // Keep only IDs that exist in the current registry.
          .filter((id) => registeredIds.has(id))

        localStorage.setItem(key, JSON.stringify(migrated))
      } catch {
        // Corrupted data — reset to empty array.
        localStorage.setItem(key, JSON.stringify([]))
      }
    }

    localStorage.setItem(MIGRATION_FLAG, 'true')
  } catch {
    // localStorage disabled — skip migration silently
  }
}
