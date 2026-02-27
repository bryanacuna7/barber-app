import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsSubrouteHeaderProps {
  title: string
  subtitle?: string
  hideSubtitleOnDesktop?: boolean
  backHref?: string
  backLabel?: string
}

export function SettingsSubrouteHeader({
  title,
  subtitle,
  hideSubtitleOnDesktop = true,
  backHref = '/configuracion',
  backLabel = 'Configuración',
}: SettingsSubrouteHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className={cn(
          'mb-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-sm font-medium transition-colors',
          'border-zinc-200/70 bg-white/70 text-zinc-700 hover:bg-white',
          'dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className="app-page-title">{title}</h1>
      {subtitle ? (
        <p className={`app-page-subtitle mt-1 ${hideSubtitleOnDesktop ? 'lg:hidden' : ''}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
