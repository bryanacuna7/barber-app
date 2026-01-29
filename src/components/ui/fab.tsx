'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FABProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: ReactNode
  label?: string
  isLoading?: boolean
  className?: string
}

export function FAB({ icon, label, isLoading, className, ...props }: FABProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed bottom-24 right-4 z-50',
        'flex items-center gap-2 h-14 px-6 rounded-full',
        'bg-zinc-900 dark:bg-white',
        'text-white dark:text-zinc-900',
        'shadow-lg shadow-zinc-900/20 dark:shadow-white/20',
        'font-semibold text-[15px]',
        'transition-all duration-200',
        'hover:shadow-xl hover:shadow-zinc-900/30 dark:hover:shadow-white/30',
        isLoading && 'opacity-70 pointer-events-none',
        'lg:hidden', // Hide on desktop
        className
      )}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
        />
      ) : (
        <>
          {icon}
          {label && <span className="hidden sm:inline">{label}</span>}
        </>
      )}
    </motion.button>
  )
}
