'use client'

import React from 'react'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, Calendar, Banknote, Crown, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Client } from '@/types'

interface ClientProfileErrorBoundaryProps {
  children: React.ReactNode
  client?: Client
  onReset?: () => void
}

/**
 * Client Profile Error Boundary with Read-Only View Fallback
 *
 * When profile editor fails (complex form validation),
 * falls back to a read-only view of client data.
 *
 * Reason: Form validation and state management can fail
 */
function ClientProfileFallback({ client, onRetry }: { client?: Client; onRetry?: () => void }) {
  if (!client) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No se pudo cargar la información del cliente
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </Card>
    )
  }

  const infoItems = [
    {
      icon: Phone,
      label: 'Teléfono',
      value: client.phone || 'No especificado',
    },
    {
      icon: Mail,
      label: 'Email',
      value: client.email || 'No especificado',
    },
    {
      icon: Calendar,
      label: 'Última visita',
      value: client.last_visit_at
        ? format(new Date(client.last_visit_at), "d 'de' MMMM, yyyy", { locale: es })
        : 'Nunca',
    },
    {
      icon: Banknote,
      label: 'Total gastado',
      value: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(
        Number(client.total_spent || 0)
      ),
    },
  ]

  const isVIP = (client.total_visits || 0) >= 5 || Number(client.total_spent || 0) >= 50000

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista de Solo Lectura
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El editor de perfil no está disponible temporalmente
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar editor
            </Button>
          )}
        </div>

        {/* Client Info Card */}
        <div className="space-y-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {client.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              {isVIP && (
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{client.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client.total_visits || 0} visita{client.total_visits !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                >
                  <Icon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Notas</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Modo de solo lectura:</strong> No puedes editar esta información en este
            momento. Intenta recargar el editor o contacta soporte si el problema persiste.
          </p>
        </div>
      </div>
    </Card>
  )
}

export function ClientProfileErrorBoundary({
  children,
  client,
  onReset,
}: ClientProfileErrorBoundaryProps) {
  return (
    <ComponentErrorBoundary
      fallback={<ClientProfileFallback client={client} onRetry={onReset} />}
      fallbackTitle="Error en perfil del cliente"
      fallbackDescription="No se pudo cargar el editor de perfil"
      showReset={false} // Custom reset button in fallback
      onReset={onReset}
      onError={(error) => {
        console.error('[ClientProfileErrorBoundary] Profile editor failed:', error)
      }}
    >
      {children}
    </ComponentErrorBoundary>
  )
}

export default ClientProfileErrorBoundary
