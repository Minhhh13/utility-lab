export type XY = { x: number; y: number };
export type ObjectKind =
  "t" | "ct" | "route" | "pen" | "smoke" | "flash" | "molotov" | "he" | "text";
export type BoardObject = {
  id: string;
  kind: ObjectKind;
  x: number;
  y: number;
  points?: XY[];
  label?: string;
  number?: number;
};
export type BoardPlan = {
  version: 1;
  mapId: string;
  levelId: string;
  name: string;
  side: "T" | "CT";
  notes: string;
  objects: BoardObject[];
  illustrative: boolean;
};
export type SavedTactic = { id: string; updatedAt: string; plan: BoardPlan };
export type BoardHistory = {
  present: BoardPlan;
  past: BoardPlan[];
  future: BoardPlan[];
};
export type TacticFile = {
  format: "utility-lab-tactic";
  version: 1;
  plan: BoardPlan;
  mapImage?: string;
};
const kinds: ObjectKind[] = [
  "t",
  "ct",
  "route",
  "pen",
  "smoke",
  "flash",
  "molotov",
  "he",
  "text",
];
export const MAX_OBJECTS = 250;
export const clamp = (value: number, min = 0, max = 1000) =>
  Math.min(max, Math.max(min, value));
export function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
export function emptyPlan(mapId: string, levelId: string): BoardPlan {
  return {
    version: 1,
    mapId,
    levelId,
    name: "Untitled strategy",
    side: "T",
    notes: "",
    objects: [],
    illustrative: false,
  };
}
export function samplePlan(mapId: string, levelId: string): BoardPlan {
  const plan = emptyPlan(mapId, levelId);
  if (mapId !== "mirage") return plan;
  return {
    ...plan,
    name: "A site execute",
    illustrative: true,
    notes:
      "Editable example: coordinate the three smokes, send two players through ramp, and split from palace. Check positions and timings in a practice server before using this plan.",
    objects: [
      {
        id: "sample-route-1",
        kind: "route",
        x: 0,
        y: 0,
        points: [
          { x: 790, y: 718 },
          { x: 795, y: 560 },
          { x: 695, y: 456 },
        ],
      },
      {
        id: "sample-route-2",
        kind: "route",
        x: 0,
        y: 0,
        points: [
          { x: 899, y: 660 },
          { x: 905, y: 486 },
          { x: 825, y: 420 },
        ],
      },
      {
        id: "sample-route-3",
        kind: "route",
        x: 0,
        y: 0,
        points: [
          { x: 751, y: 799 },
          { x: 711, y: 670 },
          { x: 779, y: 550 },
        ],
      },
      { id: "sample-smoke-1", kind: "smoke", x: 626, y: 394, label: "CT" },
      { id: "sample-smoke-2", kind: "smoke", x: 692, y: 341, label: "Stairs" },
      { id: "sample-smoke-3", kind: "smoke", x: 626, y: 312, label: "Jungle" },
      { id: "sample-flash-1", kind: "flash", x: 772, y: 415 },
      { id: "sample-t-1", kind: "t", x: 782, y: 625, number: 1 },
      { id: "sample-t-2", kind: "t", x: 818, y: 695, number: 2 },
      { id: "sample-t-3", kind: "t", x: 900, y: 594, number: 3 },
      { id: "sample-t-4", kind: "t", x: 754, y: 760, number: 4 },
      { id: "sample-t-5", kind: "t", x: 828, y: 816, number: 5 },
    ],
  };
}
export function historyFor(plan: BoardPlan): BoardHistory {
  return { present: plan, past: [], future: [] };
}
export function commit(history: BoardHistory, plan: BoardPlan): BoardHistory {
  if (JSON.stringify(history.present) === JSON.stringify(plan)) return history;
  return {
    present: plan,
    past: [...history.past, history.present].slice(-60),
    future: [],
  };
}
export function undo(history: BoardHistory): BoardHistory {
  if (!history.past.length) return history;
  return {
    present: history.past[history.past.length - 1],
    past: history.past.slice(0, -1),
    future: [history.present, ...history.future].slice(0, 60),
  };
}
export function redo(history: BoardHistory): BoardHistory {
  if (!history.future.length) return history;
  return {
    present: history.future[0],
    past: [...history.past, history.present].slice(-60),
    future: history.future.slice(1),
  };
}
export function translated(
  object: BoardObject,
  dx: number,
  dy: number,
): BoardObject {
  if (object.points?.length) {
    const minX = Math.min(...object.points.map((point) => point.x));
    const maxX = Math.max(...object.points.map((point) => point.x));
    const minY = Math.min(...object.points.map((point) => point.y));
    const maxY = Math.max(...object.points.map((point) => point.y));
    const boundedX = clamp(dx, -minX, 1000 - maxX);
    const boundedY = clamp(dy, -minY, 1000 - maxY);
    return {
      ...object,
      points: object.points.map((point) => ({
        x: point.x + boundedX,
        y: point.y + boundedY,
      })),
    };
  }
  return { ...object, x: clamp(object.x + dx), y: clamp(object.y + dy) };
}
export function endpointChanged(
  object: BoardObject,
  endpoint: "start" | "end",
  axis: "x" | "y",
  value: number,
): BoardObject {
  if (
    object.kind !== "route" ||
    !object.points?.length ||
    !Number.isFinite(value)
  )
    return object;
  const index = endpoint === "start" ? 0 : object.points.length - 1;
  return {
    ...object,
    points: object.points.map((point, pointIndex) =>
      pointIndex === index ? { ...point, [axis]: clamp(value) } : point,
    ),
  };
}
export function objectLabel(object: BoardObject): string {
  const labels: Record<ObjectKind, string> = {
    t: "T player",
    ct: "CT player",
    route: "Route",
    pen: "Drawing",
    smoke: "Smoke",
    flash: "Flash",
    molotov: "Molotov",
    he: "HE grenade",
    text: "Text",
  };
  return `${labels[object.kind]}${object.number ? ` ${object.number}` : ""}${object.label ? ` · ${object.label}` : ""}`;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown, max: number, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "string" || value.length > max)
    throw new Error(`Text fields must be shorter than ${max + 1} characters.`);
  return value;
}
function coordinate(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1000
  )
    throw new Error("Object coordinates must be finite and within the map.");
  return value;
}
export function validatePlan(value: unknown): BoardPlan {
  if (!record(value) || value.version !== 1)
    throw new Error("This is not a supported Utility Lab tactic.");
  const mapId = text(value.mapId, 80),
    levelId = text(value.levelId, 80);
  if (!/^[a-z0-9_-]+$/i.test(mapId) || !/^[a-z0-9_-]+$/i.test(levelId))
    throw new Error("The tactic has an invalid map or level.");
  if (value.side !== "T" && value.side !== "CT")
    throw new Error("The tactic must have a T or CT side.");
  if (!Array.isArray(value.objects) || value.objects.length > MAX_OBJECTS)
    throw new Error(`Tactics can contain up to ${MAX_OBJECTS} objects.`);
  const ids = new Set<string>();
  const objects = value.objects.map((raw): BoardObject => {
    if (!record(raw) || !kinds.includes(raw.kind as ObjectKind))
      throw new Error("The tactic contains an unknown object.");
    const id = text(raw.id, 100);
    if (!id || ids.has(id))
      throw new Error("Every object must have a unique ID.");
    ids.add(id);
    const kind = raw.kind as ObjectKind;
    const item: BoardObject = {
      id,
      kind,
      x: coordinate(raw.x),
      y: coordinate(raw.y),
    };
    if (raw.label !== undefined) item.label = text(raw.label, 80);
    if (raw.number !== undefined) {
      if (
        typeof raw.number !== "number" ||
        !Number.isInteger(raw.number) ||
        raw.number < 1 ||
        raw.number > 99
      )
        throw new Error("Player numbers must be between 1 and 99.");
      item.number = raw.number;
    }
    if (kind === "route" || kind === "pen") {
      if (
        !Array.isArray(raw.points) ||
        raw.points.length < 2 ||
        raw.points.length > 800
      )
        throw new Error("Routes and drawings need 2–800 points.");
      item.points = raw.points.map((point) => {
        if (!record(point))
          throw new Error("The tactic contains an invalid path.");
        return { x: coordinate(point.x), y: coordinate(point.y) };
      });
    }
    return item;
  });
  return {
    version: 1,
    mapId,
    levelId,
    name: text(value.name, 100).trim() || "Untitled strategy",
    side: value.side,
    notes: text(value.notes, 8000, ""),
    objects,
    illustrative: value.illustrative === true,
  };
}
export function validateTacticFile(value: unknown): TacticFile {
  if (
    !record(value) ||
    value.format !== "utility-lab-tactic" ||
    value.version !== 1
  )
    throw new Error("Choose a Utility Lab tactic JSON file.");
  const plan = validatePlan(value.plan);
  let mapImage: string | undefined;
  if (value.mapImage !== undefined) {
    mapImage = text(value.mapImage, 2_000_000);
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(mapImage))
      throw new Error("The included map image must be PNG, JPEG, or WebP.");
  }
  return {
    format: "utility-lab-tactic",
    version: 1,
    plan,
    ...(mapImage ? { mapImage } : {}),
  };
}
export function validateSavedTactics(value: unknown): SavedTactic[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.slice(0, 100).flatMap((raw) => {
    try {
      if (!record(raw)) return [];
      const id = text(raw.id, 100),
        updatedAt = text(raw.updatedAt, 40);
      if (!id || ids.has(id) || !Number.isFinite(Date.parse(updatedAt)))
        return [];
      const plan = validatePlan(raw.plan);
      ids.add(id);
      return [{ id, updatedAt, plan }];
    } catch {
      return [];
    }
  });
}
