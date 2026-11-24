/** Photos stay on their publishers' servers. The worker keeps only a small,
 * viewed-photo cache; a successful image decode confirms an opaque response. */
export function confirmPhotoLoaded(url: string): void {
  if (typeof navigator === "undefined" || !/^https:\/\//.test(url)) return;
  try {
    navigator.serviceWorker?.controller?.postMessage({type:"CACHE_PHOTO_CONFIRMED",url});
  } catch { /* Restricted/private browsers still display the original image. */ }
}

/** Wait for eviction before reusing the URL, so Retry cannot replay a bad entry. */
export async function forgetCachedPhoto(url: string): Promise<void> {
  if (typeof navigator === "undefined" || !/^https:\/\//.test(url)) return;
  let worker:ServiceWorker|null|undefined;
  try {worker=navigator.serviceWorker?.controller;} catch {return;}
  if (!worker || typeof MessageChannel === "undefined") return;
  await new Promise<void>(resolve=>{
    const channel=new MessageChannel();
    let timer:ReturnType<typeof setTimeout>;
    const done=()=>{clearTimeout(timer);channel.port1.close();resolve();};
    channel.port1.onmessage=done;
    timer=setTimeout(done,500);
    try {worker.postMessage({type:"CACHE_PHOTO_RETRY",url},[channel.port2]);}
    catch {done();}
  });
}

// One adjacent slide can be warmed through normal <img>/HTTP caching. Keep
// requests low priority, honor data saving and never scan the whole catalogue.
const warmPhotos=new Map<string,HTMLImageElement>();
export function preloadPhoto(url: string): void {
  if (typeof Image === "undefined" || !/^(https:\/\/|\/lineup-media\/)/.test(url) || warmPhotos.has(url)) return;
  const connection=typeof navigator === "undefined" ? undefined :
    (navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
  const image=new Image();
  image.decoding="async";
  image.fetchPriority="low";
  image.onerror=()=>warmPhotos.delete(url);
  warmPhotos.set(url,image);
  while(warmPhotos.size>3) {
    const oldest=warmPhotos.keys().next().value!;
    const previous=warmPhotos.get(oldest)!;
    warmPhotos.delete(oldest);
    if(!previous.complete) {previous.onerror=null;previous.src="";}
  }
  image.src=url;
}
