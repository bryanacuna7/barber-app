'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  UserRound,
  AlertTriangle,
  Mail,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import {
  FadeInUp,
  StaggeredList,
  StaggeredItem,
  ScaleOnHover,
} from '@/components/ui/motion'
import type { Barber } from '@/types'
import { useToast } from '@/components/ui/toast'

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

export default function BarberosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [deleteBarber, setDeleteBarber] = useState<Barber | null>(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  })

  useEffect(() => {
    fetchBarbers()
  }, [])

  async function fetchBarbers() {
    try {
      const res = await fetch('/api/barbers')
      const data = await res.json()
      setBarbers(Array.isArray(data) ? data : [])
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

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
    setSubmitting(true)
    setError('')

    try {
      const url = editingBarber
        ? `/api/barbers/${editingBarber.id}`
        : '/api/barbers'

      const res = await fetch(url, {
        method: editingBarber ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
        return
      }

      toast.success(
        editingBarber
          ? 'Barbero actualizado correctamente.'
          : 'Barbero agregado correctamente.',
      )

      resetForm()
      fetchBarbers()
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteBarber) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/barbers/${deleteBarber.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al eliminar')
        return
      }

      toast.success('El barbero ha sido removido del staff.')

      setDeleteBarber(null)
      fetchBarbers()
    } catch {
      setError('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
              Staff de Barberos
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
              Gestiona tu equipo de profesionales
            </p>
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
              Agregar Barbero
            </Button>
          </motion.div>
        </div>
      </FadeInUp>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juan@ejemplo.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
          <Input
            label="Especialidad / Bio"
            placeholder="Ej: Experto en degradados y barba"
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} className="h-11">
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting} className="h-11">
              {editingBarber ? 'Actualizar' : 'Agregar'} Barbero
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteBarber}
        onClose={() => setDeleteBarber(null)}
        title="Eliminar Barbero"
      >
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
              isLoading={deleting}
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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-[17px] font-semibold">
                Equipo Activo
              </CardTitle>
              {!loading && barbers.length > 0 && (
                <span className="ml-auto rounded-full bg-zinc-100 px-2.5 py-0.5 text-[13px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {barbers.length} {barbers.length === 1 ? 'barbero' : 'barberos'}
                </span>
              )}
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
            ) : barbers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                  <UserRound className="h-10 w-10 text-violet-500 dark:text-violet-400" />
                </div>
                <p className="mt-5 text-[17px] font-medium text-zinc-900 dark:text-white">
                  Aún no tienes barberos
                </p>
                <p className="mt-1 text-[15px] text-zinc-500">
                  Agrega a tu primer profesional para gestionar citas.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <Button onClick={() => setShowForm(true)} className="h-11">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Barbero
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <StaggeredList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {barbers.map((barber, index) => {
                    const colorSet = BARBER_COLORS[index % BARBER_COLORS.length]
                    return (
                      <StaggeredItem key={barber.id}>
                        <ScaleOnHover>
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50"
                          >
                            {/* Gradient accent bar */}
                            <div
                              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorSet.gradient}`}
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
                              <div className={`relative ring-4 ${colorSet.ring} rounded-full`}>
                                <div
                                  className={`flex h-16 w-16 items-center justify-center rounded-full ${colorSet.bg}`}
                                >
                                  {barber.photo_url ? (
                                    <img
                                      src={barber.photo_url}
                                      alt={barber.name}
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <UserRound className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                                  )}
                                </div>
                                {/* Status indicator */}
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
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
    </div>
  )
}
