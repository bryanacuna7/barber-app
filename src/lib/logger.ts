import pino from 'pino'

/**
 * Structured logging utility using Pino
 *
 * Features:
 * - JSON structured logs in production
 * - Pretty printing in development
 * - Request context tracking
 * - Performance monitoring
 * - Error tracking integration
 */

const isDevelopment = process.env.NODE_ENV === 'development'

// Create base logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Format logs based on environment
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Add default context
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'apiKey',
      'secret',
    ],
    remove: true,
  },
})

/**
 * API Request Logger
 * Creates child logger with request context
 */
export function createRequestLogger(req: Request) {
  const requestId = crypto.randomUUID()
  const url = new URL(req.url)

  return logger.child({
    requestId,
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  })
}

/**
 * Log API Request
 */
export function logRequest(req: Request, extra?: Record<string, unknown>) {
  const url = new URL(req.url)
  logger.info(
    {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userAgent: req.headers.get('user-agent'),
      ...extra,
    },
    `${req.method} ${url.pathname}`
  )
}

/**
 * Log API Response
 */
export function logResponse(
  req: Request,
  status: number,
  duration: number,
  extra?: Record<string, unknown>
) {
  const url = new URL(req.url)
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  logger[level](
    {
      method: req.method,
      path: url.pathname,
      status,
      duration,
      ...extra,
    },
    `${req.method} ${url.pathname} ${status} ${duration}ms`
  )
}

/**
 * Log Database Query
 */
export function logQuery(
  operation: string,
  table: string,
  duration: number,
  extra?: Record<string, unknown>
) {
  logger.debug(
    {
      type: 'db_query',
      operation,
      table,
      duration,
      ...extra,
    },
    `DB ${operation} ${table} (${duration}ms)`
  )
}

/**
 * Log Authentication Event
 */
export function logAuth(
  event: 'login' | 'logout' | 'signup' | 'failed_login' | 'token_refresh',
  userId?: string,
  extra?: Record<string, unknown>
) {
  logger.info(
    {
      type: 'auth',
      event,
      userId,
      ...extra,
    },
    `Auth: ${event}${userId ? ` (${userId})` : ''}`
  )
}

/**
 * Log Business Operation
 */
export function logBusiness(
  operation: string,
  businessId: string,
  extra?: Record<string, unknown>
) {
  logger.info(
    {
      type: 'business',
      operation,
      businessId,
      ...extra,
    },
    `Business: ${operation} (${businessId})`
  )
}

/**
 * Log Payment Event
 */
export function logPayment(
  event: 'initiated' | 'verified' | 'approved' | 'rejected' | 'expired',
  businessId: string,
  amount?: number,
  extra?: Record<string, unknown>
) {
  logger.info(
    {
      type: 'payment',
      event,
      businessId,
      amount,
      ...extra,
    },
    `Payment: ${event} (${businessId})${amount ? ` $${amount}` : ''}`
  )
}

/**
 * Log Referral Event
 */
export function logReferral(
  event: 'code_generated' | 'conversion_tracked' | 'milestone_unlocked' | 'reward_earned',
  businessId: string,
  extra?: Record<string, unknown>
) {
  logger.info(
    {
      type: 'referral',
      event,
      businessId,
      ...extra,
    },
    `Referral: ${event} (${businessId})`
  )
}

/**
 * Log Cron Job
 */
export function logCron(
  job: string,
  status: 'started' | 'completed' | 'failed',
  duration?: number,
  extra?: Record<string, unknown>
) {
  const level = status === 'failed' ? 'error' : 'info'

  logger[level](
    {
      type: 'cron',
      job,
      status,
      duration,
      ...extra,
    },
    `Cron: ${job} ${status}${duration ? ` (${duration}ms)` : ''}`
  )
}

/**
 * Log Security Event
 */
export function logSecurity(
  event: 'rate_limit' | 'invalid_file' | 'path_traversal' | 'unauthorized' | 'forbidden',
  severity: 'low' | 'medium' | 'high' | 'critical',
  extra?: Record<string, unknown>
) {
  logger.warn(
    {
      type: 'security',
      event,
      severity,
      ...extra,
    },
    `Security: ${event} [${severity.toUpperCase()}]`
  )
}

/**
 * Log Performance Metric
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count',
  extra?: Record<string, unknown>
) {
  logger.debug(
    {
      type: 'performance',
      metric,
      value,
      unit,
      ...extra,
    },
    `Performance: ${metric} = ${value}${unit}`
  )
}

/**
 * Higher-order function to wrap API routes with logging
 */
export function withLogging<T>(
  handler: (req: Request, context?: T) => Promise<Response>,
  routeName?: string
) {
  return async (req: Request, context?: T): Promise<Response> => {
    const start = Date.now()
    const reqLogger = createRequestLogger(req)

    reqLogger.info(`${routeName || 'API'} - Request started`)

    try {
      const response = await handler(req, context)
      const duration = Date.now() - start

      logResponse(req, response.status, duration, { routeName })

      return response
    } catch (error) {
      const duration = Date.now() - start

      reqLogger.error(
        {
          err: error,
          duration,
          routeName,
        },
        `${routeName || 'API'} - Request failed`
      )

      throw error
    }
  }
}

/**
 * Measure execution time of async operations
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  extra?: Record<string, unknown>
): Promise<T> {
  const start = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - start

    logPerformance(operation, duration, 'ms', extra)

    return result
  } catch (error) {
    const duration = Date.now() - start

    logger.error(
      {
        err: error,
        operation,
        duration,
        ...extra,
      },
      `${operation} failed after ${duration}ms`
    )

    throw error
  }
}

export default logger
