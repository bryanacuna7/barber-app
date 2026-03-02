/**
 * Action Registry Types
 *
 * Shared interfaces for the centralized action system.
 * Actions are used by: command palette, context menu, bulk toolbar, keyboard shortcuts.
 *
 * ID format: `{entityType}.{verb}` — e.g. 'appointment.confirm', 'nav.dashboard'
 */

import type { StaffPermissions } from '@/lib/auth/roles'

/** Category for grouping in command palette */
export type ActionCategory = 'navigate' | 'create' | 'entity' | 'settings'

/** Execution model — determines undo/optimistic behavior (wired in Fase 2C/3A) */
export type ExecutionModel = 'delayed-commit' | 'immediate-compensate' | 'immediate'

/** Entity types that actions can target */
export type ActionEntityType = 'appointment' | 'client' | 'service' | 'barber'

/** Runtime context passed to execute() */
export interface ActionContext {
  navigate: (path: string) => void
  entityId?: string
  entityIds?: string[]
  businessId: string
  slug?: string
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
  }
}

/** Context for permission-filtered queries */
export interface VisibilityContext {
  scope: 'global' | 'entity'
  isOwner: boolean
  isBarber: boolean
  staffPermissions?: StaffPermissions
}

/** Core action definition registered in the action registry */
export interface ActionDefinition {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  category: ActionCategory
  keywords: string[]

  // Context
  entityType?: ActionEntityType
  scope: 'global' | 'entity'

  // Execution
  executionModel: ExecutionModel
  execute: (ctx: ActionContext) => void | Promise<void>

  // Permissions
  path?: string
  requiredPermission?: keyof StaffPermissions

  // UI hints
  destructive?: boolean
  bulkable?: boolean
  pinEligible?: boolean
}
