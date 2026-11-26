const CACHE = 'workout-static-v1'
const PRECACHE = ['/icons/icon-192.png', '/icons/icon-512.png', '/offline.html']

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const req = event.request
    if (req.method !== 'GET') return

    const url = new URL(req.url)
    if (url.origin !== self.location.origin) return

    // Static files: serve from cache first, then network
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(
            caches.match(req).then((hit) => {
                if (hit) return hit
                return fetch(req).then((res) => {
                    const copy = res.clone()
                    caches.open(CACHE).then((cache) => cache.put(req, copy))
                    return res
                })
            })
        )
        return
    }

    // Page navigations: go to the network, and show the offline page if there's no connection
    if (req.mode === 'navigate') {
        event.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
    }
})