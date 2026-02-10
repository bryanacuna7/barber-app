export default function RootLoading() {
  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pt-12 pb-8">
        <div className="h-10 w-40 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />
        <div className="h-24 animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
        <div className="h-24 animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
        <div className="h-24 animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
      </div>
    </main>
  )
}
