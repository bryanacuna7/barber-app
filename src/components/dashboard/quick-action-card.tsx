import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  href: string
  icon: LucideIcon
  label: string
  variant?: 'default' | 'warning'
}

export function QuickActionCard({
  href,
  icon: Icon,
  label,
  variant = 'default',
}: QuickActionCardProps) {
  const isWarning = variant === 'warning'

  return (
    <Link href={href} className="block group">
      <div
        className={cn(
          'flex flex-col items-center gap-2 rounded-2xl px-3 py-4 border-2',
          'transition-all duration-200',
          'active:scale-[0.96]',
          'lg:hover:-translate-y-0.5 lg:hover:shadow-md',
          isWarning
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 lg:hover:border-amber-300 dark:lg:hover:border-amber-600'
            : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent lg:hover:border-zinc-200 dark:lg:hover:border-zinc-700'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
            isWarning
              ? 'bg-amber-500 dark:bg-amber-600 group-hover:bg-amber-600 dark:group-hover:bg-amber-500'
              : 'lg:group-hover:shadow-md'
          )}
        >
          <Icon className={cn('h-6 w-6', isWarning ? 'text-white' : '')} />
        </div>
        <span
          className={cn(
            'text-sm font-medium text-center',
            isWarning ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-900 dark:text-white'
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}
