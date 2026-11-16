import assert from "node:assert/strict";
import test from "node:test";
import {
  compileScenario,
  unitsPerBoardUnitForMap,
} from "../src/simulation/engine.ts";
import type {
  Actor,
  Grenade,
  GrenadeKind,
  Scenario,
} from "../src/simulation/engine.ts";

function player(id: string, overrides: Partial<Actor> = {}): Actor {
  return {
    id,
    team: "CT",
    start: { x: 100, y: 100 },
    waypoints: [],
    delay: 0,
    facing: 0,
    speed: 100,
    ...overrides,
  };
}
function grenade(kind: GrenadeKind, time: number, x = 100, y = 100): Grenade {
  return { id: kind + time, kind, time, at: { x, y } };
}
function plan(
  actors: Actor[],
  grenades: Grenade[] = [],
  extra: Partial<Scenario> = {},
) {
  return compileScenario({ actors, grenades, unitsPerBoardUnit: 1, ...extra });
}

test("delayed movement obeys world scale, turns at corners and preserves the board draft", () => {
  const actor = player("T1", {
    delay: 2,
    team: "T",
    start: { x: 20, y: 30 },
    waypoints: [
      { x: 20, y: 30 },
      { x: 120, y: 30 },
      { x: 120, y: 80 },
    ],
  });
  const before = structuredClone(actor);
  const sim = plan([actor], [], { unitsPerBoardUnit: 5 });
  assert.equal(sim.duration, 9.5);
  assert.equal(sim.frameAt(1).actors[0].x, 20);
  assert.equal(sim.frameAt(4.5).actors[0].x, 70);
  assert.equal(sim.frameAt(7).actors[0].facing, 90);
  assert.equal(sim.frameAt(8).actors[0].y, 50);
  assert.equal(sim.frameAt(100).actors[0].y, 80);
  assert.deepEqual(before, actor);
  assert.equal(unitsPerBoardUnitForMap("de_mirage"), 5.12);
  assert.equal(unitsPerBoardUnitForMap("nuke"), (7 * 1024) / 1000);
});

test("flash uses position and facing at detonation and walls can fully shield a player", () => {
  const ahead = player("front", { team: "T", waypoints: [{ x: 400, y: 100 }] });
  const turned = player("turned", {
    facing: 180,
    faceRoute: false,
    waypoints: ahead.waypoints,
  });
  const covered = player("covered", { start: { x: 500, y: 100 }, facing: 180 });
  const blast = grenade("flash", 1, 250);
  const sim = plan([ahead, turned, covered], [blast], {
    walls: [{ a: { x: 450, y: 50 }, b: { x: 450, y: 150 } }],
  });
  assert.equal(sim.frameAt(0.999).actors[0].blind, 0);
  const [front, back, protectedActor] = sim.frameAt(1).actors;
  assert.ok(front.blindRemaining > 5);
  assert.ok(back.blindRemaining > 0 && back.blindRemaining < 1.1);
  assert.equal(protectedActor.blind, 0);
  assert.ok(sim.frameAt(2.5).actors[0].blind > 0);
  assert.equal(sim.frameAt(2.5).actors[1].blind, 0);
  assert.equal(sim.frameAt(8).actors[0].blind, 0);
});

test("smoke expires on its own clock, extinguishes fire and has a temporary localized HE gap", () => {
  const sim = plan(
    [player("near"), player("edge", { start: { x: 5, y: 100 } })],
    [
      grenade("molotov", 0),
      grenade("smoke", 1),
      grenade("he", 4, 165),
      grenade("incendiary", 8),
    ],
  );
  assert.ok(sim.frameAt(0.5).actors[0].burning);
  assert.equal(sim.frameAt(1).actors[0].burning, false);
  assert.ok(sim.frameAt(3).actors.every((actor) => actor.inSmoke));
  const burst = sim.frameAt(4);
  assert.equal(burst.actors[0].inSmoke, false);
  assert.equal(
    burst.effects.find((effect) => effect.kind === "smoke")?.holes.length,
    1,
  );
  assert.ok(sim.frameAt(4.4).actors[1].inSmoke === false); // on the opening boundary
  assert.ok(sim.frameAt(5.4).actors[1].inSmoke);
  assert.ok(sim.frameAt(6).actors.every((actor) => actor.inSmoke));
  assert.equal(
    sim.frameAt(8).effects.filter((effect) => effect.kind === "incendiary")
      .length,
    0,
  );
  assert.equal(sim.frameAt(23).effects.length, 0);
});

test("seek and replay produce the same damage, overlapping fires do not double tick, death freezes movement", () => {
  const actor = player("entry", { waypoints: [{ x: 500, y: 100 }], speed: 10 });
  const sim = plan(
    [actor],
    [grenade("molotov", 0), grenade("incendiary", 0), grenade("he", 4)],
  );
  const before = sim.frameAt(1);
  assert.equal(before.actors[0].hp, 60);
  const after = sim.frameAt(6).actors[0];
  assert.equal(after.hp, 0);
  assert.equal(after.x, 126);
  assert.equal(after.burning, false);
  assert.deepEqual(sim.frameAt(1), before);
  assert.deepEqual(sim.frameAt(6).actors[0], after);
  const fire = sim.frameAt(5.5).effects;
  assert.deepEqual(
    fire.map((effect) => effect.kind),
    ["molotov"],
  );
});

test("HE damages at its timestamp once and reduces damage with distance and physical cover", () => {
  const sim = plan(
    [
      player("center"),
      player("near", { start: { x: 200, y: 100 } }),
      player("safe", { start: { x: 300, y: 100 } }),
    ],
    [grenade("he", 3)],
    { walls: [{ a: { x: 270, y: 10 }, b: { x: 270, y: 150 } }] },
  );
  assert.deepEqual(
    sim.frameAt(2.99).actors.map((actor) => actor.hp),
    [100, 100, 100],
  );
  const health = sim.frameAt(3).actors.map((actor) => actor.hp);
  assert.equal(health[0], 1);
  assert.ok(health[1] > health[0] && health[1] < 100);
  assert.equal(health[2], 100);
  assert.deepEqual(
    sim.frameAt(4).actors.map((actor) => actor.hp),
    health,
  );
});

test("routes stop on the approach side of the first cover wall and can leave a wall they start on", () => {
  const route = [
    { x: 300, y: 100 },
    { x: 300, y: 300 },
  ];
  const walls = [220, 170].map((x) => ({ a: { x, y: 90 }, b: { x, y: 120 } }));
  const sim = plan(
    [
      player("entry", { waypoints: route }),
      player("exit", { start: { x: 220, y: 100 }, waypoints: route }),
    ],
    [grenade("flash", 2, 195)],
    { walls },
  );
  assert.equal(sim.frameAt(0.5).actors[0].blockedByWall, false);
  const [entry, exit] = sim.frameAt(2).actors;
  assert.equal(entry.blockedByWall, true);
  assert.equal(entry.x, 169);
  assert.equal(entry.blind, 0);
  assert.equal(exit.x, 300);
  assert.equal(exit.blockedByWall, false);
  assert.equal(sim.frameAt(0.25).actors[0].x, 125);
});

test("flight begins at the thrower's release position; airborne utility survives later elimination", () => {
  const moving = player("T1", { waypoints: [{ x: 250, y: 100 }], speed: 10 });
  const airborne = {
    ...grenade("smoke", 5, 300),
    throwerId: "T1",
    flightSeconds: 4,
  };
  const late = { ...grenade("he", 7, 350), throwerId: "T1", flightSeconds: 1 };
  const sim = plan([moving], [grenade("molotov", 0), airborne, late]);
  assert.deepEqual(sim.canceledThrowIds, [late.id]);
  assert.equal(sim.frameAt(0.99).flights.length, 0);
  const flight = sim.frameAt(3).flights[0];
  assert.deepEqual(flight.from, { x: 110, y: 100 });
  assert.equal(flight.progress, 0.5);
  assert.equal(flight.x, 205);
  assert.equal(sim.frameAt(3).actors[0].hp, 0);
  assert.equal(sim.frameAt(5).flights.length, 0);
  assert.ok(sim.frameAt(5).effects.some((effect) => effect.id === airborne.id));
  assert.ok(!sim.frameAt(7).effects.some((effect) => effect.id === late.id));
});

test("canceling an eliminated player's throw preserves a later thrower who would have died to it", () => {
  const actors = [player("A"), player("B", { start: { x: 700, y: 100 } })];
  const missed = { ...grenade("he", 5, 700), throwerId: "A", flightSeconds: 1 };
  const actual = {
    ...grenade("flash", 8, 730),
    throwerId: "B",
    flightSeconds: 2,
  };
  const sim = plan(actors, [
    grenade("molotov", 0),
    grenade("he", 0.1, 700),
    missed,
    actual,
  ]);
  assert.deepEqual(sim.canceledThrowIds, [missed.id]);
  assert.equal(sim.frameAt(7).flights[0].id, actual.id);
  assert.equal(sim.frameAt(8).actors[1].hp, 1);
  assert.ok(sim.frameAt(8).actors[1].blind > 0);
});

test("waypoint holds let players wait for a flash, retaining their arrival angle until departure", () => {
  const actor = player("entry", {
    waypoints: [
      { x: 100, y: 200 },
      { x: 200, y: 200 },
    ],
    holds: [3, 0],
  });
  const sim = plan([actor], [grenade("flash", 3, 100, 201)]);
  const paused = sim.frameAt(3).actors[0];
  assert.equal(paused.y, 200);
  assert.equal(paused.x, 100);
  assert.equal(paused.facing, 90);
  assert.ok(paused.blindRemaining > 5);
  assert.equal(sim.frameAt(4.5).actors[0].x, 150);
  assert.equal(sim.frameAt(4.5).actors[0].facing, 0);
});
