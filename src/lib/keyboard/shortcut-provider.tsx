'use client'

/**
 * Keyboard Shortcut Provider
 *
 * Single global keydown listener. Delegates to shortcut-registry.
 * Guards: skips if target is input/textarea/contenteditable or if a modal/sheet is open.
 *
 * Registers default shortcuts (navigation 1-5, N for new appointment, ? for help)
 * and delegates Cmd+K to CommandPalette via its context.
 */

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { shortcutRegistry } from './shortcut-registry'
import type { ShortcutDefinition } from './types'
import { useBusiness } from '@/contexts/business-context'
import { canBarberAccessPath } from '@/lib/auth/roles'
import { useCommandPalette } from '@/components/dashboard/command-palette'

interface ShortcutProviderProps {
  children: ReactNode
}

export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const router = useRouter()
  const { isBarber, isOwner, staffPermissions } = useBusiness()
  const paletteCtx = useCommandPalette()

  // Register default shortcuts
  useEffect(() => {
    const canAccess = (path: string) => {
      if (!isBarber || isOwner) return true
      return canBarberAccessPath(path, staffPermissions)
    }

    const defs: ShortcutDefinition[] = [
      // Navigation (1-5)
      {
        id: 'nav.dashboard',
        keys: '1',
        key: '1',
        description: 'Ir a Dashboard',
        category: 'navigation',
        action: () => router.push('/dashboard'),
        enabled: () => canAccess('/dashboard'),
      },
      {
        id: 'nav.citas',
        keys: '2',
        key: '2',
        description: 'Ir a Citas',
        category: 'navigation',
        action: () => router.push('/citas'),
        enabled: () => canAccess('/citas'),
      },
      {
        id: 'nav.clientes',
        keys: '3',
        key: '3',
        description: 'Ir a Clientes',
        category: 'navigation',
        action: () => router.push('/clientes'),
        enabled: () => canAccess('/clientes'),
      },
      {
        id: 'nav.servicios',
        keys: '4',
        key: '4',
        description: 'Ir a Servicios',
        category: 'navigation',
        action: () => router.push('/servicios'),
        enabled: () => canAccess('/servicios'),
      },
      {
        id: 'nav.equipo',
        keys: '5',
        key: '5',
        description: 'Ir a Equipo',
        category: 'navigation',
        action: () => router.push('/barberos'),
        enabled: () => canAccess('/barberos'),
      },
      // Actions
      {
        id: 'appointment.create',
        keys: 'N',
        key: 'n',
        description: 'Nueva Cita',
        category: 'action',
        action: () => router.push('/citas?intent=create'),
        enabled: () => canAccess('/citas'),
      },
      // Palette
      {
        id: 'palette.toggle',
        keys: '⌘/Ctrl + K',
        key: 'k',
        modifiers: { meta: true },
        description: 'Abrir/Cerrar Command Palette',
        category: 'palette',
        action: () => paletteCtx.toggle(),
      },
      {
        id: 'palette.help',
        keys: '?',
        key: '?',
        modifiers: { shift: true },
        description: 'Abrir ayuda de atajos',
        category: 'palette',
        // Action set dynamically — the help modal state is managed by command-palette
        // We use a custom event to signal the palette to open help
        action: () => {
          window.dispatchEvent(new CustomEvent('shortcut:open-help'))
        },
      },
    ]

    const unregisters = defs.map((d) => shortcutRegistry.register(d))

    return () => {
      unregisters.forEach((fn) => fn())
    }
  }, [router, isBarber, isOwner, staffPermissions, paletteCtx])

  // Global keydown listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Desktop-only: ignore keyboard shortcuts on touch/coarse-pointer devices.
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return
      }

      // Guard: skip if focus is on an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: Cmd+K should work even in inputs
        if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
          return
        }
      }

      // Guard: skip if a modal/sheet/dialog is open (check for [role="dialog"])
      const hasOpenDialog = document.querySelector('[role="dialog"]')
      if (hasOpenDialog) {
        // Exception: Cmd+K and Escape should still work with dialogs open
        if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') && e.key !== 'Escape') {
          return
        }
      }

      const allShortcuts = shortcutRegistry.getAll()

      for (const shortcut of allShortcuts) {
        if (shortcut.enabled && !shortcut.enabled()) continue

        const mods = shortcut.modifiers ?? {}

        // Check modifiers
        const needsMeta = mods.meta || mods.ctrl
        const hasMeta = e.metaKey || e.ctrlKey
        if (needsMeta && !hasMeta) continue
        if (!needsMeta && (e.metaKey || e.ctrlKey)) continue

        const needsShift = mods.shift
        // For keys like '?' that inherently require shift, don't double-check
        if (needsShift && !e.shiftKey) continue

        const needsAlt = mods.alt
        if (needsAlt && !e.altKey) continue
        if (!needsAlt && e.altKey) continue

        // Check key match
        if (e.key.toLowerCase() === shortcut.key.toLowerCase() || e.key === shortcut.key) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return <>{children}</>
}
