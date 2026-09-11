const CACHE_NAME = "salary-manager-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];


// Install service worker and save app files
self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(FILES_TO_CACHE);

      })

  );

});


// Activate and remove old cache versions
self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames.map((cacheName) => {

          if(cacheName !== CACHE_NAME){

            return caches.delete(cacheName);

          }

        })

      );

    })

  );

});


// Load from cache when offline
self.addEventListener("fetch", (event) => {

  event.respondWith(

    caches.match(event.request)
      .then((response) => {

        return response || fetch(event.request);

      })

  );

});
