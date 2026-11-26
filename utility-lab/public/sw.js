// App assets plus a bounded cache of publisher photos the viewer has decoded.
// No background catalogue fetch, video cache, polling, database or media proxy.
const CACHE = "utility-lab-v17";
const PHOTO_CACHE = "ul-viewed-photos-v1";
const PHOTO_LIMIT = 12;
const PHOTO_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const PHOTO_PENDING_AGE = 2 * 60 * 1000;
const launchArt = /^\/art\/ansimuz\/(?:neon-street(?:-front)?|old-town|hangar|factory|mountain-pass|cliffside)\.webp$/;
const pendingPhotos = new Map();
const photoRetries = new Map();
let photoWrites = Promise.resolve();

function remotePhotoUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    const image = /\.(?:webp|png|jpe?g|avif)$/i.test(url.pathname);
    if (!image) return null;
    if (url.hostname === "d1ntlvfrxziqo6.cloudfront.net" && /^\/[a-zA-Z0-9_.-]+$/.test(url.pathname)) return url.href;
    if (url.hostname === "assets.csnades.gg" && /^\/nades\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(url.pathname)) return url.href;
    if (url.hostname === "media.nadesdb.com" && /^\/media\/[a-zA-Z0-9_.-]+$/.test(url.pathname)) return url.href;
    if (url.hostname === "media.setpos.gg" && /^\/renders\/(?:[a-zA-Z0-9_-]+\/)+[a-zA-Z0-9_.-]+$/.test(url.pathname)) return url.href;
  } catch { /* Untrusted or unsupported source: normal browser loading. */ }
  return null;
}

function photoMetaUrl(url) {
  return new URL(`/__viewed_photo_meta__?url=${encodeURIComponent(url)}`,self.location.origin).href;
}
function photoClientKey(url,clientId) {
  return JSON.stringify([clientId || "",url]);
}
function serializePhotoWrite(task) {
  const operation=photoWrites.then(task);
  photoWrites=operation.catch(()=>{});
  return operation;
}
async function removePhoto(cache,url) {
  await Promise.all([cache.delete(url),cache.delete(photoMetaUrl(url))]);
}
async function photoEntries(cache) {
  const keys=await cache.keys(),entries=[];
  const imageKeys=new Set(keys.map(key=>remotePhotoUrl(key.url)).filter(Boolean));
  for(const key of keys) {
    const url=remotePhotoUrl(key.url);
    if(!url) {
      // Metadata shares this dedicated cache; remove orphan records as well as
      // images so an interrupted write cannot grow a separate metadata tail.
      const metadata=new URL(key.url);
      const image=metadata.origin===self.location.origin && metadata.pathname==="/__viewed_photo_meta__"
        ? remotePhotoUrl(metadata.searchParams.get("url")) : null;
      if(!image || !imageKeys.has(image)) await cache.delete(key);
      continue;
    }
    let meta;
    try {meta=await (await cache.match(photoMetaUrl(url)))?.json();} catch {}
    if(!meta || !Number.isFinite(meta.savedAt) || Date.now()-meta.savedAt>PHOTO_MAX_AGE) {
      await removePhoto(cache,url);
      continue;
    }
    entries.push({url,...meta});
  }
  return entries.sort((a,b)=>a.usedAt-b.usedAt);
}
function confirmPhotoToken(key) {
  const pending=pendingPhotos.get(key);
  if(!pending) return null;
  if(Date.now()-pending.seenAt>PHOTO_PENDING_AGE) {
    pendingPhotos.delete(key);
    return null;
  }
  if(pending.confirmed) return null;
  pending.confirmed=true;
  return pending.token;
}
function rememberPhoto(url,clientId) {
  const key=photoClientKey(url,clientId);
  const token=confirmPhotoToken(key);
  if(!token) return Promise.resolve();
  // Slow storage may queue many confirmations. Keep their response bodies in
  // the bounded map; queued closures retain only URL/client keys and tokens.
  // A decoded image in one tab cannot confirm another tab's opaque response.
  return serializePhotoWrite(async()=>{
    const pending=pendingPhotos.get(key);
    if(!pending || pending.token!==token || !pending.confirmed) return;
    pendingPhotos.delete(key);
    if(Date.now()-pending.seenAt>PHOTO_PENDING_AGE) return;
    const cache=await caches.open(PHOTO_CACHE);
    const entries=await photoEntries(cache);
    const other=entries.filter(entry=>entry.url!==url);
    while(other.length>=PHOTO_LIMIT) await removePhoto(cache,other.shift().url);
    const put=async()=>{
      await cache.put(url,pending.response.clone());
      const now=Date.now();
      await cache.put(photoMetaUrl(url),new Response(JSON.stringify({savedAt:now,usedAt:now}),{headers:{"Content-Type":"application/json"}}));
    };
    try {await put();}
    catch(error) {
      await removePhoto(cache,url);
      if(error?.name!=="QuotaExceededError" || !other.length) return;
      // One bounded retry after releasing an older photo. Display never waits
      // for persistence and remains usable when storage is full/unavailable.
      await removePhoto(cache,other.shift().url);
      try {await put();} catch {await removePhoto(cache,url);}
    }
  }).catch(()=>{});
}
async function forgetPhoto(url,clientId) {
  const key=photoClientKey(url,clientId);
  pendingPhotos.delete(key);
  photoRetries.set(key,Date.now());
  while(photoRetries.size>PHOTO_LIMIT) photoRetries.delete(photoRetries.keys().next().value);
  await serializePhotoWrite(async()=>removePhoto(await caches.open(PHOTO_CACHE),url)).catch(()=>{});
}
async function fetchPhoto(event,url) {
  const key=photoClientKey(url,event.clientId);
  const retry=photoRetries.get(key);
  photoRetries.delete(key);
  if(!retry || Date.now()-retry>PHOTO_PENDING_AGE) {
    try {
      const cache=await caches.open(PHOTO_CACHE);
      const [photo,metaResponse]=await Promise.all([cache.match(url),cache.match(photoMetaUrl(url))]);
      const meta=await metaResponse?.json();
      if(photo && Number.isFinite(meta?.savedAt) && Date.now()-meta.savedAt<=PHOTO_MAX_AGE) {
        event.waitUntil(serializePhotoWrite(()=>cache.put(photoMetaUrl(url),new Response(JSON.stringify({...meta,usedAt:Date.now()}),{headers:{"Content-Type":"application/json"}}))).catch(()=>{}));
        return photo;
      }
      if(photo || metaResponse) event.waitUntil(serializePhotoWrite(()=>removePhoto(cache,url)).catch(()=>{}));
    } catch { /* The image still loads when browser storage is disabled. */ }
  }
  const request=retry && Date.now()-retry<=PHOTO_PENDING_AGE ? new Request(event.request,{cache:"reload"}) : event.request;
  const response=await fetch(request);
  // no-cors image responses are opaque; never persist one until the actual
  // viewer reports that the browser decoded it successfully.
  if(response.ok || response.type==="opaque") {
    for(const [key,value] of pendingPhotos) if(Date.now()-value.seenAt>PHOTO_PENDING_AGE) pendingPhotos.delete(key);
    pendingPhotos.delete(key);
    pendingPhotos.set(key,{response:response.clone(),seenAt:Date.now(),token:Symbol(),confirmed:false});
    while(pendingPhotos.size>PHOTO_LIMIT) pendingPhotos.delete(pendingPhotos.keys().next().value);
  }
  return response;
}
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
      // Retire the previous Home paintings without discarding offline map and guide downloads.
      caches.open(CACHE).then(cache => Promise.all([
        "launch-courtyard.webp", "launch-dunes.webp", "launch-dust-cs1999.webp", "launch-dust-source.webp",
        "launch-dust-csgo.webp", "launch-foundry.webp", "launch-pixel.png", "launch-temple.webp", "pixel-smoke.png",
      ].map(name => cache.delete("/art/" + name, { ignoreVary: true })))),
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
  if(["CACHE_PHOTO_CONFIRMED","CACHE_PHOTO_RETRY"].includes(event.data?.type)) {
    const url=remotePhotoUrl(event.data.url);
    const port=event.ports?.[0];
    if(!url) {port?.postMessage({done:true});return;}
    const clientId=event.source?.id || "";
    const task=event.data.type==="CACHE_PHOTO_CONFIRMED" ? rememberPhoto(url,clientId) : forgetPhoto(url,clientId);
    event.waitUntil(task.finally(()=>port?.postMessage({done:true})));
    return;
  }
  if (event.data?.type === "CACHE_OFFLINE" && Array.isArray(event.data.urls)) {
    const urls = [...new Set(event.data.urls)].filter(
      (url) =>
        typeof url === "string" &&
        (/^\/(maps|map-thumbnails)\/[a-zA-Z0-9_.-]+\.(svg|png)$/.test(url) ||
          (url === "/art/credits.txt" || launchArt.test(url)) ||
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
        launchArt.test(url),
    );
    event.waitUntil(
      caches
        .open(CACHE)
        .then((cache) => Promise.all(urls.map(async (url) => {
          if (!await cache.match(url, { ignoreVary: true })) await cache.add(url);
        })))
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
  if(event.request.method==="GET" && event.request.destination==="image") {
    const photo=remotePhotoUrl(url.href);
    if(photo) {event.respondWith(fetchPhoto(event,photo));return;}
  }
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (url.pathname.startsWith("/art/") && url.pathname !== "/art/credits.txt" && !launchArt.test(url.pathname)) return;
  if (event.request.mode === "navigate" && url.pathname !== "/art/credits.txt") {
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

