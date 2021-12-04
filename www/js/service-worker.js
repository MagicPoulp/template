
self.addEventListener('install', function(event) {
    console.log("service worker install");
});

self.addEventListener('activate', function(event) {
    console.log("service worker activate");
});
