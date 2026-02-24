'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, UserRound, AlertTriangle, Mail, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { FadeInUp, StaggeredList, StaggeredItem, ScaleOnHover } from '@/components/ui/motion'
import { IOSToggle } from '@/components/ui/ios-toggle'
import type { Barber } from '@/types'
import { useToast } from '@/components/ui/toast'
import { useBarbers, useCreateBarber, useUpdateBarber, useDeleteBarber } from '@/hooks/use-barbers'

// Premium barber color palette
const BARBER_COLORS = [
  {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    ring: 'ring-violet-500/30',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    ring: 'ring-blue-500/30',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    ring: 'ring-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    ring: 'ring-amber-500/30',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    ring: 'ring-rose-500/30',
    gradient: 'from-rose-500 to-pink-600',
  },
]

export function BarbersManagement() {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [deleteBarber, setDeleteBarber] = useState<Barber | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [togglingIds, setTogglingIds] = useState<string[]>([])
  const toast = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  })

  // React Query hooks
  const { data: barbers = [], isLoading: loading } = useBarbers()
  const createBarber = useCreateBarber()
  const updateBarber = useUpdateBarber()
  const deleteBarberMutation = useDeleteBarber()

  function resetForm() {
    setFormData({ name: '', email: '', bio: '' })
    setEditingBarber(null)
    setShowForm(false)
    setError('')
  }

  function handleEdit(barber: Barber) {
    setFormData({
      name: barber.name,
      email: barber.email,
      bio: barber.bio || '',
    })
    setEditingBarber(barber)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (editingBarber) {
        await updateBarber.mutateAsync({
          id: editingBarber.id,
          data: formData,
        })
        toast.success('Miembro del equipo actualizado correctamente.')
      } else {
        await createBarber.mutateAsync({
          name: formData.name,
          phone: formData.email,
        })
        toast.success('Miembro del equipo agregado correctamente.')
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  async function handleDelete() {
    if (!deleteBarber) return

    try {
      await deleteBarberMutation.mutateAsync(deleteBarber.id)
      toast.success('El miembro del equipo ha sido removido del staff.')
      setDeleteBarber(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function handleToggleActive(barber: Barber, nextValue: boolean) {
    if (togglingIds.includes(barber.id)) return

    setTogglingIds((prev) => (prev.includes(barber.id) ? prev : [...prev, barber.id]))

    try {
      await updateBarber.mutateAsync({
        id: barber.id,
        data: { is_active: nextValue },
      })
    } catch {
      toast.error('No pudimos actualizar el estado del miembro del equipo.')
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== barber.id))
    }
  }

  const filteredBarbers = barbers.filter((barber) => {
    const isActive = barber.is_active ?? true
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return isActive
    return !isActive
  })

  return (
    <>
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
              Staff
            </h1>
            <p className="text-[15px] text-muted mt-1">Gestiona tu equipo de profesionales</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="w-full sm:w-auto h-12 px-6 text-[15px] font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Agregar Miembro del equipo
            </Button>
          </motion.div>
        </div>
      </FadeInUp>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingBarber ? 'Editar Miembro del equipo' : 'Nuevo Miembro del equipo'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <Input
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juan@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Especialidad / Bio"
            placeholder="Ej: Experto en degradados y barba"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} className="h-11">
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createBarber.isPending || updateBarber.isPending}
              className="h-11"
            >
              {editingBarber ? 'Actualizar' : 'Agregar'} Miembro del equipo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteBarber} onClose={() => setDeleteBarber(null)} title="Eliminar Miembro del equipo">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
            >
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </motion.div>
            <div>
              <p className="text-[17px] text-zinc-900 dark:text-white">
                ¿Eliminar a <strong>{deleteBarber?.name}</strong>?
              </p>
              <p className="mt-2 text-[15px] text-zinc-500">
                Las citas existentes asignadas no se verán afectadas.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteBarber(null)} className="h-11">
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="h-11 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleDelete}
              isLoading={deleteBarberMutation.isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Barber List */}
      <FadeInUp delay={0.1}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: 'var(--brand-primary-contrast)' }}
                  />
                </div>
                <CardTitle className="text-[17px] font-semibold">Equipo</CardTitle>
                {!loading && filteredBarbers.length > 0 && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[13px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {filteredBarbers.length} {filteredBarbers.length === 1 ? 'miembro del equipo' : 'miembros del equipo'}
                  </span>
                )}
              </div>
              <div className="flex w-full items-center gap-1 rounded-full bg-zinc-100 p-1 text-[12px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:w-auto">
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Activos', value: 'active' },
                  { label: 'Inactivos', value: 'inactive' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                    className={`flex-1 rounded-full px-3 py-1.5 transition-colors sm:flex-initial ${
                      statusFilter === option.value
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                        : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
                />
              </div>
            ) : filteredBarbers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center"
              >
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px]"
                  style={{ background: 'var(--brand-primary-light)' }}
                >
                  <UserRound
                    className="h-10 w-10"
                    style={{ color: 'var(--brand-primary-on-light)' }}
                  />
                </div>
                <p className="mt-5 text-[17px] font-medium text-zinc-900 dark:text-white">
                  {statusFilter === 'inactive'
                    ? 'No hay miembros del equipo inactivos'
                    : 'Aún no tienes miembros del equipo'}
                </p>
                <p className="mt-1 text-[15px] text-zinc-500">
                  {statusFilter === 'inactive'
                    ? 'Todos tus miembros del equipo están activos.'
                    : 'Agrega a tu primer profesional para gestionar citas.'}
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  {statusFilter !== 'inactive' && (
                    <Button onClick={() => setShowForm(true)} className="h-11">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Miembro del equipo
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <StaggeredList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredBarbers.map((barber, index) => {
                    const isActive = barber.is_active ?? true
                    const isToggling = togglingIds.includes(barber.id)
                    return (
                      <StaggeredItem key={barber.id}>
                        <ScaleOnHover>
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${
                              isActive ? '' : 'opacity-75 grayscale-[10%]'
                            }`}
                          >
                            {/* Subtle brand accent */}
                            <div
                              className="absolute inset-x-0 top-0 h-[2px] opacity-60"
                              style={{ background: 'var(--brand-primary)' }}
                            />

                            {/* Actions */}
                            <div className="absolute right-3 top-4 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(barber)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100/90 text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteBarber(barber)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50/90 text-red-600 backdrop-blur-sm transition-colors hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>

                            {/* Avatar with ring */}
                            <div className="mb-4 flex items-center gap-4">
                              <div
                                className="relative rounded-full"
                                style={{
                                  boxShadow: '0 0 0 3px rgba(var(--brand-primary-rgb), 0.15)',
                                }}
                              >
                                <div
                                  className="flex h-16 w-16 items-center justify-center rounded-full"
                                  style={{ background: 'var(--brand-primary-light)' }}
                                >
                                  {barber.photo_url ? (
                                    <img
                                      src={barber.photo_url}
                                      alt={barber.name}
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <UserRound
                                      className="h-8 w-8"
                                      style={{ color: 'var(--brand-primary-on-light)' }}
                                    />
                                  )}
                                </div>
                                {/* Status indicator */}
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 ${
                                    isActive
                                      ? 'border-white bg-emerald-500 dark:border-zinc-900'
                                      : 'border-white bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate text-[17px] font-semibold text-zinc-900 dark:text-white">
                                  {barber.name}
                                </h3>
                                <p className="flex items-center gap-1.5 truncate text-[13px] text-zinc-500">
                                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                  {barber.email}
                                </p>
                              </div>
                            </div>

                            {/* Bio / Specialty */}
                            {barber.bio && (
                              <p className="line-clamp-2 text-[14px] text-zinc-600 dark:text-zinc-400">
                                {barber.bio}
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
                              <span className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                                {isToggling ? 'Guardando...' : isActive ? 'Activo' : 'Inactivo'}
                              </span>
                              <IOSToggle
                                checked={isActive}
                                disabled={isToggling}
                                onChange={(value) => handleToggleActive(barber, value)}
                              />
                            </div>
                          </motion.div>
                        </ScaleOnHover>
                      </StaggeredItem>
                    )
                  })}
                </AnimatePresence>
              </StaggeredList>
            )}
          </CardContent>
        </Card>
      </FadeInUp>
    </>
  )
}
