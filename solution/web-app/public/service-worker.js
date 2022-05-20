/**
 * @file service worker
 * @author Mingze Ma
 */

const staticCacheName = 'cyberStudio-cache-v1';

const filesToCache = [
  '/',
  '/offline/not_found',
  'javascripts/scripts/bootstrap.min.js',
  'javascripts/scripts/jquery-3.6.0.min.js',
  'javascripts/scripts/socket.io.min.js',
  'javascripts/scripts/axios.min.js',
  'javascripts/index.js',
  'javascripts/details.js',
  'javascripts/canvas.js',
  'https://cdn.jsdelivr.net/npm/idb@7/+esm',
  'javascripts/indexedDB/storyDB.js',
  'javascripts/indexedDB/messageDB.js',
  'javascripts/indexedDB/canvasDB.js',
  'javascripts/indexedDB/room_to_story.js',
  'javascripts/indexedDB/KGraphDB.js',
  'stylesheets/bootstrap.min.css',
  'stylesheets/store_detail.css',
  'stylesheets/style.css',
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating new service worker...');

  const cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.destination === 'image') {
    event.respondWith(caches.open(staticCacheName).then((cache) => {
      // Go to the cache first
      return cache.match(event.request.url).then((cachedResponse) => {
        // Return a cached response if we have one
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, hit the network
        return fetch(event.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          cache.put(event.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }));
    return;
  }
  event.respondWith(
    caches.open(staticCacheName).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return fetch(event.request)
          .then(function (response) {
            cache.put(event.request, response.clone()).catch((err) => console.error(err));
            // fetch response
            return response;
          }).catch((err) => {
            // cache response
            if (response) {
              return response;
            }
            // if no match, return not found page
            console.error('fetch(event.request): ', event.request.url, err);
            return cache.match('/offline/not_found');
          })
      });
    })
  );
});
