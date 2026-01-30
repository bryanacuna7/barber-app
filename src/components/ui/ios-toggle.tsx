'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface IOSToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = {
  sm: {
    track: 'w-10 h-6',
    thumb: 'w-5 h-5',
    translate: 16,
  },
  md: {
    track: 'w-[51px] h-[31px]',
    thumb: 'w-[27px] h-[27px]',
    translate: 20,
  },
  lg: {
    track: 'w-14 h-8',
    thumb: 'w-7 h-7',
    translate: 24,
  },
}

export function IOSToggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
}: IOSToggleProps) {
  const sizeConfig = sizes[size]

  return (
    <label
      className={cn('inline-flex items-center gap-3', disabled && 'opacity-50 cursor-not-allowed')}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full p-[2px]',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2',
          sizeConfig.track,
          checked ? 'bg-[var(--brand-primary)]' : 'bg-[#E9E9EB] dark:bg-[#39393D]'
        )}
      >
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30,
          }}
          className={cn(
            'pointer-events-none rounded-full bg-white shadow-md',
            'ring-0',
            sizeConfig.thumb
          )}
          style={{
            x: checked ? sizeConfig.translate : 0,
          }}
        />
      </button>
      {label && (
        <span className="text-[17px] font-normal text-zinc-900 dark:text-white">{label}</span>
      )}
    </label>
  )
}
