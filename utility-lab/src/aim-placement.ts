import type { UtilityPhoto, UtilityReference } from "./utility-data.ts";

const center = { x: 0.5, y: 0.5 };
// Exact source assets whose baked-in reticles have been checked at full resolution.
// A portrait source retains full-image coordinates even when a panel is shown.
const centeredImages = new Set([
  "https://gonade.app/images/maps/webp/3038/lineup1.webp?v=1784807957",
  "https://gonade.app/images/maps/webp/1008/lineup1.webp?v=1784807938",
  "/lineup-media/source-video-stills/cache-completions/nart-boost-he-aim.jpg",
  "/lineup-media/source-video-stills/cs2nades/nuke/b-retake-flash-aim-7000ms.jpg",
  "https://gonade.app/images/maps/webp/3039/lineup1.webp?v=1784807957",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-1bf7d1a4cd08-garage-from-outside-t-spawn-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-91afe651d426-t-blue-boxes-from-ct-spawn-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-a43aa7dbae78-heaven-from-silo-aim-5500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-e17236b24d3e-garage-from-t-spawn-aim-3500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-1cd37f5bc35a-outside-garage-from-t-spawn-aim-9000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-5f786af83ef9-heaven-from-a-site-aim-5500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-43a71749dfc8-top-a-main-from-t-spawn-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-30436a1163c6-outside-heaven-from-t-spawn-aim-7000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-1b3d4c065d60-top-a-main-from-silo-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-d9705b6c9716-heaven-from-tetris-aim-9000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-589895309854-tetris-from-squeaky-aim-7000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-a22621a2d6dd-vent-from-outside-lobby-aim-9000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-ae3d208f448f-secret-far-from-under-silo-aim-3500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-65252c63f56a-heaven-from-t-spawn-aim-5500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-ab7aa245defa-lockers-from-red-aim-7000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-953b039b3932-vent-from-t-spawn-aim-10000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-638e9956b5d3-outside-from-roof-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-smoke-06ffdba358b5-top-a-main-from-t-spawn-aim-4500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-flashbang-b3f09459ad30-ramp-from-trophy-room-aim-3500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-flashbang-0a9c896c653c-outside-from-a-site-aim-5500ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-flashbang-f9e03cfe1f96-silooutside-from-a-site-aim-13000ms.jpg",
  "/lineup-media/source-video-stills/csnades/nuke/community-he-bae7574f2486-silo-from-rafters-aim-7000ms.jpg",
  "https://gonade.app/images/maps/webp/1014/lineup1.webp?v=1784807939",
  "https://media.nadesdb.com/media/c3095046-7833-4dbd-8cf3-a2b488b58dee.webp",
]);

// Camera edits in these four video frames move the reticle away from the midpoint.
const offsetImages = new Map<string, {x: number; y: number}>([
  ["/lineup-media/source-video-stills/csnades/nuke/community-smoke-f83f1ca67510-outside-heaven-from-under-silo-aim-5500ms.jpg", {x: 975 / 1920, y: 561 / 1080}],
  ["/lineup-media/source-video-stills/csnades/nuke/community-smoke-7bd14c78b6e8-top-silo-from-ct-spawn-aim-2500ms.jpg", {x: 961 / 1920, y: 540 / 1080}],
  ["/lineup-media/source-video-stills/csnades/nuke/community-smoke-0f1f228313c0-garage-from-t-spawn-aim-7000ms.jpg", {x: 957 / 1920, y: 540 / 1080}],
  ["/lineup-media/source-video-stills/csnades/nuke/community-smoke-f79c31cb119f-heaven-from-t-roof-aim-18000ms.jpg", {x: 639 / 1280, y: 360 / 720}],
]);

function publisher(url: string | undefined) {
  try {
    const source = new URL(url || "");
    if (source.protocol !== "https:" || source.username || source.password) return "";
    if (source.hostname === "www.cs2tricks.com" && source.pathname.startsWith("/nades/")) return "cs2tricks";
    if (source.hostname === "csnades.gg" && /^\/[a-z0-9]+\/[a-z]+\/[a-z0-9-]+$/.test(source.pathname)) return "csnades";
  } catch { /* Personal, composite and unknown sources are never inferred. */ }
  return "";
}

/** Restore the publisher's separately rendered reticle; never invent a point
 * for personal photos, diagrams, composites, or unverified camera crops.
 * CS2Tricks applies one centred SVG to both its normal and zoomed camera views.
 * CSNADES centres its separate crosshair image over original lineup.webp.
 * See docs/aim-placement.md for the original public UI evidence. */
export function withAimPlacement<T extends UtilityReference>(record: T): T {
  if (record.userCreated) return record;
  const provider = publisher(record.source);
  let aimIndex = 0;
  const annotate = (photos: UtilityPhoto[] | undefined) => photos?.map(photo => {
    if (photo.kind !== "aim") return photo;
    const index = aimIndex++;
    if (photo.aimPoint) return photo;
    const sameSource = photo.source === record.source;
    const sourceCamera = !photo.region && sameSource && (
      provider === "cs2tricks" && index < 2 &&
        /^https:\/\/d1ntlvfrxziqo6\.cloudfront\.net\/[a-f0-9-]+\.(?:webp|jpe?g)$/.test(photo.image) &&
        (index === 0 || photo.caption === "Aim detail") ||
      provider === "csnades" && index === 0 &&
        /^https:\/\/assets\.csnades\.gg\/nades\/[a-zA-Z0-9_-]+\/lineup\.webp$/.test(photo.image)
    );
    const point = offsetImages.get(photo.image) ?? (sourceCamera || centeredImages.has(photo.image) ? center : undefined);
    return point ? { ...photo, aimPoint: { ...point } } : photo;
  });
  // Keep the same ordering as utilityPhotos(): source photos, then personal.
  const remotePhotos = annotate(record.remotePhotos);
  const photos = annotate(record.photos);
  return { ...record, ...(remotePhotos ? { remotePhotos } : {}), ...(photos ? { photos } : {}) };
}

type Dimensions = { width: number; height: number };
/** Point in the scrollable canvas, using the same contain/panel geometry as
 * PhotoZoom. The full original coordinate is retained through crop and zoom. */
export function photoAimPosition(
  photo: UtilityPhoto,
  canvas: Dimensions,
  intrinsic: Dimensions,
): { x: number; y: number } | null {
  const point = photo.aimPoint;
  if (photo.kind !== "aim" || !point || canvas.width <= 0 || canvas.height <= 0) return null;
  const region = photo.region;
  if (region) {
    const x = point.x * region.sourceWidth - region.x;
    const y = point.y * region.sourceHeight - region.y;
    if (x < 0 || y < 0 || x > region.width || y > region.height) return null;
    const scale = Math.min(canvas.width / region.width, canvas.height / region.height);
    return {
      x: (canvas.width - region.width * scale) / 2 + x * scale,
      y: (canvas.height - region.height * scale) / 2 + y * scale,
    };
  }
  if (intrinsic.width <= 0 || intrinsic.height <= 0) return null;
  const scale = Math.min(canvas.width / intrinsic.width, canvas.height / intrinsic.height);
  return {
    x: (canvas.width - intrinsic.width * scale) / 2 + point.x * intrinsic.width * scale,
    y: (canvas.height - intrinsic.height * scale) / 2 + point.y * intrinsic.height * scale,
  };
}
