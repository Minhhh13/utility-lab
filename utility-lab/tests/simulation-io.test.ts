import test from "node:test";
import assert from "node:assert/strict";
import {
  fromBoard,
  flashDrill,
  exportRehearsal,
  importRehearsal,
  rehearsalKey,
  type BoardInput,
} from "../src/simulation/scenario-io.ts";
const plan: BoardInput = {
  mapId: "mirage",
  levelId: "main",
  name: "Split",
  objects: [
    {
      id: "r",
      kind: "route",
      x: 0,
      y: 0,
      points: [
        { x: 410, y: 400 },
        { x: 500, y: 370 },
      ],
    },
    {
      id: "distant",
      kind: "route",
      x: 0,
      y: 0,
      points: [
        { x: 20, y: 20 },
        { x: 300, y: 30 },
      ],
    },
    { id: "ct1", kind: "ct", x: 810, y: 800 },
    { id: "t1", kind: "t", x: 400, y: 400 },
    { id: "smoke", kind: "smoke", x: 600, y: 450 },
  ],
};
test("a rehearsal seeds from nearby board arrows without changing board-owned points", () => {
  const before = JSON.stringify(plan),
    scenario = fromBoard(plan);
  assert.equal(scenario.actors[0].waypoints.length, 0);
  assert.deepEqual(scenario.actors[1].waypoints, plan.objects[0].points);
  scenario.actors[1].waypoints[0].x = 0;
  assert.equal(JSON.stringify(plan), before);
  assert.equal(scenario.grenades[0].kind, "smoke");
});
test("a rehearsal draft stays separate from different tactics, floors and layouts", async () => {
  const original = await rehearsalKey(plan);
  assert.equal(
    original,
    await rehearsalKey({ ...plan, name: "Renamed tactic" }),
  );
  assert.notEqual(original, await rehearsalKey({ ...plan, levelId: "lower" }));
  assert.notEqual(original, await rehearsalKey({ ...plan, objects: [] }));
  assert.notEqual(
    await rehearsalKey(plan, "saved-a"),
    await rehearsalKey(plan, "saved-b"),
  );
});
test("the example drill and throw assignments round-trip without accepting another floor or invalid actors", () => {
  const example = flashDrill(5.12),
    text = exportRehearsal(plan, example);
  assert.deepEqual(importRehearsal(text, plan), example);
  assert.throws(
    () => importRehearsal(text, { ...plan, levelId: "lower" }),
    /floor/,
  );
  const file = JSON.parse(text);
  file.scenario.grenades[0].throwerId = "not-a-player";
  assert.throws(() => importRehearsal(JSON.stringify(file), plan), /Thrower/);
  delete file.scenario.grenades[0].throwerId;
  file.scenario.actors[0].speed = 0;
  assert.throws(() => importRehearsal(JSON.stringify(file), plan), /speed/);
});
