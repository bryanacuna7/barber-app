'use client'

import { Card } from '@/components/ui/card'
import { Clock, ArrowRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Conversion {
  id: string
  referralCode: string
  status: 'pending' | 'active' | 'expired'
  createdAt: string
  convertedAt: string | null
  referrerBusiness: {
    id: string
    name: string
    slug: string
  }
  referredBusiness: {
    id: string
    name: string
    slug: string
  }
}

interface ConversionsTimelineProps {
  conversions: Conversion[]
}

export function ConversionsTimeline({ conversions }: ConversionsTimelineProps) {
  if (conversions.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay conversiones registradas todavía</p>
        </div>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Activo
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Pendiente
          </div>
        )
      case 'expired':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Expirado
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Conversiones Recientes
        </h3>
        <p className="text-sm text-muted mt-1">
          Últimas {conversions.length} conversiones registradas
        </p>
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {conversions.map((conversion, index) => (
          <motion.div
            key={conversion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-start gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  conversion.status === 'active'
                    ? 'bg-green-500'
                    : conversion.status === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              {index < conversions.length - 1 && (
                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(conversion.status)}
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {conversion.referralCode}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {conversion.referrerBusiness.name}
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {conversion.referredBusiness.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">
                    {formatDistanceToNow(new Date(conversion.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                  {conversion.convertedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Convertido{' '}
                      {formatDistanceToNow(new Date(conversion.convertedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
