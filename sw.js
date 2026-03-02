const CACHE_NAME = "trail-app-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./map.geojson",
  "./chart.js",
  "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js",
  "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
];

// Install
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );
});

// Activate (remove old versions)
self.addEventListener("activate", event => {
  self.clients.claim();

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch handler
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = req.url;

  // Cache Mapbox tiles and fonts dynamically
  if (
    url.includes("mapbox.com") ||
    url.includes(".pbf") ||
    url.includes(".png") ||
    url.includes(".jpg")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          return cached || fetch(req).then(response => {
            cache.put(req, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Default: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});