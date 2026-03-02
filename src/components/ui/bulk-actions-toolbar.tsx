/**
 * BulkActionsToolbar — Floating bottom toolbar for multi-select actions
 *
 * Shows when 1+ items are selected. Positioned above mobile bottom nav.
 * Actions sourced from action registry via getVisibleBulkable().
 * Escape key clears selection.
 */

'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { animations } from '@/lib/design-system'
import { actionRegistry } from '@/lib/actions'
import type { ActionDefinition, VisibilityContext } from '@/lib/actions'
import { useBusiness } from '@/contexts/business-context'
import { cn } from '@/lib/utils'

interface BulkActionsToolbarProps {
  count: number
  entityType: 'appointment' | 'client' | 'service'
  onAction: (actionId: string, ids: string[]) => void
  selectedIds: string[]
  onClear: () => void
}

const ENTITY_NOUNS = {
  appointment: { singular: 'cita', plural: 'citas' },
  client: { singular: 'cliente', plural: 'clientes' },
  service: { singular: 'servicio', plural: 'servicios' },
} as const

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function BulkActionsToolbar({
  count,
  entityType,
  onAction,
  selectedIds,
  onClear,
}: BulkActionsToolbarProps) {
  const { isOwner, isBarber, staffPermissions } = useBusiness()

  // Escape key clears selection
  useEffect(() => {
    if (count === 0) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClear()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [count, onClear])

  const visibilityCtx: VisibilityContext = {
    scope: 'entity',
    isOwner: isOwner ?? false,
    isBarber: isBarber ?? false,
    staffPermissions: staffPermissions ?? undefined,
  }

  const bulkActions = actionRegistry.getVisibleBulkable({
    ...visibilityCtx,
    entityType,
  })
  const nouns = ENTITY_NOUNS[entityType]
  const entityLabel = count === 1 ? nouns.singular : nouns.plural
  const selectedLabel = `${entityLabel} seleccionado${count === 1 ? '' : 's'}`

  const toolbar = (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={animations.spring.snappy}
          className={cn(
            'fixed left-1/2 z-[70] -translate-x-1/2',
            'bottom-[calc(6.25rem+env(safe-area-inset-bottom))] lg:bottom-6'
          )}
        >
          <div
            className={cn(
              'flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border px-2.5 py-2 shadow-2xl',
              'border-zinc-200/90 bg-white/95 backdrop-blur-sm dark:border-zinc-700/90 dark:bg-zinc-900/95'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                {count}
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-foreground">
                {selectedLabel}
              </span>
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

            <div className="flex items-center gap-2">
              {bulkActions.map((action: ActionDefinition) => {
                const Icon = action.icon
                const actionLabel =
                  action.id === `${entityType}.delete`
                    ? `Eliminar ${capitalize(entityLabel)}`
                    : action.label
                return (
                  <Button
                    key={action.id}
                    variant={action.destructive ? 'danger' : 'ghost'}
                    size="sm"
                    onClick={() => onAction(action.id, selectedIds)}
                    className="h-8 min-h-0 gap-1.5 rounded-full px-3.5 py-1.5 text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{actionLabel}</span>
                  </Button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={onClear}
              className="rounded-full p-2 text-muted transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
              aria-label="Deseleccionar todo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* Spacer to avoid overlapping bottom content when toolbar is visible */}
      {count > 0 && <div aria-hidden className="h-28 lg:h-20" />}
      {typeof document !== 'undefined' ? createPortal(toolbar, document.body) : null}
    </>
  )
}
