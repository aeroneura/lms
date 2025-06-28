const CACHE_NAME = 'lms-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/components.css',
    '/js/app.js',
    '/js/router.js',
    '/js/storage.js',
    '/js/courses.js',
    '/js/quiz.js',
    '/js/search.js',
    '/js/certificate.js',
    '/data/courses.js',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for future use
self.addEventListener('sync', event => {
    if (event.tag === 'progress-sync') {
        event.waitUntil(syncProgress());
    }
});

async function syncProgress() {
    // Future implementation for syncing progress when online
    console.log('Background sync triggered');
}

// Push notifications (future implementation)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New course available!',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('LMS Platform', options)
    );
});
