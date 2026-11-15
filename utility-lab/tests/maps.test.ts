import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { MAPS } from "../src/maps.ts";
import { UTILITY_REFERENCES } from "../src/utility-data.ts";
import { CREATOR_GUIDES } from "../src/creator-guides.ts";

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

test("only Active Duty and FACEIT maps are exposed, including both floors", () => {
  for (const id of ["nuke", "vertigo"])
    assert.ok(
      MAPS.find((m) => m.id === id)!.levels.length >= 2,
      `${id} needs its second level`,
    );
  assert.equal(MAPS.length, 8);
  assert.equal(MAPS.filter((map) => map.activeDuty).length, 7);
  assert.ok(MAPS.every((map) => map.activeDuty || map.faceit));
  assert.deepEqual(
    MAPS.filter((map) => !map.activeDuty).map((map) => map.id),
    ["vertigo"],
  );
  for (const removed of [
    "office",
    "italy",
    "pool-day",
    "boulder",
    "complex",
    "train",
    "overpass",
  ])
    assert.ok(!MAPS.some((map) => map.id === removed));
});

test("fitted artwork bounds retain every bundled lineup target on each floor", () => {
  for (const map of MAPS) {
    for (const level of map.levels) {
      const bounds = level.contentBounds;
      assert.ok(bounds, `${map.id}/${level.id} needs fitted bounds`);
      assert.ok(bounds.width > 0 && bounds.height > 0);
      assert.ok(bounds.x >= 0 && bounds.y >= 0);
      assert.ok(bounds.x + bounds.width <= 1000);
      assert.ok(bounds.y + bounds.height <= 1000);
      for (const lineup of [...UTILITY_REFERENCES, ...CREATOR_GUIDES].filter(
        (item) => item.mapId === map.id && item.levelId === level.id,
      )) {
        assert.ok(
          lineup.x >= bounds.x && lineup.x <= bounds.x + bounds.width,
          `${lineup.id}: X is outside fit`,
        );
        assert.ok(
          lineup.y >= bounds.y && lineup.y <= bounds.y + bounds.height,
          `${lineup.id}: Y is outside fit`,
        );
      }
    }
  }
});
