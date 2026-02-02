# Node.js Best Practices

Production-ready patterns for Node.js applications.

## Project Structure

```
src/
├── config/           # Environment config
│   ├── index.ts
│   └── database.ts
├── controllers/      # Route handlers
├── services/         # Business logic
├── repositories/     # Data access
├── middleware/       # Express middleware
├── utils/            # Helpers
├── types/            # TypeScript types
└── index.ts          # Entry point
```

## Environment Configuration

```typescript
// config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const config = envSchema.parse(process.env);
```

## Express Setup

```typescript
// index.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));

// Performance
app.use(compression());
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Error Handling

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { config } from '../config';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      }
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  res.status(500).json({
    error: {
      message: config.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    }
  });
};
```

## Async Handler

```typescript
// utils/asyncHandler.ts
import { RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in routes
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json(user);
}));
```

## Validation Middleware

```typescript
// middleware/validate.ts
import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidateOptions): RequestHandler => {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }
      throw error;
    }
  };
};
```

## Database Connection (Prisma)

```typescript
// config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Graceful disconnect
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
```

## Logging (Pino)

```typescript
// utils/logger.ts
import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: config.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  redact: ['req.headers.authorization', 'password'],
});

// Request logging middleware
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });

  next();
};
```

## Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
  message: { error: { message: 'Too many requests' } },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skipSuccessfulRequests: true,
});
```

## Health Check Endpoint

```typescript
// routes/health.ts
router.get('/health', asyncHandler(async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  const redisHealthy = await checkRedisConnection();

  const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';
  const statusCode = status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'up' : 'down',
    }
  });
}));
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## Common Gotchas

| Issue | Solution |
|-------|----------|
| Unhandled promise rejection | Use asyncHandler wrapper |
| Memory leaks | Close connections on shutdown |
| Blocking event loop | Use worker threads for CPU tasks |
| Security headers missing | Use helmet middleware |
| CORS errors | Configure cors middleware properly |
| Large payloads | Set body-parser limits |
