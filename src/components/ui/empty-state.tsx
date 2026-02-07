'use client'

import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Users, Calendar, Search, Database } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  variant?: 'default' | 'minimal' | 'illustrated'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4 text-center',
          className
        )}
      >
        {Icon && (
          <motion.div
            className="relative mb-6"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-zinc-800">
                <Icon className="w-12 h-12 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            {/* Decorative circles */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        )}

        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-muted max-w-sm mb-6">{description}</p>}
        {action}
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
    >
      {Icon && (
        <motion.div
          className="mb-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-6">{description}</p>}
      {action}
    </motion.div>
  )
}

// Predefined empty states for common scenarios
export function EmptyAppointments({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      variant="illustrated"
      icon={Calendar}
      title="No hay citas programadas"
      description="Comienza creando tu primera cita para gestionar tu agenda."
      action={
        onCreateNew ? (
          <motion.button
            onClick={onCreateNew}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Crear Cita
          </motion.button>
        ) : undefined
      }
    />
  )
}

export function EmptyClients({ onAddClient }: { onAddClient?: () => void }) {
  return (
    <EmptyState
      variant="illustrated"
      icon={Users}
      title="No hay clientes registrados"
      description="Agrega tu primer cliente para empezar a gestionar tu base de datos."
      action={
        onAddClient ? (
          <motion.button
            onClick={onAddClient}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Agregar Cliente
          </motion.button>
        ) : undefined
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
