import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { withAimPlacement } from "../src/aim-placement.ts";
import { ANCIENT_CT_ELBOW_SPAWN_POINTS } from "../src/data/ancient-ct-elbow-spawn-points.ts";
import { PRECISE_MIRAGE_ANCIENT } from "../src/data/precise-mirage-ancient.ts";
import { parseOriginLookup } from "../src/lineup-origins.ts";
import { lineupWalkthrough } from "../src/lineup-walkthrough.ts";
import { utilityPhotos } from "../src/utility-data.ts";
import creatorEvidence from "../docs/data/precise-mirage-ancient-evidence.json" with { type: "json" };
import worldEvidence from "../docs/data/reviewed-world-origins.json" with { type: "json" };

const guides = PRECISE_MIRAGE_ANCIENT.filter(row => row.spawn?.family === "ancient-ct-elbow-cs2tricks");
const origins = parseOriginLookup(JSON.parse(readFileSync(new URL("../src/data/lineup-origins/origins-ancient.json", import.meta.url), "utf8")));

test("each Ancient Elbow guide points at its matched CT spawn in the chooser and guide map", () => {
  assert.deepEqual(guides.map(r => r.spawn?.slot), [1, 2, 3, 4, 5]);
  const radar = worldEvidence.radars.ancient;
  for (const guide of guides) {
    const record = worldEvidence.records.find(row => row.source === guide.source)!;
    assert.equal(record.creatorSlot, guide.spawn!.slot);
    assert.equal(record.referenceSlot, record.creatorSlot);
    const unitsPerRadar = radar.scale * radar.radarSize;
    const x = Number(((record.world.x - radar.posX) * 1000 / unitsPerRadar).toFixed(2));
    const y = Number(((radar.posY - record.world.y) * 1000 / unitsPerRadar).toFixed(2));
    const origin = origins[guide.source!];
    assert.equal(origin.precision, "world");
    assert.equal(origin.sourceId, record.originId);
    assert.deepEqual([origin.x, origin.y], [x, y]);
    assert.deepEqual(ANCIENT_CT_ELBOW_SPAWN_POINTS.find(p => p.slot === record.creatorSlot), { slot: record.creatorSlot, x, y });
  }
});

test("each Ancient Elbow aim detail describes the landmark in its own publisher close-up", () => {
  const landmarks = [/short seam/, /top edge/, /gap of sky/, /upper-right corner/, /two stone prongs/];
  for (const guide of guides) {
    const slot = guide.spawn!.slot;
    const evidence = creatorEvidence.records.find(row => row.source === guide.source)!;
    const stages = lineupWalkthrough(guide, utilityPhotos(withAimPlacement(guide)));
    const aim = stages.find(s => s.stage === "aim")!.views[0].photo!;
    const detail = stages.find(s => s.stage === "detail")!.views[0];
    assert.equal(aim.image, evidence.originalAim.image);
    assert.equal(detail.photo!.image, evidence.detailAim.image);
    assert.notEqual(detail.photo!.image, aim.image);
    assert.equal(detail.photo!.source, guide.source);
    assert.deepEqual(detail.photo!.aimPoint, { x: 0.5, y: 0.5 });
    assert.ok(!detail.magnifyAim);
    assert.match(detail.photo!.caption, landmarks[slot - 1]);
    assert.match(stages.find(s => s.stage === "setup")!.views[0].photo!.source!, /elbow-from-ct-spawn-/);
  }
});
