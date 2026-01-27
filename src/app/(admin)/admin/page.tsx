'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AdminStats {
  overview: {
    totalBusinesses: number
    activeBusinesses: number
    inactiveBusinesses: number
    newThisMonth: number
    newThisWeek: number
    growthRate: number
  }
  subscription: {
    mrr: number
    trialsActive: number
    conversionRate: number
    churnRate: number
  }
  recentBusinesses: Array<{
    id: string
    name: string
    slug: string
    created_at: string
    is_active: boolean
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Panel de Administrador
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Vista general de tu plataforma SaaS
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total Negocios"
          value={stats.overview.totalBusinesses}
          trend={`+${stats.overview.newThisWeek} esta semana`}
          trendUp={stats.overview.newThisWeek > 0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Activos"
          value={stats.overview.activeBusinesses}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          icon={XCircle}
          label="Inactivos"
          value={stats.overview.inactiveBusinesses}
          iconColor="text-zinc-400"
          bgColor="bg-zinc-100 dark:bg-zinc-800"
        />
        <StatCard
          icon={TrendingUp}
          label="Crecimiento Mensual"
          value={`${stats.overview.growthRate > 0 ? '+' : ''}${stats.overview.growthRate}%`}
          trend={`${stats.overview.newThisMonth} nuevos este mes`}
          trendUp={stats.overview.growthRate > 0}
          iconColor={stats.overview.growthRate > 0 ? 'text-emerald-500' : 'text-red-500'}
          bgColor={stats.overview.growthRate > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}
        />
      </div>

      {/* Subscription Stats (Placeholders for Phase 3) */}
      <Card>
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-700">
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Ingresos y Suscripciones
            </h2>
            <p className="text-sm text-zinc-500">
              Disponible cuando se implemente el sistema de pagos
            </p>
          </div>
          <DollarSign className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <PlaceholderStat label="MRR" value="$0" />
          <PlaceholderStat label="Trials Activos" value="0" />
          <PlaceholderStat label="Tasa Conversión" value="0%" />
          <PlaceholderStat label="Churn Rate" value="0%" />
        </div>
      </Card>

      {/* Recent Businesses */}
      <Card>
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-700">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Negocios Recientes
          </h2>
          <Link
            href="/admin/negocios"
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-700">
          {stats.recentBusinesses.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">
              No hay negocios registrados
            </p>
          ) : (
            stats.recentBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/admin/negocios/${business.id}`}
                className="flex items-center justify-between py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50 -mx-6 px-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                    <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {business.name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      /{business.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">
                    {formatDistanceToNow(new Date(business.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
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
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  iconColor?: string
  bgColor?: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  iconColor = 'text-zinc-600 dark:text-zinc-300',
  bgColor = 'bg-zinc-100 dark:bg-zinc-700',
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1 text-sm ${
                trendUp ? 'text-emerald-600' : 'text-zinc-500'
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  )
}

function PlaceholderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-zinc-300 dark:text-zinc-600">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">{label}</p>
    </div>
  )
}
