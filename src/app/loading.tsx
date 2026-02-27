export default function RootLoading() {
  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-sm items-center px-5">
        <div className="w-full rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
          <div className="skeleton mb-3 h-4 w-24 rounded" />
          <div className="skeleton mb-2 h-8 w-full rounded-lg" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
      </div>
    </main>
  )
}
