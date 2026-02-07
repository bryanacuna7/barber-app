# Rate Limiting Implementation - Mi Día Status Endpoints

## Overview

Rate limiting has been implemented for all Mi Día appointment status update endpoints to prevent abuse and accidental double-clicks. The implementation uses Upstash Redis (when configured) or falls back to in-memory storage.

## Protected Endpoints

The following endpoints are now protected with rate limiting:

1. **PATCH /api/appointments/[id]/check-in**
   - Mark appointment as checked in (confirmed status)
   - Limit: 10 requests/minute per user

2. **PATCH /api/appointments/[id]/complete**
   - Mark appointment as completed
   - Limit: 10 requests/minute per user

3. **PATCH /api/appointments/[id]/no-show**
   - Mark appointment as no-show
   - Limit: 10 requests/minute per user

## Configuration

### Rate Limit Settings

```typescript
{
  interval: 60 * 1000,  // 1 minute window
  maxRequests: 10        // 10 requests per user
}
```

### Environment Variables

The rate limiting uses Upstash Redis when configured (recommended for production):

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

If these are not set, the system falls back to in-memory rate limiting (works for single-instance deployments).

## How It Works

### Request Flow

```
1. Request arrives at endpoint
   ↓
2. Rate limit middleware checks request count
   ↓
3a. If under limit:
    - Process request normally
    - Add rate limit headers to response
    - Return success

3b. If limit exceeded:
    - Block request
    - Return 429 status
    - Include Retry-After header
```

### Rate Limit Tracking

- **Identifier**: Client IP address + endpoint path
- **Storage**: Upstash Redis (distributed) or in-memory Map (single-instance)
- **Window**: Rolling 60-second window
- **Reset**: Automatic after window expires

### Response Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2026-02-03T21:00:00.000Z
```

When rate limited:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-02-03T21:00:45.000Z
```

## Implementation Details

### Middleware Architecture

The implementation uses a composable middleware pattern:

```typescript
// Standalone rate limiting
export const PATCH = withRateLimit(handler, { interval: 60000, maxRequests: 10 })

// Combined authentication + rate limiting
export const PATCH = withAuthAndRateLimit(handler, { interval: 60000, maxRequests: 10 })
```

### Files Modified

1. **`src/lib/api/middleware.ts`**
   - Added `withRateLimit()` wrapper
   - Added `withAuthAndRateLimit()` convenience wrapper
   - Added `rateLimitResponse()` helper

2. **`src/app/api/appointments/[id]/check-in/route.ts`**
   - Changed from `withAuth` to `withAuthAndRateLimit`
   - Added rate limit configuration

3. **`src/app/api/appointments/[id]/complete/route.ts`**
   - Changed from `withAuth` to `withAuthAndRateLimit`
   - Added rate limit configuration

4. **`src/app/api/appointments/[id]/no-show/route.ts`**
   - Changed from `withAuth` to `withAuthAndRateLimit`
   - Added rate limit configuration

### Existing Infrastructure

The implementation leverages the existing rate limiting infrastructure:

- **`src/lib/rate-limit.ts`**: Core rate limiting logic with Redis support
- **IP Detection**: Safe client IP extraction with spoofing protection
- **Fallback**: Automatic fallback to in-memory storage

## Testing

### Manual Testing

You can test rate limiting using curl or any HTTP client:

```bash
# Make multiple rapid requests
for i in {1..15}; do
  curl -X PATCH \
    http://localhost:3000/api/appointments/[id]/check-in \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -i
  echo "\nRequest $i"
  sleep 1
done
```

Expected behavior:

- First 10 requests: Success (200)
- Requests 11-15: Rate limited (429)
- After 60 seconds: Counter resets

### Monitoring Rate Limits

Check response headers to monitor your rate limit status:

```bash
curl -X PATCH \
  http://localhost:3000/api/appointments/abc123/check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -I | grep -i "ratelimit"
```

### Testing Different Users

Rate limits are per-user (based on IP address), so different users have independent limits:

```bash
# User A from IP 192.168.1.100
curl -X PATCH http://localhost:3000/api/appointments/[id]/check-in \
  -H "X-Real-IP: 192.168.1.100" \
  -H "Authorization: Bearer TOKEN_A"

# User B from IP 192.168.1.101 (independent limit)
curl -X PATCH http://localhost:3000/api/appointments/[id]/check-in \
  -H "X-Real-IP: 192.168.1.101" \
  -H "Authorization: Bearer TOKEN_B"
```

## Error Responses

### Rate Limit Exceeded (429)

```json
{
  "error": "Demasiadas solicitudes",
  "message": "Has excedido el límite de solicitudes. Por favor, inténtalo más tarde."
}
```

**Headers:**

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-02-03T21:00:45.000Z
```

## Security Considerations

### IP Spoofing Protection

The rate limiter uses safe IP detection:

- Validates IP format
- Checks multiple headers (x-real-ip, x-forwarded-for, etc.)
- Prevents injection attacks
- Falls back to 'unknown' if no valid IP found

### Bypass Prevention

- Rate limits apply BEFORE business logic
- Failed rate limit checks do not execute handler
- No database queries when rate limited
- Logs rate limit violations for monitoring

### DDoS Mitigation

While this rate limiting helps prevent abuse, for production deployments consider:

- Using Cloudflare or AWS WAF for DDoS protection
- Configuring Upstash Redis for distributed rate limiting
- Monitoring rate limit violations
- Adjusting limits based on usage patterns

## Customization

### Adjusting Rate Limits

To change the rate limit for specific endpoints, modify the configuration:

```typescript
export const PATCH = withAuthAndRateLimit(handler, {
  interval: 30 * 1000, // 30 seconds
  maxRequests: 5, // 5 requests per 30 seconds
})
```

### Using Rate Limit Presets

The rate-limit library includes presets for common scenarios:

```typescript
import { RateLimitPresets } from '@/lib/rate-limit'

// Very strict (5 requests per 15 minutes)
export const PATCH = withAuthAndRateLimit(handler, RateLimitPresets.strict)

// Moderate (30 requests per minute)
export const PATCH = withAuthAndRateLimit(handler, RateLimitPresets.moderate)

// Lenient (100 requests per minute)
export const PATCH = withAuthAndRateLimit(handler, RateLimitPresets.lenient)
```

### Custom Identifiers

By default, rate limiting uses IP + path. You can use custom identifiers:

```typescript
const result = await rateLimit(
  request,
  config,
  `user:${userId}:endpoint` // Custom identifier
)
```

## Monitoring & Observability

### Logging

Rate limit violations are logged:

```
Rate limit exceeded for http://localhost:3000/api/appointments/[id]/check-in.
Remaining: 0, Reset: 2026-02-03T21:00:00.000Z
```

### Metrics to Track

Consider tracking these metrics in production:

- Rate limit hit rate per endpoint
- Most frequently rate limited IPs
- Average requests per user per minute
- Rate limit bypass attempts

### Integration with Monitoring

The rate limiter can be integrated with monitoring tools:

```typescript
// Example: Send metrics to monitoring service
if (!result.success) {
  await monitoring.trackRateLimit({
    endpoint: request.url,
    ip: getClientIP(request),
    remaining: result.remaining,
    reset: result.reset,
  })
}
```

## Troubleshooting

### "Rate limit exceeded" for legitimate users

If legitimate users are hitting rate limits:

1. Check if they're making duplicate requests (UI double-click)
2. Review the rate limit configuration
3. Consider increasing limits for authenticated users
4. Check if multiple users share the same IP (NAT/proxy)

### Rate limiting not working

1. Verify Upstash Redis credentials (if using Redis)
2. Check if rate-limit module is properly imported
3. Verify middleware is applied to the endpoint
4. Check server logs for errors

### Different behavior in dev vs production

- In development: Uses in-memory storage (resets on server restart)
- In production: Use Upstash Redis for persistent rate limiting
- Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in production

## Future Enhancements

Potential improvements to consider:

- User-based rate limiting (in addition to IP-based)
- Different limits for different user roles (barbers vs owners)
- Exponential backoff for repeated violations
- Rate limit exemptions for trusted IPs
- GraphQL API rate limiting
- Per-business rate limiting
