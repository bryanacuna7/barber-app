# Security Hardening Skill

Security best practices, vulnerability prevention, and hardening patterns.

## OWASP Top 10 Prevention

### 1. Injection Prevention

```typescript
// BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD - Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// GOOD - Using ORM (Prisma)
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### 2. Broken Authentication

```typescript
// Password hashing with bcrypt
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Secure session configuration
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JS access
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

### 3. Cross-Site Scripting (XSS)

```typescript
// Sanitize HTML input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

// React auto-escapes, but avoid dangerouslySetInnerHTML
// BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// GOOD
<div>{userInput}</div>

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

### 4. Insecure Direct Object References

```typescript
// BAD - No ownership check
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);
});

// GOOD - Verify ownership
app.get('/api/documents/:id', authenticate, async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id // Ensure user owns the resource
  });

  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(doc);
});
```

### 5. Security Misconfiguration

```typescript
// Helmet for secure headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Disable verbose errors in production
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err); // Log full error
    res.status(500).json({ error: 'Internal server error' }); // Generic response
  });
}
```

### 6. Sensitive Data Exposure

```typescript
// Never log sensitive data
// BAD
console.log('User login:', { email, password });

// GOOD
console.log('User login:', { email, password: '[REDACTED]' });

// Mask sensitive fields in responses
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return `${name[0]}***@${domain}`;
}

// Encrypt sensitive data at rest
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}
```

### 7. Cross-Site Request Forgery (CSRF)

```typescript
// CSRF protection
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
  // Process form
});

// In forms
<input type="hidden" name="_csrf" value="{{csrfToken}}" />

// SameSite cookies also help
cookie: {
  sameSite: 'strict'
}
```

## JWT Security

```typescript
// Secure JWT configuration
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
  );

  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY, algorithm: 'HS256' }
  );

  return { accessToken, refreshToken };
}

function verifyToken(token: string, type: 'access' | 'refresh') {
  const secret = type === 'access'
    ? process.env.JWT_SECRET
    : process.env.JWT_REFRESH_SECRET;

  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

  if (decoded.type !== type) {
    throw new Error('Invalid token type');
  }

  return decoded;
}
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many login attempts, try again later',
  skipSuccessfulRequests: true,
});

app.use(generalLimiter);
app.use('/api/auth', authLimiter);
```

## Input Validation

```typescript
import { z } from 'zod';

// Define strict schemas
const UserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  name: z.string().min(1).max(100).trim(),
  age: z.number().int().min(0).max(150).optional(),
});

// Validation middleware
function validate<T>(schema: z.ZodSchema<T>) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.issues
      });
    }

    req.body = result.data;
    next();
  };
}

app.post('/api/users', validate(UserSchema), createUser);
```

## File Upload Security

```typescript
import multer from 'multer';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/uploads',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: MAX_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

// Verify file content matches extension
import fileType from 'file-type';

async function validateFileContent(filePath: string): Promise<boolean> {
  const type = await fileType.fromFile(filePath);
  return type && ALLOWED_TYPES.includes(type.mime);
}
```

## Environment Security

```bash
# .env.example (commit this)
DATABASE_URL=
JWT_SECRET=
ENCRYPTION_KEY=

# Never commit .env files
# .gitignore
.env
.env.local
.env.*.local
```

```typescript
// Validate required env vars at startup
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
```

## Security Headers Checklist

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Content-Security-Policy` | `default-src 'self'` | Control resource loading |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |

## Dependency Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Use lockfiles
# Always commit package-lock.json
```

```json
// package.json - pin major versions
{
  "dependencies": {
    "express": "^4.18.0",  // Allow minor/patch updates
    "lodash": "4.17.21"    // Pin exact version for critical deps
  }
}
```

## Logging Security Events

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
function logSecurityEvent(event: string, data: object) {
  securityLogger.info(event, {
    ...data,
    timestamp: new Date().toISOString(),
    ip: data.ip,
    userAgent: data.userAgent
  });
}

// Example usage
logSecurityEvent('LOGIN_FAILED', {
  email: maskEmail(email),
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  reason: 'Invalid password'
});
```
