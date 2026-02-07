'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AdminErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    // Log error with admin context
    console.error('Admin panel error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-xl border border-red-200 dark:border-red-900/30 p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-red-500/10 dark:bg-red-500/5 p-4 rounded-full">
                <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Error en el Panel de Administración
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              No pudimos cargar esta sección del panel administrativo. Intenta recargar o vuelve al
              inicio.
            </p>
          </div>

          {/* Error Details (development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6">
              <summary className="text-sm text-muted cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-2">
                Detalles del error
              </summary>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mensaje:
                  </p>
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">
                    {error.message}
                  </p>
                </div>
                {error.digest && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Error ID:
                    </p>
                    <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      {error.digest}
                    </p>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Stack:
                    </p>
                    <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/25 active:scale-95 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>

            <Link
              href="/admin"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Panel
            </Link>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center text-sm text-muted mt-4">
          ¿Necesitas ayuda?{' '}
          <Link
            href="/admin/configuracion"
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            Contacta a soporte técnico
          </Link>
        </p>
      </div>
    </div>
  )
}
