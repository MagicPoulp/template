// source:
// https://gist.github.com/mohandere/9f293c9d02d094b4c39956c8f3008694

var cacheName = 'my-domain1-cache-';
var staticCacheName = cacheName + '1';

// Cache files
self.addEventListener('install', function (event) {
  console.log("install");
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

// Remove old data/cache
self.addEventListener('activate', function (event) {
  console.log("activate");
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
  console.log("fetch intercepted", event);
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request, {
          mode: 'no-cors'
        }).then(function(response) {
          cache.put(event.request, response.clone());
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
