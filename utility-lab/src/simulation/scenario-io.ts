import {
  unitsPerBoardUnitForMap,
  type Actor,
  type Grenade,
  type Scenario,
  type Point,
} from "./engine.ts";

export interface BoardInput {
  name: string;
  mapId: string;
  levelId: string;
  objects: {
    id: string;
    kind: string;
    x: number;
    y: number;
    number?: number;
    label?: string;
    points?: Point[];
  }[];
}

export const LIMITS = {
  actors: 32,
  grenades: 64,
  walls: 64,
  waypoints: 64,
  speed: 300,
  time: 120,
  duration: 60,
  minScale: 1,
  maxScale: 20,
} as const;
export const MAX_FILE_BYTES = 768 * 1024;
const format = "utility-lab-rehearsal";
const kinds = ["smoke", "flash", "he", "molotov", "incendiary"] as const;
const isGrenade = (kind: string): kind is Grenade["kind"] =>
  kinds.some((k) => k === kind);
const point = ({ x, y }: Point): Point => ({ x, y });

export function fromBoard(plan: BoardInput): Scenario {
  const actors: Actor[] = [],
    grenades: Grenade[] = [];
  for (const item of plan.objects) {
    if (
      (item.kind === "t" || item.kind === "ct") &&
      actors.length < LIMITS.actors
    ) {
      actors.push({
        id: item.id,
        team: item.kind === "t" ? "T" : "CT",
        start: point(item),
        waypoints: [],
        delay: 0,
        speed: 215,
        facing: item.kind === "t" ? 270 : 90,
        faceRoute: true,
      });
    } else if (isGrenade(item.kind) && grenades.length < LIMITS.grenades) {
      grenades.push({ id: item.id, kind: item.kind, at: point(item), time: 0 });
    }
  }
  // A board arrow has no owner. Suggest one nearby start per player/arrow,
  // closest pair first. Never assign a distant mark just to make a route.
  const routes = plan.objects.filter(
    (o) => o.kind === "route" && o.points && o.points.length > 1,
  );
  const candidates = actors
    .flatMap((actor) =>
      routes.map((route) => ({
        actor,
        route,
        distance: Math.hypot(
          actor.start.x - route.points![0].x,
          actor.start.y - route.points![0].y,
        ),
      })),
    )
    .filter((c) => c.distance <= 110)
    .sort((a, b) => a.distance - b.distance);
  const used = new Set<string>();
  for (const { actor, route } of candidates) {
    if (used.has(route.id) || actor.waypoints.length) continue;
    const pts = route.points!;
    const count = Math.min(LIMITS.waypoints, pts.length);
    actor.waypoints = Array.from({ length: count }, (_, i) =>
      point(pts[Math.round((i * (pts.length - 1)) / (count - 1))]),
    );
    used.add(route.id);
  }
  return {
    actors,
    grenades,
    unitsPerBoardUnit: unitsPerBoardUnitForMap(plan.mapId),
    walls: [],
  };
}

// The identity is the board geometry that actually feeds a rehearsal. Editing a
// board creates another draft; returning to its earlier layout restores its run.
export async function rehearsalKey(
  plan: BoardInput,
  tacticId?: string | null,
  customRadar?: string,
) {
  const material = JSON.stringify([
    plan.mapId,
    plan.levelId,
    tacticId || "",
    customRadar?.startsWith("data:") ? customRadar : "",
    plan.objects
      .filter(
        (o) =>
          o.kind === "t" ||
          o.kind === "ct" ||
          o.kind === "route" ||
          isGrenade(o.kind),
      )
      .map((o) => [o.id, o.kind, o.x, o.y, o.points?.map((p) => [p.x, p.y])]),
  ]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  return (
    "utility-lab:rehearsal:v1:" +
    Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("")
  );
}

export function exportRehearsal(
  plan: Pick<BoardInput, "mapId" | "levelId">,
  scenario: Scenario,
) {
  return JSON.stringify({
    format,
    version: 1,
    map: plan.mapId,
    level: plan.levelId,
    scenario,
  });
}

type Dict = Record<string, unknown>;
const record = (v: unknown): Dict => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw Error("Expected a rehearsal object.");
  return v as Dict;
};
const number = (v: unknown, lo: number, hi: number, name: string) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi)
    throw Error("Invalid " + name + " in rehearsal.");
  return v;
};
const coords = (v: unknown) => {
  const p = record(v);
  return {
    x: number(p.x, 0, 1000, "map position"),
    y: number(p.y, 0, 1000, "map position"),
  };
};
const list = (v: unknown, max: number) => {
  if (!Array.isArray(v) || v.length > max)
    throw Error("Invalid or oversized rehearsal list.");
  return v as unknown[];
};
export function importRehearsal(
  text: string,
  plan: Pick<BoardInput, "mapId" | "levelId">,
): Scenario {
  if (text.length > MAX_FILE_BYTES) throw Error("Rehearsal file is too large.");
  const file = record(JSON.parse(text));
  if (file.format !== format || file.version !== 1)
    throw Error("Choose a Utility Lab rehearsal JSON file (v1).");
  if (file.map !== plan.mapId || file.level !== plan.levelId)
    throw Error("Open the same map and floor as the exported rehearsal.");
  const data = record(file.scenario),
    ids = new Set<string>();
  const id = (v: unknown) => {
    if (typeof v !== "string" || !v.trim() || v.length > 128 || ids.has(v))
      throw Error("Missing or duplicate rehearsal marker ID.");
    ids.add(v);
    return v;
  };
  const actors: Actor[] = list(data.actors, LIMITS.actors).map((v) => {
    const a = record(v);
    if (a.team !== "T" && a.team !== "CT") throw Error("Invalid player side.");
    if (a.faceRoute !== undefined && typeof a.faceRoute !== "boolean")
      throw Error("Invalid facing mode.");
    const waypoints = list(a.waypoints, LIMITS.waypoints).map(coords);
    const holds =
      a.holds === undefined
        ? undefined
        : list(a.holds, waypoints.length).map((v) =>
            number(v, 0, LIMITS.time, "waypoint hold"),
          );
    return {
      id: id(a.id),
      team: a.team,
      start: coords(a.start),
      waypoints,
      ...(holds ? { holds } : {}),
      delay: number(a.delay, 0, LIMITS.time, "start time"),
      speed: number(a.speed, 1, LIMITS.speed, "speed"),
      facing: number(a.facing, -360, 360, "facing"),
      ...(typeof a.faceRoute === "boolean" ? { faceRoute: a.faceRoute } : {}),
    };
  });
  const actorIds = new Set(actors.map((a) => a.id));
  const grenades: Grenade[] = list(data.grenades, LIMITS.grenades).map((v) => {
    const g = record(v);
    if (typeof g.kind !== "string" || !isGrenade(g.kind))
      throw Error("Unknown grenade type.");
    if (
      g.throwerId !== undefined &&
      (typeof g.throwerId !== "string" || !actorIds.has(g.throwerId))
    )
      throw Error("Thrower is not in the rehearsal.");
    const time = number(g.time, 0, LIMITS.time, "detonation time");
    return {
      id: id(g.id),
      kind: g.kind,
      at: coords(g.at),
      time,
      ...(typeof g.throwerId === "string" ? { throwerId: g.throwerId } : {}),
      ...(g.flightSeconds !== undefined
        ? {
            flightSeconds: number(
              g.flightSeconds,
              0,
              Math.min(10, time),
              "flight time",
            ),
          }
        : {}),
      ...(g.duration !== undefined
        ? { duration: number(g.duration, 0.1, LIMITS.duration, "duration") }
        : {}),
    };
  });
  return {
    actors,
    grenades,
    unitsPerBoardUnit: number(
      data.unitsPerBoardUnit,
      LIMITS.minScale,
      LIMITS.maxScale,
      "map scale",
    ),
    walls: list(data.walls ?? [], LIMITS.walls).map((v) => {
      const w = record(v);
      return { a: coords(w.a), b: coords(w.b) };
    }),
  };
}

// Isolated example, measured in game units relative to the demonstration area.
// The two stationary CTs see the same flash from different directions.
export function flashDrill(scale: number, mapId = "mirage"): Scenario {
  // For the stock Mirage radar this centers the drill in the open mid lane,
  // clear of the staircase cutout. The layout is schematic on other artwork.
  const origin = mapId === "mirage" ? { x: 575, y: 440 } : { x: 500, y: 500 };
  const p = (x: number, y: number) => ({
    x: origin.x + x / scale,
    y: origin.y + y / scale,
  });
  return {
    unitsPerBoardUnit: scale,
    walls: [],
    actors: [
      {
        id: "entry",
        team: "T",
        start: p(-320, 180),
        waypoints: [p(-100, 65), p(220, 65)],
        speed: 215,
        delay: 1.4,
        facing: 0,
        faceRoute: true,
      },
      {
        id: "facing",
        team: "CT",
        start: p(160, 0),
        waypoints: [],
        speed: 215,
        delay: 0,
        facing: 180,
        faceRoute: false,
      },
      {
        id: "turned",
        team: "CT",
        start: p(160, -100),
        waypoints: [],
        speed: 215,
        delay: 0,
        facing: 0,
        faceRoute: false,
      },
    ],
    grenades: [
      {
        id: "pop",
        kind: "flash",
        at: p(0, 0),
        time: 1,
        throwerId: "entry",
        flightSeconds: 0.8,
      },
      { id: "fire", kind: "molotov", at: p(160, 0), time: 4 },
      { id: "cover", kind: "smoke", at: p(160, 0), time: 5 },
      { id: "blast", kind: "he", at: p(90, 0), time: 8 },
    ],
  };
}
