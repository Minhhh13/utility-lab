import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { otherStagePhotos } from "../src/data/other-stage-photos.ts";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { MAPS } from "../src/maps.ts";
import { isBundledPhoto, utilityPhotos } from "../src/utility-data.ts";

const guides = MAPS.flatMap(map => mergePhotoGuides(
  PHOTO_GUIDE_LIBRARY.filter(guide => guide.mapId === map.id),
  normalizeExpandedGuides(JSON.parse(readFileSync(new URL(`../src/data/expanded/${map.id}.json`, import.meta.url), "utf8")), map.id),
)).filter(guide => !guide.source?.startsWith("https://www.cs2tricks.com/"));

test("every non-CS2Tricks source has a credited wide setup and a source-matched landing", () => {
  assert.equal(guides.length, 270);
  let resultCount = 0;
  for (const guide of guides) {
    const original = utilityPhotos(guide);
    const { setup, landing } = otherStagePhotos(guide);
    assert.ok(setup, guide.id);
    assert.equal(setup.kind, "position");
    assert.equal(setup.aimPoint, undefined);
    assert.match(setup.annotationId!, /^(sourceframe@\d+ms|source-game-tick@\d+)$/);
    const originalLanding = original.find(photo => photo.kind === "landing");
    if (originalLanding) assert.equal(landing, undefined, guide.id);
    else {
      ++resultCount;
      assert.equal(landing?.kind, "landing", guide.id);
      if (landing?.region) {
        assert.ok(landing.region.width < landing.region.sourceWidth);
        assert.equal(landing.region.height, landing.region.sourceHeight);
      } else {
        assert.match(landing!.annotationId!, /^sourceframe@\d+ms$/);
      }
    }
    for (const photo of [setup, landing].filter(photo => !!photo)) {
      assert.equal(photo.source, guide.source, guide.id);
      assert.equal(photo.creator, guide.creator, guide.id);
      assert.ok(photo.creator?.trim(), guide.id);
      if (isBundledPhoto(photo.image)) assert.ok(existsSync(new URL(`../public${photo.image}`, import.meta.url)), photo.image);
      else assert.ok(photo.image.startsWith("https://"), photo.image);
    }
    assert.deepEqual(otherStagePhotos({ ...guide, userCreated: true }), {});
  }
  assert.equal(resultCount, 208);
});
