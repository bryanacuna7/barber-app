import { Skeleton } from '@/components/ui/skeleton'

export default function CitasLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative z-10 flex">
        <div className="w-full min-w-0 flex-1 lg:pr-80">
          <header className="sticky top-0 z-40 border-b border-transparent bg-transparent backdrop-blur-sm dark:border-white/5">
            <div className="px-0 py-4 lg:px-6">
              <div className="mb-4 hidden items-center justify-between gap-2 lg:flex">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-56 rounded-lg" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                </div>
              </div>

              <div className="mb-3 space-y-2 rounded-2xl border border-zinc-200/70 bg-white/70 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:shadow-[0_14px_30px_rgba(0,0,0,0.35)] lg:hidden">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 flex-1 rounded" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-12 rounded" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            </div>
          </header>

          <div className="px-0 pt-4 lg:px-6">
            <Skeleton className="mb-4 h-16 rounded-2xl" />
          </div>

          <div className="space-y-4 px-0 pb-4 lg:p-6">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <Skeleton className="mb-3 h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4">
                  <Skeleton className="h-4 w-14" />
                  <div className="flex flex-1 items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="fixed right-0 top-0 hidden h-screen w-80 overflow-y-auto border-l border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:block">
          <div className="sticky top-0">
            <Skeleton className="mb-6 h-52 rounded-2xl" />
            <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
