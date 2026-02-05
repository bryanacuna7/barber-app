'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
  showReset?: boolean
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ComponentErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Component-level Error Boundary
 *
 * Isolates errors to specific components instead of breaking the entire page.
 * Used for complex components like Calendar, Analytics, Client Profile.
 *
 * Usage:
 * ```tsx
 * <ComponentErrorBoundary
 *   fallbackTitle="Error en calendario"
 *   fallbackDescription="No se pudo cargar el calendario"
 * >
 *   <ComplexCalendar />
 * </ComponentErrorBoundary>
 * ```
 *
 * Custom fallback:
 * ```tsx
 * <ComponentErrorBoundary fallback={<SimpleListView />}>
 *   <ComplexCalendar />
 * </ComponentErrorBoundary>
 * ```
 */
export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ComponentErrorBoundary caught error:', error, errorInfo)
    }

    // Report to Sentry with component context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: 'component',
      },
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI (compact, component-level)
      const title = this.props.fallbackTitle || 'Error al cargar'
      const description =
        this.props.fallbackDescription ||
        'Ocurrió un error al cargar este componente. Intenta recargar.'
      const showReset = this.props.showReset !== false

      return (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="w-full rounded-lg bg-gray-100 p-3 text-left dark:bg-gray-800">
                <summary className="cursor-pointer font-mono text-xs text-gray-700 dark:text-gray-300">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            {showReset && (
              <Button onClick={this.handleReset} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap any component with error boundary
 */
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    fallbackTitle?: string
    fallbackDescription?: string
    showReset?: boolean
  }
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary {...options}>
      <Component {...props} />
    </ComponentErrorBoundary>
  )

  WrappedComponent.displayName = `withComponentErrorBoundary(${
    Component.displayName || Component.name
  })`

  return WrappedComponent
}

export default ComponentErrorBoundary
