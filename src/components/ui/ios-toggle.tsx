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
  const trackStateClasses = checked
    ? 'bg-[#30D158] dark:bg-[#30D158] ring-1 ring-[rgba(48,209,88,0.42)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_0_1px_rgba(48,209,88,0.22),0_8px_18px_rgba(0,0,0,0.28)]'
    : 'bg-[#D2D4DB] dark:bg-[#3A3D46] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'

  const thumbStateClasses = checked
    ? 'bg-white shadow-[0_3px_10px_rgba(0,0,0,0.35)]'
    : 'bg-[#F5F5F7] dark:bg-[#D0D3DB] shadow-[0_1px_5px_rgba(0,0,0,0.25)]'

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
          trackStateClasses
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
            'pointer-events-none relative rounded-full',
            'ring-0',
            sizeConfig.thumb,
            thumbStateClasses
          )}
          style={{
            x: checked ? sizeConfig.translate : 0,
          }}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-[35%] rounded-full transition-opacity duration-200',
              checked ? 'opacity-100 bg-[#24A148]' : 'opacity-0 bg-transparent'
            )}
          />
        </motion.span>
      </button>
      {label && (
        <span className="text-[17px] font-normal text-zinc-900 dark:text-white">{label}</span>
      )}
    </label>
  )
}
