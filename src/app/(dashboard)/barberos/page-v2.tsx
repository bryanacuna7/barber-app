'use client'

/**
 * Barberos Page V2 - Team Management
 * Feature 0B: Owner can invite/manage barbers
 *
 * Real data from Supabase via React Query hooks.
 * Invite flow: name + email → creates auth user + barber record + sends email.
 * Manage: toggle active/inactive, delete barber.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ChevronRight,
  UserRound,
  Mail,
  Phone,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { useBusiness } from '@/contexts/business-context'
import {
  useBarbers,
  useAddBarber,
  useInviteBarber,
  useUpdateBarber,
  useDeleteBarber,
} from '@/hooks/queries/useBarbers'
import type { UIBarber } from '@/lib/adapters/barbers'

export default function BarberosPage() {
  const { businessId } = useBusiness()
  const { data: barbers, isLoading, error } = useBarbers(businessId)

  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)

  // Derive live barber from query data (stays in sync after mutations)
  const selectedBarber = useMemo(
    () => barbers?.find((b) => b.id === selectedBarberId) ?? null,
    [barbers, selectedBarberId]
  )

  const filteredBarbers = useMemo(() => {
    if (!barbers) return []
    if (!searchQuery) return barbers
    const q = searchQuery.toLowerCase()
    return barbers.filter(
      (b) => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
    )
  }, [barbers, searchQuery])

  const activeCount = barbers?.filter((b) => b.isActive).length ?? 0

  const openDetail = (barber: UIBarber) => {
    setSelectedBarberId(barber.id)
    if (isMobileDevice()) haptics.tap()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen px-0 pt-4 lg:px-0 lg:pt-0 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="space-y-1 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-700/70">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-none" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            Error al cargar barberos
          </p>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:pb-6 relative overflow-x-hidden">
      <div className="px-0 pt-4 sm:px-0 lg:px-0 lg:pt-0 space-y-4 sm:space-y-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="app-page-title brand-gradient-text">Equipo</h1>
              <p className="app-page-subtitle mt-1">
                {activeCount} barbero{activeCount !== 1 ? 's' : ''} activo
                {activeCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="lg:hidden">
                <NotificationBell />
              </div>
              <Button
                variant="gradient"
                onClick={() => {
                  setIsInviteOpen(true)
                  if (isMobileDevice()) haptics.tap()
                }}
                className="shrink-0 min-w-[44px] min-h-[44px] h-10 border-0"
              >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Agregar Barbero</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
            className="h-11 bg-white/65 dark:bg-white/[0.04] border border-zinc-200/70 dark:border-zinc-800/80"
          />
        </motion.div>

        {/* Barber List */}
        {filteredBarbers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
          >
            <UserRound className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
              {searchQuery ? 'Sin resultados' : 'Sin barberos'}
            </p>
            <p className="text-sm text-muted">
              {searchQuery
                ? 'Intenta con otro término de búsqueda'
                : 'Invita a tu primer barbero para empezar'}
            </p>
            {!searchQuery && (
              <Button
                variant="gradient"
                onClick={() => setIsInviteOpen(true)}
                className="mt-4 min-h-[44px]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Barbero
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 bg-white/92 dark:bg-zinc-900/88 shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            {/* Mobile: compact list */}
            <div className="lg:hidden">
              {filteredBarbers.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => openDetail(barber)}
                  className={`flex items-center gap-3 p-3.5 transition-colors cursor-pointer active:bg-zinc-100/80 dark:active:bg-white/[0.06] ${
                    index < filteredBarbers.length - 1
                      ? 'border-b border-zinc-200/70 dark:border-zinc-800/80'
                      : ''
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                      barber.isActive
                        ? 'bg-gradient-to-br from-teal-400 to-emerald-500'
                        : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    {barber.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={barber.avatarUrl}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[15px] text-zinc-900 dark:text-white truncate">
                        {barber.name}
                      </p>
                      {barber.role === 'owner' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
                          Dueño
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{barber.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        barber.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-muted'
                      }`}
                    >
                      {barber.isActive ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {barber.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: table layout with more info */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Barbero
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Estado
                    </th>
                    <th className="w-12 px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBarbers.map((barber, index) => (
                    <tr
                      key={barber.id}
                      onClick={() => openDetail(barber)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openDetail(barber)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver detalle de ${barber.name}`}
                      className={`group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:ring-inset ${
                        index < filteredBarbers.length - 1
                          ? 'border-b border-zinc-200 dark:border-zinc-800/80'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              barber.isActive
                                ? 'bg-gradient-to-br from-teal-400 to-emerald-500'
                                : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {barber.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={barber.avatarUrl}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                            {barber.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{barber.email}</td>
                      <td className="px-4 py-3">
                        {barber.role === 'owner' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                            <Shield className="h-3 w-3" />
                            Dueño
                          </span>
                        ) : (
                          <span className="text-sm text-muted">Barbero</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            barber.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-muted'
                          }`}
                        >
                          {barber.isActive ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {barber.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Bottom spacing for nav */}
        <div className="h-24 lg:h-0" />
      </div>

      {/* Invite Modal */}
      <InviteBarberModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />

      {/* Detail Modal */}
      {selectedBarber && (
        <BarberDetailModal
          barber={selectedBarber}
          open={!!selectedBarberId}
          onOpenChange={(open) => {
            if (!open) setSelectedBarberId(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Invite Barber Modal ──────────────────────────────────────

function InviteBarberModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const toast = useToast()
  const addBarber = useAddBarber()
  const inviteBarber = useInviteBarber()
  const [mode, setMode] = useState<'add' | 'invite'>('add')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    try {
      const result =
        mode === 'add'
          ? await addBarber.mutateAsync({ name: name.trim(), email: email.trim() })
          : await inviteBarber.mutateAsync({ name: name.trim(), email: email.trim() })

      if (mode === 'add') {
        if (result.email_sent) {
          toast.success(`Barbero agregado y correo enviado a ${email}`)
        } else {
          toast.warning(
            result.warning || 'Barbero agregado, pero no se pudo enviar el correo de acceso.'
          )
        }
      } else {
        toast.success(`Invitación enviada a ${email}`)
      }

      setName('')
      setEmail('')
      setMode('add')
      onOpenChange(false)
      if (isMobileDevice()) haptics.success()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al invitar barbero'
      toast.error(msg)
    }
  }

  const handleClose = () => {
    setName('')
    setEmail('')
    setMode('add')
    onOpenChange(false)
  }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={mode === 'add' ? 'Agregar Barbero' : 'Invitar Barbero'}
      description={
        mode === 'add'
          ? 'Crea su cuenta y envíale un enlace para establecer su contraseña.'
          : 'Envía una invitación por correo para que complete su acceso.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`h-10 rounded-lg text-sm font-medium transition-colors ${
              mode === 'add'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={`h-10 rounded-lg text-sm font-medium transition-colors ${
              mode === 'invite'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            Invitar
          </button>
        </div>

        <Input
          label="Nombre"
          type="text"
          placeholder="Ej: Juan Pérez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="juan@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="h-11">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={addBarber.isPending || inviteBarber.isPending}
            disabled={!name.trim() || !email.trim()}
            className="h-11"
          >
            {mode === 'add' ? 'Agregar Barbero' : 'Enviar Invitación'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Barber Detail Modal ──────────────────────────────────────

function BarberDetailModal({
  barber,
  open,
  onOpenChange,
}: {
  barber: UIBarber
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const toast = useToast()
  const updateBarber = useUpdateBarber()
  const deleteBarber = useDeleteBarber()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDelete = async () => {
    try {
      await deleteBarber.mutateAsync(barber.id)
      toast.success(`${barber.name} eliminado`)
      onOpenChange(false)
      if (isMobileDevice()) haptics.tap()
    } catch {
      toast.error('Error al eliminar barbero')
    }
  }

  const handleClose = () => {
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={barber.name}
      description={barber.role === 'owner' ? 'Dueño' : 'Barbero'}
    >
      <div className="space-y-5">
        {/* Avatar + status */}
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 ${
              barber.isActive
                ? 'bg-gradient-to-br from-teal-400 to-emerald-500'
                : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            {barber.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={barber.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-7 w-7 text-white" />
            )}
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                barber.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {barber.isActive ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {barber.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Email</div>
              <div className="font-medium text-zinc-900 dark:text-white truncate">
                {barber.email}
              </div>
            </div>
          </div>

          {barber.phone && (
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
              <Phone className="h-5 w-5 text-violet-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted">Teléfono</div>
                <div className="font-medium text-zinc-900 dark:text-white">{barber.phone}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <Shield className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Cuenta vinculada</div>
              <div className="font-medium text-zinc-900 dark:text-white">
                {barber.userId ? 'Sí — puede iniciar sesión' : 'No — sin acceso al sistema'}
              </div>
            </div>
          </div>
        </div>

        {/* Active toggle */}
        {barber.role !== 'owner' && (
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Acceso activo</p>
              <p className="text-xs text-muted mt-0.5">
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

        {/* Delete */}
        {barber.role !== 'owner' && (
          <AnimatePresence>
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar barbero
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
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
    </Modal>
  )
}
