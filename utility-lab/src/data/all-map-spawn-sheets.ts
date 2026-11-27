import type { UtilityReference } from "../utility-data.ts";

import { ANUBIS_T_SPAWN_POINTS } from "./anubis-t-spawn-points.ts";
import { ANCIENT_CT_ELBOW_SPAWN_POINTS } from "./ancient-ct-elbow-spawn-points.ts";

type Side = "T" | "CT";
type Point = { slot: number; x: number; y: number };
type Sheet = { registration: string; points: readonly Point[] };

function sheet(registration: string, coordinates: [number, number, number][]): Sheet {
  return { registration, points: coordinates.map(([slot, x, y]) => ({ slot, x, y })) };
}

// A sheet uses one publisher's numbering on one team's spawn floor. Points without
// a published throw for the active destination still provide standing context.
const sheets: Record<string, Sheet> = {
  anubisT: { registration: "setpos-anubis-main-20261124", points: ANUBIS_T_SPAWN_POINTS },
  ancientCTElbow: { registration: "world-ancient-main", points: ANCIENT_CT_ELBOW_SPAWN_POINTS },
  mirageCT: sheet("setpos-mirage-main-20261126", [[5, 283.98, 720.51]]),
  mirageT: sheet("setpos-mirage-main-20261126", [[1, 883.98, 403.32], [2, 868.36, 394.53], [4, 868.36, 375.78], [6, 868.36, 357.03], [8, 868.36, 337.7], [9, 852.73, 328.32], [10, 883.98, 328.32]]),
  dust2T: sheet("setpos-dust2-main-20261124", [[1, 287.42, 886.23], [3, 310.72, 905.98], [11, 431.24, 886.23], [12, 440.12, 898.22], [13, 454.55, 905.98], [14, 468.08, 898.22], [15, 475.85, 886.23]]),
  dust2CT: sheet("setpos-dust2-main-20261124", [[1, 627.53, 196.66], [2, 623.75, 178.73], [3, 606.84, 168.33], [4, 589.99, 177.55], [5, 585.08, 192.94]]),
  infernoCT: sheet("setpos-inferno-main-20261124", [[1, 872.74, 367.17], [2, 884.89, 377.27], [3, 893.65, 356.94], [4, 908.67, 371.5], [5, 912.79, 354.75], [6, 905.58, 342.16]]),
  nukeT: sheet("setpos-nuke-upper-20261124", [[1, 210.1, 537.4], [3, 229.49, 545.76], [4, 212.61, 545.76], [5, 220.28, 552.87], [6, 229.49, 554.69], [7, 210.1, 556.52], [8, 226.14, 564.59]]),
  cacheCT: sheet("setpos-cache-main-20261124", [[1, 106.48, 451.56], [2, 90.86, 451.56], [3, 84.47, 435.93], [4, 106.48, 421.73], [5, 90.86, 421.73]]),
  cacheT: sheet("setpos-cache-main-20261124", [[1, 887.05, 606.89], [2, 904.52, 604.15], [3, 918.26, 594.96], [4, 878.73, 585.4], [5, 895.2, 580.8], [6, 916.57, 577.95], [7, 873.01, 564.73], [8, 894.51, 565.22], [9, 901.59, 552.93], [10, 874.03, 547.64]]),
  ancientCT: sheet("setpos-ancient-main-20261126", [[1, 539.26, 91.41], [2, 526.76, 85.16], [3, 508.01, 85.16], [4, 489.26, 85.16], [5, 476.76, 91.41]]),
  ancientT: sheet("setpos-ancient-main-20261126", [[1, 462.7, 869.53], [2, 475.2, 857.03], [3, 487.7, 869.53], [4, 500.2, 857.03], [5, 512.7, 869.53]]),
  anubisCT: sheet("setpos-anubis-main-20261124", [[2, 448.25, 212.52], [3, 434.03, 208.03], [4, 418.31, 212.52], [5, 409.33, 225.99]]),
  mirageTWindowCs2tricks: sheet("world-mirage-main", [[1, 883.98, 403.32], [2, 868.36, 375.78], [3, 868.36, 357.03], [4, 868.36, 337.7], [5, 883.98, 328.32]]),
  dust2TMidDoorsStellaraqwq: sheet("world-dust2-main", [[2, 440.12, 898.22], [3, 454.55, 905.98], [4, 468.08, 898.22], [5, 475.85, 886.23]]),
  csnadesCacheCtGarage: sheet("world-cache-main", [[1, 90.86, 451.56], [2, 106.48, 451.56], [3, 90.86, 421.73], [4, 106.48, 421.73]]),
  ancientTTopMidFlockwglock: sheet("world-ancient-main", [[1, 512.7, 869.53], [2, 487.7, 869.53], [3, 462.7, 869.53], [4, 500.2, 857.03], [5, 475.2, 857.03]]),
  viriVertigoCtARamp: sheet("world-vertigo-upper", [[1, 563.43, 200.62], [2, 546.47, 205.91], [3, 518.53, 204.5], [4, 498.24, 204.41], [5, 483.05, 219.6]]),
};

type Family = {
  mapId: string;
  side: Side;
  destinationFloor: string;
  type: UtilityReference["type"];
  total: number;
  sheet: Sheet;
  sources: ReadonlyMap<number, string>;
};

function setpos(mapId: string, side: Side, destination: string, slots: number[],
  total: number, suffix = "", type: UtilityReference["type"] = "Smoke"): Family {
  return {
    mapId, side, destinationFloor: mapId === "nuke" ? "upper" : "main", type, total,
    sheet: sheets[mapId + side],
    sources: new Map(slots.map(slot => [slot, `https://setpos.gg/${mapId}/${destination}/${side.toLowerCase()}${slot}${suffix}`])),
  };
}

function creator(mapId: string, side: Side, destinationFloor: string, total: number,
  sheet: Sheet, sources: Record<number, string>): Family {
  return {
    mapId, side, destinationFloor, type: "Smoke", total, sheet,
    sources: new Map(Object.entries(sources).map(([slot, url]) => [Number(slot), url])),
  };
}

const families: ReadonlyMap<string, Family> = new Map(Object.entries({
  "setpos-anubis-t-conn": setpos("anubis", "T", "conn", [1, 2, 3, 4, 5, 6, 7, 9, 10, 11], 11),
  "setpos-anubis-t-outside-conn": setpos("anubis", "T", "outside-conn", [1, 2, 5, 6, 8, 11], 11),
  "setpos-anubis-t-mid": setpos("anubis", "T", "mid", [2, 4, 5, 6, 7, 8, 11], 11),
  "ancient-ct-elbow-cs2tricks": creator("ancient", "CT", "main", 5, sheets.ancientCTElbow, {
    1: "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-1-35af",
    2: "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-2-9550",
    3: "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-3-494a",
    4: "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-4-8b27",
    5: "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-5-0e13",
  }),
  "setpos-mirage-ct-top-mid": setpos("mirage", "CT", "top-mid", [5], 5),
  "setpos-mirage-t-catwalk": setpos("mirage", "T", "catwalk", [1,4,6,8,9,10], 10),
  "mirage-t-window-cs2tricks": creator("mirage", "T", "main", 5, sheets.mirageTWindowCs2tricks, {
    1: "https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-1-d3bd",
    2: "https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-2-e54c",
    3: "https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-3-e1f4",
    4: "https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-4-000c",
    5: "https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-5-a08b",
  }),
  "setpos-dust2-t-long-corner": setpos("dust2", "T", "long-corner", [11,12,13,14,15], 15),
  "setpos-dust2-t-mid-doors": setpos("dust2", "T", "mid-doors", [1,3,12,14,15], 15),
  "setpos-dust2-t-xbox": setpos("dust2", "T", "xbox", [13,14], 15),
  "setpos-dust2-ct-long-doors": setpos("dust2", "CT", "long-doors", [1,2,3], 5),
  "dust2-t-mid-doors-stellaraqwq": creator("dust2", "T", "main", 5, sheets.dust2TMidDoorsStellaraqwq, {
    2: "https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-2-d460",
    3: "https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-3-b56e",
    4: "https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-4-44e9",
    5: "https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-5-d314",
  }),
  "setpos-inferno-ct-banana": setpos("inferno", "CT", "banana", [2,4,5], 6),
  "setpos-inferno-ct-mid": setpos("inferno", "CT", "mid", [1,2,3,4,5,6], 6),
  "setpos-nuke-t-outside-main": setpos("nuke", "T", "outside-main", [5,6,7,8], 8),
  "setpos-nuke-t-t-red": setpos("nuke", "T", "t-red", [1,4,7], 8),
  "setpos-nuke-t-vent": setpos("nuke", "T", "vent", [5,6,7,8], 8),
  "setpos-cache-ct-molotov-heaven": setpos("cache", "CT", "heaven", [2,5], 5, "-molotov", "Molotov"),
  "setpos-cache-t-boost": setpos("cache", "T", "boost", [2,5,9], 10),
  "setpos-cache-t-connector": setpos("cache", "T", "connector", [1,2,4,5,7,8,9,10], 10),
  "setpos-cache-t-b-main": setpos("cache", "T", "b-main", [1,2,3,4,5,6,7,8,9,10], 10),
  "csnades-cache-ct-garage": creator("cache", "CT", "main", 4, sheets.csnadesCacheCtGarage, {
    1: "https://csnades.gg/cache/smokes/garage-from-ct-spawn-1",
    2: "https://csnades.gg/cache/smokes/garage-from-ct-spawn-2",
    3: "https://csnades.gg/cache/smokes/garage-from-ct-spawn-3",
    4: "https://csnades.gg/cache/smokes/garage-from-ct-spawn-4",
  }),
  "setpos-ancient-ct-b-doors": setpos("ancient", "CT", "b-doors", [1,2,3,4,5], 5),
  "setpos-ancient-t-cave": setpos("ancient", "T", "cave", [1,4,5], 5),
  "ancient-t-top-mid-flockwglock": creator("ancient", "T", "main", 5, sheets.ancientTTopMidFlockwglock, {
    1: "https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-t-spawn-1-bf6e",
    2: "https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-t-spawn-2-2490",
    3: "https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-t-spawn-3-2799",
    4: "https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-t-spawn-4-cf20",
    5: "https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-spawn-5-f2a3",
  }),
  "setpos-anubis-ct-carpets": setpos("anubis", "CT", "carpets", [3], 5),
  "setpos-anubis-ct-stairs": setpos("anubis", "CT", "stairs", [2,3,4,5], 5),
  "viri-vertigo-ct-a-ramp": creator("vertigo", "CT", "lower", 5, sheets.viriVertigoCtARamp, {
    1: "https://www.youtube.com/watch?v=HGhSBNdWJEs&t=3",
    2: "https://www.youtube.com/watch?v=HGhSBNdWJEs&t=32",
    3: "https://www.youtube.com/watch?v=HGhSBNdWJEs&t=61",
    4: "https://www.youtube.com/watch?v=HGhSBNdWJEs&t=93",
    5: "https://www.youtube.com/watch?v=HGhSBNdWJEs&t=118",
  }),
}));

export function reviewedSpawnMap(record: UtilityReference): Sheet | undefined {
  if (record.userCreated || !record.spawn || !record.source) return;
  const { family, slot, total } = record.spawn;
  const match = families.get(family);
  if (match && match.mapId === record.mapId && match.side === record.side &&
      match.destinationFloor === record.levelId && match.type === record.type &&
      match.total === total && match.sources.get(slot) === record.source) return match.sheet;
}
