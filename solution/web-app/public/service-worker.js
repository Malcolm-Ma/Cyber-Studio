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
  'javascripts/indexedDB/messageDB.js',
  'javascripts/indexedDB/storyDB.js',
  'javascripts/indexedDB/room_to_story.js',
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
  event.respondWith(
    caches.open(staticCacheName).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return fetch(event.request)
          .then(function (response) {
            cache.put(event.request, response.clone()).catch((err) => console.error(err));
            // fetch response
            return response;
          }).catch(() => {
            // cache response
            if (response) {
              return response;
            }
            // if no match, return not found page
            return cache.match('/offline/not_found');
          })
      });
    })
  );
});
