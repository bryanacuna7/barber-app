'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Banknote,
  User,
  TrendingUp,
  Crown,
  Star,
  UserPlus,
  MessageCircle,
  History,
  ChevronRight,
  X,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils'
import { format, startOfMonth, isAfter, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Client } from '@/types'
import { ClientesTourWrapper } from '@/components/tours/clientes-tour-wrapper'
import { useClients, useCreateClient } from '@/hooks/use-clients'

type ClientSegment = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'

function getClientSegment(client: Client): 'vip' | 'frequent' | 'new' | 'inactive' {
  const visits = client.total_visits || 0
  const spent = Number(client.total_spent || 0)
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
  const thirtyDaysAgo = subDays(new Date(), 30)

  // VIP: 5+ visitas O +50,000 gastados
  if (visits >= 5 || spent >= 50000) return 'vip'

  // Inactivo: sin visitas en 30+ días
  if (lastVisit && !isAfter(lastVisit, thirtyDaysAgo)) return 'inactive'

  // Frecuente: 3-4 visitas
  if (visits >= 3) return 'frequent'

  // Nuevo: 0-2 visitas
  return 'new'
}

const segmentConfig = {
  vip: {
    label: 'VIP',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Crown,
    description: '5+ visitas o ₡50k+ gastados',
  },
  frequent: {
    label: 'Frecuente',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Star,
    description: '3-4 visitas',
  },
  new: {
    label: 'Nuevo',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: UserPlus,
    description: '1-2 visitas',
  },
  inactive: {
    label: 'Inactivo',
    color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    icon: User,
    description: 'Sin visitas en 30+ días',
  },
}

export default function ClientesPage() {
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<ClientSegment>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  // React Query hooks
  const {
    data: clientsData,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useClients()
  const createClient = useCreateClient()

  // Flatten all pages into single array
  const clients = clientsData?.pages.flatMap((page) => page.data) || []
  const totalClients = clientsData?.pages[0]?.pagination.total || 0

  // Métricas calculadas con contexto temporal
  const metrics = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const thirtyDaysAgo = subDays(now, 30)

    // Clientes nuevos este mes (basado en created_at si existe, sino primera visita)
    const newThisMonth = clients.filter((c) => {
      const createdAt = c.created_at ? new Date(c.created_at) : null
      return createdAt && isAfter(createdAt, monthStart)
    }).length

    // Ingresos de los últimos 30 días (aproximado basado en última visita)
    const recentClients = clients.filter((c) => {
      const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
      return lastVisit && isAfter(lastVisit, thirtyDaysAgo)
    })

    // Segmentos
    const segments = {
      vip: clients.filter((c) => getClientSegment(c) === 'vip').length,
      frequent: clients.filter((c) => getClientSegment(c) === 'frequent').length,
      new: clients.filter((c) => getClientSegment(c) === 'new').length,
      inactive: clients.filter((c) => getClientSegment(c) === 'inactive').length,
    }

    // Valor promedio por cliente
    const avgValue =
      clients.length > 0
        ? clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0) / clients.length
        : 0

    // Total histórico
    const totalRevenue = clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0)

    // Cliente top
    const topClient = clients.reduce(
      (top, c) => (Number(c.total_spent || 0) > Number(top?.total_spent || 0) ? c : top),
      clients[0]
    )

    return {
      total: clients.length,
      newThisMonth,
      recentActive: recentClients.length,
      segments,
      avgValue,
      totalRevenue,
      topClient,
    }
  }, [clients])

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    let result = clients

    // Filtrar por segmento
    if (selectedSegment !== 'all') {
      result = result.filter((c) => getClientSegment(c) === selectedSegment)
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          c.email?.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [clients, selectedSegment, search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await createClient.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      })

      setFormData({ name: '', phone: '', email: '', notes: '' })
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
    }
  }

  function handleWhatsApp(phone: string) {
    // Formatear número para Costa Rica
    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.length === 8 ? `506${cleanPhone}` : cleanPhone
    window.open(`https://wa.me/${fullPhone}`, '_blank')
  }

  return (
    <ClientesTourWrapper>
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Clientes
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{totalClients} registrados</p>
          </div>
          <Button
            data-tour="clients-add-button"
            onClick={() => setShowModal(true)}
            className="shrink-0 text-sm px-3 py-2 sm:px-4 sm:py-2"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </Button>
        </div>

        {/* Stats - iOS Style Pills */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-3 scrollbar-hide">
            {/* Clientes Nuevos */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
                <div className="rounded-xl bg-green-500/20 p-2.5">
                  <UserPlus className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">
                    {metrics.newThisMonth}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">nuevos</p>
                </div>
              </div>
            </div>

            {/* Clientes Activos */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3">
                <div className="rounded-xl bg-blue-500/20 p-2.5">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">
                    {metrics.recentActive}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">activos</p>
                </div>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 min-w-[140px]">
                <div className="rounded-xl bg-emerald-500/20 p-2.5">
                  <Banknote className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-white leading-none truncate">
                    {formatCurrency(metrics.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">ingresos</p>
                </div>
              </div>
            </div>

            {/* Valor Promedio */}
            <div className="shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 min-w-[140px]">
                <div className="rounded-xl bg-purple-500/20 p-2.5">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-white leading-none truncate">
                    {formatCurrency(metrics.avgValue)}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">promedio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Filters - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500 shrink-0">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <button
              onClick={() => setSelectedSegment('all')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                selectedSegment === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              Todos ({metrics.total})
            </button>
            {(Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>).map((segment) => {
              const config = segmentConfig[segment]
              const count = metrics.segments[segment]
              const Icon = config.icon
              return (
                <button
                  key={segment}
                  onClick={() => setSelectedSegment(segment)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-1.5 border shrink-0 ${
                    selectedSegment === segment
                      ? config.color
                      : 'bg-zinc-100 text-zinc-600 border-transparent hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
          />
        </div>

        {/* Client List */}
        <Card data-tour="clients-list">
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              {selectedSegment === 'all'
                ? 'Todos los Clientes'
                : `${segmentConfig[selectedSegment as keyof typeof segmentConfig]?.label || ''}`}
            </CardTitle>
            <span className="text-xs sm:text-sm text-zinc-500">
              {filteredClients.length} clientes
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
            {loading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-zinc-900 dark:border-white" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-8 sm:py-12 text-center">
                <User className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-zinc-300 dark:text-zinc-700" />
                <p className="mt-3 sm:mt-4 text-sm text-zinc-500">
                  {search || selectedSegment !== 'all'
                    ? 'No se encontraron clientes.'
                    : 'Sin clientes registrados.'}
                </p>
                {!search && selectedSegment === 'all' && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-400">
                    Se agregan al reservar una cita.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {filteredClients.map((client) => {
                  const segment = getClientSegment(client)
                  const segmentInfo = segmentConfig[segment]
                  const SegmentIcon = segmentInfo.icon

                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="group flex items-center gap-3 rounded-xl border border-zinc-200 p-3 sm:p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 cursor-pointer active:scale-[0.98]"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-base sm:text-lg font-semibold text-zinc-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        {segment === 'vip' && (
                          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 rounded-full bg-amber-500 p-0.5">
                            <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <p className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                            {client.name}
                          </p>
                          <span
                            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${segmentInfo.color}`}
                          >
                            <SegmentIcon className="h-3 w-3" />
                            {segmentInfo.label}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs sm:text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {client.phone}
                          </span>
                          <span className="sm:hidden text-zinc-300 dark:text-zinc-600">•</span>
                          <span className="sm:hidden text-xs">
                            {client.total_visits || 0} visitas
                          </span>
                        </div>
                      </div>

                      {/* Desktop: Stats + Actions */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {formatCurrency(Number(client.total_spent || 0))}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {client.total_visits || 0} visitas
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleWhatsApp(client.phone)
                            }}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>

                      {/* Mobile: Chevron */}
                      <ChevronRight className="h-4 w-4 text-zinc-400 sm:hidden shrink-0" />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Load More Button */}
            {!loading && filteredClients.length > 0 && hasNextPage && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isFetchingNextPage ? 'Cargando...' : 'Cargar más clientes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Nuevo Cliente */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Nuevo Cliente</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Input
                  label="Nombre completo"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="87175866"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />

                <Input
                  label="Email (opcional)"
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Notas (opcional)
                  </label>
                  <textarea
                    placeholder="Preferencias, alergias, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" isLoading={createClient.isPending} className="flex-1">
                    Guardar Cliente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detalle Cliente */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedClient(null)}
            />
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 text-2xl font-bold text-zinc-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-300">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {selectedClient.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${segmentConfig[getClientSegment(selectedClient)].color}`}
                    >
                      {segmentConfig[getClientSegment(selectedClient)].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contacto */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Phone className="h-5 w-5 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{selectedClient.phone}</span>
                  <button
                    onClick={() => handleWhatsApp(selectedClient.phone)}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
                {selectedClient.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <Mail className="h-5 w-5 text-zinc-400" />
                    <span className="text-zinc-900 dark:text-white">{selectedClient.email}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedClient.total_visits || 0}
                  </p>
                  <p className="text-xs text-zinc-500">Visitas</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(Number(selectedClient.total_spent || 0))}
                  </p>
                  <p className="text-xs text-zinc-500">Total gastado</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedClient.last_visit_at
                      ? format(new Date(selectedClient.last_visit_at), 'd MMM', { locale: es })
                      : '-'}
                  </p>
                  <p className="text-xs text-zinc-500">Última visita</p>
                </div>
              </div>

              {/* Notas */}
              {selectedClient.notes && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 mb-6">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Notas
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedClient(null)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientesTourWrapper>
  )
}
