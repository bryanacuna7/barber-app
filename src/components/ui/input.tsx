'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'filled' | 'outline'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      id,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const inputId = id || props.name
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const baseStyles =
      'w-full px-4 py-4 text-[17px] text-zinc-900 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:placeholder:text-zinc-500 transition-all duration-200 focus:outline-none'

    const variantStyles = {
      default:
        'rounded-2xl border-0 bg-zinc-100/80 focus:bg-zinc-100 dark:bg-zinc-800/80 dark:focus:bg-zinc-800',
      filled:
        'rounded-2xl border-0 bg-zinc-200/60 focus:bg-zinc-200 dark:bg-zinc-700/60 dark:focus:bg-zinc-700',
      outline:
        'rounded-2xl border-2 border-zinc-200 bg-transparent focus:border-[var(--brand-primary)] dark:border-zinc-700',
    }

    const stateStyles = error
      ? 'ring-2 ring-red-500/50 bg-red-50 focus:ring-red-500/70 dark:bg-red-900/20'
      : success
        ? 'ring-2 ring-emerald-500/50 bg-emerald-50 focus:ring-emerald-500/70 dark:bg-emerald-900/20'
        : 'focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:focus:ring-[var(--brand-primary)]/30'

    return (
      <div className="w-full">
        <AnimatePresence mode="wait">
          {label && (
            <motion.label
              htmlFor={inputId}
              className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              baseStyles,
              variantStyles[variant],
              stateStyles,
              leftIcon && 'pl-12',
              (rightIcon || isPassword) && 'pr-12',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
          />

          {/* Right Icon / Password Toggle / Status Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            )}

            {success && !error && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </motion.div>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}

            {rightIcon && !error && !success && !isPassword && (
              <div className="text-zinc-400 dark:text-zinc-500">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Helper / Error / Success Text */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  'mt-2 text-[13px] font-medium',
                  error && 'text-red-500',
                  success && 'text-emerald-500',
                  !error && !success && 'text-zinc-500 dark:text-zinc-400'
                )}
              >
                {error || success || helperText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
