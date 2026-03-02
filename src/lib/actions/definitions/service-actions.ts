/**
 * Service actions
 *
 * Global: create
 * Entity: toggle-active
 */

import { Plus, ToggleLeft } from 'lucide-react'
import { actionRegistry } from '../registry'
import type { ActionDefinition } from '../types'

const serviceActions: ActionDefinition[] = [
  // Global
  {
    id: 'service.create',
    label: 'Nuevo Servicio',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nuevo', 'servicio', 'agregar'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/servicios',
    execute: (ctx) => ctx.navigate('/servicios?intent=create'),
  },
  // Entity
  {
    id: 'service.toggle-active',
    label: 'Activar/Desactivar',
    icon: ToggleLeft,
    category: 'entity',
    keywords: ['activar', 'desactivar', 'toggle', 'estado'],
    entityType: 'service',
    scope: 'entity',
    executionModel: 'immediate-compensate',
    path: '/servicios',
    execute: () => {
      // Wired in Fase 3A (optimistic via useOptimisticMutation)
    },
  },
]

export function registerServiceActions(): void {
  for (const action of serviceActions) {
    actionRegistry.register(action)
  }
}
