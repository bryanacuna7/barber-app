'use client'

import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface Conversion {
  id: string
  referred_business: {
    name: string
  } | null
  status: 'pending' | 'trial' | 'active' | 'churned'
  created_at: string
  converted_at: string | null
}

interface ConversionsTableProps {
  conversions: Conversion[]
}

export function ConversionsTable({ conversions }: ConversionsTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        label: 'Pendiente',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      },
      trial: {
        label: 'Prueba',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      active: {
        label: 'Activo',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      churned: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    }
    const config = variants[status as keyof typeof variants]
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  if (conversions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Historial de Conversiones
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-zinc-600 dark:text-zinc-400">Aún no tienes conversiones</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
            Comparte tu código de referido para empezar a ganar recompensas
          </p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Historial de Conversiones
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Negocio Referido
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Fecha de Registro
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Fecha de Conversión
                </th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((conversion, index) => (
                <motion.tr
                  key={conversion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {conversion.referred_business?.name || 'Pendiente de confirmación'}
                  </td>
                  <td className="py-3 px-4 text-sm">{getStatusBadge(conversion.status)}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(conversion.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {conversion.converted_at
                      ? new Date(conversion.converted_at).toLocaleDateString('es-ES')
                      : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
