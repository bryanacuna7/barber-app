export default function MiDiaLoading() {
  return (
    <div>
      <div className="animate-pulse">
        <div className="py-5">
          <div className="mb-3 h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mb-4 h-4 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        </div>

        <main className="container mx-auto max-w-4xl px-3 py-5 sm:px-4 sm:py-6">
          <div className="mb-4 flex items-center justify-end gap-2">
            <div className="h-11 min-w-[104px] rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-11 min-w-[104px] rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-11 w-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <div className="space-y-4 p-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-48 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
