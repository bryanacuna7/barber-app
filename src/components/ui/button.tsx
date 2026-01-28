'use client'

import { forwardRef, type ButtonHTMLAttributes, useState, MouseEvent } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  withRipple?: boolean
}

interface RippleType {
  x: number
  y: number
  id: number
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, withRipple = true, children, disabled, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<RippleType[]>([])

    // Ripple effect on click
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (withRipple && !disabled && !isLoading) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()

        setRipples(prev => [...prev, { x, y, id }])
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id))
        }, 600)
      }

      onClick?.(e)
    }

    // iOS-style base with better animations
    const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed -webkit-tap-highlight-color-transparent transition-colors duration-200'

    const variants = {
      primary: 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 focus-visible:ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:shadow-white/10 dark:hover:bg-zinc-100 dark:focus-visible:ring-white',
      secondary: 'bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300/80 focus-visible:ring-zinc-500 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700',
      outline: 'border-2 border-zinc-200 bg-white/80 hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:hover:border-zinc-600',
      ghost: 'bg-transparent hover:bg-zinc-100/80 focus-visible:ring-zinc-500 dark:hover:bg-zinc-800/80',
      danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 focus-visible:ring-red-500',
      gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700 focus-visible:ring-blue-500',
      success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 focus-visible:ring-emerald-500',
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
        disabled={disabled || isLoading}
        onClick={handleClick}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
          />
        ))}

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
