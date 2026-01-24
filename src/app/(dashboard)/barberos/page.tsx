'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  UserRound,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import type { Barber } from '@/types'
import { useToast } from '@/components/ui/toast'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Staff de Barberos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gestiona tu equipo de trabajo
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Barbero
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipo Activo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white" />
            </div>
          ) : barbers.length === 0 ? (
            <div className="py-12 text-center">
              <UserRound className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-4 text-zinc-500">No hay barberos registrados.</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar tu primer barbero
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="group relative rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {barber.photo_url ? (
                        <img
                          src={barber.photo_url}
                          alt={barber.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-6 w-6 text-zinc-500" />
                      )}
                    </div>

                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(barber)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteBarber(barber)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {barber.name}
                  </h3>
                  <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {barber.email}
                  </p>

                  {barber.bio && (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {barber.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingBarber ? 'Editar Barbero' : 'Agregar Nuevo Barbero'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Biografía / Especialidad"
            placeholder="Ej: Experto en degradados y barba"
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
          />

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingBarber ? 'Guardar Cambios' : 'Agregar Barbero'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteBarber}
        onClose={() => setDeleteBarber(null)}
        title="Eliminar Barbero"
      >
        <div className="space-y-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p>
            ¿Estás seguro de que quieres eliminar a{' '}
            <strong>{deleteBarber?.name}</strong>?
          </p>
          <p className="text-sm text-zinc-500">
            Las citas existentes asignadas a este barbero no se verán afectadas.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteBarber(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
