import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import audit from "../docs/data/other-numbered-spawn-audit.json" with { type: "json" };
import { reviewedSpawnMap } from "../src/data/all-map-spawn-sheets.ts";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { MAPS } from "../src/maps.ts";
import type { UtilityReference } from "../src/utility-data.ts";

function readJson(path: string) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

const catalogue = MAPS.flatMap(({ id }) => mergePhotoGuides(
  PHOTO_GUIDE_LIBRARY.filter(record => record.mapId === id),
  normalizeExpandedGuides(readJson(`../src/data/expanded/${id}.json`), id),
));

function findGuide(family: string, slot: number) {
  const record = catalogue.find(r => r.spawn?.family === family && r.spawn.slot === slot);
  assert.ok(record?.spawn);
  return record;
}

test("all numbered catalogue guides resolve their exact published starting pin and floor", () => {
  const mapOrigins = new Map(MAPS.map(({ id }) =>
    [id, readJson(`../src/data/lineup-origins/origins-${id}.json`)] as const));
  const coveredMaps = new Set();
  const families = new Set();
  let covered = 0;
  for (const guide of catalogue) {
    const sheet = reviewedSpawnMap(guide);
    if (!guide.spawn) {
      assert.equal(sheet, undefined);
      continue;
    }
    assert.ok(sheet && guide.source, guide.id);
    const start = mapOrigins.get(guide.mapId)[guide.source];
    assert.equal(start.precision, "world", guide.id);
    assert.equal(start.registrationId, sheet.registration, guide.id);
    const slot = guide.spawn.slot;
    assert.deepEqual(sheet.points.find(p => p.slot === slot), { slot, x: start.x, y: start.y }, guide.id);
    assert.equal(new Set(sheet.points.map(p => p.slot)).size, sheet.points.length);
    coveredMaps.add(guide.mapId);
    families.add(guide.spawn.family);
    covered++;
  }
  assert.equal(covered, 129);
  assert.equal(families.size, 28);
  assert.equal(coveredMaps.size, MAPS.length);
});

test("all contextual setpos pins project from the published standing XY in publisher order", () => {
  assert.equal(audit.setpos.length, 11);
  for (const row of audit.setpos) {
    const guide = catalogue.find(r => r.mapId === row.mapId && r.side === row.side &&
      r.spawn && r.source?.startsWith(row.source + "/"));
    assert.ok(guide);
    const sheet = reviewedSpawnMap(guide);
    assert.equal(sheet?.registration, row.registration);
    const { posX, posY, scale, radarSize } = row.calibration;
    const toRadar = (distance: number) => Math.round(distance / (scale * radarSize) * 100000) / 100;
    assert.deepEqual(sheet?.points, row.slots.map(({ slot, world: [x, y] }) =>
      ({ slot, x: toRadar(x - posX), y: toRadar(posY - y) })));
    assert.equal(new Set(row.slots.map(p => p.spawnId)).size, row.slots.length);
  }
});

test("source-specific numbering and standing floors remain independent from destination", () => {
  const position = (record: UtilityReference, slot: number) => {
    const p = reviewedSpawnMap(record)?.points.find(p => p.slot === slot);
    return p && [p.x, p.y];
  };
  const dust = findGuide("dust2-t-mid-doors-stellaraqwq", 4);
  assert.equal(position(dust, 1), undefined);
  assert.deepEqual(position(dust, 4), position(findGuide("setpos-dust2-t-mid-doors", 14), 14));
  assert.deepEqual(position(findGuide("mirage-t-window-cs2tricks", 2), 2),
    position(findGuide("setpos-mirage-t-catwalk", 4), 4));
  assert.deepEqual(position(findGuide("csnades-cache-ct-garage", 1), 1),
    position(findGuide("setpos-cache-ct-molotov-heaven", 2), 2));
  const vertigo = findGuide("viri-vertigo-ct-a-ramp", 5);
  assert.equal(vertigo.levelId, "lower");
  assert.equal(reviewedSpawnMap(vertigo)?.registration, "world-vertigo-upper");
  assert.equal(reviewedSpawnMap({ ...vertigo, levelId: "upper" }), undefined);
});

test("personal records, incorrect source URLs, mismatched numbers and copied families cannot claim a source sheet", () => {
  const guide = findGuide("setpos-dust2-t-mid-doors", 14);
  assert.ok(guide.spawn);
  const variants: UtilityReference[] = [
    { ...guide, userCreated: true }, { ...guide, mapId: "mirage" }, { ...guide, side: "CT" },
    { ...guide, type: "Flash" }, { ...guide, levelId: "upper" }, { ...guide, source: undefined },
    { ...guide, source: "https://example.org/dust2/mid-doors/t14" },
    { ...guide, source: findGuide("setpos-dust2-t-long-corner", 14).source },
    { ...guide, spawn: { ...guide.spawn, slot: 12 } }, { ...guide, spawn: { ...guide.spawn, total: 14 } },
    { ...guide, spawn: { ...guide.spawn, family: "other-family" } },
    { ...findGuide("ancient-ct-elbow-cs2tricks", 2), source: findGuide("ancient-ct-elbow-cs2tricks", 1).source },
    { ...findGuide("setpos-anubis-t-conn", 1), source: findGuide("setpos-anubis-t-outside-conn", 1).source },
  ];
  for (const value of variants) assert.equal(reviewedSpawnMap(value), undefined, value.source);
});
