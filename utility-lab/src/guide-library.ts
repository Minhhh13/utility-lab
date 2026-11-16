import { CREATOR_GUIDES } from "./creator-guides.ts";
import { PHOTO_LINEUPS } from "./lineup-photos.ts";
import { COMPENDIUM_PHOTO_LINEUPS } from "./photos.compendium.ts";
import { NUKE_PHOTO_LINEUPS } from "./photos.nuke.ts";
import { VERTIGO_PHOTO_LINEUPS } from "./photos.vertigo.ts";
import { OTHER_MAP_PHOTO_LINEUPS } from "./photos.gonade-other.ts";
import { MIRAGE_ONLINE_PHOTO_LINEUPS } from "./photos.mirage-online.ts";
import { FILL_PHOTO_LINEUPS } from "./photos.gonade-fill.ts";
import { UTILITY_REFERENCES, utilityPhotos, type UtilityReference } from "./utility-data.ts";
import { applyRegisteredUtilityAnchor } from "./map-utility-anchors.ts";
import { clearPhotoInstructions } from "./lineup-copy.ts";
import { nativePhotoRecord } from "./native-photo-library.ts";
import expandedBundledPhotos from "./data/expanded/bundled-photos.json" with { type: "json" };
const records = new Map<string, UtilityReference>();
for (const item of [
  ...PHOTO_LINEUPS,
  ...COMPENDIUM_PHOTO_LINEUPS,
  ...NUKE_PHOTO_LINEUPS,
  ...VERTIGO_PHOTO_LINEUPS,
  ...OTHER_MAP_PHOTO_LINEUPS,
  ...MIRAGE_ONLINE_PHOTO_LINEUPS,
  ...FILL_PHOTO_LINEUPS,
  ...CREATOR_GUIDES,
])
  records.set(item.id, { ...records.get(item.id), ...item });
export const GUIDE_LIBRARY: UtilityReference[] = [...records.values()]
  .map(nativePhotoRecord)
  .map(clearPhotoInstructions)
  .map(applyRegisteredUtilityAnchor);
/** Published browsing is photo-first. Older creator-video links still resolve. */
export const PHOTO_GUIDE_LIBRARY = GUIDE_LIBRARY.filter((guide) =>
  utilityPhotos(guide).some((photo) => photo.kind !== "context"),
);
export const REGISTERED_PRACTICE_REFERENCES: UtilityReference[] =
  UTILITY_REFERENCES.map(applyRegisteredUtilityAnchor);
export const ALL_LINEUP_REFERENCES: UtilityReference[] = [
  ...GUIDE_LIBRARY,
  ...REGISTERED_PRACTICE_REFERENCES,
];
export const BUNDLED_GUIDE_PHOTOS = [
  ...new Set(
    [...GUIDE_LIBRARY.flatMap((item) =>
      (item.photos || []).map((photo) => photo.image),
    ), ...expandedBundledPhotos].filter((image) => image.startsWith("/lineup-media/")),
  ),
];
