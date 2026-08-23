const CACHE_NAME = "srma-academy-v3";
const APP_SHELL = ["./", "./manifest.webmanifest", "./favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const landingPage = await fetch("./");
      const html = await landingPage.clone().text();
      const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))[^"]*"/g)]
        .map((match) => new URL(match[1], self.registration.scope).toString());
      await cache.put("./", landingPage);
      await cache.addAll([...APP_SHELL.slice(1), ...assetUrls]);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.includes("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(async () => {
        return (await caches.match(event.request)) || (await caches.match("./")) || Response.error();
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === "basic") {
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => event.request.mode === "navigate" ? caches.match("./") : undefined);
    }),
  );
});