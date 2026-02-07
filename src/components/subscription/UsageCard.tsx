export function UsageCard({
  icon: Icon,
  label,
  current,
  max,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current?: number
  max?: number | null
  enabled?: boolean
}) {
  const isUnlimited = max === null || max === undefined
  const isAtLimit = max != null && current !== undefined && current >= max
  const percentage = max != null && current !== undefined ? Math.min((current / max) * 100, 100) : 0

  // For branding card (enabled prop)
  if (enabled !== undefined) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Icon className="h-5 w-5 text-muted" />
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
        <div
          className={`mt-1 font-semibold ${enabled ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-500'}`}
        >
          {enabled ? 'Habilitado' : 'No disponible'}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <Icon className="h-5 w-5 text-muted" />
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
      <div
        className={`mt-1 font-semibold ${
          isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'
        }`}
      >
        {current}/{isUnlimited ? '∞' : max}
      </div>
      {!isUnlimited && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
