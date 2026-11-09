import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { MAPS } from "../src/maps.ts";

test("every selectable map layer resolves to a local radar asset", () => {
  const ids = new Set<string>();
  for (const map of MAPS) {
    assert.ok(!ids.has(map.id), `Duplicate map ${map.id}`);
    ids.add(map.id);
    assert.ok(map.levels.length, `${map.name} needs a layer`);
    const levels = new Set<string>();
    for (const level of map.levels) {
      assert.ok(!levels.has(level.id));
      levels.add(level.id);
      assert.match(level.image, /^\/maps\/[a-zA-Z0-9_.-]+\.(svg|png)$/);
      const path = new URL(`../public${level.image}`, import.meta.url);
      assert.ok(
        existsSync(path),
        `${map.name} / ${level.name} missing artwork`,
      );
      if (level.image.endsWith(".png"))
        assert.equal(
          readFileSync(path).subarray(0, 8).toString("hex"),
          "89504e470d0a1a0a",
        );
    }
    const preview = (map.levels[0].radarImage || map.levels[0].image).replace(
      "/maps/",
      "/map-thumbnails/",
    );
    assert.ok(
      existsSync(new URL(`../public${preview}`, import.meta.url)),
      `${map.name} missing thumbnail`,
    );
  }
});

test("multi-level maps and all game-mode groups remain available", () => {
  for (const id of ["nuke", "train", "vertigo", "baggage", "boulder"])
    assert.ok(
      MAPS.find((m) => m.id === id)!.levels.length >= 2,
      `${id} needs its second level`,
    );
  assert.equal(MAPS.find((m) => m.id === "complex")!.levels.length, 21);
  for (const group of [
    "Active Duty",
    "Competitive",
    "Hostage",
    "Wingman",
    "Arms Race",
    "Rush",
  ])
    assert.ok(
      MAPS.some((m) => m.mode === group),
      `Missing ${group} maps`,
    );
});
