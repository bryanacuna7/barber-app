'use client'

import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Users, Calendar, Search, Database, Scissors, BarChart3, Share2 } from 'lucide-react'
import { animations } from '@/lib/design-system'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  variant?: 'default' | 'minimal' | 'illustrated'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: animations.duration.slow }}
        className={cn('flex flex-col items-center justify-center py-8 px-4 text-center', className)}
      >
        {Icon && <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-3" />}
        <p className="text-sm text-muted">{title}</p>
        {description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{description}</p>
        )}
      </motion.div>
    )
  }

  if (variant === 'illustrated') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0.01 } : animations.spring.gentle}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4 text-center',
          className
        )}
      >
        {Icon && (
          <motion.div
            className="relative mb-6"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [0, -8, 0],
                  }
            }
            transition={
              prefersReducedMotion
                ? {}
                : {
                    duration: animations.duration.slow * 9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          >
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-zinc-800">
                <Icon className="w-12 h-12 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            {/* Decorative circles */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: animations.duration.slow * 6,
                    repeat: Infinity,
                    delay: animations.duration.slow,
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    duration: animations.duration.slow * 6,
                    repeat: Infinity,
                    delay: animations.duration.slow * 3,
                  }}
                />
              </>
            )}
          </motion.div>
        )}

        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-muted max-w-sm mb-6">{description}</p>}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        )}
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: animations.duration.slow }}
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
    >
      {Icon && (
        <motion.div
          className="mb-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50"
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          transition={animations.spring.default}
        >
          <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-6">{description}</p>}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  )
}

// CTA button for empty states (respects reduced motion)
function EmptyStateCTA({ onClick, label }: { onClick: () => void; label: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      onClick={onClick}
      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      {label}
    </motion.button>
  )
}

function EmptyStateSecondaryCTA({ onClick, label }: { onClick: () => void; label: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="px-4 py-3 text-sm font-semibold rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      {label}
    </motion.button>
  )
}

// Predefined empty states for common scenarios
export function EmptyAppointments({
  onCreateNew,
  onViewGuide,
}: {
  onCreateNew?: () => void
  onViewGuide?: () => void
}) {
  return (
    <EmptyState
      variant="illustrated"
      icon={Calendar}
      title="No hay citas programadas"
      description="Comienza creando tu primera cita para gestionar tu agenda."
      action={onCreateNew ? <EmptyStateCTA onClick={onCreateNew} label="Crear Cita" /> : undefined}
      secondaryAction={
        onViewGuide ? <EmptyStateSecondaryCTA onClick={onViewGuide} label="Ver Guía" /> : undefined
      }
    />
  )
}

export function EmptyClients({
  onAddClient,
  onViewGuide,
}: {
  onAddClient?: () => void
  onViewGuide?: () => void
}) {
  return (
    <EmptyState
      variant="illustrated"
      icon={Users}
      title="No hay clientes registrados"
      description="Agrega tu primer cliente para empezar a gestionar tu base de datos."
      action={
        onAddClient ? <EmptyStateCTA onClick={onAddClient} label="Agregar Cliente" /> : undefined
      }
      secondaryAction={
        onViewGuide ? <EmptyStateSecondaryCTA onClick={onViewGuide} label="Ver Guía" /> : undefined
      }
    />
  )
}

export function EmptyServices({
  onCreateService,
  onViewGuide,
}: {
  onCreateService?: () => void
  onViewGuide?: () => void
}) {
  return (
    <EmptyState
      variant="illustrated"
      icon={Scissors}
      title="No hay servicios registrados"
      description="Crea tu primer servicio para empezar a recibir reservas."
      action={
        onCreateService ? (
          <EmptyStateCTA onClick={onCreateService} label="Crear Servicio" />
        ) : undefined
      }
      secondaryAction={
        onViewGuide ? <EmptyStateSecondaryCTA onClick={onViewGuide} label="Ver Guía" /> : undefined
      }
    />
  )
}

export function EmptyAnalytics({
  onRefresh,
  onViewGuide,
}: {
  onRefresh?: () => void
  onViewGuide?: () => void
}) {
  return (
    <EmptyState
      variant="default"
      icon={BarChart3}
      title="Aún no hay datos suficientes"
      description="Cuando registres citas y ventas, aquí verás métricas y tendencias."
      action={onRefresh ? <EmptyStateCTA onClick={onRefresh} label="Actualizar" /> : undefined}
      secondaryAction={
        onViewGuide ? <EmptyStateSecondaryCTA onClick={onViewGuide} label="Ver Guía" /> : undefined
      }
    />
  )
}

export function EmptyReferences({
  onShare,
  onViewGuide,
}: {
  onShare?: () => void
  onViewGuide?: () => void
}) {
  return (
    <EmptyState
      variant="default"
      icon={Share2}
      title="Aún no hay referencias"
      description="Comparte tu enlace para comenzar a recibir referidos."
      action={onShare ? <EmptyStateCTA onClick={onShare} label="Compartir Enlace" /> : undefined}
      secondaryAction={
        onViewGuide ? <EmptyStateSecondaryCTA onClick={onViewGuide} label="Ver Guía" /> : undefined
      }
    />
  )
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      variant="default"
      icon={Search}
      title="Sin resultados"
      description={`No encontramos resultados para "${query}"`}
    />
  )
}

export function EmptyData() {
  return <EmptyState variant="minimal" icon={Database} title="No hay datos disponibles" />
}
