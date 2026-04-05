const CACHE_NAME = "qially-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/main.js",
  "/header.html",
  "/footer.html",
  "/assets/imgs/favicon.png",
  "/assets/imgs/logo.png",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
