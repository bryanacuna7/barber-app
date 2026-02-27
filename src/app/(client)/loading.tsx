export default function ClientLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 skeleton h-10 w-48 rounded-xl" />

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="skeleton mb-3 h-5 w-1/3 rounded" />
              <div className="skeleton mb-2 h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-11 w-16 rounded-xl" />
          ))}
        </div>
      </nav>
    </div>
  )
}
