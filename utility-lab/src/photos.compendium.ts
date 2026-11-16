import type { UtilityReference } from "./utility-data";

/** Unchanged, attributed source guide panels. Their June 2026 publication is
 * evidence of source age, not a claim of current-map validation. No map pin is
 * shown until the exact standing/landing positions are registered to our SVG.
 * Original annotations and guide images: CC BY-SA 4.0, spnk / CS2 Compendium.
 */
export const COMPENDIUM_PHOTO_SOURCE = {
  creator: "spnk / CS2 Compendium",
  project: "https://github.com/1234/cs2-compendium",
  commit: "deaae65ebae1a9a48240ea215d3d72d5e1c7a712",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  source:
    "https://github.com/1234/cs2-compendium/blob/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage/README.md",
  checkedAt: "2026-11-09",
} as const;

const shared = {
  mapId: "mirage",
  levelId: "main",
  side: "T",
  type: "Smoke",
  x: 500,
  y: 500,
  showMarker: false,
  userCreated: false,
  creator: COMPENDIUM_PHOTO_SOURCE.creator,
  source: COMPENDIUM_PHOTO_SOURCE.source,
} as const;

const palaceFile = "mirage-t-palace-alley-a-smokes.webp";
const windowFile = "t-spawn-insta-window-smokes.webp";
function sourcePhoto(file: string, caption: string) {
  return {
    image: `/lineup-media/compendium/${file}`,
    kind: "aim" as const,
    caption,
    creator: COMPENDIUM_PHOTO_SOURCE.creator,
    source: `${COMPENDIUM_PHOTO_SOURCE.project}/blob/${COMPENDIUM_PHOTO_SOURCE.commit}/training/utility/mirage/${file}`,
    license: COMPENDIUM_PHOTO_SOURCE.license,
    licenseUrl: COMPENDIUM_PHOTO_SOURCE.licenseUrl,
  };
}

const palaceGuides = [
  {
    slug: "jungle",
    target: "Jungle",
    panel: "1 · Jungle smoke (orange)",
    purpose: "Cover the Jungle sightline during an A execute.",
  },
  {
    slug: "stairs",
    target: "Top stairs",
    panel: "2 · Top Stairs smoke (blue)",
    purpose: "Cover the elevated stairs angle during an A execute.",
  },
  {
    slug: "ct",
    target: "CT entrance",
    panel: "3 · CT smoke (green)",
    purpose: "Cover the CT entrance during an A execute.",
  },
];

/** Eight distinct source throws, sharing two complete original guide images.
 * Each photo includes the standing/spawn reference and its matching aim panel;
 * the Palace guide also includes landing views. No release frame is supplied.
 */
export const COMPENDIUM_PHOTO_LINEUPS: UtilityReference[] = [
  ...palaceGuides.map((guide) => ({
    ...shared,
    id: `compendium-mirage-palace-${guide.slug}`,
    title: `${guide.target} smoke · Palace Alley`,
    from: "Palace Alley · shared standing position",
    target: guide.target,
    site: "A" as const,
    tags: ["Photo guide", "A execute", "Jump throw", "CC BY-SA 4.0"],
    purpose: `${guide.purpose} Source guide published June 2026; capture date and game build are not stated. Check the throw on your current map version.`,
    throwType: "Jump + LMB",
    steps: [
      "Match the shared Palace Alley position in the left column: third-person location above, first-person view below.",
      `Use only the aim panel labeled ${guide.panel}; align the crosshair with that panel's ring.`,
      "The source specifies a jump throw with Space + left click. The standing position is shared by all three Palace Alley smokes.",
      `Compare the same row's landing view for ${guide.target}. The guide image is retained unchanged; it is not an independent current-build test.`,
    ],
    photos: [
      sourcePhoto(
        palaceFile,
        `Complete original guide: standing position at left; read ${guide.panel} in the middle and its matching landing view at right. Other rows are different throws. spnk / CS2 Compendium · CC BY-SA 4.0 · unchanged.`,
      ),
    ],
  })),
  ...Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    return {
      ...shared,
      id: `compendium-mirage-window-spawn-${number}`,
      title: `Window smoke · T spawn ${number}`,
      from: `T spawn · source position ${number}`,
      target: "Window",
      site: "Mid" as const,
      tags: ["Photo guide", "Spawn specific", "Walk jump throw", "CC BY-SA 4.0"],
      purpose:
        "Cover Window for mid control using this specific T-spawn position. Source guide published June 2026; capture date and game build are not stated. Check the throw on your current map version.",
      throwType: "Shift + W + Jump + LMB",
      steps: [
        `Use the exact spawn box labeled ${number} in the left panel. This guide is spawn specific; the source says no repositioning.`,
        `Use aim panel ${number}, matching the numbered spawn. Align the crosshair with the center of that panel's ring.`,
        "The source specifies a walk jump throw: hold Shift + W, then jump and left click. Its technique panel says to release left click at the peak of the jump; confirm the timing while practicing.",
        "The original composite provides position and aim references, without a separate release-frame or Window landing photo. It is not an independent current-build test.",
      ],
      photos: [
        sourcePhoto(
          windowFile,
          `Complete original guide: match spawn box ${number} at left to numbered aim panel ${number}. Read the walk-jumpthrow technique at bottom right. spnk / CS2 Compendium · CC BY-SA 4.0 · unchanged.`,
        ),
      ],
    };
  }),
];
