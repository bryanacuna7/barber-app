# Rate Limiting - Quick Reference

## TL;DR

All Mi Día appointment status update endpoints are now protected with rate limiting:

- **Limit**: 10 requests per minute per user
- **Storage**: Upstash Redis (production) or in-memory (development)
- **Response**: 429 status with Retry-After header when exceeded

## Quick Test

```bash
# Test rate limiting (requires auth token)
for i in {1..15}; do
  curl -X PATCH \
    http://localhost:3000/api/appointments/YOUR_APPOINTMENT_ID/check-in \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -i | head -1
  echo "Request $i"
  sleep 1
done
```

**Expected**: First 10 succeed (200), next 5 fail (429)

## Response Examples

### Success (Under Limit)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2026-02-03T21:00:00Z
```

### Rate Limited

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-02-03T21:00:45Z
Retry-After: 45

{
  "error": "Demasiadas solicitudes",
  "message": "Has excedido el límite de solicitudes..."
}
```

## Protected Endpoints

| Endpoint                          | Method | Limit  | Purpose           |
| --------------------------------- | ------ | ------ | ----------------- |
| `/api/appointments/[id]/check-in` | PATCH  | 10/min | Mark as confirmed |
| `/api/appointments/[id]/complete` | PATCH  | 10/min | Mark as completed |
| `/api/appointments/[id]/no-show`  | PATCH  | 10/min | Mark as no-show   |

## Configuration

### Environment Variables

```env
# Optional - for distributed rate limiting (recommended for production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# If not set: uses in-memory storage (resets on server restart)
```

### Adjust Limits

Edit the route file:

```typescript
export const PATCH = withAuthAndRateLimit(handler, {
  interval: 60 * 1000, // Window: 1 minute
  maxRequests: 10, // Max requests in window
})
```

### Use Presets

```typescript
import { RateLimitPresets } from '@/lib/rate-limit'

// Strict: 5 requests per 15 minutes
withAuthAndRateLimit(handler, RateLimitPresets.strict)

// Moderate: 30 requests per minute
withAuthAndRateLimit(handler, RateLimitPresets.moderate)

// Lenient: 100 requests per minute
withAuthAndRateLimit(handler, RateLimitPresets.lenient)
```

## Implementation Pattern

```typescript
import { withAuthAndRateLimit } from '@/lib/api/middleware'

export const PATCH = withAuthAndRateLimit(
  async (request, { params }, { user, business, supabase }) => {
    // Your business logic here
    // Rate limiting already handled
    // Authentication already verified
  },
  {
    interval: 60 * 1000,
    maxRequests: 10,
  }
)
```

## Monitoring

### Check Headers

```bash
curl -I http://localhost:3000/api/appointments/[id]/check-in \
  -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  | grep -i ratelimit
```

### Logs

Rate limit violations are logged:

```
Rate limit exceeded for http://localhost:3000/api/appointments/[id]/check-in.
Remaining: 0, Reset: 2026-02-03T21:00:00.000Z
```

## Troubleshooting

### Rate limit too strict?

- Increase `maxRequests` in route configuration
- Check if multiple users share same IP (NAT/proxy)

### Not working?

- Verify middleware is applied: `withAuthAndRateLimit`
- Check Redis credentials (if using Redis)
- Check server logs for errors

### Different in dev vs production?

- Dev: Uses in-memory (resets on restart)
- Prod: Use Redis for persistence
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## Files to Know

| File                                       | Purpose                  |
| ------------------------------------------ | ------------------------ |
| `src/lib/rate-limit.ts`                    | Core rate limiting logic |
| `src/lib/api/middleware.ts`                | Middleware wrappers      |
| `src/app/api/appointments/[id]/*/route.ts` | Protected endpoints      |
| `docs/rate-limiting-implementation.md`     | Full documentation       |

## Common Patterns

### Add to New Endpoint

```typescript
import { withAuthAndRateLimit } from '@/lib/api/middleware'

export const POST = withAuthAndRateLimit(
  async (request, context, { user, business, supabase }) => {
    // Handler
  },
  { interval: 60000, maxRequests: 10 }
)
```

### Rate Limit Without Auth

```typescript
import { withRateLimit } from '@/lib/api/middleware'

export const POST = withRateLimit(
  async (request, context) => {
    // Handler
  },
  { interval: 60000, maxRequests: 10 }
)
```

### Custom Identifier

```typescript
const result = await rateLimit(
  request,
  config,
  `custom:${userId}:${action}` // Custom key
)
```

## Security Notes

- ✅ IP spoofing protection built-in
- ✅ Rate limit checked BEFORE auth
- ✅ No DB queries when rate limited
- ✅ Safe IP validation
- ✅ Automatic header sanitization
- ✅ Logs violations for monitoring

## Support

For issues or questions:

1. Check `/docs/rate-limiting-implementation.md`
2. Review logs for rate limit errors
3. Verify Redis connection (if using)
4. Test with curl manually
