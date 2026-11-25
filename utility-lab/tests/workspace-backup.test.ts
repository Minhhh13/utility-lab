import test from "node:test";
import assert from "node:assert/strict";
import {
  captureWorkspace,
  parseWorkspaceBackup,
  mergeWorkspace,
  persistWorkspace,
} from "../src/workspace-backup.ts";
import { emptyPlan } from "../src/board-model.ts";
import { createRoundSetup } from "../src/playbook-model.ts";
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=";
const storage = (seed: Record<string, string> = {}) => {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    map,
  };
};
const blank = () => captureWorkspace(storage());
const lineup = () => ({
  id: "lineup",
  mapId: "mirage",
  levelId: "main",
  side: "T" as const,
  type: "Smoke" as const,
  title: "Personal smoke",
  from: "Corner",
  target: "Window",
  purpose: "Practice",
  throwType: "Jump + LMB",
  steps: ["Use the reference"],
  x: 470,
  y: 330,
  userCreated: true,
  photos: [{ image: pixel, caption: "Aim" }],
});

test("a workspace roundtrip keeps photos, round steps, map drafts and palette", () => {
  const value = blank();
  value.tactics = [
    {
      id: "tactic",
      updatedAt: new Date().toISOString(),
      plan: emptyPlan("mirage", "main"),
    },
  ];
  value.lineups = [lineup()];
  value.books = [
    {
      id: "book",
      name: "Match plan",
      notes: "",
      tacticIds: ["tactic"],
      lineupIds: ["lineup"],
      steps: [
        {
          id: "step",
          title: "Execute",
          role: "Entry",
          timing: "1:35",
          notes: "Trade",
          tacticId: "tactic",
          lineupId: "lineup",
        },
      ],
    },
  ];
  value.drafts = [
    {
      format: "utility-lab-tactic",
      version: 1,
      plan: emptyPlan("nuke", "lower"),
    },
  ];
  value.appearance = { mode: "dark", palette: "ember" };
  const parsed = parseWorkspaceBackup(JSON.parse(JSON.stringify(value))),
    device = storage();
  persistWorkspace(device, parsed, true);
  const restored = captureWorkspace(device);
  assert.deepEqual(restored.lineups, value.lineups);
  assert.deepEqual(restored.books, value.books);
  assert.equal(restored.drafts[0].plan.levelId, "lower");
  assert.deepEqual(restored.appearance, value.appearance);
});
test("malformed or nonportable backups cannot silently drop saved data", () => {
  const value = blank();
  for (const patch of [
    { version: 2 },
    { lineups: {} },
    { tactics: [{ id: "bad" }] },
    {
      lineups: [
        { ...lineup(), photos: [{ image: "ul-media:missing", caption: "" }] },
      ],
    },
    { books: [{ id: "broken" }] },
  ])
    assert.throws(() => parseWorkspaceBackup({ ...value, ...patch }));
  const corrupted = captureWorkspace(
    storage({ "utility-lab:utilities:v1": "{}" }),
  );
  assert.deepEqual(corrupted.lineups, []);
});
test("conflicting imports become copies and every round reference follows its imported record", () => {
  const current = blank(),
    incoming = blank();
  current.lineups = [lineup()];
  incoming.lineups = [{ ...lineup(), title: "Different smoke" }];
  incoming.books = [
    {
      id: "book",
      name: "Imported",
      notes: "",
      tacticIds: [],
      lineupIds: ["lineup"],
      round: createRoundSetup("vertigo", "lower"),
      steps: [
        {
          id: "step",
          title: "Smoke",
          role: "Support",
          timing: "",
          notes: "",
          lineupId: "lineup",
          playerId: "p4",
          atSeconds: 20,
        },
      ],
    },
  ];
  incoming.favorites = ["lineup"];
  const result = mergeWorkspace(current, incoming, () => "new-lineup");
  assert.equal(result.lineups.length, 2);
  assert.equal(result.lineups[0].title, "Personal smoke");
  assert.equal(result.books[0].steps[0].lineupId, "new-lineup");
  assert.deepEqual(result.favorites, ["new-lineup"]);
  const device = storage();
  persistWorkspace(device, result);
  const restored = parseWorkspaceBackup(JSON.parse(JSON.stringify(captureWorkspace(device))));
  assert.deepEqual(restored.books[0].round, incoming.books[0].round);
  assert.deepEqual(restored.books[0].steps[0], { ...incoming.books[0].steps[0], lineupId: "new-lineup" });
});
test("re-importing an identical backup is idempotent and preserves an existing map draft", () => {
  const current = blank();
  current.lineups = [lineup()];
  current.books = [
    {
      id: "book",
      name: "Plan",
      notes: "",
      tacticIds: [],
      lineupIds: ["lineup"],
      steps: [],
    },
  ];
  current.drafts = [
    {
      format: "utility-lab-tactic",
      version: 1,
      plan: emptyPlan("mirage", "main"),
    },
  ];
  const incoming = structuredClone(current);
  incoming.drafts[0].plan.name = "Do not overwrite";
  const next = mergeWorkspace(current, incoming);
  assert.equal(next.lineups.length, 1);
  assert.equal(next.books.length, 1);
  assert.equal(next.drafts[0].plan.name, current.drafts[0].plan.name);
});
test("an import cannot relink a missing payload to an unrelated local ID", () => {
  const current = blank(),
    incoming = blank();
  current.lineups = [lineup()];
  incoming.books = [
    {
      id: "book",
      name: "Incomplete",
      notes: "",
      tacticIds: [],
      lineupIds: ["lineup"],
      steps: [],
    },
  ];
  const next = mergeWorkspace(current, incoming, () => "missing-reference");
  assert.deepEqual(next.books[0].lineupIds, ["missing-reference"]);
  assert.equal(next.lineups.length, 1);
});

test("an import yields to a draft saved on another tab during photo conversion", () => {
  const device = storage();
  const initial: Record<string, string | null> = {};
  const current = captureWorkspace(device, initial);
  const incoming = blank();
  const incomingPlan = emptyPlan("mirage", "main");
  incoming.drafts = [{ format: "utility-lab-tactic", version: 1, plan: incomingPlan, mapImage: pixel }];
  const merged = mergeWorkspace(current, incoming);
  const key = "utility-lab:draft:v1:mirage:main";
  const concurrent = JSON.stringify({ ...incomingPlan, name: "Fresh edits from another tab" });
  device.setItem(key, concurrent);
  assert.throws(() => persistWorkspace(device, merged, false, initial), /workspace changed/);
  assert.deepEqual([...device.map.entries()], [[key, concurrent]]);
  const retry: Record<string, string | null> = {};
  const newCapture = captureWorkspace(device, retry);
  persistWorkspace(device, mergeWorkspace(newCapture, incoming), false, retry);
  assert.equal(captureWorkspace(device).drafts[0].plan.name, "Fresh edits from another tab");
});
