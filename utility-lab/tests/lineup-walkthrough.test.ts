import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { lineupWalkthrough } from "../src/lineup-walkthrough.ts";
import { withAimPlacement } from "../src/aim-placement.ts";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { MAPS } from "../src/maps.ts";
import { utilityPhotos, isBundledPhoto } from "../src/utility-data.ts";

const guides = MAPS.flatMap(map => mergePhotoGuides(
  PHOTO_GUIDE_LIBRARY.filter(g => g.mapId === map.id),
  normalizeExpandedGuides(JSON.parse(readFileSync(new URL(`../src/data/expanded/${map.id}.json`, import.meta.url), "utf8")), map.id),
));
const example = guides.find(g => g.id === "expanded-cs2tricks-mirage-window-from-back-alley-61ab-t")!;
const gallery = (r: typeof example) => lineupWalkthrough(r, utilityPhotos(withAimPlacement(r)));

// These originals begin during the run. Their videos cover the setup until
// a first-person still at that exact starting position can be verified.
const runningSetups = new Set([
  "expanded-cs2tricks-inferno-banana-logs-from-b-entrance-c431-ct",
  "expanded-cs2tricks-inferno-top-banana-from-b-entrance-6c8c-ct",
  "expanded-cs2tricks-inferno-banana-logs-from-b-entrance-467d-ct",
]);

test("every published guide has four ordered stages, retaining original photos and video access when a still is missing", () => {
  for (const guide of guides) {
    const steps = gallery(guide);
    assert.deepEqual(steps.map(s => s.stage), ["stand", "setup", "aim", "landing"], guide.id);
    assert.ok(steps.every(s => s.views.length), guide.id);
    const originals = utilityPhotos(guide);
    for (const photo of originals) assert.ok(steps.some(s => s.views.some(v => v.photo?.image === photo.image)), guide.id);
    assert.ok(steps[2].views[0].photo?.aimPoint, guide.id);
    for (const view of steps[1].views) assert.equal(view.photo?.aimPoint, undefined, guide.id);
    for (const stage of steps) for (const view of stage.views) {
      if (!view.photo) assert.ok(stage.stage === "setup" && runningSetups.has(guide.id) && guide.videoUrl, guide.id);
      if (view.photo && isBundledPhoto(view.photo.image)) {
        assert.ok(existsSync(new URL(`../public${view.photo.image}`, import.meta.url)), view.photo.image);
      }
    }
  }
});

test("Mirage Back Alley shows four distinct credited photos and preserves personal galleries", () => {
  const steps = gallery(example);
  assert.equal(new Set(steps.map(s => s.views[0].photo?.image)).size, 4);
  assert.ok(steps.every(s => s.views[0].photo?.source === example.source));
  assert.match(steps[1].views[0].photo!.image, /window-from-back-alley-61ab\.webp$/);
  assert.match(steps[2].views[0].photo!.image, /3686baa6-6d86-4bba-8ab4-ee55f61a310d/);
  const copy = { ...example, userCreated: true };
  assert.deepEqual(gallery(copy).flatMap(s => s.views.map(v => v.photo!.image)), utilityPhotos(copy).map(p => p.image));
});
