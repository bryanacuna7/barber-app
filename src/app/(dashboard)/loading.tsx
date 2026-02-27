export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 lg:border-r lg:border-zinc-200 lg:bg-white lg:px-4 lg:py-6 dark:lg:border-zinc-800 dark:lg:bg-zinc-900">
        <div className="skeleton mb-8 h-9 w-36 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-10 rounded-xl" />
          ))}
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 lg:hidden">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="skeleton h-7 w-28 rounded-lg" />
          <div className="skeleton h-9 w-9 rounded-full" />
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:py-7 lg:pb-10">
          <div className="mb-4 skeleton h-16 rounded-2xl" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="skeleton mb-3 h-4 w-1/3 rounded" />
                <div className="skeleton mb-2 h-8 w-1/2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-11 w-14 rounded-xl" />
          ))}
        </div>
      </nav>
    </div>
  )
}
