'use client'

import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  href: string
  icon: LucideIcon
  label: string
  variant?: 'default' | 'warning'
}

export function QuickActionCard({ href, icon: Icon, label, variant = 'default' }: QuickActionCardProps) {
  const isWarning = variant === 'warning'

  return (
    <Link href={href} className="block group">
      <motion.div
        className={cn(
          'flex flex-col items-center gap-2 rounded-2xl px-3 py-4 transition-all duration-200 border-2',
          isWarning
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600'
            : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
        )}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <motion.div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
            isWarning
              ? 'bg-amber-500 dark:bg-amber-600 group-hover:bg-amber-600 dark:group-hover:bg-amber-500'
              : 'group-hover:shadow-md'
          )}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Icon className={cn('h-6 w-6', isWarning ? 'text-white' : '')} />
        </motion.div>
        <span className={cn(
          'text-[13px] font-medium text-center',
          isWarning ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-900 dark:text-white'
        )}>
          {label}
        </span>
      </motion.div>
    </Link>
  )
}
