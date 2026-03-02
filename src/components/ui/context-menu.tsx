/**
 * ContextMenu — Styled Radix wrapper
 *
 * Matches existing dropdown.tsx styling.
 * Provides: Root, Trigger, Content, Item, Separator, Label.
 */

'use client'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

// Re-export Root and Trigger as-is
export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger

// Styled Content
interface ContextMenuContentProps {
  children: ReactNode
  className?: string
}

export function ContextMenuContent({ children, className }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          'z-50 min-w-[200px]',
          'bg-white dark:bg-zinc-900 rounded-xl shadow-lg',
          'border border-zinc-200 dark:border-zinc-800',
          'py-1.5',
          'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
      >
        {children}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  )
}

// Styled Item
interface ContextMenuItemProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  className?: string
}

export function ContextMenuItem({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
  className,
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      disabled={disabled}
      onSelect={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm cursor-default outline-none',
        'transition-colors duration-150',
        'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
        danger
          ? 'text-red-600 dark:text-red-400 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/30'
          : 'text-zinc-900 dark:text-zinc-100 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800',
        className
      )}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </ContextMenuPrimitive.Item>
  )
}

// Styled Separator
export function ContextMenuSeparator() {
  return (
    <ContextMenuPrimitive.Separator className="my-1.5 border-t border-zinc-200 dark:border-zinc-800" />
  )
}

// Styled Label
export function ContextMenuLabel({ children }: { children: ReactNode }) {
  return (
    <ContextMenuPrimitive.Label className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
      {children}
    </ContextMenuPrimitive.Label>
  )
}
