'use client'

/**
 * Client Dashboard Home — /mi-cuenta
 *
 * Sections: Greeting, Next Appointment, Book Button, History, Loyalty
 * Mobile-first. Apple HIG compliant.
 */

import { useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Scissors, Trophy, Star, CalendarPlus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientContext } from '@/contexts/client-context'
import {
  useClientUpcoming,
  useClientHistory,
  useClientLoyalty,
} from '@/hooks/queries/useClientDashboard'
import { LiveQueueCard } from '@/components/client/live-queue-card'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { ClientNotificationBell } from '@/components/client/client-notification-bell'

// Status labels and colors
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  confirmed: {
    label: 'Confirmada',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  no_show: {
    label: 'No asistió',
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
  },
}

// Tier display config
const TIER_CONFIG: Record<string, { label: string; color: string; icon: typeof Star }> = {
  bronze: { label: 'Bronce', color: 'text-amber-700 dark:text-amber-500', icon: Star },
  silver: { label: 'Plata', color: 'text-zinc-500 dark:text-zinc-400', icon: Star },
  gold: { label: 'Oro', color: 'text-yellow-500 dark:text-yellow-400', icon: Trophy },
  platinum: { label: 'Platino', color: 'text-purple-500 dark:text-purple-400', icon: Trophy },
}

export default function ClientHomePage() {
  const { clientId, clientName, businessId, businessName, businessSlug } = useClientContext()

  const { data: upcoming, isLoading: loadingUpcoming } = useClientUpcoming(clientId)
  const { data: history, isLoading: loadingHistory } = useClientHistory(clientId)
  const { data: loyalty } = useClientLoyalty(clientId, businessId)

  const firstName = useMemo(() => {
    return clientName.trim().split(' ')[0] || 'Cliente'
  }, [clientName])

  return (
    <div className="px-4 pt-safe-offset-4 pt-12">
      {/* Greeting */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Hola, {firstName}</h1>
          <p className="text-muted text-sm mt-0.5">{businessName}</p>
        </div>
        <div className="flex items-center gap-2">
          <ClientNotificationBell businessId={businessId} />
          <Link
            href="/mi-cuenta/perfil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Mi Perfil"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* PWA Install Prompt — only shows if not already installed */}
      <div className="mb-5">
        <InstallPrompt />
      </div>

      {/* Next Appointment */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Próxima Cita
        </h2>
        {loadingUpcoming ? (
          <UpcomingCardSkeleton />
        ) : upcoming ? (
          <LiveQueueCard
            appointment={upcoming}
            businessId={businessId}
            businessSlug={businessSlug}
          />
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-center">
            <Calendar className="h-8 w-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No tienes citas próximas</p>
          </div>
        )}
      </section>

      {/* Book Button */}
      <Link href={`/reservar/${businessSlug}`} className="block mb-8">
        <Button variant="gradient" className="w-full h-12 text-base font-semibold gap-2">
          <CalendarPlus className="h-5 w-5" />
          Reservar Cita
        </Button>
      </Link>

      {/* Loyalty Card */}
      {loyalty && (
        <section className="mb-8">
          <LoyaltyCard loyalty={loyalty} />
        </section>
      )}

      {/* History */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Historial</h2>
        {loadingHistory ? (
          <HistoryListSkeleton />
        ) : history && history.length > 0 ? (
          <div className="space-y-2">
            {history.map((appt) => (
              <HistoryRow key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-center">
            <p className="text-sm text-muted">Aún no tienes citas anteriores</p>
          </div>
        )}
      </section>
    </div>
  )
}

// =====================================================
// Sub-components
// =====================================================

function LoyaltyCard({
  loyalty,
}: {
  loyalty: {
    points_balance: number
    current_tier: string
    lifetime_points: number
    visit_count: number
  }
}) {
  const tier = TIER_CONFIG[loyalty.current_tier] ?? TIER_CONFIG.bronze
  const TierIcon = tier.icon

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TierIcon className={`h-5 w-5 ${tier.color}`} />
          <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
        </div>
        <span className="text-xs text-muted">{loyalty.visit_count} visitas</span>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
          {loyalty.points_balance.toLocaleString()}
        </span>
        <span className="text-sm text-muted">puntos</span>
      </div>

      <p className="text-xs text-subtle">
        {loyalty.lifetime_points.toLocaleString()} puntos acumulados en total
      </p>
    </div>
  )
}

function HistoryRow({
  appointment,
}: {
  appointment: {
    id: string
    scheduled_at: string
    price: number | null
    status: string
    service: { name: string } | null
    barber: { name: string } | null
  }
}) {
  const status = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.completed
  const date = new Date(appointment.scheduled_at)

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <Scissors className="h-4 w-4 text-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">
          {appointment.service?.name ?? 'Servicio'}
        </p>
        <p className="text-xs text-muted">
          {formatDate(date)}
          {appointment.barber && ` · ${appointment.barber.name}`}
        </p>
      </div>

      <div className="text-right shrink-0">
        {appointment.price != null && (
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {formatCurrency(Number(appointment.price))}
          </p>
        )}
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

// =====================================================
// Skeletons
// =====================================================

function UpcomingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 animate-pulse">
      <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4" />
      <div className="flex items-center gap-3 mb-3">
        <div className="h-11 w-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  )
}

function HistoryListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 animate-pulse"
        >
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  )
}
