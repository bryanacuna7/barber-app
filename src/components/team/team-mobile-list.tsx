'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, Trash2 } from 'lucide-react'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { animations } from '@/lib/design-system'
import type { UIBarber } from '@/lib/adapters/barbers'

// ─── Helpers ────────────────────────────────────────────────

function normalizeAvatarUrl(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined')
    return undefined
  return trimmed
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}

// ─── Avatar ─────────────────────────────────────────────────

function BarberAvatar({
  name,
  avatarUrl,
  isActive,
  size = 'md',
}: {
  name: string
  avatarUrl?: string
  isActive: boolean
  size?: 'md' | 'lg'
}) {
  const normalized = normalizeAvatarUrl(avatarUrl)
  const sizeClass = size === 'lg' ? 'w-14 h-14' : 'w-11 h-11'
  const textClass = size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 ${
        isActive
          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-zinc-100 dark:bg-zinc-700/40 text-zinc-400'
      }`}
    >
      {normalized ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalized}
          alt=""
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`${textClass} font-semibold uppercase`}>{getInitials(name)}</span>
      )}
    </div>
  )
}

// ─── Owner Featured Card ────────────────────────────────────

function OwnerCard({ barber, onSelect }: { barber: UIBarber; onSelect: (b: UIBarber) => void }) {
  return (
    <button
      onClick={() => onSelect(barber)}
      className="w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white dark:from-emerald-900/40 dark:via-emerald-800/20 dark:to-zinc-900 p-5 active:scale-[0.99] transition-transform"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-4">
        <BarberAvatar name={barber.name} avatarUrl={barber.avatarUrl} isActive size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-zinc-900 dark:text-white text-[15px]">{barber.name}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
              Dueño
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{barber.email}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-500 shrink-0" />
      </div>

      {/* Mini stats */}
      <div className="relative flex items-center gap-4 mt-4 pt-3.5 border-t border-emerald-200/40 dark:border-white/[0.06]">
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
            {barber.totalAppointments ?? 0}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
            Citas
          </p>
        </div>
        <div className="w-px h-8 bg-emerald-200/40 dark:bg-white/[0.06]" />
        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
            ₡{Math.round((barber.totalRevenue ?? 0) / 1000)}k
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
            Ingreso
          </p>
        </div>
        <div className="w-px h-8 bg-emerald-200/40 dark:bg-white/[0.06]" />
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
              {barber.avgRating?.toFixed(1) ?? '—'}
            </p>
            {barber.avgRating != null && (
              <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-current" />
            )}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
            Rating
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Team Member Row ────────────────────────────────────────

function MemberRow({
  barber,
  onSelect,
  onDelete,
}: {
  barber: UIBarber
  onSelect: (b: UIBarber) => void
  onDelete: (b: UIBarber) => void
}) {
  const isOwner = barber.role === 'owner'

  const rowContent = (
    <button
      onClick={() => onSelect(barber)}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left bg-white dark:bg-zinc-950 active:bg-zinc-100 dark:active:bg-zinc-900 transition-colors ${
        !barber.isActive ? 'opacity-60' : ''
      }`}
    >
      <BarberAvatar name={barber.name} avatarUrl={barber.avatarUrl} isActive={barber.isActive} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-zinc-900 dark:text-white">{barber.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {isOwner ? 'Dueño' : 'Barbero'} · {barber.isActive ? 'Activo' : 'Inactivo'}
        </p>
        {barber.isActive && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
            {barber.avgRating != null && (
              <>
                <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-current" />
                {barber.avgRating.toFixed(1)} ·{' '}
              </>
            )}
            {barber.totalAppointments ?? 0} citas este mes
          </p>
        )}
        {!barber.isActive && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Sin actividad reciente</p>
        )}
      </div>
      {isOwner && <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0" />}
    </button>
  )

  // Owner rows don't have swipe actions
  if (isOwner) return rowContent

  return (
    <SwipeableRow
      showAffordance={false}
      rightActions={[
        {
          label: 'Eliminar',
          icon: <Trash2 className="h-5 w-5" />,
          color: 'bg-red-500',
          onClick: () => onDelete(barber),
        },
      ]}
    >
      {rowContent}
    </SwipeableRow>
  )
}

// ─── Main List ──────────────────────────────────────────────

interface TeamMobileListProps {
  barbers: UIBarber[]
  onSelect: (barber: UIBarber) => void
  onDelete: (barber: UIBarber) => void
}

export const TeamMobileList = React.memo(function TeamMobileList({
  barbers,
  onSelect,
  onDelete,
}: TeamMobileListProps) {
  const owner = barbers.find((b) => b.role === 'owner')
  const team = barbers.filter((b) => b.role !== 'owner')

  return (
    <div className="space-y-5">
      {/* Owner featured card */}
      {owner && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animations.spring.default}
        >
          <OwnerCard barber={owner} onSelect={onSelect} />
        </motion.div>
      )}

      {/* Team members */}
      {team.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Equipo
          </p>
          <div className="rounded-2xl overflow-hidden">
            <AnimatePresence mode="popLayout">
              {team.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  layout
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={animations.spring.layout}
                >
                  {index > 0 && <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800/60" />}
                  <MemberRow barber={barber} onSelect={onSelect} onDelete={onDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
})
