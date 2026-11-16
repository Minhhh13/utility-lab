import type { UtilityReference } from "./utility-data.ts";

/** Complete original source pages, loaded on demand; no media is mirrored.
 * These records add two photo choices for each Mirage side/utility pair that
 * was absent from the existing Palace Alley / Window smoke photo collection.
 */
export const MIRAGE_ONLINE_PHOTO_CHECKED = "2026-11-09";
type SourceRow = readonly [
  id: number,
  target: string,
  from: string,
  sourceType: string,
  side: "T" | "CT",
  method: string,
  click: string,
  lastImage: "aim" | "release",
  positionAimImages: number,
  slug: string,
];
const sourceRows: SourceRow[] = [
  [
    6004,
    "Ladder",
    "Bottom Mid",
    "Flash",
    "T",
    "Walking throw",
    "Left click",
    "release",
    2,
    "mirage-ladder-from-bottom-mid-flash",
  ],
  [
    6010,
    "Sandwich",
    "T Roof",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-sandwich-from-t-roof-molotov",
  ],
  [
    6023,
    "Ladder",
    "Bottom Mid",
    "Molotov",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "mirage-ladder-from-bottom-mid-molotov",
  ],
  [
    6025,
    "Ramp",
    "A Triple",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-ramp-from-a-triple-smoke",
  ],
  [
    6026,
    "A Default",
    "CT Spawn",
    "Incendiary",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-a-default-from-ct-spawn-incendiary",
  ],
  [
    6027,
    "Deep Apartments",
    "B Site",
    "Smoke",
    "CT",
    "Running throw",
    "Left click",
    "release",
    3,
    "mirage-deep-apartments-from-b-site-smoke",
  ],
  [
    6029,
    "B Site",
    "Apartments",
    "Flash",
    "T",
    "Running throw",
    "Left click",
    "release",
    2,
    "mirage-b-site-from-apartments-flash",
  ],
  [
    6042,
    "Ramp",
    "A Triple",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-ramp-from-a-triple-flash",
  ],
  [
    6043,
    "Deep Apartments",
    "B Site",
    "HE",
    "CT",
    "Running throw",
    "Left click",
    "release",
    3,
    "mirage-deep-apartments-from-b-site-he",
  ],
  [
    6045,
    "A Default",
    "Top Connector",
    "Incendiary",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-a-default-from-top-connector-incendiary",
  ],
  [
    6046,
    "A Default",
    "Top Connector",
    "HE",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "mirage-a-default-from-top-connector-he",
  ],
  [
    6050,
    "Apartments",
    "Market Window",
    "Flash",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "mirage-apartments-from-market-window-flash",
  ],
];

function siteFor(target: string): UtilityReference["site"] {
  if (/ladder|mid/i.test(target)) return "Mid";
  if (/apartment|b site/i.test(target)) return "B";
  return "A";
}
function originalPage(url: string, provider: "gonade" | "cs2tricks") {
  return { provider, postUrl: url, embedUrl: url, height: 1100 };
}
const goNadeGuides: UtilityReference[] = sourceRows.map((row) => {
  const [
    sourceId,
    target,
    from,
    sourceType,
    side,
    method,
    click,
    lastImage,
    count,
    slug,
  ] = row;
  const url = "https://gonade.app/nade/" + slug;
  const type =
    sourceType === "Incendiary"
      ? "Molotov"
      : (sourceType as UtilityReference["type"]);
  const button =
    click === "Left click"
      ? "LMB"
      : click === "Right click"
        ? "RMB"
        : "Middle click (source label)";
  return {
    id: "gonade-mirage-" + sourceId,
    mapId: "mirage",
    levelId: "main",
    side,
    type,
    title: target + " " + sourceType.toLowerCase() + " · " + from,
    from,
    target,
    purpose:
      type === "Smoke"
        ? "Block " + target + " from " + from + "."
        : type === "Flash"
          ? "Flash " + target + " from " + from + "."
          : type === "HE"
            ? "Damage players at " + target + " from " + from + "."
            : "Clear " + target + " with fire from " + from + ".",
    throwType: method.replace(/ throw$/i, "") + " + " + button,
    steps: [
      "Move to " +
        from +
        " and match the standing position in the first lineup photo.",
      lastImage === "release"
        ? "Match the aim shown before the final photo; use photo " +
          count +
          " as the release-position reference."
        : "Match the crosshair in lineup photo " +
          count +
          ", the final aim reference.",
      "Use a " +
        method.toLowerCase() +
        " with " +
        button +
        " toward " +
        target +
        (lastImage === "release"
          ? "; release at the position in the final photo."
          : "."),
    ],
    x: 500,
    y: 500,
    showMarker: false,
    userCreated: false,
    creator: "GO NADE",
    source: url,
    site: siteFor(target),
    tags: ["Photo guide", "Online", "GO NADE"],
    photos: [],
    photoEmbed: originalPage(url, "gonade"),
  };
});

const catwalkUrl =
  "https://www.cs2tricks.com/nades/mirage/grenades/catwalk-from-back-alley-9376";
const benchUrl =
  "https://www.cs2tricks.com/nades/mirage/grenades/bench-from-b-apartments-a7b9";
const tHeGuides: UtilityReference[] = [
  {
    id: "cs2tricks-mirage-t-catwalk-he",
    mapId: "mirage",
    levelId: "main",
    side: "T",
    type: "HE",
    title: "Catwalk HE · Back Alley",
    from: "Back Alley / B House",
    target: "Catwalk",
    site: "B",
    purpose: "Damage a defender holding Catwalk before a B split.",
    throwType: "Jump + LMB",
    steps: [
      "Match the Back Alley / B House position in the source's Position photo.",
      "Match the crosshair in the source's Lineup image.",
      "Stand still, jump and release LMB.",
    ],
    x: 500,
    y: 500,
    showMarker: false,
    userCreated: false,
    creator: "★ igraman4ik ★ / CS2Tricks",
    source: catwalkUrl,
    tags: ["Photo guide", "Online", "CS2Tricks"],
    photos: [],
    photoEmbed: originalPage(catwalkUrl, "cs2tricks"),
  },
  {
    id: "cs2tricks-mirage-t-bench-he",
    mapId: "mirage",
    levelId: "main",
    side: "T",
    type: "HE",
    title: "Bench HE · B Apartments",
    from: "B Apartments doorway",
    target: "Bench",
    site: "B",
    purpose: "Damage a player behind Bench before leaving B Apartments.",
    throwType: "Run two steps + LMB",
    steps: [
      "Stand in the B Apartments doorway shown in the Position photo.",
      "Aim where the arch starts curving beside the white hanging cloth.",
      "Run two steps and release LMB.",
    ],
    x: 500,
    y: 500,
    showMarker: false,
    userCreated: false,
    creator: "CS2Tricks community",
    source: benchUrl,
    tags: ["Photo guide", "Online", "CS2Tricks", "Either side"],
    photos: [],
    photoEmbed: originalPage(benchUrl, "cs2tricks"),
  },
];

export const MIRAGE_ONLINE_PHOTO_LINEUPS: UtilityReference[] = [
  ...goNadeGuides,
  ...tHeGuides,
];

/** Source facts are evidence of what was published, not current-game testing. */
export const MIRAGE_ONLINE_PHOTO_EVIDENCE = [
  ...sourceRows.map((row) => ({
    id: "gonade-mirage-" + row[0],
    source: "https://gonade.app/nade/" + row[9],
    sourceSide: row[4] as string,
    positionAimImages: row[8],
    resultImages: 1,
    sourceMethod: row[5],
    sourceClick: row[6],
    finalPhotoRole: row[7],
    checkedAt: MIRAGE_ONLINE_PHOTO_CHECKED,
  })),
  {
    id: "cs2tricks-mirage-t-catwalk-he",
    source: catwalkUrl,
    sourceSide: "T",
    positionAimImages: 2,
    resultImages: 1,
    sourceMethod: "Stationary + Jump",
    sourceClick: "Left Click",
    finalPhotoRole: "aim",
    publishedAt: "2026-04-20",
    checkedAt: MIRAGE_ONLINE_PHOTO_CHECKED,
  },
  {
    id: "cs2tricks-mirage-t-bench-he",
    source: benchUrl,
    sourceSide: "Any Team",
    positionAimImages: 2,
    resultImages: 1,
    sourceMethod: "Run two steps",
    sourceClick: "Left Click",
    finalPhotoRole: "aim",
    publishedAt: "2025-01-15",
    checkedAt: MIRAGE_ONLINE_PHOTO_CHECKED,
  },
];
