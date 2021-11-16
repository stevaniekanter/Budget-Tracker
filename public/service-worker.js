const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "budget-tracker";
  const CACHE_DATA = "budget-tracker-data";
  
//   install
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
      );
    });
  
// activate
  self.addEventListener("activate", function (evt) {
    const currentCaches = [CACHE_NAME, CACHE_DATA];
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== CACHE_DATA) {
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  // fetch
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(CACHE_DATA)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              })
              .catch((err) => {
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    });