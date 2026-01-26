export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-zinc-900">
              BarberShop Pro
              <span className="h-1 w-1 rounded-full bg-white/80 dark:bg-zinc-900/70" />
              Agenda inteligente
            </div>
            <h1 className="mt-5 text-[38px] font-bold tracking-tight text-zinc-900 dark:text-white sm:text-[46px] lg:text-[54px]">
              Tu barbería con agenda, pagos y clientes en un solo lugar.
            </h1>
            <p className="mt-4 text-[17px] leading-7 text-zinc-600 dark:text-zinc-400">
              Cobra a tiempo, reduce no-shows y ofrece reservas con una experiencia premium
              para tus clientes. Configuras en minutos y empiezas a agendar hoy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-6 py-4 text-[15px] font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Crear cuenta gratis
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white/80 px-6 py-4 text-[15px] font-semibold text-zinc-900 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-white dark:hover:bg-zinc-900"
              >
                Ya tengo cuenta
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800/70">
                ✅ Reservas públicas personalizadas
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800/70">
                ✅ Control de citas y clientes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800/70">
                ✅ Funciona en móvil
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-zinc-200/70 via-white/30 to-white/80 blur-2xl dark:from-zinc-800/40 dark:via-zinc-900/30 dark:to-black/50" />
            <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900/80">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Vista rápida
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Hoy
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { time: '9:30', name: 'Carlos M.', service: 'Corte + Barba', status: 'Confirmada' },
                  { time: '11:00', name: 'Andrea R.', service: 'Fade', status: 'Pendiente' },
                  { time: '14:15', name: 'Luis P.', service: 'Color', status: 'Confirmada' },
                ].map((item) => (
                  <div
                    key={`${item.time}-${item.name}`}
                    className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                        {item.time} · {item.name}
                      </p>
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                        {item.service}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Citas', value: '12' },
                  { label: 'Ingresos', value: '₡128k' },
                  { label: 'Clientes', value: '84' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-zinc-100 px-3 py-4 text-center dark:bg-zinc-800/80"
                  >
                    <p className="text-[18px] font-bold text-zinc-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Agenda automática',
              copy: 'Bloquea horarios, evita solapamientos y administra tu día desde el móvil.',
            },
            {
              title: 'Clientes fidelizados',
              copy: 'Historial, notas y recordatorios para brindar una experiencia VIP.',
            },
            {
              title: 'Reservas públicas',
              copy: 'Comparte tu link y recibe citas sin llamadas ni mensajes.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-[22px] border border-zinc-200 bg-white/90 p-6 shadow-lg shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/80"
            >
              <h3 className="text-[18px] font-semibold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
                {feature.copy}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
