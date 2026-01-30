'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CreditCard,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PaymentWithDetails {
  id: string
  business_id: string
  plan_id: string
  amount_usd: number
  proof_url: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  business: {
    id: string
    name: string
    slug: string
  }
  plan: {
    name: string
    display_name: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending')
  const currentPage = parseInt(searchParams.get('page') || '1')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', currentPage.toString())

      const response = await fetch(`/api/admin/payments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch payments')

      const data = await response.json()
      setPayments(data.payments)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading payments')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, currentPage])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const updateFilters = (newSearch?: string, newStatus?: string, newPage?: number) => {
    const params = new URLSearchParams()
    const s = newSearch ?? search
    const st = newStatus ?? statusFilter
    const p = newPage ?? 1

    if (s) params.set('search', s)
    if (st !== 'all') params.set('status', st)
    if (p > 1) params.set('page', p.toString())

    router.push(`/admin/pagos?${params}`)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    const timer = setTimeout(() => {
      updateFilters(value, undefined, 1)
    }, 300)
    return () => clearTimeout(timer)
  }

  const handleAction = async (
    paymentId: string,
    action: 'approve' | 'reject',
    adminNotes?: string
  ) => {
    setProcessingId(paymentId)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: adminNotes }),
      })

      if (!response.ok) throw new Error('Failed to process payment')

      // Refresh list
      fetchPayments()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error processing payment')
    } finally {
      setProcessingId(null)
    }
  }

  const statusStyles = {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: Clock,
    },
    approved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: CheckCircle,
    },
    rejected: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      icon: XCircle,
    },
  }

  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pagos Reportados</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Revisa y aprueba los pagos de suscripción
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar por negocio..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                updateFilters(undefined, status, 1)
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {status === 'all'
                ? 'Todos'
                : status === 'pending'
                  ? 'Pendientes'
                  : status === 'approved'
                    ? 'Aprobados'
                    : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-600 dark:text-red-400">{error}</Card>
      ) : payments.length === 0 ? (
        <Card className="p-8 text-center text-zinc-500">
          No hay pagos{' '}
          {statusFilter !== 'all' &&
            statusLabels[statusFilter as keyof typeof statusLabels]?.toLowerCase()}
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const style = statusStyles[payment.status]
            const StatusIcon = style.icon

            return (
              <Card key={payment.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bg}`}
                    >
                      <StatusIcon className={`h-6 w-6 ${style.text}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          ${payment.amount_usd}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                        >
                          {statusLabels[payment.status]}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Building2 className="h-4 w-4" />
                        <span>{payment.business.name}</span>
                        <span className="text-zinc-400">•</span>
                        <span>Plan {payment.plan.display_name}</span>
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        Hace{' '}
                        {formatDistanceToNow(new Date(payment.created_at), {
                          locale: es,
                        })}
                      </div>

                      {payment.notes && (
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Nota:</span> {payment.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.proof_url && (
                      <a
                        href={payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <Eye className="h-4 w-4" />
                        Ver comprobante
                      </a>
                    )}

                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(payment.id, 'approve')}
                          disabled={processingId === payment.id}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Aprobar
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('Razón del rechazo (opcional):')
                            handleAction(payment.id, 'reject', reason || undefined)
                          }}
                          disabled={processingId === payment.id}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </>
                    )}

                    <a
                      href={`/admin/negocios/${payment.business_id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver negocio
                    </a>
                  </div>
                </div>

                {payment.admin_notes && payment.status === 'rejected' && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    <span className="font-medium">Razón del rechazo:</span> {payment.admin_notes}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => updateFilters(undefined, undefined, currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateFilters(undefined, undefined, currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
