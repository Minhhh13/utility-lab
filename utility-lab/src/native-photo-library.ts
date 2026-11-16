import { GONADE_PHOTO_GALLERIES } from "./data/gonade-photo-gallery.ts";
import { OTHER_PHOTO_GALLERIES } from "./data/other-photo-galleries.ts";
import { GONADE_GUIDE_VIDEOS } from "./data/gonade-guide-videos.ts";
import { OTHER_GUIDE_VIDEOS } from "./data/other-guide-videos.ts";
import type { UtilityPhoto, UtilityReference } from "./utility-data.ts";
import { withAimPlacement } from "./aim-placement.ts";

export const NATIVE_PHOTO_GALLERIES: Record<string, UtilityPhoto[]> = {
  ...GONADE_PHOTO_GALLERIES,
  ...OTHER_PHOTO_GALLERIES,
};
const bySource = new Map(
  Object.values(NATIVE_PHOTO_GALLERIES).flatMap((photos) =>
    photos[0]?.source ? [[photos[0].source, photos] as const] : [],
  ),
);
const byId = new Map(Object.entries(NATIVE_PHOTO_GALLERIES));
const videos = new Map(
  Object.entries({ ...GONADE_GUIDE_VIDEOS, ...OTHER_GUIDE_VIDEOS }),
);
const videosBySource = new Map(
  Object.entries(NATIVE_PHOTO_GALLERIES).flatMap(([id, photos]) =>
    photos[0]?.source && videos.has(id)
      ? [[photos[0].source, videos.get(id)!] as const]
      : [],
  ),
);

/** Resolve legacy saved references without rendering the original website. */
export function nativePhotoRecord(record: UtilityReference): UtilityReference {
  const linked = record.remotePhotos?.length
    ? record.remotePhotos
    : (!record.userCreated ? byId.get(record.id) : undefined) ||
      bySource.get(record.photoEmbed?.postUrl || "");
  if (!linked) return withAimPlacement(record);
  const { photoEmbed: _legacyWebsite, ...native } = record;
  const steps = record.steps.map((step) =>
    step
      .replace(/^Choose Lineup in the original guide and match /, "Match ")
      .replace(/\bsource video\b/g, "video"),
  );
  if (
    !record.userCreated &&
    record.id === "lineupspro-cache-highway-firetruck-5erxnx"
  ) {
    steps[0] = "Use the first two photos to find the exact Firetruck position.";
    steps[1] =
      "Match the Aim photo, then use the Throw photo for the release point.";
  }
  const video = record.videoUrl
    ? undefined
    : !record.userCreated
      ? videos.get(record.id)
      : videosBySource.get(record.photoEmbed?.postUrl || "");
  return withAimPlacement({ ...native, steps, remotePhotos: linked, ...video });
}
