'use client'

import { type ButtonHTMLAttributes, useState, MouseEvent, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================================================
// COMPOSITION PATTERNS APPLIED:
// 1. Explicit Variants - Button.Primary, Button.Danger, etc. instead of variant prop
// 2. No Boolean Props - Removed isLoading and withRipple
// 3. React 19 - ref as prop instead of forwardRef
// ============================================================================

// ============================================================================
// WEB INTERFACE GUIDELINES APPLIED:
// 1. Ellipsis character "…" instead of "..."
// 2. Proper aria-label for loading state
// 3. Disabled state during loading
// ============================================================================

export interface BaseButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof HTMLMotionProps<'button'>
> {
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
  ref?: React.Ref<HTMLButtonElement>
  className?: string
  disabled?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

interface RippleType {
  x: number
  y: number
  id: number
}

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'gradient'
  | 'success'

interface InternalButtonProps extends BaseButtonProps {
  variant: ButtonVariant
}

// Base Button Component (internal)
function BaseButton({
  className,
  variant,
  size = 'md',
  children,
  disabled,
  onClick,
  ref,
  ...props
}: InternalButtonProps) {
  const [ripples, setRipples] = useState<RippleType[]>([])

  // Ripple effect on click (always enabled for better UX)
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples((prev) => [...prev, { x, y, id }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
      }, 600)
    }

    onClick?.(e)
  }

  const baseStyles =
    'relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed -webkit-tap-highlight-color-transparent transition-colors duration-200'

  const variants = {
    primary:
      'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 focus-visible:ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:shadow-white/10 dark:hover:bg-zinc-100 dark:focus-visible:ring-white',
    secondary:
      'bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300/80 focus-visible:ring-zinc-500 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700',
    outline:
      'border-2 border-zinc-200 bg-white/80 hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:hover:border-zinc-600',
    ghost:
      'bg-transparent hover:bg-zinc-100/80 focus-visible:ring-zinc-500 dark:hover:bg-zinc-800/80',
    danger:
      'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 focus-visible:ring-red-500',
    gradient:
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700 focus-visible:ring-blue-500',
    success:
      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 focus-visible:ring-emerald-500',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[14px] gap-1.5',
    md: 'px-5 py-3 text-[15px] gap-2',
    lg: 'px-6 py-4 text-[17px] gap-2.5',
  }

  return (
    <motion.button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={handleClick}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          aria-hidden="true"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}

      {children}
    </motion.button>
  )
}

// Loading Spinner Component
function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} aria-hidden="true" />
}

// Explicit Variant Components
const Button = Object.assign(
  // Default button (primary)
  function Button(props: BaseButtonProps) {
    return <BaseButton variant="primary" {...props} />
  },
  {
    // Explicit variants
    Primary: function ButtonPrimary(props: BaseButtonProps) {
      return <BaseButton variant="primary" {...props} />
    },

    Secondary: function ButtonSecondary(props: BaseButtonProps) {
      return <BaseButton variant="secondary" {...props} />
    },

    Outline: function ButtonOutline(props: BaseButtonProps) {
      return <BaseButton variant="outline" {...props} />
    },

    Ghost: function ButtonGhost(props: BaseButtonProps) {
      return <BaseButton variant="ghost" {...props} />
    },

    Danger: function ButtonDanger(props: BaseButtonProps) {
      return <BaseButton variant="danger" {...props} />
    },

    Gradient: function ButtonGradient(props: BaseButtonProps) {
      return <BaseButton variant="gradient" {...props} />
    },

    Success: function ButtonSuccess(props: BaseButtonProps) {
      return <BaseButton variant="success" {...props} />
    },

    // Helper: Loading state composition
    Loading: function ButtonLoading({ children, ...props }: BaseButtonProps) {
      return (
        <BaseButton variant="primary" disabled aria-busy="true" aria-label="Loading" {...props}>
          <Spinner />
          <span>{children || 'Loading…'}</span>
        </BaseButton>
      )
    },

    // Export Spinner for custom compositions
    Spinner,
  }
)

// @ts-ignore - displayName for dev tools
Button.displayName = 'Button'

export { Button }

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Before (old API):
<Button variant="danger" isLoading={isDeleting}>
  Delete
</Button>

// After (new API) - Option 1: Explicit variant
<Button.Danger disabled={isDeleting}>
  {isDeleting ? (
    <>
      <Button.Spinner />
      <span>Deleting…</span>
    </>
  ) : (
    'Delete'
  )}
</Button.Danger>

// After (new API) - Option 2: Loading variant
{isDeleting ? (
  <Button.Loading>Deleting…</Button.Loading>
) : (
  <Button.Danger onClick={handleDelete}>Delete</Button.Danger>
)}

// Benefits:
// ✅ No boolean props
// ✅ Explicit variants
// ✅ Compose loading state manually
// ✅ Full control over loading UI
// ✅ Better TypeScript inference

*/
