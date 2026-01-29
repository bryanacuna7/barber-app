export function StatusBadge({ status }: { status: string }) {
  const styles = {
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const labels = {
    trial: 'Prueba',
    active: 'Activo',
    expired: 'Expirado',
    cancelled: 'Cancelado',
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.expired}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
