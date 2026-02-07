'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        errorBoundary: 'global',
      },
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Critical error caught by global boundary:', error)
    }
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-900 via-zinc-900 to-zinc-950">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Critical Error Icon */}
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative bg-red-500/10 p-6 rounded-full border border-red-500/20">
                <AlertTriangle className="w-20 h-20 text-red-500" strokeWidth={2} />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">Error Crítico</h1>
              <p className="text-zinc-400 text-lg">Ha ocurrido un error grave en la aplicación.</p>
              <p className="text-zinc-500 text-sm">
                Por favor, intenta recargar la página o contacta a soporte si el problema persiste.
              </p>
            </div>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 text-left">
                <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-zinc-500 mt-2">Error ID: {error.digest}</p>
                )}
                {error.stack && (
                  <pre className="text-xs text-zinc-400 mt-3 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/25 active:scale-95 transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Reintentar
            </button>

            {/* Manual Reload */}
            <p className="text-xs text-zinc-500">
              o{' '}
              <button
                onClick={() => (window.location.href = '/')}
                className="text-red-400 hover:text-red-300 underline transition-colors"
              >
                recargar manualmente
              </button>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
