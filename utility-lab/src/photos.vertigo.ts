import type { UtilityReference } from "./utility-data.ts";

/** Reference-only links to GO NADE's complete, source-hosted guides.
 * The original page retains its photos, branding and controls. No source photo
 * or video bytes are copied into Utility Lab, and no media license is implied.
 */
export const VERTIGO_PHOTO_SOURCE = {
  provider: "GO NADE",
  mapUrl: "https://gonade.app/map/vertigo",
  checkedAt: "2026-11-09",
  presentation: "Original source-hosted page",
} as const;

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
    4001,
    "Ramp",
    "Elevator",
    "Smoke",
    "CT",
    "Running throw",
    "Left click",
    "release",
    3,
    "vertigo-ramp-from-elevator-smoke",
  ],
  [
    4002,
    "Right Gen",
    "Stairs",
    "Smoke",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-right-gen-from-stairs-smoke",
  ],
  [
    4003,
    "Left Gen",
    "Stairs",
    "Smoke",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-left-gen-from-stairs-smoke",
  ],
  [
    4004,
    "CT Spawn",
    "Mid",
    "Smoke",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-ct-spawn-from-mid-smoke",
  ],
  [
    4006,
    "Left A",
    "Ramp",
    "Smoke",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-left-a-from-ramp-smoke",
  ],
  [
    4007,
    "Wood",
    "Stairs",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-wood-from-stairs-molotov",
  ],
  [
    4008,
    "White",
    "Stairs",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-white-from-stairs-molotov",
  ],
  [
    4009,
    "A Short",
    "Ramp",
    "Molotov",
    "T",
    "Standing throw",
    "Middle click",
    "aim",
    2,
    "vertigo-a-short-from-ramp-molotov",
  ],
  [
    4011,
    "Pillar",
    "Stairs",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-pillar-from-stairs-molotov",
  ],
  [
    4013,
    "A Heaven",
    "Top Ramp",
    "Molotov",
    "T",
    "Tap + Jump throw",
    "Left click",
    "release",
    2,
    "vertigo-a-heaven-from-top-ramp-molotov",
  ],
  [
    4016,
    "A Default",
    "Back Room",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-default-from-back-room-smoke",
  ],
  [
    4018,
    "A Default",
    "Back Room",
    "HE",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-default-from-back-room-he",
  ],
  [
    4019,
    "Ramp",
    "A Site",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-ramp-from-a-site-flash",
  ],
  [
    4020,
    "B Site",
    "Stairs",
    "Flash",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-b-site-from-stairs-flash",
  ],
  [
    4021,
    "Stairs",
    "T Corridor",
    "Flash",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-stairs-from-t-corridor-flash",
  ],
  [
    4022,
    "White",
    "Stairs",
    "Flash",
    "T",
    "Crouching throw",
    "Left click",
    "release",
    2,
    "vertigo-white-from-stairs-flash",
  ],
  [
    4024,
    "Yellow",
    "Elevator",
    "Incendiary",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-yellow-from-elevator-incendiary",
  ],
  [
    4025,
    "A Default",
    "Back Room",
    "Incendiary",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-default-from-back-room-incendiary",
  ],
  [
    4026,
    "White",
    "Stairs",
    "HE",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-white-from-stairs-he",
  ],
  [
    4027,
    "A Gap",
    "T Spawn",
    "Smoke",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-gap-from-t-spawn-smoke",
  ],
  [
    4028,
    "Ramp",
    "Sandbags",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-ramp-from-sandbags-smoke",
  ],
  [
    4029,
    "Ramp",
    "Bottom Ramp",
    "Flash",
    "T",
    "Crouching throw",
    "Middle click",
    "release",
    2,
    "vertigo-ramp-from-bottom-ramp-flash",
  ],
  [
    4030,
    "Yellow",
    "Elevator",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-yellow-from-elevator-smoke",
  ],
  [
    4031,
    "Ramp",
    "A Short",
    "Incendiary",
    "CT",
    "Jump throw",
    "Right click",
    "aim",
    2,
    "vertigo-ramp-from-a-short-incendiary",
  ],
  [
    4032,
    "T Mid",
    "B Connector",
    "HE",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-t-mid-from-b-connector-he",
  ],
  [
    4033,
    "A Gap",
    "A Headshot",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-gap-from-a-headshot-flash",
  ],
  [
    4034,
    "A Site",
    "Elevator",
    "Flash",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-site-from-elevator-flash",
  ],
  [
    4035,
    "Top Ramp",
    "Back Room",
    "Flash",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-top-ramp-from-back-room-flash",
  ],
  [
    4036,
    "Right A Tall",
    "Ramp",
    "Smoke",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    3,
    "vertigo-right-a-tall-from-ramp-smoke",
  ],
  [
    4037,
    "A Site",
    "Top Ramp",
    "Flash",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-site-from-top-ramp-flash",
  ],
  [
    4038,
    "Stairs",
    "Pillar",
    "Flash",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-stairs-from-pillar-flash",
  ],
  [
    4039,
    "B Site",
    "T Stairs",
    "Flash",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-b-site-from-t-stairs-flash",
  ],
  [
    4041,
    "Elevator",
    "Ramp",
    "Smoke",
    "T",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-elevator-from-ramp-smoke",
  ],
  [
    4042,
    "B Connector",
    "Deep T Mid",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-b-connector-from-deep-t-mid-molotov",
  ],
  [
    4043,
    "Mini",
    "Ramp",
    "Smoke",
    "T",
    "Standing throw",
    "Middle click",
    "aim",
    2,
    "vertigo-mini-from-ramp-smoke",
  ],
  [
    4045,
    "A Catwalk",
    "Top Ramp",
    "Molotov",
    "T",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-a-catwalk-from-top-ramp-molotov",
  ],
  [
    4046,
    "Ramp",
    "A Short",
    "HE",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-ramp-from-a-short-he",
  ],
  [
    4047,
    "T Mid",
    "B Connector",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-t-mid-from-b-connector-smoke",
  ],
  [
    4048,
    "Stairs",
    "Left Gen/Deep B Site",
    "Smoke",
    "CT",
    "Jump throw",
    "Left click",
    "aim",
    2,
    "vertigo-stairs-from-left-gendeep-b-site-smoke",
  ],
  [
    4049,
    "Front B Site",
    "CT Spawn",
    "Smoke",
    "CT",
    "Standing throw",
    "Left click",
    "aim",
    2,
    "vertigo-front-b-site-from-ct-spawn-smoke",
  ],
  [
    4050,
    "B Default",
    "CT Spawn",
    "Incendiary",
    "CT",
    "Jump throw",
    "Middle click",
    "aim",
    2,
    "vertigo-b-default-from-ct-spawn-incendiary",
  ],
];

function siteFor(target: string): UtilityReference["site"] {
  if (/mid|ct spawn|b connector/i.test(target)) return "Mid";
  if (/gen|stairs|wood|white|quad|pillar|b default|b site/i.test(target))
    return "B";
  return "A";
}
function throwMethod(method: string, click: string): string {
  const button =
    click === "Left click"
      ? "LMB"
      : click === "Right click"
        ? "RMB"
        : "Middle click (source label)";
  return method.replace(/ throw$/i, "") + " + " + button;
}
function instructions(row: SourceRow): string[] {
  const [, target, from, , , method, click, lastImage, count] = row;
  const button =
    click === "Left click"
      ? "LMB"
      : click === "Right click"
        ? "RMB"
        : "the mouse input shown in the guide";
  return [
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
    click === "Middle click"
      ? "Use the throw and mouse input shown in the guide."
      : "Use a " +
        method.toLowerCase() +
        " with " +
        button +
        " toward " +
        target +
        (lastImage === "release"
          ? "; release at the position in the final photo."
          : "."),
  ];
}

export const VERTIGO_PHOTO_LINEUPS: UtilityReference[] = sourceRows.map(
  (row) => {
    const [sourceId, target, from, sourceType, side, method, click, , , slug] =
      row;
    const url = "https://gonade.app/nade/" + slug;
    const type =
      sourceType === "Incendiary"
        ? "Molotov"
        : (sourceType as UtilityReference["type"]);
    return {
      id: "gonade-vertigo-" + sourceId,
      mapId: "vertigo",
      // 4029's result photo shows the flash inside the roofed bottom-ramp hall.
      // This is destination-photo evidence, rather than an origin-floor guess.
      levelId: sourceId === 4029 ? "lower" : "upper",
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
      throwType: throwMethod(method, click),
      steps: instructions(row),
      x: 500,
      y: 500,
      showMarker: false,
      userCreated: false,
      creator: "GO NADE",
      source: url,
      site: siteFor(target),
      tags: ["Photo guide", "Online", "GO NADE"],
      photos: [],
      photoEmbed: {
        provider: "gonade",
        postUrl: url,
        embedUrl: url,
        height: 1100,
      },
    };
  },
);

/** Reproducible source facts for content checks; not a current-game throw test. */
export const VERTIGO_PHOTO_EVIDENCE = sourceRows.map((row) => ({
  id: "gonade-vertigo-" + row[0],
  sourceId: row[0],
  source: "https://gonade.app/nade/" + row[9],
  positionAimImages: row[8],
  resultImages: 1,
  finalPhotoRole: row[7],
  sourceThrow: row[5],
  sourceClick: row[6],
  checkedAt: VERTIGO_PHOTO_SOURCE.checkedAt,
}));
