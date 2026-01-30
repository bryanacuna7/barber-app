'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Clock, Scissors, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { formatCurrency } from '@/lib/utils'
import { FadeInUp, StaggeredList, StaggeredItem, ScaleOnHover } from '@/components/ui/motion'
import type { Service } from '@/types'
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/use-services'

// Service color palette
const SERVICE_COLORS = [
  {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    gradient: 'from-rose-500 to-pink-600',
  },
]

export default function ServiciosPage() {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
  })

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // React Query hooks
  const { data: services = [], isLoading: loading, refetch } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteServiceMutation = useDeleteService()

  // Pull to refresh handler
  const handleRefresh = async () => {
    await refetch()
  }

  function resetForm() {
    setFormData({ name: '', description: '', duration_minutes: 30, price: 0 })
    setEditingService(null)
    setShowForm(false)
    setError('')
  }

  function handleEdit(service: Service) {
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: Number(service.price),
    })
    setEditingService(service)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          data: formData,
        })
      } else {
        await createService.mutateAsync(formData)
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar servicio')
    }
  }

  async function handleDelete() {
    if (!deleteService) return

    try {
      await deleteServiceMutation.mutateAsync(deleteService.id)
      setDeleteService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
              Servicios
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
              Gestiona el catálogo de servicios de tu barbería
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
              Agregar Servicio
            </Button>
          </motion.div>
        </div>
      </FadeInUp>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
            label="Nombre del servicio"
            type="text"
            placeholder="Ej: Corte de cabello"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Descripción (opcional)"
            type="text"
            placeholder="Ej: Incluye lavado y peinado"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración (minutos)"
              type="number"
              min={5}
              max={480}
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration_minutes: Number(e.target.value),
                }))
              }
              required
            />

            <Input
              label="Precio (CRC)"
              type="number"
              min={0}
              step={100}
              value={formData.price || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: e.target.value === '' ? 0 : Number(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm} className="h-11">
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createService.isPending || updateService.isPending}
              className="h-11"
            >
              {editingService ? 'Actualizar' : 'Crear'} Servicio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteService}
        onClose={() => setDeleteService(null)}
        title="Eliminar Servicio"
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
                ¿Estás seguro de que deseas eliminar <strong>{deleteService?.name}</strong>?
              </p>
              <p className="mt-2 text-[15px] text-zinc-500">
                Esta acción no se puede deshacer. Las citas existentes con este servicio no se verán
                afectadas.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteService(null)} className="h-11">
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="h-11 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleDelete}
              isLoading={deleteServiceMutation.isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Service List */}
      <FadeInUp delay={0.1}>
        <div className="space-y-4">
          <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white">
            Catálogo de Servicios
          </h3>

          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
                />
              </div>
            ) : services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-zinc-100 dark:bg-zinc-800">
                  <Scissors className="h-10 w-10 text-zinc-400" />
                </div>
                <p className="mt-5 text-[17px] font-medium text-zinc-900 dark:text-white">
                  No tienes servicios registrados
                </p>
                <p className="mt-1 text-[15px] text-zinc-500">
                  Agrega tu primer servicio para que los clientes puedan reservar.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <Button onClick={() => setShowForm(true)} className="h-11">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Servicio
                  </Button>
                </motion.div>
              </motion.div>
            ) : isMobile ? (
              <PullToRefresh onRefresh={handleRefresh}>
                <StaggeredList className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {services.map((service) => {
                      return (
                        <StaggeredItem key={service.id}>
                          {/* Compact mobile view - with swipe gestures */}
                          <div className="relative rounded-xl overflow-hidden">
                            {/* Swipeable content */}
                            <motion.div
                              drag="x"
                              dragConstraints={{ left: -200, right: 0 }}
                              dragElastic={0.1}
                              dragMomentum={false}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="group relative z-10 w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 touch-pan-y border-l-4 border-l-blue-500"
                            >
                              {/* Action buttons - iOS style ovals */}
                              <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3 px-3 translate-x-full">
                                {/* Edit button */}
                                <motion.button
                                  onClick={() => handleEdit(service)}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex h-12 w-20 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
                                >
                                  <Pencil className="h-5 w-5" />
                                </motion.button>
                                {/* Delete button */}
                                <motion.button
                                  onClick={() => setDeleteService(service)}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex h-12 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </motion.button>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-zinc-900 dark:text-white truncate">
                                    {service.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {service.duration_minutes} min
                                  </span>
                                </div>
                              </div>
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {formatCurrency(Number(service.price))}
                              </span>
                            </motion.div>
                          </div>
                        </StaggeredItem>
                      )
                    })}
                  </AnimatePresence>
                </StaggeredList>
              </PullToRefresh>
            ) : (
              <StaggeredList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {services.map((service) => {
                    return (
                      <StaggeredItem key={service.id}>
                        <ScaleOnHover>
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            {/* Subtle brand accent */}
                            <div
                              className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-60"
                              style={{ background: 'var(--brand-primary)' }}
                            />

                            {/* Actions */}
                            <div className="absolute right-3 top-4 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(service)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100/90 text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                title="Editar servicio"
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteService(service)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50/90 text-red-600 backdrop-blur-sm transition-colors hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
                                title="Eliminar servicio"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>

                            {/* Service Icon */}
                            <div className="mb-4">
                              <div
                                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                                style={{
                                  background: 'var(--brand-primary-light)',
                                  color: 'var(--brand-primary-on-light)',
                                }}
                              >
                                <Scissors className="h-7 w-7" />
                              </div>
                            </div>

                            {/* Service Info */}
                            <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="mt-1 text-[13px] text-zinc-500 line-clamp-2">
                                {service.description}
                              </p>
                            )}

                            {/* Duration & Price */}
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                                <Clock className="h-4 w-4" />
                                {service.duration_minutes} min
                              </div>
                              <p className="text-[20px] font-bold text-zinc-900 dark:text-white">
                                {formatCurrency(Number(service.price))}
                              </p>
                            </div>
                          </motion.div>
                        </ScaleOnHover>
                      </StaggeredItem>
                    )
                  })}
                </AnimatePresence>
              </StaggeredList>
            )}
          </div>
        </div>
      </FadeInUp>
    </div>
  )
}
