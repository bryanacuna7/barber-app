'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log error with context
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-full">
                <AlertCircle
                  className="w-12 h-12 text-amber-600 dark:text-amber-500"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Error en el Dashboard
            </h2>
            <p className="text-muted">
              No pudimos cargar esta sección. Intenta recargar o vuelve al inicio.
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
                  <p className="text-xs font-mono text-muted break-all">{error.message}</p>
                </div>
                {error.digest && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Error ID:
                    </p>
                    <p className="text-xs font-mono text-muted">{error.digest}</p>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Stack:
                    </p>
                    <pre className="text-xs font-mono text-muted overflow-auto max-h-32 whitespace-pre-wrap">
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
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-95 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>

            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center text-sm text-muted mt-4">
          ¿Necesitas ayuda?{' '}
          <Link
            href="/configuracion"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Contacta a soporte
          </Link>
        </p>
      </div>
    </div>
  )
}
