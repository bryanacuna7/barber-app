'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Users,
  Scissors,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface BusinessDetail {
  business: {
    id: string
    name: string
    slug: string
    phone: string | null
    whatsapp: string | null
    address: string | null
    timezone: string | null
    is_active: boolean
    created_at: string
    brand_primary_color: string | null
    owner_email: string
  }
  barbers: Array<{
    id: string
    name: string
    email: string
    is_active: boolean
  }>
  services: Array<{
    id: string
    name: string
    price: number
    is_active: boolean
  }>
  stats: {
    totalAppointments: number
    completedAppointments: number
    totalClients: number
    totalBarbers: number
    totalServices: number
  }
}

export default function AdminBusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [data, setData] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/admin/businesses/${businessId}`)
        if (!response.ok) throw new Error('Failed to fetch business')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading business')
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [businessId])

  const toggleActive = async () => {
    if (!data || deleting) return

    setToggling(true)
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !data.business.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update business')

      const result = await response.json()
      setData({
        ...data,
        business: { ...data.business, is_active: result.business.is_active },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating business')
    } finally {
      setToggling(false)
    }
  }

  const deleteBusiness = async () => {
    if (!data || toggling) return

    setDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Error al eliminar negocio')
      }

      router.push('/admin/negocios')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar negocio')
      setDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setShowDeleteModal(false)
    setConfirmName('')
    setDeleteError(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/negocios"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error || 'Negocio no encontrado'}
        </div>
      </div>
    )
  }

  const { business, barbers, services, stats } = data

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/negocios"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a negocios
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: business.brand_primary_color
                ? `${business.brand_primary_color}20`
                : '#f4f4f5',
            }}
          >
            <Building2
              className="h-8 w-8"
              style={{ color: business.brand_primary_color || '#71717a' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="app-page-title">{business.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  business.is_active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                }`}
              >
                {business.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-zinc-500">/{business.slug}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/reservar/${business.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <ExternalLink className="h-4 w-4" />
            Ver página de reservas
          </Link>
          <Button
            onClick={toggleActive}
            disabled={toggling || deleting}
            variant={business.is_active ? 'secondary' : 'primary'}
          >
            {toggling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : business.is_active ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {business.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          {!business.is_active && (
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={toggling || deleting}
              variant="danger"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Equipo" value={stats.totalBarbers} />
        <StatCard icon={Scissors} label="Servicios" value={stats.totalServices} />
        <StatCard icon={Calendar} label="Citas Totales" value={stats.totalAppointments} />
        <StatCard icon={CheckCircle2} label="Completadas" value={stats.completedAppointments} />
        <StatCard icon={Users} label="Clientes" value={stats.totalClients} />
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Negocio</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email del dueño" value={business.owner_email} />
            {business.phone && <InfoRow icon={Phone} label="Teléfono" value={business.phone} />}
            {business.address && (
              <InfoRow icon={MapPin} label="Dirección" value={business.address} />
            )}
            {business.timezone && (
              <InfoRow icon={Globe} label="Zona horaria" value={business.timezone} />
            )}
            <InfoRow
              icon={Calendar}
              label="Registrado"
              value={format(new Date(business.created_at), "d 'de' MMMM, yyyy", {
                locale: es,
              })}
            />
          </div>
        </Card>

        {/* Subscription Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-700">
              <Building2 className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Sistema de suscripciones pendiente (Fase 3)
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Aquí se mostrará: plan actual, estado, fecha de pago, etc.
            </p>
          </div>
        </Card>
      </div>

      {/* Barbers and Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Barbers */}
        <Card>
          <CardHeader>
            <CardTitle>Equipo ({barbers.length})</CardTitle>
          </CardHeader>
          {barbers.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin miembros del equipo registrados</p>
          ) : (
            <div className="space-y-2">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{barber.name}</p>
                    <p className="text-sm text-zinc-500">{barber.email}</p>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      barber.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios ({services.length})</CardTitle>
          </CardHeader>
          {services.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin servicios registrados</p>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                >
                  <p className="font-medium text-zinc-900 dark:text-white">{service.name}</p>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Eliminar negocio permanentemente"
        size="md"
        showCloseButton={!deleting}
        closeOnOverlayClick={!deleting}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-semibold">Esta acción es irreversible.</p>
              <p className="mt-1">Se eliminarán permanentemente todos los datos asociados:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>{stats.totalAppointments} citas</li>
                <li>{stats.totalClients} clientes</li>
                <li>{stats.totalBarbers} miembros del equipo</li>
                <li>{stats.totalServices} servicios</li>
              </ul>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Escribe{' '}
              <span className="font-bold text-zinc-900 dark:text-white">{business.name}</span> para
              confirmar:
            </label>
            <Input
              id="confirm-name"
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={business.name}
              className="mt-2"
              disabled={deleting}
              autoComplete="off"
            />
          </div>

          {deleteError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {deleteError}
            </div>
          )}

          <ModalFooter>
            <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={deleteBusiness}
              disabled={confirmName !== business.name || deleting}
              isLoading={deleting}
            >
              {!deleting && <Trash2 className="mr-2 h-4 w-4" />}
              Eliminar permanentemente
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <Card className="text-center">
      <Icon className="mx-auto h-5 w-5 text-zinc-400" />
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </Card>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-400" />
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
