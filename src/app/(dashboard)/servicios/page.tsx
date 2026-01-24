'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Scissors,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

// Service color palette
const SERVICE_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
]

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(data)
    } catch {
      setError('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
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
    setSubmitting(true)
    setError('')

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : '/api/services'

      const res = await fetch(url, {
        method: editingService ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar servicio')
        return
      }

      resetForm()
      fetchServices()
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteService) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/services/${deleteService.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al eliminar servicio')
        return
      }

      setDeleteService(null)
      fetchServices()
    } catch {
      setError('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  // Calculate stats
  const totalServices = services.length
  const avgPrice =
    totalServices > 0
      ? services.reduce((sum, s) => sum + Number(s.price), 0) / totalServices
      : 0
  const avgDuration =
    totalServices > 0
      ? Math.round(
          services.reduce((sum, s) => sum + s.duration_minutes, 0) /
            totalServices,
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Servicios
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gestiona el catálogo de servicios de tu barbería
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Servicio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Servicios</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {totalServices}
                </p>
              </div>
              <Scissors className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Precio Promedio</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(avgPrice)}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center text-zinc-300 dark:text-zinc-700 text-2xl font-bold">
                ₡
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Duración Promedio</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {avgDuration} min
                </p>
              </div>
              <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Nombre del servicio"
            type="text"
            placeholder="Ej: Corte de cabello"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <Input
            label="Descripción (opcional)"
            type="text"
            placeholder="Ej: Incluye lavado y peinado"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
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
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-zinc-900 dark:text-white">
                ¿Estás seguro de que deseas eliminar{' '}
                <strong>{deleteService?.name}</strong>?
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Esta acción no se puede deshacer. Las citas existentes con este
                servicio no se verán afectadas.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteService(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Service List */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white" />
            </div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center">
              <Scissors className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-4 text-zinc-500">
                No tienes servicios registrados.
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Agrega tu primer servicio para que los clientes puedan reservar.
              </p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Servicio
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => {
                const colorClass = SERVICE_COLORS[index % SERVICE_COLORS.length]
                return (
                  <div
                    key={service.id}
                    className="group relative rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    {/* Actions */}
                    <div className="absolute right-4 top-4 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(service)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                        title="Editar servicio"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteService(service)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50/90 text-red-600 shadow-sm backdrop-blur-sm transition-all hover:bg-red-100 hover:text-red-700 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Card Header: Icon */}
                    <div className="mb-4">
                      {/* Service Icon */}
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
                      >
                        <Scissors className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Service Info */}
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {/* Duration & Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        {service.duration_minutes} min
                      </div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(Number(service.price))}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
