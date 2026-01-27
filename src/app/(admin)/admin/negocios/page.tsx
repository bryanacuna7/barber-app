'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  Users,
  Scissors,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface BusinessWithStats {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  brand_primary_color: string | null
  stats: {
    barbers: number
    services: number
    appointments: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminBusinessesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [businesses, setBusinesses] = useState<BusinessWithStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  )
  const currentPage = parseInt(searchParams.get('page') || '1')

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', currentPage.toString())

      const response = await fetch(`/api/admin/businesses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch businesses')

      const data = await response.json()
      setBusinesses(data.businesses)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading businesses')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, currentPage])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const updateFilters = (newSearch?: string, newStatus?: string, newPage?: number) => {
    const params = new URLSearchParams()
    const s = newSearch ?? search
    const st = newStatus ?? statusFilter
    const p = newPage ?? 1

    if (s) params.set('search', s)
    if (st !== 'all') params.set('status', st)
    if (p > 1) params.set('page', p.toString())

    router.push(`/admin/negocios?${params}`)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Debounce search
    const timer = setTimeout(() => {
      updateFilters(value, statusFilter, 1)
    }, 300)
    return () => clearTimeout(timer)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Negocios
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Gestiona todas las barberías registradas en la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  updateFilters(search, status, 1)
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {status === 'all'
                  ? 'Todos'
                  : status === 'active'
                    ? 'Activos'
                    : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : businesses.length === 0 ? (
        <Card className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-4 text-zinc-500">No se encontraron negocios</p>
        </Card>
      ) : (
        <>
          {/* Business List */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link key={business.id} href={`/admin/negocios/${business.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: business.brand_primary_color
                            ? `${business.brand_primary_color}20`
                            : '#f4f4f5',
                        }}
                      >
                        <Building2
                          className="h-6 w-6"
                          style={{
                            color: business.brand_primary_color || '#71717a',
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          {business.name}
                        </h3>
                        <p className="text-sm text-zinc-500">/{business.slug}</p>
                      </div>
                    </div>
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

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {business.stats.barbers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="h-4 w-4" />
                      {business.stats.services}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {business.stats.appointments}
                    </span>
                  </div>

                  {/* Created date */}
                  <p className="mt-3 text-xs text-zinc-400">
                    Registrado{' '}
                    {formatDistanceToNow(new Date(business.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Mostrando {(currentPage - 1) * pagination.limit + 1} -{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} de{' '}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilters(search, statusFilter, currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  onClick={() => updateFilters(search, statusFilter, currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
