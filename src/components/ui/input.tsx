import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border-0 bg-zinc-100/80 px-4 py-4 text-[17px] text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:bg-zinc-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-500',
            'dark:focus:ring-white/20 dark:focus:bg-zinc-800',
            'transition-all duration-200',
            error && 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[13px] font-medium text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
