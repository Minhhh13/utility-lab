import type { UtilityPhoto, UtilityPhotoRegion, UtilityReference } from "../utility-data.ts";
import reviewedSources from "./other-stage-sources.json" with { type: "json" };

type SourceStill = { image: string; ms: number };
type SourceRender = { image: string; tick: number };
type SourcePanel = { image: string; region: UtilityPhotoRegion };
type StageSource = { setup: SourceStill | SourceRender; landing?: SourceStill | SourcePanel };
type StagePhotos = { setup?: UtilityPhoto; landing?: UtilityPhoto };

const sources: Record<string, StageSource> = reviewedSources;

export function otherStagePhotos(record: UtilityReference): StagePhotos {
  if (record.userCreated || !record.source) return {};
  const evidence = sources[record.source];
  if (!evidence) return {};

  const credit = { source: record.source, creator: record.creator };
  const { setup, landing } = evidence;
  const photos: StagePhotos = {
    setup: {
      ...credit,
      kind: "position",
      image: setup.image,
      caption: "ms" in setup
        ? `First-person view from ${record.from} · source video ${(setup.ms / 1000).toFixed(2)}s.`
        : `First-person view from ${record.from}. The Aim step marks the point on this same view.`,
      annotationId: "ms" in setup ? `sourceframe@${setup.ms}ms` : `source-game-tick@${setup.tick}`,
    },
  };
  if (landing) {
    photos.landing = {
      ...credit,
      kind: "landing",
      image: landing.image,
      caption: "ms" in landing
        ? `Destination at ${record.target} · source video ${(landing.ms / 1000).toFixed(2)}s.`
        : `Destination at ${record.target}, shown in the creator’s result panel.`,
      ...("ms" in landing
        ? { annotationId: `sourceframe@${landing.ms}ms` }
        : { region: landing.region, annotationId: "source-thumbnail-destination-panel" }),
    };
  }
  return photos;
}
