'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Heart,
  Clock,
  Zap,
  Award,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  UserPlus,
  DollarSign,
  Scissors,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { ActivityItem } from '@/components/clients/activity-item'
import { formatCurrencyCompact } from '@/lib/utils'
import type { Client } from '@/types'
import { animations } from '@/lib/design-system'
import { getClientSegment, calculateLoyalty, getSpendingTier } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'

interface ClientActivity {
  id: string
  type: 'appointment' | 'registered'
  title: string
  description: string
  date: string
  amount?: number
  status?: string
}

interface ClientCardsViewProps {
  clients: Client[]
  selectedCardClient: Client | null
  onSelectCardClient: (client: Client) => void
  onMobileDetailOpen: () => void
  onSelectClient: (client: Client) => void
  clientActivities: ClientActivity[] | undefined
  activitiesLoading: boolean
  onWhatsApp: (phone: string) => void
}

function getActivityIcon(type: string) {
  if (type === 'registered')
    return {
      icon: UserPlus,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100 dark:bg-green-900/30',
    }
  return {
    icon: Scissors,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
  }
}

export function ClientCardsView({
  clients,
  selectedCardClient,
  onSelectCardClient,
  onMobileDetailOpen,
  onSelectClient,
  clientActivities,
  activitiesLoading,
  onWhatsApp,
}: ClientCardsViewProps) {
  return (
    <motion.div
      key="cards"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`grid grid-cols-1 gap-6 ${selectedCardClient ? 'lg:grid-cols-5' : 'lg:grid-cols-1'}`}
    >
      {/* Left: Compact client list */}
      <div className={`space-y-2 ${selectedCardClient ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
        <div
          className={`space-y-2 ${
            selectedCardClient ? 'lg:max-h-[calc(100vh-24rem)] lg:overflow-y-auto lg:pr-2' : ''
          }`}
        >
          {clients.map((client) => {
            const segment = getClientSegment(client)
            const tier = getSpendingTier(client)
            const loyalty = calculateLoyalty(client)
            const isSelected = selectedCardClient?.id === client.id

            // Tier config for badge
            const tierLabels = {
              platinum: 'Platino',
              gold: 'Oro',
              silver: 'Plata',
              bronze: 'Bronce',
            }

            const tierColors = {
              platinum: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
              gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
              silver: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
              bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            }

            const rightActions = [
              {
                icon: <MessageCircle className="h-5 w-5" />,
                label: 'WhatsApp',
                color: 'bg-emerald-500',
                onClick: () => onWhatsApp(client.phone),
              },
              {
                icon: <Edit className="h-5 w-5" />,
                label: 'Editar',
                color: 'bg-blue-500',
                onClick: () => onSelectClient(client),
              },
            ]

            return (
              <Fragment key={client.id}>
                <SwipeableRow rightActions={rightActions} className="lg:hidden">
                  <motion.button
                    onClick={() => {
                      onSelectCardClient(client)
                      onMobileDetailOpen()
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={animations.spring.snappy}
                    className={`relative w-full text-left rounded-2xl p-3 lg:p-4 transition-[background-color,border-color,box-shadow] border-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-md dark:bg-blue-950 dark:border-blue-500 dark:shadow-lg'
                        : 'bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md'
                    }`}
                  >
                    {/* Loyalty badge - mobile (compact) */}
                    <div className="absolute top-2 right-2 lg:hidden">
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                          loyalty >= 80
                            ? 'bg-green-500/20 text-green-400'
                            : loyalty >= 50
                              ? 'bg-blue-500/20 text-blue-400'
                              : loyalty >= 30
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {Math.round(loyalty)}%
                      </span>
                    </div>
                    {/* Loyalty ring - desktop (full SVG) */}
                    <div className="absolute top-3 right-3 hidden lg:block">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-zinc-700 dark:text-zinc-600"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            className={`transition-[stroke-dashoffset] duration-700 ${
                              loyalty >= 80
                                ? 'text-green-500'
                                : loyalty >= 50
                                  ? 'text-blue-500'
                                  : loyalty >= 30
                                    ? 'text-amber-500'
                                    : 'text-zinc-500'
                            }`}
                            style={{
                              strokeDasharray: `${2 * Math.PI * 20}`,
                              strokeDashoffset: `${2 * Math.PI * 20 * (1 - loyalty / 100)}`,
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-foreground">
                            {Math.round(loyalty)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pr-14">
                      {/* Avatar + Name + VIP badge */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 dark:from-zinc-600 dark:to-zinc-700 text-lg font-bold text-white">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          {segment === 'vip' && (
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-base text-foreground truncate">
                              {client.name}
                            </p>
                            {segment === 'vip' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Crown className="h-2.5 w-2.5" />
                                VIP
                              </span>
                            )}
                          </div>
                          {/* Engagement badge */}
                          <div className="flex items-center gap-1">
                            <div className="flex gap-[2px]">
                              {Array.from({
                                length: Math.min(Math.ceil(loyalty / 25), 4),
                              }).map((_, i) => (
                                <div key={i} className="w-1 h-3 rounded-full bg-green-500" />
                              ))}
                              {Array.from({
                                length: Math.max(0, 4 - Math.ceil(loyalty / 25)),
                              }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted">{loyalty}% engagement</span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-xs text-muted mb-0.5">Gastado</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrencyCompact(Number(client.total_spent || 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-0.5">Visitas</p>
                          <p className="text-lg font-bold text-foreground">
                            {client.total_visits || 0}
                          </p>
                        </div>
                      </div>

                      {/* Spending tier badge */}
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-muted" />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColors[tier]}`}
                        >
                          {tierLabels[tier]}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                </SwipeableRow>
                {/* Desktop: compact card without swipe — single loyalty indicator */}
                <motion.button
                  onClick={() => {
                    onSelectCardClient(client)
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={animations.spring.snappy}
                  className={`group/card relative w-full text-left rounded-xl p-3 transition-colors border hidden lg:flex items-center gap-3 ${
                    isSelected
                      ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600'
                      : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    {segment === 'vip' && (
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-0.5">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name + segment */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted">
                      {client.total_visits || 0} visitas ·{' '}
                      {formatCurrencyCompact(Number(client.total_spent || 0))}
                    </p>
                  </div>

                  {/* Segment badge */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${segmentConfig[segment].color}`}
                  >
                    {segmentConfig[segment].label}
                  </span>

                  {/* Chevron on hover */}
                  <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </motion.button>
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* Right: Detail panel - Desktop only, only visible when client selected */}
      <div className={`hidden ${selectedCardClient ? 'lg:block lg:col-span-3' : ''}`}>
        {selectedCardClient ? (
          <motion.div
            key={selectedCardClient.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                  {selectedCardClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedCardClient.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${
                      segmentConfig[getClientSegment(selectedCardClient)].color
                    }`}
                  >
                    {segmentConfig[getClientSegment(selectedCardClient)].label}
                  </span>
                </div>
              </div>
              <Button
                variant="success"
                onClick={() => onWhatsApp(selectedCardClient.phone)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>

            {/* Metrics Row - 4 colorful cards (demo-accurate) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {/* Visitas (Azul) */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Visitas
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {selectedCardClient.total_visits || 0}
                </p>
              </div>

              {/* Gastado (Verde) */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-600/10 dark:from-emerald-500/20 dark:to-green-600/20 border border-emerald-500/20 dark:border-emerald-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Gastado
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground truncate">
                  {formatCurrencyCompact(Number(selectedCardClient.total_spent || 0))}
                </p>
              </div>

              {/* Frecuencia (Morado) */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 dark:from-purple-500/20 dark:to-violet-600/20 border border-purple-500/20 dark:border-purple-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Frecuencia
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {selectedCardClient.last_visit_at
                    ? `${Math.floor(
                        (new Date().getTime() -
                          new Date(selectedCardClient.last_visit_at).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}d`
                    : '-'}
                </p>
              </div>

              {/* Lealtad (Naranja) */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-600/10 dark:from-orange-500/20 dark:to-amber-600/20 border border-orange-500/20 dark:border-orange-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Lealtad
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(calculateLoyalty(selectedCardClient))}%
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Phone className="h-5 w-5 text-muted" />
                <span className="text-foreground">{selectedCardClient.phone}</span>
              </div>
              {selectedCardClient.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <Mail className="h-5 w-5 text-muted" />
                  <span className="text-foreground">{selectedCardClient.email}</span>
                </div>
              )}
            </div>

            {/* Activity Timeline — Real Data */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Actividad</h3>
              <div className="space-y-0">
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : clientActivities && clientActivities.length > 0 ? (
                  <>
                    {/* Registration event */}
                    {selectedCardClient.created_at &&
                      (() => {
                        const regIcon = getActivityIcon('registered')
                        const allActivities = [
                          ...clientActivities.map((a) => ({
                            ...a,
                            ...getActivityIcon('appointment'),
                          })),
                          {
                            id: 'registered',
                            title: 'Cliente registrado',
                            description: 'Se unió al programa',
                            date: selectedCardClient.created_at,
                            ...regIcon,
                          },
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                        return allActivities.map((activity, index, arr) => (
                          <ActivityItem
                            key={activity.id}
                            icon={activity.icon}
                            iconColor={activity.iconColor}
                            iconBgColor={activity.iconBgColor}
                            title={activity.title}
                            description={activity.description}
                            date={new Date(activity.date)}
                            amount={'amount' in activity ? activity.amount : undefined}
                            isLast={index === arr.length - 1}
                          />
                        ))
                      })()}
                    {!selectedCardClient.created_at &&
                      clientActivities.map((activity, index, arr) => {
                        const icons = getActivityIcon('appointment')
                        return (
                          <ActivityItem
                            key={activity.id}
                            icon={icons.icon}
                            iconColor={icons.iconColor}
                            iconBgColor={icons.iconBgColor}
                            title={activity.title}
                            description={activity.description}
                            date={new Date(activity.date)}
                            amount={activity.amount}
                            isLast={index === arr.length - 1}
                          />
                        )
                      })}
                  </>
                ) : (
                  <p className="text-sm text-muted py-4 text-center">Sin actividad registrada</p>
                )}
              </div>
            </div>

            {/* Próxima Visita y Riesgo de Pérdida (from demo) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Próxima Visita */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Próxima Visita
                  </span>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {selectedCardClient.last_visit_at
                    ? `En ${Math.max(
                        1,
                        14 -
                          Math.floor(
                            (new Date().getTime() -
                              new Date(selectedCardClient.last_visit_at).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                      )} días`
                    : 'No estimado'}
                </p>
                <p className="text-xs text-muted">Basado en historial promedio</p>
              </div>

              {/* Riesgo de Pérdida */}
              <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 dark:from-green-500/20 dark:to-emerald-600/20 border border-green-500/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Riesgo de Pérdida
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {(() => {
                    const daysSince = selectedCardClient.last_visit_at
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(selectedCardClient.last_visit_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 999
                    if (daysSince > 45) return '95%'
                    if (daysSince > 30) return '60%'
                    if (daysSince > 21) return '30%'
                    return '5%'
                  })()}
                </p>
                <p className="text-xs text-muted">
                  {selectedCardClient.last_visit_at
                    ? `${Math.floor(
                        (new Date().getTime() -
                          new Date(selectedCardClient.last_visit_at).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}d sin visita`
                    : 'Sin visitas registradas'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {selectedCardClient.notes && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Notas</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {selectedCardClient.notes}
                </p>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  )
}
