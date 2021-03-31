"use strict"

const CACHE_FILES = [
    `/db.js`,
    `/index.js`,
    `/index.css`,
    `/manifest.webmanifest`,
    `/img/icons/192x192.png`
];

const STATIC_CACHE = `static-cache-v1`;
const RUNTIME_CACHE =`runtime-cache`;

self.addEventListener(`install`, event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(CACHE_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener(`activate`, event => {
    const cacheNow = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches.keys()
            .then(cacheNames =>
                cacheNames.filter(cacheName => !cacheNow.includes(cacheName))
                )
        .then(cacheDelete =>
            Promise.all(
                cacheDelete.map(cacheDelete => caches.delete(cacheDelete))
            )
        )
        .then(() => self.clients.claim())
    );
});

self.addEventListener(`fetch`, event => {
    if (
        event.request.method !== `GET` ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.url.includes(`/api/transaction`)) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then(cache =>
                fetch(event.request)
                    .then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(()=> caches.match(event.request))
            )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches
                .open(RUNTIME_CACHE)
                .then(cache =>
                    fetch(event.request).then(response =>
                        cache.put(event.request, response.clone()).then(() => response)
                        )
                    );
        })
    );
});