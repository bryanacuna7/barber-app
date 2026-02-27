'use client'

import { forwardRef, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  /** @deprecated No-op — ripple effect removed in favor of iOS-style whileTap scale */
  withRipple?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      withRipple: _withRipple,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for primary actions on mobile
      if (
        isMobileDevice() &&
        (variant === 'primary' || variant === 'gradient' || variant === 'danger')
      ) {
        haptics.tap()
      }

      onClick?.(e)
    }

    // iOS-style base
    const baseStyles =
      'relative overflow-hidden inline-flex max-w-full items-center justify-center text-center text-ellipsis whitespace-nowrap font-semibold rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed -webkit-tap-highlight-color-transparent transition-colors duration-200'

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
      gradient: 'btn-gradient-bg shadow-lg focus-visible:ring-2',
      success:
        'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 focus-visible:ring-emerald-500',
    }

    const sizes = {
      sm: 'px-4 py-2.5 text-sm gap-1.5 min-h-[44px]',
      md: 'px-5 py-3 text-base gap-2 min-h-[44px]',
      lg: 'px-6 py-3.5 text-lg gap-2.5 min-h-[48px]',
    }

    return (
      // @ts-ignore - framer-motion type compatibility issue
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        onClick={handleClick}
        whileTap={{ scale: 0.97 }}
        transition={animations.spring.snappy}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
