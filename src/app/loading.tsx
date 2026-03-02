export default function RootLoading() {
  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 md:py-8 lg:py-10">
        <header className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50 md:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="skeleton h-9 w-28 rounded-xl" />
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50 lg:block">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
              <div className="skeleton mb-3 h-5 w-40 rounded" />
              <div className="skeleton mb-2 h-10 w-full rounded-xl" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <div className="skeleton mb-3 h-4 w-20 rounded" />
                  <div className="skeleton mb-2 h-8 w-1/2 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
