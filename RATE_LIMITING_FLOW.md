# Rate Limiting Flow Diagram

## Request Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Request                               │
│              (PATCH /api/appointments/[id]/check-in)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  withAuthAndRateLimit Middleware                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  Rate Limit     │
                   │  Check          │
                   │  (IP + Path)    │
                   └────────┬────────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
            Under Limit         Over Limit
                  │                   │
                  ▼                   ▼
         ┌────────────────┐  ┌────────────────┐
         │  Continue to   │  │  Return 429    │
         │  Auth Check    │  │  with Headers  │
         └────────┬───────┘  └────────────────┘
                  │                   │
                  ▼                   │
         ┌────────────────┐           │
         │  Authenticate  │           │
         │  User & Fetch  │           │
         │  Business      │           │
         └────────┬───────┘           │
                  │                   │
            ┌─────┴─────┐             │
            │           │             │
       Authenticated  Not Auth        │
            │           │             │
            ▼           ▼             │
   ┌────────────┐  ┌──────────┐      │
   │  Execute   │  │ Return   │      │
   │  Business  │  │ 401      │      │
   │  Logic     │  └──────────┘      │
   └────────┬───┘                    │
            │                        │
            ▼                        │
   ┌────────────────┐                │
   │  Update DB     │                │
   │  (check-in)    │                │
   └────────┬───────┘                │
            │                        │
            ▼                        │
   ┌────────────────┐                │
   │  Return 200    │                │
   │  + Rate Limit  │                │
   │  Headers       │                │
   └────────┬───────┘                │
            │                        │
            └────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Client Response │
            └──────────────────┘
```

## Rate Limit Headers

### Success Response (200)

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2026-02-03T21:00:00.000Z

{
  "id": "apt-123",
  "status": "confirmed",
  ...
}
```

### Rate Limited Response (429)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-02-03T21:00:45.000Z
Retry-After: 45

{
  "error": "Demasiadas solicitudes",
  "message": "Has excedido el límite de solicitudes. Por favor, inténtalo más tarde."
}
```

## Storage Architecture

### With Upstash Redis (Production)

```
┌──────────────────────────────────────────────┐
│           Application Servers                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Server 1│  │ Server 2│  │ Server 3│     │
│  └────┬────┘  └────┬────┘  └────┬────┘     │
│       │            │            │           │
│       └────────────┼────────────┘           │
│                    │                        │
└────────────────────┼────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │    Upstash Redis        │
        │   (Distributed Store)   │
        │                         │
        │  Key: rate_limit:IP:path│
        │  Value: request_count   │
        │  TTL: 60 seconds        │
        └─────────────────────────┘
```

### Without Redis (Development)

```
┌──────────────────────────────────────────────┐
│           Application Server                 │
│                                              │
│  ┌───────────────────────────────────┐      │
│  │      In-Memory Map                │      │
│  │                                   │      │
│  │  rate_limit:192.168.1.100:/api... │      │
│  │    count: 7                       │      │
│  │    resetTime: 1234567890000       │      │
│  │                                   │      │
│  │  rate_limit:192.168.1.101:/api... │      │
│  │    count: 3                       │      │
│  │    resetTime: 1234567891000       │      │
│  └───────────────────────────────────┘      │
│                                              │
└──────────────────────────────────────────────┘
```

## Middleware Composition

### withAuthAndRateLimit

```typescript
┌────────────────────────────────────────────┐
│     withAuthAndRateLimit(handler, config)  │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  withRateLimit(                      │ │
│  │    withAuth(handler),                │ │
│  │    config                            │ │
│  │  )                                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Execution Order:                          │
│  1. Rate Limit Check                       │
│  2. Authentication                         │
│  3. Business Logic                         │
│                                            │
└────────────────────────────────────────────┘
```

## Rate Limit Key Generation

```
┌─────────────────────────────────────────────────┐
│         Rate Limit Key Structure                │
├─────────────────────────────────────────────────┤
│                                                 │
│  rate_limit:{CLIENT_IP}:{ENDPOINT_PATH}        │
│                                                 │
│  Examples:                                      │
│  • rate_limit:192.168.1.100:/api/appointments/abc/check-in │
│  • rate_limit:10.0.0.5:/api/appointments/xyz/complete      │
│  • rate_limit:172.16.0.1:/api/appointments/def/no-show     │
│                                                 │
│  Benefits:                                      │
│  ✓ Per-user rate limiting                      │
│  ✓ Per-endpoint limits                         │
│  ✓ No cross-contamination                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## IP Detection Priority

```
┌──────────────────────────────────────────┐
│        IP Detection Waterfall            │
├──────────────────────────────────────────┤
│                                          │
│  1. x-real-ip header                     │
│     ↓ (if not valid)                     │
│  2. x-forwarded-for (first IP)           │
│     ↓ (if not valid)                     │
│  3. cf-connecting-ip (Cloudflare)        │
│     ↓ (if not valid)                     │
│  4. x-client-ip                          │
│     ↓ (if not valid)                     │
│  5. Fallback: "unknown"                  │
│                                          │
│  Validation:                             │
│  • IPv4 format check                     │
│  • IPv6 format check                     │
│  • Length validation (max 45 chars)      │
│  • SQL injection prevention              │
│                                          │
└──────────────────────────────────────────┘
```

## Time Window Behavior

```
Time Window: 60 seconds (1 minute)
Max Requests: 10

Timeline:
0s    ─────────────────────────────────────── 60s
│                                               │
├─ Request 1  (Remaining: 9)                    │
├─ Request 2  (Remaining: 8)                    │
├─ Request 3  (Remaining: 7)                    │
├─ Request 4  (Remaining: 6)                    │
├─ Request 5  (Remaining: 5)                    │
├─ Request 6  (Remaining: 4)                    │
├─ Request 7  (Remaining: 3)                    │
├─ Request 8  (Remaining: 2)                    │
├─ Request 9  (Remaining: 1)                    │
├─ Request 10 (Remaining: 0) ✅ Last allowed   │
├─ Request 11 (BLOCKED)      ❌ 429 response   │
├─ Request 12 (BLOCKED)      ❌ 429 response   │
│                                               │
└─────────────────────────────────────────────┘
                                                │
                                                ▼
                                         Counter resets
                                         All requests allowed again
```

## Protected Endpoints

```
┌──────────────────────────────────────────────────────┐
│          Mi Día Status Update Endpoints              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ✅ PATCH /api/appointments/[id]/check-in            │
│     Rate Limit: 10/min                               │
│     Purpose: Mark appointment as confirmed           │
│                                                      │
│  ✅ PATCH /api/appointments/[id]/complete            │
│     Rate Limit: 10/min                               │
│     Purpose: Mark appointment as completed           │
│                                                      │
│  ✅ PATCH /api/appointments/[id]/no-show             │
│     Rate Limit: 10/min                               │
│     Purpose: Mark appointment as no-show             │
│                                                      │
└──────────────────────────────────────────────────────┘
```
