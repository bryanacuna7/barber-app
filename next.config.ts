import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

// Bundle analyzer (run with ANALYZE=true npm run build)
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking during build (for performance baseline)
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security + PWA Headers
  async headers() {
    return [
      // Prevent caching of SW and manifest — iOS must always fetch fresh
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from self, Next.js chunks, and inline scripts (needed for Next.js)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Allow styles from self and inline styles (needed for Tailwind/CSS-in-JS)
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self, data URIs, and Supabase
              "img-src 'self' data: blob: https://*.supabase.co",
              // Allow fonts from self and data URIs
              "font-src 'self' data:",
              // Allow connections to self, Supabase, Resend, and Sentry
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://*.sentry.io",
              // Allow frames from self only
              "frame-src 'self'",
              // Allow media from self and Supabase
              "media-src 'self' https://*.supabase.co",
              // Allow objects from nowhere
              "object-src 'none'",
              // Restrict base URI
              "base-uri 'self'",
              // Restrict form actions
              "form-action 'self'",
              // Restrict frame ancestors (prevent clickjacking)
              "frame-ancestors 'none'",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ]
              .filter(Boolean)
              .join('; '),
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy (disable unused browser features)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=()',
              'usb=()',
            ].join(', '),
          },
          // Strict Transport Security (HSTS) - only in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
}

// Wrap with Sentry config if DSN is provided
const configWithPlugins = withBundleAnalyzer(nextConfig)

// Only enable Sentry in production or if explicitly configured
const sentryEnabled = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)

export default sentryEnabled
  ? withSentryConfig(configWithPlugins, {
      // Sentry Webpack Plugin options
      silent: true, // Suppresses all logs
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Upload source maps only in production builds
      widenClientFileUpload: true,
      sourcemaps: {
        disable: false,
      },
      disableLogger: true,

      // Automatically annotate React components for better error tracking
      reactComponentAnnotation: {
        enabled: true,
      },

      // Disable automatic instrumentation in development
      autoInstrumentServerFunctions: process.env.NODE_ENV === 'production',
      autoInstrumentMiddleware: process.env.NODE_ENV === 'production',
    })
  : configWithPlugins
