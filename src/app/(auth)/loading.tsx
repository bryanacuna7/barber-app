export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:items-center">
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="skeleton mx-auto mb-2 h-8 w-40 rounded" />
          <div className="skeleton mx-auto mb-6 h-4 w-56 rounded" />

          <div className="space-y-4">
            <div>
              <div className="skeleton mb-2 h-4 w-32 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
            <div>
              <div className="skeleton mb-2 h-4 w-28 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton mx-auto h-4 w-44 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
