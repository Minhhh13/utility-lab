// Cache only this app's assets. No analytics, polling, or third-party requests.
const CACHE = "utility-lab-v15";
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch("/precache-manifest.json", {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error("App assets unavailable for offline use");
      const assets = await response.json();
      const cache = await caches.open(CACHE);
      await cache.addAll([
        "/",
        "/icon.svg",
        "/manifest.webmanifest",
        "/icon.svg?v=route20261110",
        "/manifest.webmanifest?v=route20261110",
        "/icons/apple-touch-icon.png?v=route20261110",
        "/icons/icon-192.png?v=route20261110",
        "/icons/icon-512.png?v=route20261110",
        "/fonts/manrope-latin.woff2",
        "/maps/mirage.svg",
        "/maps/mirage-light.svg",
        ...assets,
      ]);
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("utility-lab-") && key !== CACHE)
              .map((key) => caches.delete(key)),
          ),
        ),
    ]),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_OFFLINE" && Array.isArray(event.data.urls)) {
    const urls = [...new Set(event.data.urls)].filter(
      (url) =>
        typeof url === "string" &&
        (/^\/(maps|map-thumbnails)\/[a-zA-Z0-9_.-]+\.(svg|png)$/.test(url) ||
          url === "/art/pixel-smoke.png" ||
          /^\/art\/launch-dust-(cs1999|source|csgo)\.webp$/.test(url) ||
          /^\/lineup-media\/(?:[a-zA-Z0-9_-]+\/)+[a-zA-Z0-9_.-]+\.(png|jpe?g|webp)$/.test(
            url,
          )),
    );
    const port = event.ports[0];
    event.waitUntil(
      (async () => {
        let completed = 0;
        try {
          const cache = await caches.open(CACHE);
          for (const url of urls) {
            const response = await fetch(url, { cache: "reload" });
            if (!response.ok)
              throw new Error(
                "An offline asset was unavailable. Keep the local server running and try again.",
              );
            await cache.put(url, response);
            port?.postMessage({ completed: ++completed, total: urls.length });
          }
          port?.postMessage({ done: true });
        } catch (error) {
          port?.postMessage({
            done: true,
            error:
              error instanceof Error
                ? error.message
                : "Offline installation could not finish.",
          });
        }
      })(),
    );
    return;
  }
  if (event.data?.type === "CACHE_ART" && Array.isArray(event.data.urls)) {
    const urls = event.data.urls.filter(
      (url) =>
        typeof url === "string" &&
        (url === "/art/pixel-smoke.png" ||
          /^\/art\/launch-dust-(cs1999|source|csgo)\.webp$/.test(url)),
    );
    event.waitUntil(
      caches
        .open(CACHE)
        .then((cache) => cache.addAll(urls))
        .catch(() => {}),
    );
    return;
  }
  if (event.data?.type !== "CACHE_MAP" || typeof event.data.url !== "string")
    return;
  const url = new URL(event.data.url, self.location.origin);
  if (
    url.origin === self.location.origin &&
    /^\/maps\/[a-zA-Z0-9_.-]+\.(svg|png)$/.test(url.pathname)
  ) {
    event.waitUntil(
      caches
        .open(CACHE)
        .then((cache) => cache.add(url.href))
        .catch(() => {}),
    );
  }
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE).then((cache) => cache.put("/", copy)),
            );
          }
          return response;
        })
        .catch(() => caches.match("/", { ignoreVary: true })),
    );
    return;
  }
  if (
    !/^\/(assets|maps|map-thumbnails|fonts|icons|art|lineup-media)\//.test(
      url.pathname,
    ) &&
    !["/icon.svg", "/manifest.webmanifest"].includes(url.pathname)
  )
    return;
  // These are same-origin static app assets. Preview servers vary CORS headers
  // by Origin; that variation must not hide a precached script while offline.
  event.respondWith(
    caches.match(event.request, { ignoreVary: true }).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches
                .open(CACHE)
                .then((cache) => cache.put(event.request, copy)),
            );
          }
          return response;
        }),
    ),
  );
});

