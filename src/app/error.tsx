'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl border border-red-100 dark:border-red-900/20 overflow-hidden">
          {/* Icon Header */}
          <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
              <AlertTriangle className="w-16 h-16 text-white relative" strokeWidth={2} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Algo salió mal</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Ha ocurrido un error inesperado. No te preocupes, tu información está segura.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                  Ver detalles técnicos
                </summary>
                <div className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/25 active:scale-95 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>

              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 pt-2">
              Si el problema persiste, contacta a soporte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
