---
name: api-patterns
description: REST API design, error handling, authentication, and best practices.
version: 1.0.0
---

# API Design Patterns

Best practices for building robust APIs.

## REST Conventions

### HTTP Methods

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Read resource(s) | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Update resource | Yes |
| DELETE | Remove resource | Yes |

### URL Structure

```
GET    /api/users          # List users
GET    /api/users/:id      # Get single user
POST   /api/users          # Create user
PUT    /api/users/:id      # Replace user
PATCH  /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user

# Nested resources
GET    /api/users/:id/posts      # User's posts
POST   /api/users/:id/posts      # Create user's post

# Query parameters
GET    /api/users?page=1&limit=20&sort=name
GET    /api/users?status=active&role=admin
```

### Status Codes

```
200 OK           - Success (GET, PUT, PATCH)
201 Created      - Resource created (POST)
204 No Content   - Success, no body (DELETE)
400 Bad Request  - Invalid input
401 Unauthorized - Not authenticated
403 Forbidden    - Not authorized
404 Not Found    - Resource not found
409 Conflict     - Resource conflict
422 Unprocessable - Validation error
500 Server Error - Internal error
```

## Response Format

### Success Response

```json
// Single resource
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Collection
{
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Authentication

### JWT Pattern

```typescript
// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ data: { token, user: { id: user.id, email: user.email } } });
});

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: { code: 'NO_TOKEN', message: 'Authentication required' }
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}
```

## Validation

### Input Validation

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

app.post('/api/users', async (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  const user = await createUser(result.data);
  res.status(201).json({ data: user });
});
```

## Error Handling

### Global Error Handler

```typescript
// Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

// Global handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unexpected error
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});

// Usage
throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, try again later',
    },
  },
});

app.use('/api/', limiter);
```

## Pagination

```typescript
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.users.findMany({ skip: offset, take: limit }),
    db.users.count(),
  ]);

  res.json({
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

## Versioning

```typescript
// URL versioning (recommended)
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Header versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || '1';
  req.apiVersion = version;
  next();
});
```

## Best Practices

1. **Consistent naming** - Use kebab-case for URLs, camelCase for JSON
2. **Validate all input** - Never trust client data
3. **Handle errors gracefully** - Return helpful error messages
4. **Use pagination** - Don't return unbounded lists
5. **Rate limit** - Protect against abuse
6. **Log requests** - For debugging and monitoring
7. **Document API** - OpenAPI/Swagger specification
8. **Version API** - Plan for breaking changes
