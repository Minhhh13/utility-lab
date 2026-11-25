import { MAPS } from "./maps.ts";
import type { UtilityReference } from "./utility-data.ts";
export type View = "home" | "board" | "utilities" | "playbooks" | "stats";
export function parseRoute(hash: string): {
  view: View;
  mapId?: string;
  side: "T" | "CT";
  lineupId?: string;
  levelId?: string;
  cueSheet?: string;
  bookId?: string;
} {
  const [path, query = ""] = hash.replace(/^#/, "").split("?");
  const view: View = ["board", "utilities", "playbooks", "stats"].includes(path)
    ? (path as View)
    : "home";
  const params = new URLSearchParams(query),
    map = MAPS.find((item) => item.id === params.get("map"));
  const id = params.get("lineup");
  const bookId = params.get("book");
  return {
    view,
    ...(view === "playbooks" && params.has("sheet") ? { cueSheet: params.get("sheet")! } : {}),
    ...(view === "playbooks" && bookId && bookId.length <= 100 ? { bookId } : {}),
    ...(map ? { mapId: map.id } : {}),
    side: params.get("side") === "CT" ? "CT" : "T",
    ...(id && id.length <= 160 ? { lineupId: id } : {}),
    ...(map?.levels.some((level) => level.id === params.get("level"))
      ? { levelId: params.get("level")! }
      : {}),
  };
}
export function lineupLink(record: UtilityReference, base: string): string {
  const url = new URL(base);
  url.hash = `utilities?${new URLSearchParams({ map: record.mapId, level: record.levelId, side: record.side, lineup: record.id })}`;
  return url.href;
}
