'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, Calendar, Banknote, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Client } from '@/types'

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients(searchTerm?: string) {
    try {
      const url = searchTerm
        ? `/api/clients?search=${encodeURIComponent(searchTerm)}`
        : '/api/clients'
      const res = await fetch(url)
      const data = await res.json()
      setClients(data)
    } catch {
      setError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          notes: formData.notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear cliente')
        return
      }

      setFormData({ name: '', phone: '', email: '', notes: '' })
      setShowForm(false)
      fetchClients()
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSearch(value: string) {
    setSearch(value)
    // Debounce search
    const timeout = setTimeout(() => {
      fetchClients(value)
    }, 300)
    return () => clearTimeout(timeout)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Clientes
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total Clientes</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {clients.length}
                </p>
              </div>
              <User className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Visitas Totales</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {clients.reduce((sum, c) => sum + (c.total_visits || 0), 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Ingresos de Clientes</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0))}
                </p>
              </div>
              <Banknote className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre completo"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="87175866"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Email (opcional)"
                type="email"
                placeholder="cliente@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Preferencias, alergias, etc..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" isLoading={submitting}>
                  Guardar
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white" />
            </div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center">
              <User className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-4 text-zinc-500">
                {search
                  ? 'No se encontraron clientes con ese criterio.'
                  : 'No tienes clientes registrados aún.'}
              </p>
              {!search && (
                <p className="mt-2 text-sm text-zinc-400">
                  Los clientes se agregan automáticamente cuando reservan una cita.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-start justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {client.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {client.email}
                          </span>
                        )}
                      </div>
                      {client.notes && (
                        <p className="mt-2 text-sm text-zinc-400 italic">
                          {client.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {client.total_visits || 0} visitas
                    </p>
                    <p className="text-sm text-zinc-500">
                      {formatCurrency(Number(client.total_spent || 0))}
                    </p>
                    {client.last_visit_at && (
                      <p className="mt-1 text-xs text-zinc-400">
                        Última: {format(new Date(client.last_visit_at), "d MMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
