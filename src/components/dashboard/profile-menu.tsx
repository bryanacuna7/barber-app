'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Settings,
  History,
  LogOut,
  PencilLine,
  Check,
  CreditCard,
  Shield,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'
import { usePreference } from '@/lib/preferences'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type ThemeMode = 'system' | 'light' | 'dark'

export function TopBarProfileMenu() {
  const router = useRouter()
  const toast = useToast()
  const { userEmail, userName, userAvatarUrl, isOwner, isAdmin } = useBusiness()

  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [themeMode, setThemeMode] = usePreference<ThemeMode>('theme_mode', 'system', [
    'system',
    'light',
    'dark',
  ])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const mounted = typeof window !== 'undefined'
  const normalizedAvatarUrl = useMemo(() => {
    if (typeof userAvatarUrl !== 'string') return undefined
    const trimmed = userAvatarUrl.trim()
    if (!trimmed) return undefined

    const lowered = trimmed.toLowerCase()
    if (lowered === 'null' || lowered === 'undefined') return undefined

    return trimmed
  }, [userAvatarUrl])
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | undefined>(undefined)
  const showAvatarImage = Boolean(normalizedAvatarUrl) && failedAvatarUrl !== normalizedAvatarUrl

  const fallbackName = userName || userEmail?.split('@')[0] || 'Usuario'
  const accountHref = isOwner ? '/configuracion/general' : '/mi-dia/cuenta'
  const avatarInitials = useMemo(() => {
    const normalized = fallbackName.trim()
    if (!normalized) return 'U'

    const parts = normalized.split(/\s+/).filter(Boolean)
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

    return initials || 'U'
  }, [fallbackName])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    setDisplayName(fallbackName)
    setNameInput(fallbackName)
  }, [fallbackName])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const shouldUseDark = themeMode === 'dark' || (themeMode === 'system' && media.matches)
      root.classList.toggle('dark', shouldUseDark)
      root.classList.toggle('light', !shouldUseDark)
      root.style.colorScheme = shouldUseDark ? 'dark' : 'light'
    }

    applyTheme()
    if (themeMode !== 'system') return

    const listener = () => applyTheme()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }

    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [themeMode])

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportPadding = 12
    const right = Math.max(viewportPadding, window.innerWidth - rect.right)

    setMenuPosition({
      top: rect.bottom + 8,
      right,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    updateMenuPosition()

    const onResize = () => updateMenuPosition()
    const onScroll = () => updateMenuPosition()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      closeMenu()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [isOpen, closeMenu, updateMenuPosition])

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href)
      closeMenu()
    },
    [router, closeMenu]
  )

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    const supabase = createClient()
    try {
      await supabase.auth.signOut()
    } finally {
      window.location.assign('/login')
    }
  }, [isLoggingOut])

  const handleSaveDisplayName = useCallback(async () => {
    const normalized = nameInput.trim()
    if (!normalized) {
      toast.error('El nombre no puede estar vacío.')
      return
    }
    if (normalized.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres.')
      return
    }

    setIsSavingName(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: normalized,
        name: normalized,
      },
    })
    setIsSavingName(false)

    if (error) {
      toast.error('No se pudo actualizar tu nombre.')
      return
    }

    setDisplayName(normalized)
    setNameInput(normalized)
    setIsEditingName(false)
    toast.success('Nombre actualizado.')
  }, [nameInput, toast])

  const menu = isOpen ? (
    <div
      ref={menuRef}
      className="fixed z-[1000] w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      style={{ top: menuPosition.top, right: menuPosition.right }}
      role="menu"
      aria-label="Menú de perfil"
    >
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {displayName}
        </p>
        {userEmail && (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{userEmail}</p>
        )}
      </div>

      <div className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Cuenta
      </div>
      <div className="py-1">
        <MenuButton
          icon={<Settings className="h-4 w-4" />}
          label="Configuración"
          onClick={() => handleNavigate(accountHref)}
        />
        {isOwner && (
          <MenuButton
            icon={<CreditCard className="h-4 w-4" />}
            label="Suscripción"
            onClick={() => handleNavigate('/suscripcion')}
          />
        )}
        {isAdmin && (
          <MenuButton
            icon={<Shield className="h-4 w-4" />}
            label="Panel Admin"
            onClick={() => handleNavigate('/admin')}
          />
        )}
      </div>

      <div className="border-t border-zinc-200 px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Perfil
      </div>
      <div className="py-1">
        <MenuButton
          icon={<PencilLine className="h-4 w-4" />}
          label="Editar nombre visible"
          onClick={() => setIsEditingName((prev) => !prev)}
        />
      </div>

      {isEditingName && (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Nombre
          </label>
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Tu nombre"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNameInput(displayName)
                setIsEditingName(false)
              }}
              className="h-8 rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveDisplayName}
              disabled={isSavingName}
              className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSavingName ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {isOwner && (
        <>
          <div className="border-t border-zinc-200 px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            Producto
          </div>
          <div className="py-1">
            <MenuButton
              icon={<History className="h-4 w-4" />}
              label="Novedades"
              onClick={() => handleNavigate('/changelog')}
            />
          </div>
        </>
      )}

      <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Tema
        </p>
        <div className="space-y-1">
          <ThemeOptionButton
            label="Sistema"
            icon={<Monitor className="h-4 w-4" />}
            selected={themeMode === 'system'}
            onClick={() => setThemeMode('system')}
          />
          <ThemeOptionButton
            label="Claro"
            icon={<Sun className="h-4 w-4" />}
            selected={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
          />
          <ThemeOptionButton
            label="Oscuro"
            icon={<Moon className="h-4 w-4" />}
            selected={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
          />
        </div>
      </div>

      <div className="border-t border-zinc-200 py-1.5 dark:border-zinc-800">
        <MenuButton
          icon={<LogOut className="h-4 w-4" />}
          label={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          onClick={handleLogout}
          disabled={isLoggingOut}
          danger
        />
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Perfil de ${displayName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/70 bg-white/70 transition-colors',
          'hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-white/[0.03] dark:hover:bg-zinc-800',
          isOpen && 'bg-zinc-100 dark:bg-zinc-800'
        )}
      >
        {showAvatarImage ? (
          <img
            src={normalizedAvatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setFailedAvatarUrl(normalizedAvatarUrl)}
          />
        ) : null}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700"
          style={{ display: showAvatarImage ? 'none' : 'flex' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            {avatarInitials}
          </span>
        </div>
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </>
  )
}

function MenuButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-60',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function ThemeOptionButton({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string
  icon: ReactNode
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-full items-center justify-between rounded-md px-2.5 text-sm transition-colors',
        selected
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70'
      )}
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
        <span>{label}</span>
      </span>
      {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
    </button>
  )
}
