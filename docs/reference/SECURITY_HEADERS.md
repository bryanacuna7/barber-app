# Security Headers Configuration

This document explains the security headers implemented in `next.config.ts` and their purpose.

## Overview

Security headers are HTTP response headers that instruct browsers on how to behave when handling our site's content. They help protect against common web vulnerabilities.

## Implemented Headers

### 1. Content-Security-Policy (CSP)

**Purpose:** Controls which resources the browser is allowed to load for a given page, preventing XSS and data injection attacks.

**Our Configuration:**

```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://*.supabase.co
font-src 'self' data:
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com
frame-src 'self'
media-src 'self' https://*.supabase.co
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests (production only)
```

**Why these settings:**

- `script-src 'unsafe-eval' 'unsafe-inline'`: Required for Next.js and React hydration
- `style-src 'unsafe-inline'`: Required for Tailwind CSS and inline styles
- `img-src https://*.supabase.co`: Allow images from Supabase Storage
- `connect-src`: Allow API calls to Supabase and Resend
- `frame-ancestors 'none'`: Prevent the site from being embedded in iframes

**Security Level:** Medium-High (some unsafe directives required for framework compatibility)

---

### 2. X-Frame-Options: DENY

**Purpose:** Prevents the site from being embedded in `<iframe>`, `<frame>`, `<embed>`, or `<object>` tags.

**Protection:** Clickjacking attacks

**Alternative:** Could use `SAMEORIGIN` if you need to embed your own pages in iframes.

---

### 3. X-Content-Type-Options: nosniff

**Purpose:** Prevents browsers from MIME-sniffing responses away from the declared content-type.

**Protection:** Prevents execution of non-executable MIME types (e.g., serving a `.jpg` but executing it as JavaScript).

**Security Level:** High (no downside, always recommended)

---

### 4. Referrer-Policy: strict-origin-when-cross-origin

**Purpose:** Controls how much referrer information is sent with requests.

**Behavior:**

- Same-origin requests: Full URL sent
- Cross-origin HTTPS→HTTPS: Origin only
- HTTPS→HTTP: No referrer

**Security Level:** High (balances privacy and analytics needs)

---

### 5. Permissions-Policy

**Purpose:** Controls which browser features and APIs can be used.

**Disabled Features:**

- `camera=()`: No camera access
- `microphone=()`: No microphone access
- `geolocation=()`: No geolocation
- `interest-cohort=()`: Disable FLoC (Google's tracking alternative to cookies)
- `payment=()`: No Payment Request API
- `usb=()`: No USB device access

**Why:** Our app doesn't need these features, disabling them reduces attack surface.

---

### 6. Strict-Transport-Security (HSTS)

**Configuration:** `max-age=63072000; includeSubDomains; preload`

**Purpose:** Forces browsers to only connect via HTTPS.

**Settings:**

- `max-age=63072000`: 2 years
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser HSTS preload list

**Note:** Only enabled in production (when `NODE_ENV === 'production'`)

**⚠️ Warning:** Once enabled, you cannot easily revert to HTTP. Ensure your SSL certificate is always valid.

---

### 7. X-DNS-Prefetch-Control: on

**Purpose:** Allows DNS prefetching to improve performance for external resources.

**Security Level:** Low risk (minimal security impact, performance benefit)

---

## Testing Security Headers

### Local Testing

```bash
# View all headers
curl -I http://localhost:3000

# Test specific page
curl -I http://localhost:3000/dashboard

# Check for specific header
curl -I http://localhost:3000 | grep "Content-Security-Policy"
```

### Production Testing

```bash
# After deployment
curl -I https://your-domain.com

# Verify HSTS is present
curl -I https://your-domain.com | grep "Strict-Transport-Security"
```

### Online Tools

- [Security Headers Analyzer](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com)

---

## Security Score

| Category                | Score | Notes                                    |
| ----------------------- | ----- | ---------------------------------------- |
| Clickjacking Protection | A+    | X-Frame-Options + CSP frame-ancestors    |
| XSS Protection          | B+    | CSP implemented (some unsafe directives) |
| MIME Sniffing           | A+    | X-Content-Type-Options enabled           |
| Privacy                 | A     | Referrer-Policy + Permissions-Policy     |
| HTTPS Enforcement       | A+    | HSTS with preload (production)           |

**Overall Security Grade:** A-

---

## Improving CSP (Future)

Currently using `'unsafe-inline'` and `'unsafe-eval'` for compatibility. To improve:

1. **Remove `'unsafe-inline'` for scripts:**
   - Use nonces or hashes for inline scripts
   - Move inline event handlers to external scripts

2. **Remove `'unsafe-inline'` for styles:**
   - Extract Tailwind to external stylesheet (not recommended for Next.js)
   - Use CSS modules exclusively

3. **Remove `'unsafe-eval'`:**
   - Difficult with Next.js/React (required for development)
   - Consider in production build optimization

---

## CORS Configuration

For public API endpoints (e.g., `/api/reservar/[slug]`), CORS headers are handled separately in the API route files:

```typescript
// Example: src/app/api/reservar/[slug]/route.ts
export async function GET(request: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // or specific domain
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // ...
}
```

**Note:** Global CORS is NOT recommended. Apply only to public endpoints.

---

## Monitoring

### What to Monitor

1. **CSP Violations:** Set up CSP reporting endpoint
2. **Failed Requests:** Check for blocked resources in browser console
3. **HSTS Issues:** Monitor SSL certificate expiry

### CSP Reporting (Future Enhancement)

```typescript
// Add to CSP header:
'report-uri /api/csp-report'
'report-to csp-endpoint'
```

Create endpoint to log violations:

```typescript
// src/app/api/csp-report/route.ts
export async function POST(req: Request) {
  const violation = await req.json()
  console.error('CSP Violation:', violation)
  // Send to monitoring service
}
```

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
