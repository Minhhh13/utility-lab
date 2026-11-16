import { uid, validateSavedTactics, type SavedTactic } from "./board-model.ts";
import {
  MAX_USER_UTILITIES,
  validateUtility,
  type UtilityReference,
} from "./utility-data.ts";

export const BOOKS_KEY = "utility-lab:playbooks:v1";
export const PLAYBOOK_DRAFT_KEY = "utility-lab:playbook-draft:v1";
export const TACTICS_KEY = "utility-lab:tactics:v1";
export const MAX_PLAYBOOKS = 100;
export const MAX_PLAYBOOK_STEPS = 40;
export const MAX_PLAYBOOK_FILE_BYTES = 250_000_000;
export type PlaybookStep = {
  id: string;
  title: string;
  role: string;
  timing: string;
  notes: string;
  tacticId?: string;
  lineupId?: string;
};
export type Playbook = {
  id: string;
  name: string;
  notes: string;
  tacticIds: string[];
  lineupIds: string[];
  steps: PlaybookStep[];
};
export type PlaybookDraft = Playbook & { editingId: string | null };
export type PlaybookFile = {
  format: "utility-lab-playbook";
  version: 1;
  book: Playbook;
  tactics: SavedTactic[];
  lineups: UtilityReference[];
};
export type PlaybookWorkspace = {
  books: Playbook[];
  tactics: SavedTactic[];
  lineups: UtilityReference[];
};
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length <= max;
function ids(value: unknown): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length > 100 ||
    !value.every((id) => text(id, 160) && !!id.trim())
  )
    return null;
  return [...new Set(value as string[])];
}
export function validatePlaybook(value: unknown): Playbook | null {
  if (
    !record(value) ||
    !text(value.id, 100) ||
    !value.id.trim() ||
    !text(value.name, 100) ||
    !value.name.trim() ||
    !text(value.notes ?? "", 2000)
  )
    return null;
  const tacticIds = ids(value.tacticIds ?? []),
    lineupIds = ids(value.lineupIds ?? []);
  if (
    !tacticIds ||
    !lineupIds ||
    (value.steps !== undefined &&
      (!Array.isArray(value.steps) || value.steps.length > MAX_PLAYBOOK_STEPS))
  )
    return null;
  const steps: PlaybookStep[] = [],
    seen = new Set<string>();
  for (const raw of (value.steps ?? []) as unknown[]) {
    if (
      !record(raw) ||
      !text(raw.id, 100) ||
      !raw.id.trim() ||
      seen.has(raw.id) ||
      !text(raw.title, 120) ||
      !raw.title.trim() ||
      !text(raw.role ?? "", 100) ||
      !text(raw.timing ?? "", 80) ||
      !text(raw.notes ?? "", 1000)
    )
      return null;
    if (
      (raw.tacticId !== undefined &&
        (!text(raw.tacticId, 160) || !raw.tacticId.trim())) ||
      (raw.lineupId !== undefined &&
        (!text(raw.lineupId, 160) || !raw.lineupId.trim()))
    )
      return null;
    seen.add(raw.id);
    steps.push({
      id: raw.id,
      title: raw.title.trim(),
      role: (raw.role ?? "") as string,
      timing: (raw.timing ?? "") as string,
      notes: (raw.notes ?? "") as string,
      ...(raw.tacticId ? { tacticId: raw.tacticId as string } : {}),
      ...(raw.lineupId ? { lineupId: raw.lineupId as string } : {}),
    });
    if (raw.tacticId && !tacticIds.includes(raw.tacticId as string))
      tacticIds.push(raw.tacticId as string);
    if (raw.lineupId && !lineupIds.includes(raw.lineupId as string))
      lineupIds.push(raw.lineupId as string);
  }
  if (tacticIds.length > 100 || lineupIds.length > 100) return null;
  return {
    id: value.id,
    name: value.name.trim(),
    notes: (value.notes ?? "") as string,
    tacticIds,
    lineupIds,
    steps,
  };
}
export function validatePlaybooks(value: unknown): Playbook[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, MAX_PLAYBOOKS).flatMap((raw) => {
    const book = validatePlaybook(raw);
    if (!book || seen.has(book.id)) return [];
    seen.add(book.id);
    return [book];
  });
}
export function readPlaybooks(): Playbook[] {
  try {
    return validatePlaybooks(
      JSON.parse(localStorage.getItem(BOOKS_KEY) || "[]"),
    );
  } catch {
    return [];
  }
}
export function readPlaybookDraft(): PlaybookDraft | null {
  try {
    const raw: unknown = JSON.parse(
      sessionStorage.getItem(PLAYBOOK_DRAFT_KEY) || "null",
    );
    if (!record(raw) || !(raw.editingId === null || text(raw.editingId, 100)))
      return null;
    // Untitled/empty steps are valid while editing, but never persisted as saved playbooks.
    const editingId = raw.editingId as string | null;
    const candidate = validatePlaybook({
      ...raw,
      name:
        text(raw.name, 100) && raw.name.trim() ? raw.name : "Untitled playbook",
      steps: Array.isArray(raw.steps)
        ? raw.steps.map((step) =>
            record(step)
              ? {
                  ...step,
                  title:
                    text(step.title, 120) && step.title.trim()
                      ? step.title
                      : "Untitled step",
                }
              : step,
          )
        : [],
    });
    if (!candidate) return null;
    return {
      ...candidate,
      name: text(raw.name, 100) ? raw.name : "",
      steps: candidate.steps.map((step, index) => ({
        ...step,
        title:
          record((raw.steps as unknown[])?.[index]) &&
          text(
            ((raw.steps as unknown[])[index] as Record<string, unknown>).title,
            120,
          )
            ? (((raw.steps as unknown[])[index] as Record<string, unknown>)
                .title as string)
            : step.title,
      })),
      editingId,
    };
  } catch {
    return null;
  }
}
export function createPlaybookFile(
  book: Playbook,
  tactics: SavedTactic[],
  lineups: UtilityReference[],
): PlaybookFile {
  return {
    format: "utility-lab-playbook",
    version: 1,
    book,
    tactics: tactics.filter((item) => book.tacticIds.includes(item.id)),
    lineups: lineups.filter((item) => book.lineupIds.includes(item.id)),
  };
}
export function parsePlaybookFile(value: unknown): PlaybookFile {
  if (
    !record(value) ||
    value.format !== "utility-lab-playbook" ||
    value.version !== 1 ||
    !record(value.book)
  )
    throw new Error("Choose a Utility Lab playbook JSON file (version 1).");
  const book = validatePlaybook({ ...value.book, id: value.book.id || uid() });
  if (!book)
    throw new Error(
      "This playbook contains invalid names, references or round steps.",
    );
  if (
    !Array.isArray(value.tactics) ||
    value.tactics.length > 100 ||
    !Array.isArray(value.lineups) ||
    value.lineups.length > 100
  )
    throw new Error(
      "The playbook has too many records or is missing its tactics/lineups arrays.",
    );
  const tactics = validateSavedTactics(value.tactics);
  if (tactics.length !== value.tactics.length)
    throw new Error(
      "A saved tactic is invalid or has a duplicate ID. Nothing was imported.",
    );
  const lineups: UtilityReference[] = [],
    seen = new Set<string>();
  for (const raw of value.lineups) {
    if (
      record(raw) &&
      ((typeof raw.image === "string" && raw.image.startsWith("ul-media:")) ||
        (Array.isArray(raw.photos) &&
          raw.photos.some(
            (photo) =>
              record(photo) &&
              typeof photo.image === "string" &&
              photo.image.startsWith("ul-media:"),
          )))
    )
      throw new Error(
        "This file contains device-only image references. Export the playbook again from its original device to include the photos.",
      );
    const item = validateUtility(raw);
    if (!item || seen.has(item.id))
      throw new Error(
        "A lineup is invalid or has a duplicate ID. Nothing was imported.",
      );
    lineups.push(item);
    seen.add(item.id);
  }
  return { format: "utility-lab-playbook", version: 1, book, tactics, lineups };
}
const sameLineup = (a: UtilityReference, b: UtilityReference) =>
  JSON.stringify(validateUtility(a)) === JSON.stringify(validateUtility(b));
export function mergePlaybookFile(
  file: PlaybookFile,
  existing: PlaybookWorkspace,
  knownLineups: UtilityReference[] = [],
  makeId: () => string = uid,
): PlaybookWorkspace & { importedBook: Playbook; missingReferences: number } {
  const books = [...existing.books],
    tactics = [...existing.tactics],
    lineups = [...existing.lineups];
  if (books.length >= MAX_PLAYBOOKS)
    throw new Error(
      "This browser has 100 playbooks. Export and remove one before importing another.",
    );
  const tacticMap = new Map<string, string>(),
    lineupMap = new Map<string, string>();
  function unique(occupied: Set<string>) {
    let id = makeId();
    let tries = 0;
    while (occupied.has(id) && tries++ < 20) id = makeId();
    if (occupied.has(id))
      throw new Error("Could not allocate a new record ID. Please retry.");
    occupied.add(id);
    return id;
  }
  const tacticOccupied = new Set(tactics.map((item) => item.id)),
    lineupOccupied = new Set(
      [...lineups, ...knownLineups].map((item) => item.id),
    );
  for (const item of file.tactics) {
    const match = tactics.find((current) => current.id === item.id);
    if (match && JSON.stringify(match.plan) === JSON.stringify(item.plan)) {
      tacticMap.set(item.id, match.id);
      continue;
    }
    const id = tacticOccupied.has(item.id) ? unique(tacticOccupied) : item.id;
    tacticOccupied.add(id);
    tacticMap.set(item.id, id);
    tactics.push({ ...item, id });
  }
  for (const item of file.lineups) {
    const match = [...lineups, ...knownLineups].find(
      (current) => current.id === item.id && sameLineup(current, item),
    );
    if (match) {
      lineupMap.set(item.id, match.id);
      continue;
    }
    const id = lineupOccupied.has(item.id) ? unique(lineupOccupied) : item.id;
    lineupOccupied.add(id);
    lineupMap.set(item.id, id);
    lineups.push({ ...item, id, userCreated: true });
  }
  if (tactics.length > 100 || lineups.length > MAX_USER_UTILITIES)
    throw new Error(
      "This import exceeds this browser's limit of 100 tactics or 80 personal lineups. Export and remove records first.",
    );
  // Missing payload references must not accidentally attach to an unrelated local ID.
  for (const id of file.book.tacticIds)
    if (!tacticMap.has(id))
      tacticMap.set(id, tacticOccupied.has(id) ? unique(tacticOccupied) : id);
  for (const id of file.book.lineupIds)
    if (!lineupMap.has(id))
      lineupMap.set(
        id,
        knownLineups.some((item) => item.id === id)
          ? id
          : lineupOccupied.has(id)
            ? unique(lineupOccupied)
            : id,
      );
  const bookId = books.some((item) => item.id === file.book.id)
    ? unique(new Set(books.map((item) => item.id)))
    : file.book.id;
  const importedBook: Playbook = {
    ...file.book,
    id: bookId,
    tacticIds: file.book.tacticIds.map((id) => tacticMap.get(id)!),
    lineupIds: file.book.lineupIds.map((id) => lineupMap.get(id)!),
    steps: file.book.steps.map((step) => ({
      ...step,
      ...(step.tacticId ? { tacticId: tacticMap.get(step.tacticId)! } : {}),
      ...(step.lineupId ? { lineupId: lineupMap.get(step.lineupId)! } : {}),
    })),
  };
  books.unshift(importedBook);
  const missingReferences =
    importedBook.tacticIds.filter(
      (id) => !tactics.some((item) => item.id === id),
    ).length +
    importedBook.lineupIds.filter(
      (id) => ![...lineups, ...knownLineups].some((item) => item.id === id),
    ).length;
  return { books, tactics, lineups, importedBook, missingReferences };
}
/** Multi-key imports roll back every touched key if a storage write fails. */
export function persistPlaybookImport(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  values: Record<string, string>,
): void {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, storage.getItem(key)]),
  );
  const written: string[] = [];
  try {
    for (const [key, value] of Object.entries(values)) {
      storage.setItem(key, value);
      written.push(key);
    }
  } catch (error) {
    for (const key of written.reverse()) {
      try {
        previous[key] === null
          ? storage.removeItem(key)
          : storage.setItem(key, previous[key]!);
      } catch {
        /* Preserve original error; storage may have become unavailable. */
      }
    }
    throw error;
  }
}
