import test from "node:test";
import assert from "node:assert/strict";
import { emptyPlan } from "../src/board-model.ts";
import { UTILITY_REFERENCES } from "../src/utility-data.ts";
import { createPlaybookFile, mergePlaybookFile, parsePlaybookFile, persistPlaybookImport, validatePlaybook, validatePlaybooks, type Playbook } from "../src/playbook-model.ts";

const tactic = { id: "plan-1", updatedAt: "2026-11-09T00:00:00Z", plan: emptyPlan("mirage", "main") };
const lineup = { ...UTILITY_REFERENCES[0], id: "lineup-1", userCreated: true };
const book: Playbook = { id: "book-1", name: "Match plan", notes: "Trade together.", tacticIds: [tactic.id], lineupIds: [lineup.id], steps: [{ id: "step-1", title: "Throw utility", role: "Support", timing: "1:35", notes: "On the call", tacticId: tactic.id, lineupId: lineup.id }] };

test("legacy collections migrate and round steps preserve ordered role/timing links", () => {
  assert.deepEqual(validatePlaybook({ id: "old", name: "Old collection", notes: "", tacticIds: [], lineupIds: [] })?.steps, []);
  const normalized = validatePlaybook({ ...book, tacticIds: [], lineupIds: [] });
  assert.deepEqual(normalized?.tacticIds, [tactic.id]);
  assert.deepEqual(normalized?.lineupIds, [lineup.id]);
  assert.deepEqual(normalized?.steps, book.steps);
  assert.equal(validatePlaybook({ ...book, steps: [book.steps[0], book.steps[0]] }), null);
  assert.equal(validatePlaybook({ ...book, steps: [{ ...book.steps[0], title: " " }] }), null);
  assert.equal(validatePlaybook({ ...book, name: "x".repeat(101) }), null);
  assert.equal(validatePlaybooks([book, book, { bad: true }]).length, 1);
});

test("portable playbooks restore payloads and ordered links without overwriting ID collisions", () => {
  const portable = parsePlaybookFile(createPlaybookFile(book, [tactic], [lineup]));
  const originalTactic = { ...tactic, plan: { ...tactic.plan, name: "Existing local tactic" } };
  const originalLineup = { ...lineup, title: "Existing local lineup" };
  let id = 0;
  const result = mergePlaybookFile(portable, { books: [book], tactics: [originalTactic], lineups: [originalLineup] }, [], () => `new-${++id}`);
  assert.equal(result.books.length, 2);
  assert.equal(result.tactics[0].plan.name, "Existing local tactic");
  assert.equal(result.lineups[0].title, "Existing local lineup");
  assert.notEqual(result.importedBook.id, book.id);
  const step = result.importedBook.steps[0];
  assert.notEqual(step.tacticId, tactic.id);
  assert.notEqual(step.lineupId, lineup.id);
  assert.equal(result.tactics.find((item) => item.id === step.tacticId)?.plan.name, tactic.plan.name);
  assert.equal(result.lineups.find((item) => item.id === step.lineupId)?.title, lineup.title);
  assert.equal(result.missingReferences, 0);
  assert.equal(book.steps[0].tacticId, tactic.id);
});

test("identical records and bundled reference payloads are reused rather than using personal capacity", () => {
  const builtin = UTILITY_REFERENCES[0];
  const shared = { ...book, lineupIds: [builtin.id], steps: [{ ...book.steps[0], lineupId: builtin.id }] };
  const parsed = parsePlaybookFile(createPlaybookFile(shared, [tactic], [builtin]));
  const merged = mergePlaybookFile(parsed, { books: [], tactics: [tactic], lineups: [] }, [builtin]);
  assert.equal(merged.tactics.length, 1);
  assert.equal(merged.lineups.length, 0);
  assert.equal(merged.importedBook.lineupIds[0], builtin.id);
});

test("missing payload IDs do not accidentally bind to unrelated local records", () => {
  const file = parsePlaybookFile({ format: "utility-lab-playbook", version: 1, book, tactics: [], lineups: [] });
  let id = 0;
  const merged = mergePlaybookFile(file, { books: [], tactics: [tactic], lineups: [lineup] }, [], () => `missing-${++id}`);
  assert.equal(merged.missingReferences, 2);
  assert.notEqual(merged.importedBook.tacticIds[0], tactic.id);
  assert.notEqual(merged.importedBook.lineupIds[0], lineup.id);
  assert.equal(merged.importedBook.steps[0].tacticId, merged.importedBook.tacticIds[0]);
});

test("malformed or nonportable imports reject the entire file", () => {
  const file = createPlaybookFile(book, [tactic], [lineup]);
  assert.throws(() => parsePlaybookFile({ ...file, version: 9 }), /version 1/);
  assert.throws(() => parsePlaybookFile({ ...file, tactics: [tactic, tactic] }), /duplicate ID/);
  assert.throws(() => parsePlaybookFile({ ...file, lineups: [{ ...lineup, source: "javascript:alert(1)" }] }), /lineup is invalid/);
  assert.throws(() => parsePlaybookFile({ ...file, lineups: [{ ...lineup, photos: [{ image: "ul-media:device-only", caption: "Aim" }] }] }), /device-only/);
  assert.throws(() => mergePlaybookFile(file, { books: Array.from({ length: 100 }, (_, index) => ({ ...book, id: `book-${index}` })), tactics: [], lineups: [] }), /100 playbooks/);
});

test("multi-key metadata imports restore original values when storage fails", () => {
  const values = new globalThis.Map<string, string>([["tactics", "original tactics"], ["books", "original books"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => { values.delete(key); }, setItem: (key: string, value: string) => { if (key === "books" && value === "new books") throw new Error("Quota exceeded"); values.set(key, value); } };
  assert.throws(() => persistPlaybookImport(storage, { tactics: "new tactics", photos: "new photos", books: "new books" }), /Quota exceeded/);
  assert.equal(values.get("tactics"), "original tactics");
  assert.equal(values.get("books"), "original books");
  assert.equal(values.has("photos"), false);
});
