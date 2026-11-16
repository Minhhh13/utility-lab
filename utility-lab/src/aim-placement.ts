import type { UtilityPhoto, UtilityReference } from "./utility-data.ts";

const center = { x: 0.5, y: 0.5 };
// These original captures have a visible, reviewed camera-centre reticle.
// A portrait source retains full-image coordinates even when a panel is shown.
const reviewedImages = new Set([
  "https://gonade.app/images/maps/webp/3038/lineup1.webp?v=1784807957",
  "https://gonade.app/images/maps/webp/1008/lineup1.webp?v=1784807938",
  "/lineup-media/source-video-stills/cache-completions/nart-boost-he-aim.jpg",
  "/lineup-media/source-video-stills/cs2nades/nuke/b-retake-flash-aim-7000ms.jpg",
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
    if (!sourceCamera && !reviewedImages.has(photo.image)) return photo;
    return { ...photo, aimPoint: { ...center } };
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
