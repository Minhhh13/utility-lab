import {
  uid,
  validateSavedTactics,
  validateTacticFile,
  type SavedTactic,
  type TacticFile,
} from "./board-model.ts";
import { MAPS } from "./maps.ts";
import {
  validatePlaybooks,
  type Playbook,
  BOOKS_KEY,
  TACTICS_KEY,
  persistPlaybookImport,
} from "./playbook-model.ts";
import {
  validateUtility,
  USER_UTILITIES_KEY,
  FAVORITE_UTILITIES_KEY,
  MAX_USER_UTILITIES,
  type UtilityReference,
} from "./utility-data.ts";

export const MAX_WORKSPACE_BYTES = 256_000_000;
export type WorkspaceBackup = {
  format: "utility-lab-workspace";
  version: 1;
  createdAt: string;
  tactics: SavedTactic[];
  lineups: UtilityReference[];
  books: Playbook[];
  favorites: string[];
  drafts: TacticFile[];
  appearance: {
    mode: "light" | "dark" | "system";
    palette: "cobalt" | "ember" | "mint" | "rose";
  };
};
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const read = (
  storage: Pick<Storage, "getItem">,
  key: string,
  fallback: unknown,
) => {
  try {
    return JSON.parse(storage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
export function captureWorkspace(
  storage: Pick<Storage, "getItem">,
): WorkspaceBackup {
  const rawLineups = read(storage, USER_UTILITIES_KEY, []);
  const drafts: TacticFile[] = [];
  for (const map of MAPS)
    for (const level of map.levels) {
      const plan = read(
        storage,
        `utility-lab:draft:v1:${map.id}:${level.id}`,
        null,
      );
      if (!plan) continue;
      try {
        drafts.push(
          validateTacticFile({
            format: "utility-lab-tactic",
            version: 1,
            plan,
            mapImage:
              storage.getItem(`utility-lab:radar:v1:${map.id}:${level.id}`) ||
              undefined,
          }),
        );
      } catch {
        /* Isolate malformed legacy drafts. */
      }
    }
  const appearance = read(storage, "ul:appearance", null);
  return {
    format: "utility-lab-workspace",
    version: 1,
    createdAt: new Date().toISOString(),
    tactics: validateSavedTactics(read(storage, TACTICS_KEY, [])),
    lineups: (Array.isArray(rawLineups) ? rawLineups : []).flatMap((value) => {
      const item = validateUtility(value);
      return item ? [item] : [];
    }),
    books: validatePlaybooks(read(storage, BOOKS_KEY, [])),
    favorites: Array.isArray(read(storage, FAVORITE_UTILITIES_KEY, []))
      ? (read(storage, FAVORITE_UTILITIES_KEY, []) as unknown[])
          .filter((v): v is string => typeof v === "string" && v.length <= 160)
          .slice(0, 500)
      : [],
    drafts,
    appearance:
      isObject(appearance) &&
      ["light", "dark", "system"].includes(String(appearance.mode)) &&
      ["cobalt", "ember", "mint", "rose"].includes(String(appearance.palette))
        ? (appearance as WorkspaceBackup["appearance"])
        : { mode: "light", palette: "cobalt" },
  };
}
export function parseWorkspaceBackup(value: unknown): WorkspaceBackup {
  if (
    !isObject(value) ||
    value.format !== "utility-lab-workspace" ||
    value.version !== 1
  )
    throw new Error("Choose a Utility Lab workspace backup (version 1).");
  if (
    ![
      value.tactics,
      value.lineups,
      value.books,
      value.favorites,
      value.drafts,
    ].every(Array.isArray)
  )
    throw new Error("The workspace backup is missing its record lists.");
  const raw = value as unknown as WorkspaceBackup;
  if (
    raw.tactics.length > 100 ||
    raw.lineups.length > MAX_USER_UTILITIES ||
    raw.books.length > 100 ||
    raw.favorites.length > 500 ||
    raw.drafts.length > 10
  )
    throw new Error("This backup exceeds the supported workspace limits.");
  const tactics = validateSavedTactics(raw.tactics),
    books = validatePlaybooks(raw.books),
    lineups = raw.lineups.map(validateUtility);
  if (
    tactics.length !== raw.tactics.length ||
    books.length !== raw.books.length ||
    lineups.some((item) => !item) ||
    new Set(lineups.map((item) => item!.id)).size !== lineups.length
  )
    throw new Error(
      "This backup contains invalid or duplicate records. Your workspace has not changed.",
    );
  if (
    lineups.some((item) =>
      [item!.image, ...(item!.photos || []).map((photo) => photo.image)].some(
        (image) => image?.startsWith("ul-media:"),
      ),
    )
  )
    throw new Error(
      "This file is missing its photo bytes. Export a complete backup from the original device.",
    );
  if (
    !raw.favorites.every(
      (id) => typeof id === "string" && id.length > 0 && id.length <= 160,
    )
  )
    throw new Error("This backup contains invalid saved references.");
  const drafts = raw.drafts.map(validateTacticFile);
  const keys = drafts.map((item) => `${item.plan.mapId}:${item.plan.levelId}`);
  if (
    new Set(keys).size !== keys.length ||
    drafts.some(
      (item) =>
        !MAPS.some(
          (map) =>
            map.id === item.plan.mapId &&
            map.levels.some((level) => level.id === item.plan.levelId),
        ),
    )
  )
    throw new Error(
      "This backup contains duplicate or unsupported map drafts.",
    );
  const appearance =
    isObject(raw.appearance) &&
    ["light", "dark", "system"].includes(String(raw.appearance.mode)) &&
    ["cobalt", "ember", "mint", "rose"].includes(String(raw.appearance.palette))
      ? raw.appearance
      : { mode: "light" as const, palette: "cobalt" as const };
  return {
    format: "utility-lab-workspace",
    version: 1,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt.slice(0, 40) : "",
    tactics,
    books,
    lineups: lineups as UtilityReference[],
    favorites: [...new Set(raw.favorites)],
    drafts,
    appearance,
  };
}
/** Merge imports as copies on conflict; never silently replace a local record. */
export function mergeWorkspace(
  current: WorkspaceBackup,
  incoming: WorkspaceBackup,
  makeId = uid,
): WorkspaceBackup {
  const next = structuredClone(current),
    tacticMap = new Map<string, string>(),
    lineupMap = new Map<string, string>();
  const fresh = (occupied: Set<string>) => {
    let id = makeId();
    for (let i = 0; occupied.has(id) && i < 100; i++) id = makeId();
    if (occupied.has(id))
      throw new Error("Could not assign a unique imported record ID.");
    occupied.add(id);
    return id;
  };
  const tacticIds = new Set(next.tactics.map((item) => item.id)),
    lineupIds = new Set(next.lineups.map((item) => item.id));
  for (const item of incoming.tactics) {
    const existing = next.tactics.find((v) => v.id === item.id);
    if (
      existing &&
      JSON.stringify(existing.plan) === JSON.stringify(item.plan)
    ) {
      tacticMap.set(item.id, existing.id);
      continue;
    }
    const id = tacticIds.has(item.id) ? fresh(tacticIds) : item.id;
    tacticIds.add(id);
    tacticMap.set(item.id, id);
    next.tactics.push({ ...item, id });
  }
  for (const item of incoming.lineups) {
    const existing = next.lineups.find((v) => v.id === item.id);
    if (existing && JSON.stringify(existing) === JSON.stringify(item)) {
      lineupMap.set(item.id, existing.id);
      continue;
    }
    const id = lineupIds.has(item.id) ? fresh(lineupIds) : item.id;
    lineupIds.add(id);
    lineupMap.set(item.id, id);
    next.lineups.push({ ...item, id });
  }
  const mapTactic = (id: string) => {
    if (!tacticMap.has(id))
      tacticMap.set(id, tacticIds.has(id) ? fresh(tacticIds) : id);
    return tacticMap.get(id)!;
  };
  const mapLineup = (id: string) => {
    if (!lineupMap.has(id))
      lineupMap.set(id, lineupIds.has(id) ? fresh(lineupIds) : id);
    return lineupMap.get(id)!;
  };
  const bookIds = new Set(next.books.map((item) => item.id));
  for (const item of incoming.books) {
    const mapped = {
      ...item,
      tacticIds: item.tacticIds.map(mapTactic),
      lineupIds: item.lineupIds.map(mapLineup),
      steps: item.steps.map((step) => ({
        ...step,
        ...(step.tacticId ? { tacticId: mapTactic(step.tacticId) } : {}),
        ...(step.lineupId ? { lineupId: mapLineup(step.lineupId) } : {}),
      })),
    };
    if (next.books.some((v) => JSON.stringify(v) === JSON.stringify(mapped)))
      continue;
    const id = bookIds.has(mapped.id) ? fresh(bookIds) : mapped.id;
    bookIds.add(id);
    next.books.push({ ...mapped, id });
  }
  next.favorites = [
    ...new Set([
      ...next.favorites,
      ...incoming.favorites.map((id) => lineupMap.get(id) || id),
    ]),
  ];
  for (const draft of incoming.drafts)
    if (
      !next.drafts.some(
        (item) =>
          item.plan.mapId === draft.plan.mapId &&
          item.plan.levelId === draft.plan.levelId,
      )
    )
      next.drafts.push(draft);
  if (
    next.tactics.length > 100 ||
    next.lineups.length > MAX_USER_UTILITIES ||
    next.books.length > 100 ||
    next.favorites.length > 500
  )
    throw new Error(
      "The combined workspace exceeds local record limits. Export and remove records before importing this backup.",
    );
  return next;
}
export function persistWorkspace(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  value: WorkspaceBackup,
  includeAppearance = false,
): void {
  const values: Record<string, string> = {
    [TACTICS_KEY]: JSON.stringify(value.tactics),
    [USER_UTILITIES_KEY]: JSON.stringify(value.lineups),
    [BOOKS_KEY]: JSON.stringify(value.books),
    [FAVORITE_UTILITIES_KEY]: JSON.stringify(value.favorites),
  };
  for (const { plan, mapImage } of value.drafts) {
    values[`utility-lab:draft:v1:${plan.mapId}:${plan.levelId}`] =
      JSON.stringify(plan);
    if (mapImage)
      values[`utility-lab:radar:v1:${plan.mapId}:${plan.levelId}`] = mapImage;
  }
  if (includeAppearance)
    values["ul:appearance"] = JSON.stringify(value.appearance);
  persistPlaybookImport(storage, values);
}
