import { CalendarDays, History, Package } from 'lucide-react'
import { getAppVersion, getChangelogReleases } from '@/lib/changelog'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function formatReleaseDate(date: string | null): string {
  if (!date) {
    return 'Sin fecha'
  }

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return dateFormatter.format(parsed)
}

export default async function ChangelogPage() {
  const [allReleases, appVersion] = await Promise.all([getChangelogReleases(12), getAppVersion()])
  const releases = allReleases.filter(
    (release) => release.version.toLowerCase() !== 'unreleased' && release.date !== null
  )

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <History className="h-3.5 w-3.5" />
              Historial de versiones
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Novedades</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Cambios ya aplicados y disponibles en la app, organizados por versión.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
            <Package className="h-4 w-4" />
            Versión actual: <span className="font-semibold">v{appVersion}</span>
          </div>
        </div>
      </section>

      {releases.length === 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Aún no hay notas de versión publicadas para mostrar.
        </section>
      ) : (
        <div className="space-y-4">
          {releases.map((release) => (
            <article
              key={`${release.version}-${release.date ?? 'no-date'}`}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {`v${release.version}`}
                </h2>
                <p className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <CalendarDays className="h-4 w-4" />
                  {formatReleaseDate(release.date)}
                </p>
              </header>

              <div className="space-y-5">
                {release.sections.map((section) => (
                  <section key={`${release.version}-${section.title}`} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => (
                        <li
                          key={`${release.version}-${section.title}-${index}`}
                          className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300"
                        >
                          <span className="whitespace-pre-line">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
