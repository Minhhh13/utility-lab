import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { lineupWalkthrough } from "../src/lineup-walkthrough.ts";
import { withAimPlacement } from "../src/aim-placement.ts";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { MAPS } from "../src/maps.ts";
import { utilityPhotos, isBundledPhoto } from "../src/utility-data.ts";
import { NIC_AIM_LANDMARKS } from "../src/data/numbered-aim-landmarks-nic.ts";
import { OTHER_AIM_LANDMARKS } from "../src/data/numbered-aim-landmarks-rest.ts";

const guides = MAPS.flatMap(map => mergePhotoGuides(
  PHOTO_GUIDE_LIBRARY.filter(g => g.mapId === map.id),
  normalizeExpandedGuides(JSON.parse(readFileSync(new URL(`../src/data/expanded/${map.id}.json`, import.meta.url), "utf8")), map.id),
));

test("numbered aim landmarks reach both the wide view and the close view of their own guide", () => {
  for (const [id, cue] of Object.entries({...NIC_AIM_LANDMARKS, ...OTHER_AIM_LANDMARKS})) {
    const record = guides.find(guide => guide.id === id);
    assert.ok(record?.spawn, id);
    const steps = lineupWalkthrough(record, utilityPhotos(record));
    const wide = steps[2].views.find(view => view.photo?.kind === "aim");
    assert.equal(wide?.caption, cue.wide, id);
    assert.notEqual(cue.wide, cue.detail, id);
    for (const view of steps[3].views) {
      assert.equal(view.photo?.source, record.source, id);
      assert.ok(view.photo?.caption.endsWith(cue.detail), id);
      assert.ok(view.photo?.aimPoint, id);
    }
  }
});
const example = guides.find(g => g.id === "expanded-cs2tricks-mirage-window-from-back-alley-61ab-t")!;
const gallery = (r: typeof example) => lineupWalkthrough(r, utilityPhotos(withAimPlacement(r)));

// These originals begin during the run. Their videos cover the setup until
// a first-person still at that exact starting position can be verified.
const runningSetups = new Set([
  "expanded-cs2tricks-inferno-banana-logs-from-b-entrance-c431-ct",
  "expanded-cs2tricks-inferno-top-banana-from-b-entrance-6c8c-ct",
  "expanded-cs2tricks-inferno-banana-logs-from-b-entrance-467d-ct",
]);

test("every published guide has five ordered stages with a sourced or anchored aim detail", () => {
  for (const guide of guides) {
    const steps = gallery(guide);
    assert.deepEqual(steps.map(s => s.stage), ["stand", "setup", "aim", "detail", "landing"], guide.id);
    assert.ok(steps.every(s => s.views.length), guide.id);
    const originals = utilityPhotos(guide);
    for (const photo of originals) assert.ok(steps.some(s => s.views.some(v => v.photo?.image === photo.image)), guide.id);
    assert.ok(steps[2].views[0].photo?.aimPoint, guide.id);
    for (const view of steps[3].views) {
      assert.equal(view.photo?.kind, "aim", guide.id);
      if (view.magnifyAim) {
        assert.ok(view.photo.aimPoint, guide.id);
        assert.ok(steps[2].views.some(wide => wide.photo === view.photo), guide.id);
      } else {
        assert.ok(!steps[2].views.some(wide => wide.photo === view.photo), guide.id);
      }
    }
    for (const view of steps[1].views) assert.equal(view.photo?.aimPoint, undefined, guide.id);
    for (const stage of steps) for (const view of stage.views) {
      if (!view.photo) assert.ok(stage.stage === "setup" && runningSetups.has(guide.id) && guide.videoUrl, guide.id);
      if (view.photo && isBundledPhoto(view.photo.image)) {
        assert.ok(existsSync(new URL(`../public${view.photo.image}`, import.meta.url)), view.photo.image);
      }
    }
  }
});

test("Mirage Back Alley shows five distinct credited photos and preserves personal galleries", () => {
  const steps = gallery(example);
  assert.equal(new Set(steps.map(s => s.views[0].photo?.image)).size, 5);
  assert.ok(steps.every(s => s.views[0].photo?.source === example.source));
  assert.match(steps[1].views[0].photo!.image, /window-from-back-alley-61ab\.webp$/);
  assert.match(steps[2].views[0].photo!.image, /3686baa6-6d86-4bba-8ab4-ee55f61a310d/);
  assert.match(steps[3].views[0].photo!.image, /374c9cec-6d63-41eb-8f11-fd6cd6404903/);
  const copy = { ...example, userCreated: true };
  assert.deepEqual(gallery(copy).flatMap(s => s.views.map(v => v.photo!.image)), utilityPhotos(copy).map(p => p.image));
});

test("source-specific spawn setups expose their landmarks and original close-ups", () => {
  const landmarks = [
    ["mirage-window-from-t-spawn-568d", "T Spawn door corner"],
    ["mirage-window-from-t-spawn-2365", "T Spawn bin top"],
    ["mirage-window-from-t-spawn-50a0", "T Spawn bin front"],
    ["mirage-window-from-a-ramp-4728", "Deep ramp planks"],
    ["dust2-mid-doors-from-t-spawn-7714", "T Spawn crack"],
    ["dust2-mid-doors-from-t-spawn-9ed7", "T Spawn lamp"],
    ["dust2-x-box-from-top-mid-2bba", "Top Mid"],
  ];
  for (const [slug, label] of landmarks) {
    const guide = guides.find(g => g.id === `expanded-cs2tricks-${slug}-t`)!;
    assert.equal(guide.from, label);
    if (slug.endsWith("2bba")) assert.equal(guide.throwType, "Tap W + Jump + LMB");
    const [, , aim, detail] = gallery(guide);
    const photo = detail.views[0].photo!;
    assert.ok(!detail.views[0].magnifyAim, guide.id);
    assert.notEqual(photo.image, aim.views[0].photo!.image, guide.id);
    assert.equal(photo.source, guide.source, guide.id);
    assert.deepEqual(photo.aimPoint, {x: 0.5, y: 0.5}, guide.id);
  }
});
