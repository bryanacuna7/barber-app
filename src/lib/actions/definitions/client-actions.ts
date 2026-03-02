/**
 * Client actions
 *
 * Global: create
 * Entity: edit, delete, whatsapp, view
 */

import { Plus, Pencil, Trash2, MessageCircle, Eye } from 'lucide-react'
import { actionRegistry } from '../registry'
import type { ActionDefinition } from '../types'

const clientActions: ActionDefinition[] = [
  // Global
  {
    id: 'client.create',
    label: 'Nuevo Cliente',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nuevo', 'cliente', 'agregar'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/clientes',
    execute: (ctx) => ctx.navigate('/clientes?intent=create'),
  },
  // Entity
  {
    id: 'client.view',
    label: 'Ver Perfil',
    icon: Eye,
    category: 'entity',
    keywords: ['ver', 'perfil', 'detalle'],
    entityType: 'client',
    scope: 'entity',
    executionModel: 'immediate',
    path: '/clientes',
    execute: () => {
      // Wired in Fase 2.5 (context menu — opens detail modal/panel)
    },
  },
  {
    id: 'client.edit',
    label: 'Editar Cliente',
    icon: Pencil,
    category: 'entity',
    keywords: ['editar', 'modificar'],
    entityType: 'client',
    scope: 'entity',
    executionModel: 'immediate',
    path: '/clientes',
    execute: () => {
      // Wired in Fase 2.5 (context menu)
    },
  },
  {
    id: 'client.delete',
    label: 'Eliminar Cliente',
    icon: Trash2,
    category: 'entity',
    keywords: ['eliminar', 'borrar'],
    entityType: 'client',
    scope: 'entity',
    executionModel: 'delayed-commit',
    path: '/clientes',
    destructive: true,
    bulkable: true,
    execute: () => {
      // Wired in Fase 2C/3A (delayed-commit via useUndoableAction)
    },
  },
  {
    id: 'client.whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    category: 'entity',
    keywords: ['whatsapp', 'mensaje', 'contactar'],
    entityType: 'client',
    scope: 'entity',
    executionModel: 'immediate',
    path: '/clientes',
    execute: () => {
      // Wired in Fase 2.5 (context menu — needs client phone from entity)
    },
  },
]

export function registerClientActions(): void {
  for (const action of clientActions) {
    actionRegistry.register(action)
  }
}
