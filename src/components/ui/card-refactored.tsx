'use client'

import { type HTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// COMPOSITION PATTERNS APPLIED:
// 1. Explicit Variants - Card.Interactive, Card.Button, Card.Link instead of boolean props
// 2. No Boolean Props - Removed hoverable and clickable
// 3. Semantic HTML - Button and Link variants use proper semantics
// ============================================================================

// ============================================================================
// WEB INTERFACE GUIDELINES APPLIED:
// 1. role="button" on clickable cards
// 2. Keyboard support (Enter, Space) on interactive cards
// 3. Proper hover states
// 4. touch-action for mobile
// ============================================================================

export interface BaseCardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>> {
  variant?: 'default' | 'elevated' | 'gradient' | 'bordered' | 'glass'
  children?: ReactNode
}

const baseStyles = 'rounded-2xl p-6 backdrop-blur-sm transition-colors duration-200'

const variants = {
  default: 'bg-white/90 shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] dark:bg-zinc-800/80 dark:border dark:border-zinc-700/50 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
  elevated: 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.04)] dark:bg-zinc-800 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
  gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/30',
  bordered: 'bg-white border-2 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700',
  glass: 'bg-white/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:bg-zinc-900/60 dark:border-zinc-700/20',
}

// Base Card Component (static, no interaction)
export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: BaseCardProps) {
  const MotionCard = motion.div

  return (
    <MotionCard
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </MotionCard>
  )
}

// Interactive Card (hoverable, visual feedback only)
interface InteractiveCardProps extends BaseCardProps {
  onClick?: () => void
}

function CardInteractive({
  className,
  variant = 'default',
  children,
  ...props
}: InteractiveCardProps) {
  const MotionCard = motion.div

  return (
    <MotionCard
      className={cn(
        baseStyles,
        variants[variant],
        'cursor-pointer',
        className
      )}
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionCard>
  )
}

// Button Card (semantic button, full keyboard support)
interface ButtonCardProps extends BaseCardProps {
  onClick?: () => void
  disabled?: boolean
}

function CardButton({
  className,
  variant = 'default',
  children,
  onClick,
  disabled,
  ...props
}: ButtonCardProps) {
  const MotionButton = motion.button as any

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <MotionButton
      type="button"
      role="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        'cursor-pointer text-left w-full',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2',
        'touch-action-manipulation',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      whileHover={
        !disabled
          ? {
              y: -4,
              scale: 1.01,
              boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionButton>
  )
}

// Link Card (semantic link, proper navigation)
interface LinkCardProps extends BaseCardProps {
  href: string
  target?: string
  rel?: string
}

function CardLink({
  className,
  variant = 'default',
  children,
  href,
  target,
  rel,
  ...props
}: LinkCardProps) {
  const MotionLink = motion.a as any

  // Automatically add rel="noopener noreferrer" for external links
  const finalRel = target === '_blank' && !rel ? 'noopener noreferrer' : rel

  return (
    <MotionLink
      href={href}
      target={target}
      rel={finalRel}
      className={cn(
        baseStyles,
        variants[variant],
        'cursor-pointer block no-underline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2',
        'touch-action-manipulation',
        className
      )}
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionLink>
  )
}

// ============================================================================
// COMPOUND COMPONENTS (Shared across all card types)
// ============================================================================

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

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

export interface StatCardProps extends BaseCardProps {
  icon?: ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  onClick?: () => void
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  description,
  onClick,
  className,
  ...props
}: StatCardProps) {
  // Use CardInteractive if clickable, otherwise static Card
  const Component = onClick ? CardInteractive : Card

  return (
    <Component onClick={onClick} className={cn('relative overflow-hidden', className)} {...props}>
      {icon && (
        <div className="mb-3 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800" aria-hidden="true">
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
              aria-label={`${trend.isPositive ? 'Increase' : 'Decrease'} of ${trend.value} percent`}
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
    </Component>
  )
}

// Compound Card Export
Card.Interactive = CardInteractive
Card.Button = CardButton
Card.Link = CardLink
Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter
Card.Stat = StatCard

// Named exports for backwards compatibility
export {
  Card as default,
  CardInteractive,
  CardButton,
  CardLink,
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Before (old API with boolean props):
<Card hoverable clickable onClick={handleClick} variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// After (new API) - Option 1: Button variant (semantic button):
<Card.Button onClick={handleClick} variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Button>

// After (new API) - Option 2: Link variant (semantic link):
<Card.Link href="/path" variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Link>

// After (new API) - Option 3: Interactive (visual hover only, no click):
<Card.Interactive variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Interactive>

// Static card (no interaction):
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>

// Benefits:
// ✅ No boolean props (hoverable, clickable eliminated)
// ✅ Semantic HTML (button vs link)
// ✅ Keyboard support (Enter, Space)
// ✅ Proper ARIA (role="button")
// ✅ Clear intent (Button vs Link vs Interactive vs static)
// ✅ touch-action for better mobile UX

*/
