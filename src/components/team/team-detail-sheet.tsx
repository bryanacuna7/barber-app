'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Phone,
  Shield,
  Trash2,
  Pencil,
  Star,
  MessageCircle,
  Scissors,
  Wallet,
} from 'lucide-react'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { useUpdateBarber, useDeleteBarber } from '@/hooks/queries/useBarbers'
import type { UIBarber } from '@/lib/adapters/barbers'

// ─── Avatar (shared with list) ──────────────────────────────

function normalizeAvatarUrl(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined')
    return undefined
  return trimmed
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

// ─── Detail Content ─────────────────────────────────────────

function DetailContent({
  barber,
  onClose,
  initialMode = 'view',
}: {
  barber: UIBarber
  onClose: () => void
  initialMode?: 'view' | 'edit' | 'delete'
}) {
  const toast = useToast()
  const updateBarber = useUpdateBarber()
  const deleteBarber = useDeleteBarber()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(initialMode === 'delete')
  const [isEditing, setIsEditing] = useState(initialMode === 'edit')
  const [editName, setEditName] = useState(barber.name)
  const [editEmail, setEditEmail] = useState(barber.email)

  const handleToggleActive = async () => {
    try {
      await updateBarber.mutateAsync({
        id: barber.id,
        updates: { is_active: !barber.isActive },
      })
      toast.success(barber.isActive ? `${barber.name} desactivado` : `${barber.name} activado`)
      if (isMobileDevice()) haptics.tap()
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  const handleSaveEdit = async () => {
    const trimmedName = editName.trim()
    const trimmedEmail = editEmail.trim()
    if (!trimmedName) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    try {
      const updates: Record<string, string> = {}
      if (trimmedName !== barber.name) updates.name = trimmedName
      if (trimmedEmail !== barber.email) updates.email = trimmedEmail
      if (Object.keys(updates).length === 0) {
        setIsEditing(false)
        return
      }
      await updateBarber.mutateAsync({ id: barber.id, updates })
      toast.success('Perfil actualizado')
      setIsEditing(false)
      if (isMobileDevice()) haptics.success()
    } catch {
      toast.error('Error al actualizar perfil')
    }
  }

  const handleCancelEdit = () => {
    setEditName(barber.name)
    setEditEmail(barber.email)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await deleteBarber.mutateAsync(barber.id)
      toast.success(`${barber.name} eliminado`)
      onClose()
      if (isMobileDevice()) haptics.tap()
    } catch {
      toast.error('Error al eliminar miembro del equipo')
    }
  }

  const handleWhatsApp = () => {
    if (!barber.phone) return
    window.open(`https://wa.me/${barber.phone.replace(/\D/g, '')}`, '_blank')
  }

  const normalizedAvatar = normalizeAvatarUrl(barber.avatarUrl)

  if (isEditing) {
    return (
      <div className="space-y-5">
        <Input
          label="Nombre"
          type="text"
          placeholder="Ej: Juan Pérez"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          placeholder="juan@ejemplo.com"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleCancelEdit} className="h-11">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            isLoading={updateBarber.isPending}
            disabled={!editName.trim()}
            className="h-11"
          >
            Guardar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Centered Profile Header (Apple Contacts style) ── */}
      <div className="flex flex-col items-center pt-1 pb-1">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold mb-2.5 ${
            barber.isActive
              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-zinc-100 dark:bg-zinc-700/40 text-zinc-400'
          }`}
        >
          {normalizedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={normalizedAvatar}
              alt=""
              className="h-full w-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            getInitials(barber.name)
          )}
        </div>
        <p className="font-bold text-lg text-foreground text-center truncate max-w-[85%]">
          {barber.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              barber.isActive
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15'
                : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${barber.isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-zinc-400'}`}
            />
            {barber.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <span className="text-[11px] font-medium text-muted">
            {barber.role === 'owner' ? 'Dueño' : 'Barbero'}
          </span>
        </div>
      </div>

      {/* ── Quick Actions (Apple Contacts style) ── */}
      <div className="flex items-center justify-center gap-3">
        {barber.phone && (
          <a href={`tel:${barber.phone}`} className="flex flex-col items-center gap-1 w-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors active:bg-emerald-500/20">
              <Phone className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Llamar
            </span>
          </a>
        )}
        <a href={`mailto:${barber.email}`} className="flex flex-col items-center gap-1 w-16">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors active:bg-blue-500/20">
            <Mail className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Email</span>
        </a>
        {barber.phone && (
          <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1 w-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 transition-colors active:bg-green-500/20">
              <MessageCircle className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
              WhatsApp
            </span>
          </button>
        )}
        {barber.role !== 'owner' && (
          <button
            onClick={() => {
              setEditName(barber.name)
              setEditEmail(barber.email)
              setIsEditing(true)
            }}
            className="flex flex-col items-center gap-1 w-16"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-500/10 text-muted transition-colors active:bg-zinc-500/20">
              <Pencil className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[10px] font-medium text-muted">Editar</span>
          </button>
        )}
      </div>

      {/* ── Stats Grid (2x2 compact tiles — matches Clientes) ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Scissors className="h-3 w-3 text-muted" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Citas
            </span>
          </div>
          <p className="text-base font-bold text-foreground tabular-nums">
            {barber.totalAppointments ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Wallet className="h-3 w-3 text-muted" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Ingreso
            </span>
          </div>
          <p className="text-base font-bold text-foreground tabular-nums">
            ₡{Math.round((barber.totalRevenue ?? 0) / 1000)}k
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-current" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Rating
            </span>
          </div>
          <p className="text-base font-bold text-foreground tabular-nums">
            {barber.avgRating?.toFixed(1) ?? '—'}
          </p>
        </div>
      </div>

      {/* ── Info section ── */}
      <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] divide-y divide-zinc-100 dark:divide-white/[0.06]">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <Mail className="w-4 h-4 text-muted shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Email</p>
            <p className="text-sm text-foreground truncate">{barber.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-3">
          <Shield className="w-4 h-4 text-muted shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Cuenta</p>
            <p className="text-sm text-foreground">
              {barber.userId ? 'Vinculada — puede iniciar sesión' : 'Sin vincular'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Active toggle — NOT for owner ── */}
      {barber.role !== 'owner' && (
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3.5 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Acceso activo</p>
            <p className="text-[11px] text-muted mt-0.5">
              {barber.isActive
                ? 'Puede iniciar sesión y ver sus citas'
                : 'No puede acceder al sistema'}
            </p>
          </div>
          <IOSToggle
            checked={barber.isActive}
            onChange={handleToggleActive}
            disabled={updateBarber.isPending}
          />
        </div>
      )}

      {/* ── Delete — NOT for owner ── */}
      {barber.role !== 'owner' && (
        <AnimatePresence>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 active:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar miembro
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={animations.spring.snappy}
              className="space-y-3 overflow-hidden"
            >
              <p className="text-sm text-center text-red-600 dark:text-red-400 font-medium">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-11"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleteBarber.isPending}
                  className="h-11"
                >
                  Eliminar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// ─── Viewport-gated wrapper ─────────────────────────────────

interface TeamDetailSheetProps {
  barber: UIBarber | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'view' | 'edit' | 'delete'
}

export function TeamDetailSheet({
  barber,
  open,
  onOpenChange,
  initialMode = 'view',
}: TeamDetailSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (!barber) return null

  const handleClose = () => {
    onOpenChange(false)
  }

  // Desktop: centered Modal (preserves existing desktop pattern)
  if (isDesktop) {
    return (
      <Modal
        isOpen={open}
        onClose={handleClose}
        title={barber.name}
        description={barber.role === 'owner' ? 'Dueño' : 'Miembro del equipo'}
      >
        <DetailContent
          key={`${barber.id}-${initialMode}`}
          barber={barber}
          onClose={handleClose}
          initialMode={initialMode}
        />
      </Modal>
    )
  }

  // Mobile: bottom Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetClose onClose={handleClose} />
        <div className="max-h-[70vh] overflow-y-auto -mx-6 px-6 pb-[env(safe-area-inset-bottom,0px)]">
          <DetailContent
            key={`${barber.id}-${initialMode}`}
            barber={barber}
            onClose={handleClose}
            initialMode={initialMode}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
