export function PremiumBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

      {/* Subtle ambient mesh — CSS animations for zero JS cost */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-ambient-1"
          style={{ background: 'rgba(var(--brand-primary-rgb), 0.5)' }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-ambient-2"
          style={{ background: 'rgba(var(--brand-primary-rgb), 0.3)' }}
        />
      </div>
    </div>
  )
}
