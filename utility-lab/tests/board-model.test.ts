import test from "node:test";
import assert from "node:assert/strict";
import {
  commit,
  emptyPlan,
  endpointChanged,
  historyFor,
  redo,
  samplePlan,
  translated,
  undo,
  validatePlan,
  validateSavedTactics,
  validateTacticFile,
} from "../src/board-model.ts";

test("undo and redo preserve complete board edits and branching discards the old future", () => {
  const first = emptyPlan("mirage", "main");
  const second = {
    ...first,
    objects: [{ id: "t1", kind: "t" as const, x: 400, y: 500, number: 1 }],
  };
  const third = { ...second, notes: "Wait for the flash." };
  const history = commit(commit(historyFor(first), second), third);
  assert.deepEqual(undo(history).present, second);
  assert.deepEqual(redo(undo(history)).present, third);
  const branch = commit(undo(history), { ...second, side: "CT" });
  assert.equal(branch.future.length, 0);
  assert.deepEqual(redo(branch), branch);
});

test("dragging a route clamps the whole path at the map boundary without distorting its shape", () => {
  const route = {
    id: "r",
    kind: "route" as const,
    x: 0,
    y: 0,
    points: [
      { x: 100, y: 100 },
      { x: 500, y: 300 },
      { x: 900, y: 800 },
    ],
  };
  const moved = translated(route, 400, -300);
  assert.deepEqual(moved.points, [
    { x: 200, y: 0 },
    { x: 600, y: 200 },
    { x: 1000, y: 700 },
  ]);
  assert.deepEqual(route.points[0], { x: 100, y: 100 });
});

test("a route endpoint can be edited independently without dragging or moving its other points", () => {
  const route = {
    id: "r",
    kind: "route" as const,
    x: 0,
    y: 0,
    points: [
      { x: 100, y: 200 },
      { x: 500, y: 500 },
      { x: 800, y: 900 },
    ],
  };
  const changed = endpointChanged(route, "end", "x", 1200);
  assert.deepEqual(changed.points, [
    { x: 100, y: 200 },
    { x: 500, y: 500 },
    { x: 1000, y: 900 },
  ]);
  assert.deepEqual(endpointChanged(route, "start", "y", -20).points?.[0], {
    x: 100,
    y: 0,
  });
  assert.equal(endpointChanged(route, "end", "x", Number.NaN), route);
});

test("import validation rejects malformed coordinates, duplicate IDs, unsupported objects and oversized boards", () => {
  const plan = samplePlan("mirage", "main");
  assert.deepEqual(validatePlan(plan), plan);
  assert.throws(
    () =>
      validatePlan({ ...plan, objects: [{ ...plan.objects[3], x: Infinity }] }),
    /coordinates/,
  );
  assert.throws(
    () =>
      validatePlan({ ...plan, objects: [plan.objects[0], plan.objects[0]] }),
    /unique ID/,
  );
  assert.throws(
    () =>
      validatePlan({
        ...plan,
        objects: [{ id: "evil", kind: "script", x: 0, y: 0 }],
      }),
    /unknown object/,
  );
  assert.throws(
    () =>
      validatePlan({
        ...plan,
        objects: Array.from({ length: 251 }, (_, index) => ({
          id: `${index}`,
          kind: "t",
          x: 0,
          y: 0,
        })),
      }),
    /250 objects/,
  );
  assert.throws(
    () => validatePlan({ ...plan, name: "a".repeat(101) }),
    /Text fields/,
  );
});

test("JSON files have an explicit format and only bounded raster image data is accepted", () => {
  const plan = emptyPlan("dust2", "main");
  const exported = { format: "utility-lab-tactic", version: 1, plan };
  assert.deepEqual(
    validateTacticFile(JSON.parse(JSON.stringify(exported))),
    exported,
  );
  assert.throws(() => validateTacticFile(plan), /Choose a Utility Lab/);
  assert.throws(
    () =>
      validateTacticFile({
        ...exported,
        mapImage: "https://example.com/a.png",
      }),
    /PNG, JPEG, or WebP/,
  );
  assert.throws(
    () =>
      validateTacticFile({
        ...exported,
        mapImage: "data:image/svg+xml;base64,PHN2Zz4=",
      }),
    /PNG, JPEG, or WebP/,
  );
  assert.throws(
    () =>
      validateTacticFile({
        ...exported,
        mapImage: `data:image/png;base64,${"A".repeat(2_000_000)}`,
      }),
    /Text fields/,
  );
});

test("corrupted saved entries are isolated and duplicate saved IDs cannot shadow tactics", () => {
  const valid = {
    id: "saved-1",
    updatedAt: "2026-11-09T00:00:00.000Z",
    plan: emptyPlan("nuke", "upper"),
  };
  const entries = validateSavedTactics([
    null,
    { ...valid, id: "bad-date", updatedAt: "yesterday" },
    valid,
    { ...valid, plan: { ...valid.plan, name: "Shadow" } },
  ]);
  assert.deepEqual(entries, [valid]);
});
