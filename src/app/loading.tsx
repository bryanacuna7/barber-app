export default function RootLoading() {
  return (
    <main className="min-h-dvh bg-white dark:bg-zinc-950">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="skeleton h-9 w-9 rounded-xl" />
            <div className="skeleton h-5 w-28 rounded" />
          </div>
          <div className="skeleton h-10 w-10 rounded-xl lg:hidden" />
        </nav>
      </header>

      <div className="flex min-h-dvh items-center justify-center px-6 pt-16">
        <div className="w-full max-w-xl space-y-3">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="space-y-2">
            <div className="skeleton h-14 w-full rounded-xl" />
            <div className="skeleton h-14 w-full rounded-xl" />
            <div className="skeleton h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
