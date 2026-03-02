/**
 * EntityContextMenu — Registry-driven right-click context menu
 *
 * Wraps children with Radix ContextMenu on pointer devices.
 * On touch devices (pointer: coarse), renders children directly.
 * Actions sourced from actionRegistry.getVisibleForEntity().
 */

'use client'

import { useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { actionRegistry } from '@/lib/actions'
import type { ActionDefinition, ActionContext } from '@/lib/actions'
import { useBusiness } from '@/contexts/business-context'
import { useToast } from '@/components/ui/toast'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

interface EntityContextMenuProps {
  entityType: 'appointment' | 'client' | 'service'
  entityId: string
  children: ReactNode
}

export function EntityContextMenu({ entityType, entityId, children }: EntityContextMenuProps) {
  const isTouch = useIsTouchDevice()
  const { isOwner, isBarber, staffPermissions, businessId, slug } = useBusiness()
  const router = useRouter()
  const toast = useToast()

  const actions = useMemo(() => {
    return actionRegistry.getVisibleForEntity({
      scope: 'entity',
      entityType,
      isOwner: isOwner ?? false,
      isBarber: isBarber ?? false,
      staffPermissions: staffPermissions ?? undefined,
    })
  }, [entityType, isOwner, isBarber, staffPermissions])

  const actionCtx: ActionContext = useMemo(
    () => ({
      navigate: (path: string) => router.push(path),
      entityId,
      businessId: businessId ?? '',
      slug: slug ?? undefined,
      toast,
    }),
    [router, entityId, businessId, slug, toast]
  )

  // Touch devices: no context menu, just render children
  if (isTouch) {
    return <>{children}</>
  }

  // No entity actions registered: render children without wrapper
  if (actions.length === 0) {
    return <>{children}</>
  }

  // Split into normal + destructive groups
  const normalActions = actions.filter((a) => !a.destructive)
  const destructiveActions = actions.filter((a) => a.destructive)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {normalActions.map((action: ActionDefinition) => {
          const Icon = action.icon
          return (
            <ContextMenuItem
              key={action.id}
              icon={<Icon className="h-4 w-4" />}
              onClick={() => action.execute(actionCtx)}
            >
              {action.label}
            </ContextMenuItem>
          )
        })}

        {destructiveActions.length > 0 && normalActions.length > 0 && <ContextMenuSeparator />}

        {destructiveActions.map((action: ActionDefinition) => {
          const Icon = action.icon
          return (
            <ContextMenuItem
              key={action.id}
              icon={<Icon className="h-4 w-4" />}
              danger
              onClick={() => action.execute(actionCtx)}
            >
              {action.label}
            </ContextMenuItem>
          )
        })}
      </ContextMenuContent>
    </ContextMenu>
  )
}
