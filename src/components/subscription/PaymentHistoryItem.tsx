import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { PaymentReport } from '@/types/database'

export function PaymentHistoryItem({ payment }: { payment: PaymentReport }) {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  const StatusIcon =
    payment.status === 'approved'
      ? CheckCircle
      : payment.status === 'rejected'
        ? AlertCircle
        : Clock

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <StatusIcon
          className={`h-5 w-5 ${
            payment.status === 'approved'
              ? 'text-green-500'
              : payment.status === 'rejected'
                ? 'text-red-500'
                : 'text-amber-500'
          }`}
        />
        <div>
          <div className="font-medium text-zinc-900 dark:text-white">${payment.amount_usd}</div>
          <div className="text-sm text-zinc-500">
            {new Date(payment.created_at).toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[payment.status]}`}
      >
        {statusLabels[payment.status]}
      </span>
    </div>
  )
}
