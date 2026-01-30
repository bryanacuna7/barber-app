'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bars'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

export function Spinner({ size = 'md', variant = 'default', className }: SpinnerProps) {
  if (variant === 'dots') {
    return <DotsSpinner size={size} className={className} />
  }

  if (variant === 'pulse') {
    return <PulseSpinner size={size} className={className} />
  }

  if (variant === 'bars') {
    return <BarsSpinner size={size} className={className} />
  }

  // Default spinner
  return (
    <motion.div
      className={cn('inline-flex', className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Loader2 className={cn(sizeClasses[size], 'text-zinc-500 dark:text-zinc-400')} />
    </motion.div>
  )
}

function DotsSpinner({ size, className }: Pick<SpinnerProps, 'size' | 'className'>) {
  const dotSize =
    size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className={cn('inline-flex gap-2', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(dotSize, 'rounded-full bg-zinc-500 dark:bg-zinc-400')}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function PulseSpinner({ size, className }: Pick<SpinnerProps, 'size' | 'className'>) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-blue-500"
        animate={{
          scale: [1, 1.5],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-purple-500"
        animate={{
          scale: [1, 1.5],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.75,
          ease: 'easeOut',
        }}
      />
      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
    </div>
  )
}

function BarsSpinner({ size, className }: Pick<SpinnerProps, 'size' | 'className'>) {
  const barSize =
    size === 'sm'
      ? 'w-1 h-4'
      : size === 'md'
        ? 'w-1.5 h-8'
        : size === 'lg'
          ? 'w-2 h-12'
          : 'w-2.5 h-16'

  return (
    <div className={cn('inline-flex gap-1 items-center', className)}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn(barSize, 'rounded-full bg-zinc-500 dark:bg-zinc-400')}
          animate={{
            scaleY: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Full page loader
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <Spinner size="xl" variant="pulse" />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg font-medium text-zinc-700 dark:text-zinc-300"
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}

// Progress bar component
export interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, className, showLabel = false }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}
