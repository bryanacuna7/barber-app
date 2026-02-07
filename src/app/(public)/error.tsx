'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface PublicErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    // Log error for public pages
    console.error('Public page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[22px] shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Icon Header */}
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-200 p-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full blur-xl animate-pulse" />
              <AlertTriangle
                className="w-20 h-20 text-white dark:text-zinc-900 relative"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-[22px] font-semibold text-zinc-900 dark:text-white">
                Algo salió mal
              </h1>
              <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
                No pudimos cargar la página. Por favor intenta de nuevo.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-[13px] text-muted cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                  Ver detalles técnicos
                </summary>
                <div className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <p className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-[11px] text-muted mt-2">Error ID: {error.digest}</p>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-4 h-[44px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-semibold rounded-[14px] hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200"
              >
                <RefreshCw className="w-[18px] h-[18px]" />
                Intentar de nuevo
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center justify-center gap-2 px-4 h-[44px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[15px] font-medium rounded-[14px] hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200"
              >
                <Home className="w-[18px] h-[18px]" />
                Ir al inicio
              </button>
            </div>

            {/* Help Text */}
            <p className="text-[12px] text-center text-muted pt-2">
              Si el problema persiste, contacta al negocio directamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
