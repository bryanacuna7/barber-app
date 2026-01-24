import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    // iOS-style base with press animation
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] -webkit-tap-highlight-color-transparent'

    const variants = {
      primary: 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:shadow-white/10 dark:hover:bg-zinc-100',
      secondary: 'bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700',
      outline: 'border-2 border-zinc-200 bg-white/80 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:bg-zinc-800',
      ghost: 'bg-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
      danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600',
    }

    const sizes = {
      sm: 'px-4 py-2 text-[14px]',
      md: 'px-5 py-3 text-[15px]',
      lg: 'px-6 py-4 text-[17px]',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
