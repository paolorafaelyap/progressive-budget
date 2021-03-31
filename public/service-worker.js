"use strict"

const FILES_TO_CACHE = [
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
            .then(cache => cache.addAll(FILES_TO_CACHE))
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

