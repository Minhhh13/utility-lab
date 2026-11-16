import type { UtilityReference } from "./utility-data.ts";

/** Small targeted additions for missing map/side/type photo combinations.
 * Full original source pages retain their branding and media. No source image
 * is copied, hotlinked or licensed for republication by this module.
 */
type SourceRow = readonly [
  map: "dust2" | "ancient" | "cache",
  slug: string,
  target: string,
  from: string,
  sourceType: string,
  side: "T" | "CT",
  method: string,
  click: string,
  lastRole: "aim" | "release",
  photos: number,
  additionalKeys: string,
];
const sourceRows: SourceRow[] = [
  [
    "dust2",
    "dust2-lower-tunnels-from-upper-tunnels-he",
    "Lower Tunnels",
    "Upper Tunnels",
    "HE",
    "T",
    "Running throw",
    "Left click",
    "release",
    2,
    "W",
  ],
  [
    "dust2",
    "dust2-b-plat-from-b-doors-incendiary",
    "B Plat",
    "B Doors",
    "Incendiary",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "dust2",
    "dust2-under-b-window-from-b-window-incendiary",
    "Under B Window",
    "B Window",
    "Incendiary",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "dust2",
    "dust2-mid-doors-cross-from-ct-spawn-he",
    "Mid Doors Cross",
    "CT Spawn",
    "HE",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "dust2",
    "dust2-a-site-from-ct-spawn-he",
    "A Site",
    "CT Spawn",
    "HE",
    "CT",
    "Crouch + Jump throw",
    "Middle click",
    "release",
    2,
    "",
  ],
  [
    "ancient",
    "ancient-b-long-from-lane-he",
    "B Long",
    "Lane",
    "HE",
    "T",
    "Walking throw",
    "Left click",
    "release",
    2,
    "W + SHIFT",
  ],
  [
    "ancient",
    "ancient-mid-from-mid-elbow-he",
    "Mid",
    "Mid Elbow",
    "HE",
    "T",
    "Running throw",
    "Left click",
    "release",
    2,
    "W",
  ],
  [
    "ancient",
    "ancient-a-main-from-a-triple-flash",
    "A Main",
    "A Triple",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "ancient",
    "ancient-mid-from-ct-b-flash",
    "Mid",
    "CT B",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "ancient",
    "ancient-lane-from-b-short-he",
    "Lane",
    "B Short",
    "HE",
    "CT",
    "Running throw",
    "Left click",
    "release",
    2,
    "W",
  ],
  [
    "cache",
    "cache-b-site-from-sun-roomtoxic-flash",
    "B Site",
    "Sun Room/Toxic",
    "Flash",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "cache",
    "cache-mid-from-outside-a-main-flash",
    "Mid",
    "Outside A Main",
    "Flash",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "cache",
    "cache-a-main-from-back-a-site-flash",
    "A Main",
    "Back A Site",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "cache",
    "cache-b-main-from-back-b-site-flash",
    "B Main",
    "Back B Site",
    "Flash",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "",
  ],
  [
    "cache",
    "cache-mid-heavenoutside-a-main-from-mid-connectorz-he",
    "Mid Heaven/Outside A Main",
    "Mid Connector/Z",
    "HE",
    "CT",
    "Running throw",
    "Left click",
    "release",
    2,
    "W",
  ],
  [
    "cache",
    "cache-back-b-site-from-b-heaven-he",
    "Back B Site",
    "B Heaven",
    "HE",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "",
  ],
];

function siteFor(target: string): UtilityReference["site"] {
  if (/mid|highway/i.test(target)) return "Mid";
  if (/^a /i.test(target)) return "A";
  if (/^b |back b|under b|lane|tunnels/i.test(target)) return "B";
  return "Other";
}
function methodFor(method: string, click: string): string {
  const action = (
    {
      "Standing throw": "",
      "Jump throw": "Jump",
      "Running throw": "Run",
      "Walking throw": "Walk",
      "Crouch + Jump throw": "Crouch + Jump",
    } as Record<string, string>
  )[method];
  if (action === undefined) throw new Error("Unknown source method " + method);
  const button =
    click === "Left click"
      ? "LMB"
      : click === "Right click"
        ? "RMB"
        : "Middle click (source label)";
  return [action, button].filter(Boolean).join(" + ");
}
function stepsFor(row: SourceRow): string[] {
  const [, slug, , from, , , method, click, role, photos] = row;
  const button = click === "Left click" ? "LMB" : "RMB";
  const release =
    click === "Middle click"
      ? "Use the source's " + method.toLowerCase() + " and Middle click input."
      : (
          {
            "Standing throw": "Release " + button + " while standing still.",
            "Jump throw": "Jump and release " + button + ".",
            "Running throw":
              "Run with W and release " + button + " at the shown point.",
            "Walking throw":
              "Hold W + Shift and release " + button + " at the shown point.",
            "Crouch + Jump throw":
              "Hold Ctrl, jump and release " + button + " at the shown point.",
          } as Record<string, string>
        )[method];
  return [
    "Stand at " + from + " as shown in the first photo.",
    role === "release"
      ? "Match the starting aim; use photo " + photos + " as the release point."
      : "Match the crosshair in the final lineup photo.",
    slug === "cache-a-main-from-back-a-site-flash"
      ? "Call the flash to your teammate, then release LMB while standing still."
      : release,
  ];
}

export const FILL_PHOTO_LINEUPS: UtilityReference[] = [
  ...sourceRows.map((row): UtilityReference => {
    const [mapId, slug, target, from, sourceType, side, method, click] = row;
    const source = "https://gonade.app/nade/" + slug;
    const type =
      sourceType === "Incendiary"
        ? "Molotov"
        : (sourceType as UtilityReference["type"]);
    return {
      id: "gonade-" + slug,
      mapId,
      levelId: "main",
      side,
      type,
      title: target + " " + sourceType.toLowerCase() + " · " + from,
      from,
      target,
      site: siteFor(target),
      purpose:
        (type === "Flash"
          ? "Flash "
          : type === "HE"
            ? "Damage players at "
            : "Clear ") +
        target +
        " from " +
        from +
        ".",
      throwType: methodFor(method, click),
      steps: stepsFor(row),
      x: 500,
      y: 500,
      showMarker: false,
      userCreated: false,
      creator: "GO NADE",
      source,
      tags: ["Photo guide", "Online", "GO NADE"],
      photoEmbed: {
        provider: "gonade",
        postUrl: source,
        embedUrl: source,
        height: 1100,
      },
    };
  }),
  {
    id: "lineupspro-cache-highway-firetruck-5erxnx",
    mapId: "cache",
    levelId: "main",
    side: "T",
    type: "HE",
    title: "Highway HE · Firetruck",
    from: "Firetruck",
    target: "Highway",
    site: "Mid",
    purpose: "Damage players at Highway from Firetruck.",
    throwType: "Run + Jump + LMB",
    steps: [
      "Match the Find Spot and Exact Spot photos at Firetruck.",
      "Match AIM, then follow the RELEASE photo.",
      "Run with W, jump and release LMB.",
    ],
    x: 500,
    y: 500,
    showMarker: false,
    userCreated: false,
    creator: "scully · Lineups.pro",
    source: "https://lineups.pro/cache/5erxnx",
    tags: ["Photo guide", "Online", "Lineups.pro"],
    photoEmbed: {
      provider: "lineupspro",
      postUrl: "https://lineups.pro/cache/5erxnx",
      embedUrl: "https://lineups.pro/cache/5erxnx",
      height: 1100,
    },
  },
];

export const FILL_PHOTO_SOURCE_CHECKED = "2026-11-09";
export const FILL_PHOTO_EVIDENCE = [
  ...sourceRows.map((row) => ({
    id: "gonade-" + row[1],
    mapId: row[0],
    source: "https://gonade.app/nade/" + row[1],
    provider: "GO NADE",
    lineupPhotos: row[9],
    resultPhotos: 1,
    finalPhotoRole: row[8],
    sourceThrow: row[6],
    sourceClick: row[7],
    additionalKeys: row[10],
    checkedAt: FILL_PHOTO_SOURCE_CHECKED,
  })),
  {
    id: "lineupspro-cache-highway-firetruck-5erxnx",
    mapId: "cache",
    source: "https://lineups.pro/cache/5erxnx",
    provider: "Lineups.pro",
    lineupPhotos: 4,
    resultPhotos: 3,
    finalPhotoRole: "release",
    sourceThrow: "Run Jumpthrow",
    sourceClick: "M1",
    additionalKeys: "W + JUMP",
    author: "scully",
    publishedAt: "2026-07-05",
    checkedAt: FILL_PHOTO_SOURCE_CHECKED,
  },
];
