import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',

    // Sample rate for production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Replay recording for debugging (only in production)
    replaysSessionSampleRate: 0.0, // Don't record sessions by default
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0, // Record when errors occur

    // Don't send errors in development
    enabled: process.env.NODE_ENV === 'production',

    // Filter out common errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Abort errors (user cancelled)
      'AbortError',
      // Resize observer (harmless)
      'ResizeObserver loop',
    ],

    // Before sending events, add custom context
    beforeSend(event, hint) {
      // Don't send if development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Sentry (not sent):', hint.originalException || event)
        return null
      }

      return event
    },

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}
