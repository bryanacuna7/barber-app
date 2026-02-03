import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

    // Sample rate for production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Don't send errors in development
    enabled: process.env.NODE_ENV === 'production',

    // Filter out common errors
    ignoreErrors: [
      // Supabase connection errors (handle gracefully)
      'PGRST',
      // Network timeouts (temporary)
      'ETIMEDOUT',
      'ECONNREFUSED',
    ],

    // Before sending events, add custom context
    beforeSend(event, hint) {
      // Don't send if development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Sentry (not sent):', hint.originalException || event)
        return null
      }

      // Add additional context
      if (event.request) {
        // Redact sensitive headers
        if (event.request.headers) {
          delete event.request.headers.cookie
          delete event.request.headers.authorization
        }
      }

      return event
    },
  })
}
