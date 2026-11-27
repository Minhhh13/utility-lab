import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ANUBIS_T_SPAWN_POINTS } from "../src/data/anubis-t-spawn-points.ts";
import { PRECISE_ANUBIS } from "../src/data/precise-anubis.ts";
import audit from "../docs/data/anubis-t-spawn-audit.json" with { type: "json" };

const read = (path: string) => readFileSync(new URL(path, import.meta.url));
const origins = JSON.parse(read("../src/data/lineup-origins/origins-anubis.json").toString());
const proof = JSON.parse(read("../docs/data/precise-anubis-evidence.json").toString()).records;
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

test("each numbered Anubis T spawn uses the recorded starting position on the publisher's radar", () => {
  assert.equal(hash(read("../public/maps/anubis-v22.svg")), audit.radarSha256);
  assert.deepEqual(ANUBIS_T_SPAWN_POINTS.map(p => p.slot), Array.from({ length: 11 }, (_, i) => i + 1));
  assert.equal(new Set(audit.slots.map(s => s.publisherSpawnId)).size, 11);
  const { posX, posY, scale, radarSize } = audit.calibration;
  const toRadar = (distance: number) => Math.round(distance / (scale * radarSize) * 100000) / 100;
  const sourceGuides = PRECISE_ANUBIS.filter(r => r.spawn?.family.startsWith("setpos-anubis-t-"));
  assert.equal(sourceGuides.length, audit.recipes.length);
  assert.equal(new Set(audit.recipes.map(r => r.id)).size, 23);
  let movedBeforeRelease = 0;
  for (const { id, destination, slot, releaseXY } of audit.recipes) {
    const guide = sourceGuides.find(r => r.id === `precise-setpos-anubis-${id}-t`)!;
    assert.equal(guide.source, `https://setpos.gg/anubis/${destination}/t${slot}`);
    assert.ok(guide.spawn);
    assert.equal(guide.spawn.slot, slot);
    assert.equal(guide.spawn.family, `setpos-anubis-t-${destination}`);
    const sourceSlot = audit.slots.find(s => s.slot === slot)!;
    const [x, y] = sourceSlot.standingXY;
    const published = origins[guide.source];
    const expected = { slot, x: toRadar(x - posX), y: toRadar(posY - y) };
    assert.deepEqual(ANUBIS_T_SPAWN_POINTS.find(p => p.slot === slot), expected);
    assert.deepEqual({ slot, x: published.x, y: published.y }, expected);
    assert.equal(published.registrationId, "setpos-anubis-main-20261124");
    assert.equal(published.precision, "world");
    if (releaseXY[0] !== x || releaseXY[1] !== y) {
      movedBeforeRelease++;
      assert.notDeepEqual([published.x, published.y], [toRadar(releaseXY[0] - posX), toRadar(posY - releaseXY[1])]);
    }
  }
  assert.equal(movedBeforeRelease, 8);
});

test("Anubis standing captures are from the matching original video before the rendered aiming and release cues", () => {
  for (const { id, slot, aimRenderedFrame, releaseRenderedFrame } of audit.recipes) {
    const guide = PRECISE_ANUBIS.find(r => r.id === `precise-setpos-anubis-${id}-t`)!;
    const evidence = proof.find((r: { source: string }) => r.source === guide.source);
    const position = guide.photos?.find(p => p.kind === "position");
    assert.ok(position);
    const frame = evidence.positionFrame;
    assert.equal(frame.sourceVideo, guide.videoFallbackUrl);
    assert.equal(position.image, "/lineup-media/precise-anubis/" + frame.filename);
    assert.equal(hash(read("../public" + position.image)), frame.sha256);
    assert.match(guide.steps[0], new RegExp(`^Use T spawn ${slot},`));
    assert.ok(frame.time * audit.renderFps < aimRenderedFrame && aimRenderedFrame < releaseRenderedFrame);
  }
});
