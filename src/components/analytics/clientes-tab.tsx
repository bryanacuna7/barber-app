'use client'

/**
 * ClientesTab — Client analytics section for Analytics page
 *
 * Permission gate: admin || owner || nav_clientes (defense in depth).
 * Hook passes enabled: false when no permission → zero API calls.
 * Data from useClientMetrics: KPIs, segment donut, AI insights.
 * WhatsApp via buildWhatsAppLink + null guard.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  Activity,
  DollarSign,
  Crown,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Calendar as CalendarIcon,
  MessageCircle,
  Lock,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { FadeInUp, StaggeredList, StaggeredItem } from '@/components/ui/motion'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { QueryError } from '@/components/ui/query-error'
import { useBusiness } from '@/contexts/business-context'
import { useClientMetrics } from '@/hooks/queries/useClientMetrics'
import { formatCurrency } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import type { Client } from '@/types'

type InsightType = 'churn' | 'winback' | 'upsell' | null

export function ClientesTab() {
  const { businessId, userRole, staffPermissions } = useBusiness()
  const router = useRouter()
  const [selectedInsight, setSelectedInsight] = useState<InsightType>(null)

  // Permission gate: admin, owner, or barber with nav_clientes
  const canAccessClients =
    userRole === 'admin' || userRole === 'owner' || staffPermissions?.nav_clientes === true

  // enabled: false → zero API calls, zero data in memory
  const {
    metrics,
    churnRiskClients,
    winbackClients,
    upsellCandidates,
    segmentPieData,
    isLoading,
    error,
    refetch,
  } = useClientMetrics(businessId, { enabled: canAccessClients })

  // Locked state for unauthorized users
  if (!canAccessClients) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 mb-4">
          <Lock className="h-8 w-8 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Acceso restringido
        </h3>
        <p className="text-sm text-muted max-w-sm">
          No tenés permiso para ver analíticas de clientes. Contactá al dueño del negocio para
          solicitar acceso.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <ClientesTabSkeleton />
  }

  if (error) {
    return <QueryError error={error} onRetry={refetch} title="Error al cargar datos de clientes" />
  }

  function handleWhatsApp(phone: string) {
    const link = buildWhatsAppLink(phone)
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error al cargar analíticas de clientes"
      fallbackDescription="No pudimos cargar los datos de clientes."
      showReset
    >
      <div className="space-y-6">
        {/* Client KPIs */}
        <StaggeredList>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggeredItem>
              <KPICard
                icon={<Users className="w-5 h-5" />}
                label="Total Clientes"
                value={metrics.total.toString()}
                color="blue"
              />
            </StaggeredItem>
            <StaggeredItem>
              <KPICard
                icon={<UserPlus className="w-5 h-5" />}
                label="Nuevos este Mes"
                value={metrics.newThisMonth.toString()}
                color="green"
              />
            </StaggeredItem>
            <StaggeredItem>
              <KPICard
                icon={<Activity className="w-5 h-5" />}
                label="Activos (30d)"
                value={metrics.recentActive.toString()}
                color="amber"
              />
            </StaggeredItem>
            <StaggeredItem>
              <KPICard
                icon={<DollarSign className="w-5 h-5" />}
                label="Ingreso Promedio"
                value={formatCurrency(metrics.avgValue)}
                color="purple"
              />
            </StaggeredItem>
          </div>
        </StaggeredList>

        {/* Segment Donut Chart */}
        <FadeInUp delay={0.2}>
          <div className="relative rounded-xl bg-white dark:bg-zinc-900/80 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <PieChartIcon className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 relative z-10">
              Distribución de Clientes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="relative h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {segmentPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="stroke-transparent outline-none focus:outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <p className="text-xs font-medium text-muted">{data.name}</p>
                              </div>
                              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                {data.value}
                                <span className="ml-1 text-xs font-normal text-zinc-500">
                                  (
                                  {metrics.total > 0
                                    ? ((data.value / metrics.total) * 100).toFixed(1)
                                    : 0}
                                  %)
                                </span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {metrics.total}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {segmentPieData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-muted">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* AI Insights Section */}
        <FadeInUp delay={0.3}>
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-1">
            <div className="rounded-xl bg-white dark:bg-zinc-900 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Insights Inteligentes
                  </h3>
                  <p className="text-sm text-zinc-500">Análisis basado en patrones de visita</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InsightButton
                  type="churn"
                  selected={selectedInsight}
                  onSelect={setSelectedInsight}
                  icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
                  label="Riesgo de Pérdida"
                  count={churnRiskClients.length}
                  subtitle="clientes en riesgo"
                  ringColor="ring-orange-500"
                  bgColor="bg-orange-50 dark:bg-orange-900/20"
                />
                <InsightButton
                  type="winback"
                  selected={selectedInsight}
                  onSelect={setSelectedInsight}
                  icon={<CalendarIcon className="h-5 w-5 text-blue-500" />}
                  label="Recuperación"
                  count={winbackClients.length}
                  subtitle="recuperables"
                  ringColor="ring-blue-500"
                  bgColor="bg-blue-50 dark:bg-blue-900/20"
                />
                <InsightButton
                  type="upsell"
                  selected={selectedInsight}
                  onSelect={setSelectedInsight}
                  icon={<ArrowUpRight className="h-5 w-5 text-green-500" />}
                  label="Upsell VIP"
                  count={upsellCandidates.length}
                  subtitle="candidatos"
                  ringColor="ring-green-500"
                  bgColor="bg-green-50 dark:bg-green-900/20"
                />
              </div>

              {selectedInsight && (
                <div className="space-y-2">
                  {selectedInsight === 'churn' &&
                    churnRiskClients
                      .slice(0, 4)
                      .map((client) => (
                        <InsightClientRow
                          key={client.id}
                          client={client}
                          variant="churn"
                          onAction={() => handleWhatsApp(client.phone)}
                          actionIcon={<MessageCircle className="h-4 w-4" />}
                        />
                      ))}
                  {selectedInsight === 'winback' &&
                    winbackClients
                      .slice(0, 4)
                      .map((client) => (
                        <InsightClientRow
                          key={client.id}
                          client={client}
                          variant="winback"
                          onAction={() => handleWhatsApp(client.phone)}
                          actionIcon={<MessageCircle className="h-4 w-4" />}
                        />
                      ))}
                  {selectedInsight === 'upsell' &&
                    upsellCandidates.map((client) => (
                      <InsightClientRow
                        key={client.id}
                        client={client}
                        variant="upsell"
                        onAction={() => router.push('/clientes')}
                        actionIcon={<Crown className="h-4 w-4" />}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </FadeInUp>
      </div>
    </ComponentErrorBoundary>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <Card className="h-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-4 lg:p-5 h-full flex items-center">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-muted mb-1.5">{label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </div>
    </Card>
  )
}

function InsightButton({
  type,
  selected,
  onSelect,
  icon,
  label,
  count,
  subtitle,
  ringColor,
  bgColor,
}: {
  type: InsightType
  selected: InsightType
  onSelect: (t: InsightType) => void
  icon: React.ReactNode
  label: string
  count: number
  subtitle: string
  ringColor: string
  bgColor: string
}) {
  const isActive = selected === type
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      onClick={() => onSelect(type)}
      className={`h-auto p-4 text-left flex-col items-start justify-start ${
        isActive ? `${bgColor} ring-2 ${ringColor}` : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold text-zinc-900 dark:text-white">{label}</span>
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">{count}</p>
      <p className="text-xs text-zinc-500">{subtitle}</p>
    </Button>
  )
}

const VARIANT_STYLES = {
  churn: {
    gradient: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
  },
  winback: {
    gradient: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  upsell: {
    gradient: 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800',
    text: 'text-green-700 dark:text-green-300',
  },
} as const

function InsightClientRow({
  client,
  variant,
  onAction,
  actionIcon,
}: {
  client: Client
  variant: 'churn' | 'winback' | 'upsell'
  onAction: () => void
  actionIcon: React.ReactNode
}) {
  const style = VARIANT_STYLES[variant]

  // Subtitle based on variant
  let subtitle = ''
  if (variant === 'churn') {
    const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
    const daysSince = lastVisit
      ? Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    subtitle = `${daysSince}d sin visita`
  } else if (variant === 'winback') {
    subtitle = formatCurrency(Number(client.total_spent || 0))
  } else {
    subtitle = `${client.total_visits} visitas`
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient} text-sm font-semibold ${style.text}`}
        >
          {client.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-white text-sm">{client.name}</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <Button
        variant="success"
        size="sm"
        onClick={onAction}
        className="shrink-0 h-11 w-11 min-h-0 rounded-full p-0"
      >
        {actionIcon}
      </Button>
    </div>
  )
}

function ClientesTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-16" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-[280px]" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-[200px]" />
      </Card>
    </div>
  )
}
