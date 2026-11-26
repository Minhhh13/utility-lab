import { hasCompleteGuideMedia } from "./expanded-guide-model.ts";
import { photoStepName } from "./lineup-copy.ts";
import { cs2tricksStagePhotos } from "./data/cs2tricks-stage-photos.ts";
import { otherStagePhotos } from "./data/other-stage-photos.ts";
import type { UtilityPhoto, UtilityReference } from "./utility-data.ts";

export type GalleryView = { photo?: UtilityPhoto; standingMap?: boolean };
export type GalleryStep = { stage?: "stand" | "setup" | "aim" | "landing"; label: string; name: string; views: GalleryView[] };

// For stationary CS2Tricks throws, the original wide camera shot is also a
// standing POV. The publisher draws its crosshair separately on the aim step.
// A running, jumping, edited or cropped frame cannot establish a standing pose.
function stationaryCamera(record: UtilityReference, aim: UtilityPhoto | undefined): UtilityPhoto | undefined {
  if (!record.source?.startsWith("https://www.cs2tricks.com/nades/") ||
      !/^(?:(?:stand still|crouch) \+ )?(?:left click|right click|LMB|RMB|both buttons \(LMB \+ RMB\))$/i.test(record.throwType) ||
      !aim || aim.region || !aim.aimPoint || aim.source !== record.source ||
      !/^https:\/\/d1ntlvfrxziqo6\.cloudfront\.net\/[a-f0-9-]+\.(webp|jpe?g)$/.test(aim.image)) return undefined;
  const { aimPoint: _mark, ...wide } = aim;
  return { ...wide, kind: "position", caption: `Wide first-person view from ${record.from}. The aim step marks the same photo.` };
}

/** Preserve personal gallery order. In a published walkthrough, extra aim and
 * release frames belong to step three; a missing still opens the source video. */
export function lineupWalkthrough(record: UtilityReference, photos: UtilityPhoto[]): GalleryStep[] {
  if (record.userCreated || !hasCompleteGuideMedia(record) || !photos.some(p => p.kind === "aim" && p.aimPoint)) {
    return photos.map((photo, index) => ({
      label: photoStepName(photo.kind, index, photo.caption),
      name: photo.caption || `Photo ${index + 1}`, views: [{ photo }],
    }));
  }
  const source = record.source?.startsWith("https://www.cs2tricks.com/nades/")
    ? cs2tricksStagePhotos(record) : otherStagePhotos(record);
  const positions = photos.filter(p => p.kind === "position");
  const context = photos.filter(p => !p.kind || p.kind === "context");
  const aims = photos.filter(p => p.kind === "aim" || p.kind === "release");
  const setup = source.setup ?? stationaryCamera(record, aims[0]);
  const results = photos.filter(p => p.kind === "landing");
  const landing = results.length || !source.landing ? results : [source.landing];
  return [
    { stage: "stand", label: "Where to stand", name: "Where to stand", views: [...positions, ...context].map(photo => ({
      photo, standingMap: source.setup?.image === photo.image,
    })) },
    { stage: "setup", label: "First-person view", name: "First-person standing view", views: [{ photo: setup }] },
    { stage: "aim", label: "Where to aim", name: "First-person aim", views: aims.map(photo => ({ photo })) },
    { stage: "landing", label: "Landing", name: "Landing", views: landing.length ? landing.map(photo => ({ photo })) : [{}] },
  ];
}
