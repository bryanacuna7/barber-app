/**
 * Appointment actions
 *
 * Global: create
 * Entity: confirm, complete, cancel, reschedule, whatsapp
 */

import { Plus, CheckCircle, CheckCheck, XCircle, CalendarClock, MessageCircle } from 'lucide-react'
import { actionRegistry } from '../registry'
import type { ActionDefinition } from '../types'

const appointmentActions: ActionDefinition[] = [
  // Global
  {
    id: 'appointment.create',
    label: 'Nueva Cita',
    icon: Plus,
    category: 'create',
    keywords: ['crear', 'nueva', 'cita', 'reserva', 'agendar'],
    scope: 'global',
    executionModel: 'immediate',
    path: '/citas',
    requiredPermission: 'can_create_citas',
    execute: (ctx) => ctx.navigate('/citas?intent=create'),
  },
  // Entity
  {
    id: 'appointment.confirm',
    label: 'Confirmar Cita',
    icon: CheckCircle,
    category: 'entity',
    keywords: ['confirmar', 'aceptar'],
    entityType: 'appointment',
    scope: 'entity',
    executionModel: 'delayed-commit',
    path: '/citas',
    bulkable: true,
    execute: () => {
      // Wired in Fase 2C (delayed-commit via useUndoableAction)
    },
  },
  {
    id: 'appointment.complete',
    label: 'Completar Cita',
    icon: CheckCheck,
    category: 'entity',
    keywords: ['completar', 'finalizar', 'terminar'],
    entityType: 'appointment',
    scope: 'entity',
    executionModel: 'immediate-compensate',
    path: '/citas',
    bulkable: true,
    execute: () => {
      // Wired in Fase 3A (optimistic via useOptimisticMutation)
    },
  },
  {
    id: 'appointment.cancel',
    label: 'Cancelar Cita',
    icon: XCircle,
    category: 'entity',
    keywords: ['cancelar', 'eliminar'],
    entityType: 'appointment',
    scope: 'entity',
    executionModel: 'delayed-commit',
    path: '/citas',
    destructive: true,
    bulkable: true,
    execute: () => {
      // Wired in Fase 2C (delayed-commit via useUndoableAction)
    },
  },
  {
    id: 'appointment.reschedule',
    label: 'Reagendar Cita',
    icon: CalendarClock,
    category: 'entity',
    keywords: ['reagendar', 'mover', 'cambiar fecha'],
    entityType: 'appointment',
    scope: 'entity',
    executionModel: 'immediate',
    path: '/citas',
    execute: () => {
      // Wired in Fase 2.5 (context menu)
    },
  },
  {
    id: 'appointment.whatsapp',
    label: 'WhatsApp al Cliente',
    icon: MessageCircle,
    category: 'entity',
    keywords: ['whatsapp', 'mensaje', 'contactar'],
    entityType: 'appointment',
    scope: 'entity',
    executionModel: 'immediate',
    path: '/citas',
    execute: () => {
      // Wired in Fase 2.5 (context menu — needs client phone from entity)
    },
  },
]

export function registerAppointmentActions(): void {
  for (const action of appointmentActions) {
    actionRegistry.register(action)
  }
}
