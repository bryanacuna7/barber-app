'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AdvancedSettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultExpanded?: boolean
  badge?: string
}

export function AdvancedSettingsSection({
  title,
  description,
  children,
  defaultExpanded = false,
  badge,
}: AdvancedSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden transition-all">
      {/* Header - Clickable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer',
          isExpanded
            ? 'bg-blue-50 dark:bg-blue-950/30'
            : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4
              className={cn(
                'text-[15px] font-semibold',
                isExpanded ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-white'
              )}
            >
              {title}
            </h4>
            {badge && (
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-[13px] text-muted">{description}</p>}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex-shrink-0',
            isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-zinc-900 border-t-2 border-zinc-200 dark:border-zinc-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
