'use client'

import { type HTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>> {
  variant?: 'default' | 'elevated' | 'gradient' | 'bordered' | 'glass'
  hoverable?: boolean
  clickable?: boolean
  children?: ReactNode
}

export function Card({
  className,
  variant = 'default',
  hoverable = false,
  clickable = false,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl p-6 backdrop-blur-sm transition-colors duration-200'

  const variants = {
    default: 'bg-white/90 shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] dark:bg-zinc-800/80 dark:border dark:border-zinc-700/50 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    elevated: 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.04)] dark:bg-zinc-800 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/30',
    bordered: 'bg-white border-2 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700',
    glass: 'bg-white/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:bg-zinc-900/60 dark:border-zinc-700/20',
  }

  const MotionCard = motion.div

  return (
    <MotionCard
      className={cn(
        baseStyles,
        variants[variant],
        (hoverable || clickable) && 'cursor-pointer',
        className
      )}
      whileHover={
        hoverable || clickable
          ? {
              y: -4,
              scale: 1.01,
              boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
            }
          : undefined
      }
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionCard>
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('mb-4', className)}
      {...props}
    />
  )
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-zinc-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
}

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        'mt-1 text-sm text-zinc-500 dark:text-zinc-400',
        className
      )}
      {...props}
    />
  )
}

type CardContentProps = HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      className={cn('', className)}
      {...props}
    />
  )
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('mt-4 flex items-center gap-2', className)}
      {...props}
    />
  )
}

// Specialized Card Variants

export interface StatCardProps extends CardProps {
  icon?: ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  description,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card hoverable className={cn('relative overflow-hidden', className)} {...props}>
      {icon && (
        <div className="mb-3 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'text-sm font-semibold mb-1',
                trend.isPositive ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
    </Card>
  )
}
