interface BookingLoadingStateProps {
  showSlowHint?: boolean
}

export function BookingLoadingState({ showSlowHint = false }: BookingLoadingStateProps) {
  return (
    <div
      className="public-booking-theme min-h-screen bg-zinc-50 dark:bg-[#0B0D14] text-zinc-900 dark:text-white relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 hidden dark:block">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:py-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-[18px] bg-white/15" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-6 w-44 max-w-[70%] rounded bg-white/20" />
              <div className="h-4 w-32 max-w-[50%] rounded bg-white/15" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-8 w-32 rounded-full bg-white/10" />
            <div className="h-8 w-28 rounded-full bg-white/10" />
            <div className="h-8 w-24 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="sticky top-[108px] sm:top-[116px] z-40 px-4 py-3">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200/80 bg-white/85 dark:border-white/10 dark:bg-zinc-950/60 backdrop-blur-xl p-2 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-20 sm:w-28 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
            <div className="h-1 w-4 sm:w-6 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-10 w-20 sm:w-28 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
            <div className="h-1 w-4 sm:w-6 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-10 w-20 sm:w-28 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-4 animate-pulse">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-4 w-64 max-w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-10 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-3 h-10 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <p className="text-center text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
          Cargando agenda y horarios...
        </p>
        {showSlowHint && (
          <p className="text-center text-[13px] text-zinc-400 dark:text-zinc-500">
            Esto está tardando más de lo normal. Revisando disponibilidad...
          </p>
        )}
      </div>
    </div>
  )
}
