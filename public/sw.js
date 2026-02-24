// Service Worker with offline support and caching strategies
const CACHE_NAME = 'barberapp-v4'
const RUNTIME_CACHE = 'barberapp-runtime-v4'

// Only precache offline fallback and icons — NEVER cache HTML shells
// HTML is served network-first so it's always fresh when online
const PRECACHE_ASSETS = [
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Listen for SKIP_WAITING message from the registration component
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Push notification received from server
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'BarberApp'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'default',
    renotify: !!data.tag,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click — navigate to relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Try to focus an existing window
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // No existing window — open new one
        return clients.openWindow(url)
      })
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Never cache manifests; force fresh network fetch for PWA metadata updates
  if (
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/api/pwa/manifest' ||
    /^\/api\/public\/[^/]+\/manifest$/.test(url.pathname)
  ) {
    event.respondWith(fetch(request))
    return
  }

  // API requests - only cache GET requests, skip mutations entirely
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      // Mutations (POST, PATCH, DELETE) always go to network, never cached
      return
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache stable read endpoints, not frequently-changing lists
          if (response.ok) {
            const cacheable =
              url.pathname.startsWith('/api/pwa/') ||
              url.pathname.startsWith('/api/settings/') ||
              url.pathname.startsWith('/api/public/')
            if (cacheable) {
              const responseClone = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
          }
          return response
        })
        .catch(() => {
          // Fallback to cache for offline support
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            })
          })
        })
    )
    return
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
    return
  }

  // HTML pages - network first, cache fallback, offline page ultimate fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/offline')
        })
      })
  )
})
