// source:
// https://gist.github.com/mohandere/9f293c9d02d094b4c39956c8f3008694

var cacheName = 'my-domain1-cache-';
var staticCacheName = cacheName + '3';

// Cache files
self.addEventListener('install', function (event) {
  console.log("install");
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  self.skipWaiting();
  event.waitUntil(caches.open(staticCacheName).then(function (cache) {
    return cache.addAll([
      '/images/wemap-logo.png',
      '/js/react.development.js',
      '/js/react-dom.development.js',
      '/js/app.js',
      '/style.css',
    ]);
  }));
});

/*
why use claim
https://developer.mozilla.org/fr/docs/Web/API/Clients/claim

A service worker is not active upon installation
https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle

Excerpt from the doc:
"A service worker won't receive events like fetch and push until it successfully finishes installing and becomes "active".
By default, a page's fetches won't go through a service worker unless the page request itself went through a service worker. So you'll need to refresh the page to see the effects of the service worker.
clients.claim() can override this default, and take control of non-controlled pages."

*/
// Remove old data/cache
self.addEventListener('activate', function (event) {
  console.log("activate");
  event.waitUntil(self.clients.claim());
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.filter(function (cacheName) {
      return cacheName.startsWith(cacheName) && cacheName != staticCacheName;
    }).map(function (cacheName) {
      return caches['delete'](cacheName);
    }));
  }));
});

// Serve files from cache
self.addEventListener('fetch', function(event) {
  // this removes an error due to a bug reported in chromium
  // https://stackoverflow.com/questions/48463483/what-causes-a-failed-to-execute-fetch-on-serviceworkerglobalscope-only-if
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  console.log("fetch intercepted", event);
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request, {
          mode: 'no-cors'
        }).then(function(response) {
          // We should not cache all requests, such as index.html
          // cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data){
    return;
  }
  if ('skipWaiting' === event.data.action) {
    self.skipWaiting();
  }
});
