'use client'

import { useState } from 'react'
import { AlertTriangle, Bomb, Bug } from 'lucide-react'

export default function TestErrorsPage() {
  const [shouldError, setShouldError] = useState(false)

  // This will trigger the error boundary
  if (shouldError) {
    throw new Error('Test error: Simulated component error')
  }

  const triggerError = () => {
    setShouldError(true)
  }

  const triggerTypeError = () => {
    // @ts-expect-error - intentional error for testing
    const obj = null
    obj.nonExistent.property()
  }

  const triggerAsyncError = async () => {
    throw new Error('Test async error')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Error Boundary Testing
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Esta página es solo para desarrollo. Permite probar los error boundaries.
        </p>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Esta página solo debería estar disponible en desarrollo
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Render Error */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <Bomb className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Render Error</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Lanza un error durante el render
              </p>
            </div>
          </div>
          <button
            onClick={triggerError}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg active:scale-95 transition-all duration-200"
          >
            Trigger Render Error
          </button>
        </div>

        {/* Type Error */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <Bug className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Type Error</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Lanza un TypeError (null reference)
              </p>
            </div>
          </div>
          <button
            onClick={triggerTypeError}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg active:scale-95 transition-all duration-200"
          >
            Trigger Type Error
          </button>
        </div>

        {/* Async Error */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Async Error</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Lanza un error asíncrono</p>
            </div>
          </div>
          <button
            onClick={() => triggerAsyncError()}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg active:scale-95 transition-all duration-200"
          >
            Trigger Async Error
          </button>
        </div>

        {/* Network Error Simulation */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Network Error</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Simula un error de red</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/nonexistent-endpoint')
            }}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg active:scale-95 transition-all duration-200"
          >
            Trigger Network Error
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <strong>Nota:</strong> Los errores de render activarán el error boundary del dashboard.
          Recarga la página para volver al estado normal.
        </p>
      </div>
    </div>
  )
}
