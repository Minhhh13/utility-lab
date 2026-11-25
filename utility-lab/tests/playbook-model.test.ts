import test from "node:test";
import assert from "node:assert/strict";
import { emptyPlan } from "../src/board-model.ts";
import { UTILITY_REFERENCES } from "../src/utility-data.ts";
import {
  createPlaybookFile, createRoundSetup, getRoundPlan, MAX_CUE_SECONDS, mergePlaybookFile,
  parsePlaybookFile, persistPlaybookImport, PLAYBOOK_DRAFT_KEY, readPlaybookDraft,
  validatePlaybook, validatePlaybooks, type Playbook,
} from "../src/playbook-model.ts";

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

test("legacy timing and explicit slots become a rehearsal timeline without changing the original", () => {
  const steps = [
    { ...book.steps[0], role: "Support · Player 3", timing: "1:35 · On the call" },
    { ...book.steps[0], id: "s2", role: "Support", timing: "When the site is clear" },
    { ...book.steps[0], id: "s3", role: "Team", timing: "1:30" },
  ];
  const old = { ...book, steps };
  const linked = { ...tactic, plan: emptyPlan("nuke", "lower") };
  const result = getRoundPlan(old, [linked]);
  assert.deepEqual(result.steps.map((step) => step.atSeconds), [20, 25, 25]);
  assert.deepEqual(result.steps.map((step) => step.playerId), ["p3", undefined, undefined]);
  assert.deepEqual(result.steps.map((step) => step.timing), old.steps.map((step) => step.timing));
  assert.deepEqual(result.round, createRoundSetup("nuke", "lower"));
  assert.equal(result.round.players.length, 5);
  assert.equal("round" in old, false);
  assert.equal("atSeconds" in old.steps[0], false);
});

test("five-player round files preserve cues and collect links made directly on a cue", () => {
  const round = createRoundSetup("vertigo", "lower");
  round.players[3] = { id: "p4", name: "Lee", role: "Support" };
  const cue = { ...book.steps[0], playerId: "p4" as const, atSeconds: 0 };
  const plan = { ...book, round, steps: [cue], tacticIds: [], lineupIds: [] };
  const file = parsePlaybookFile(JSON.parse(JSON.stringify(createPlaybookFile(plan, [tactic], [lineup]))));
  assert.deepEqual(file.book.round, round);
  assert.deepEqual(file.book.steps, [cue]);
  assert.deepEqual(file.tactics.map((item) => item.id), [tactic.id]);
  assert.deepEqual(file.lineups.map((item) => item.id), [lineup.id]);
  assert.deepEqual(getRoundPlan(file.book).steps, [cue]);
});

test("invalid round floors, duplicate slots, oversized labels and out-of-range cues reject the whole plan", () => {
  const round = createRoundSetup("nuke");
  const player = round.players[0];
  for (const invalid of [
    null, { ...round, mapId: "unknown" }, { ...round, levelId: "main" },
    { ...round, players: round.players.slice(0, 4) },
    { ...round, players: [player, ...round.players.slice(0, 4)] },
    { ...round, players: [{ ...player, name: "x".repeat(61) }, ...round.players.slice(1)] },
  ]) assert.equal(validatePlaybook({ ...book, round: invalid }), null);
  for (const invalid of [
    { playerId: "p6" }, { atSeconds: -1 }, { atSeconds: Infinity }, { atSeconds: 0.5 },
    { atSeconds: "20" }, { atSeconds: MAX_CUE_SECONDS + 1 },
  ]) assert.equal(validatePlaybook({ ...book, round, steps: [{ ...book.steps[0], ...invalid }] }), null);
  assert.equal(validatePlaybook({ ...book, round, steps: [{ ...book.steps[0], atSeconds: MAX_CUE_SECONDS }] })?.steps[0].atSeconds, MAX_CUE_SECONDS);
});

test("draft recovery keeps unfinished times, empty titles, the full roster and cue-only links", () => {
  const round = createRoundSetup();
  for (const time of [0, undefined, -1, 0.5, MAX_CUE_SECONDS + 1]) {
    const raw = {
      ...book, name: "", editingId: book.id, round, tacticIds: [], lineupIds: [],
      steps: [{ ...book.steps[0], title: "", playerId: "p1", ...(time === undefined ? {} : { atSeconds: time }) }],
    };
    const recovered = readPlaybookDraft({ getItem: (key) => key === PLAYBOOK_DRAFT_KEY ? JSON.stringify(raw) : null });
    assert.deepEqual(recovered, raw);
  }
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
