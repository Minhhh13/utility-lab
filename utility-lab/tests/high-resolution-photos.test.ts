import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {highResolutionPhoto} from "../src/data/high-resolution-photos.ts";
import proof from "../docs/data/source-photo-resolution.json" with {type: "json"};
import assets from "../src/data/high-resolution-photo-assets.json" with {type: "json"};
import {mergePhotoGuides, normalizeExpandedGuides} from "../src/expanded-guide-model.ts";
import {PHOTO_GUIDE_LIBRARY} from "../src/guide-library.ts";
import {utilityPhotos} from "../src/utility-data.ts";
import {withAimPlacement} from "../src/aim-placement.ts";
import {lineupWalkthrough} from "../src/lineup-walkthrough.ts";

test("each zoom original matches a whole-frame view in the released guide and its native file", () => {
  const maps = Object.keys(proof.audit);
  const expanded = maps.flatMap(map => {
    const file = new URL(`../src/data/expanded/${map}.json`, import.meta.url);
    return normalizeExpandedGuides(JSON.parse(readFileSync(file, "utf8")), map);
  });
  const records = new Map(mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded).map(record => [record.id, record]));
  assert.deepEqual(Object.keys(assets).sort(), proof.records.map(p => p.baseImage).sort());
  for (const source of proof.records) {
    const record = records.get(source.guide);
    assert.ok(record, source.guide);
    assert.equal(record.source, source.source);
    const stage = lineupWalkthrough(record, utilityPhotos(withAimPlacement(record))).find(s => s.stage === source.stage);
    const base = stage?.views.find(v => v.photo?.image === source.baseImage)?.photo;
    assert.ok(base, `${record.id} ${source.stage} ${source.baseImage}`);
    assert.equal(base.region, undefined);
    const original = highResolutionPhoto(base.image);
    assert.deepEqual(original, {image: source.image, width: source.width, height: source.height});
    assert.ok(source.width > source.baseWidth && source.height > source.baseHeight);
    assert.equal(source.width * source.baseHeight, source.height * source.baseWidth);
    assert.ok(source.similarity >= 0.965 && source.minQuadrantSimilarity >= 0.94 && source.meanChannelDifference <= 6);
    const file = new URL(`../public${source.image}`, import.meta.url);
    const content = readFileSync(file);
    const hash = createHash("sha256").update(content).digest("hex");
    assert.equal(hash, source.sha256);
    assert.ok(source.image.endsWith(`/${hash.slice(0, 16)}.webp`));
    assert.equal(content.toString("ascii", 8, 16), "WEBPVP8 ");
    assert.equal(content.readUInt16LE(26) & 0x3fff, source.width);
    assert.equal(content.readUInt16LE(28) & 0x3fff, source.height);
  }
});

test("unregistered photos keep the publisher's original, including names that shadow object properties", () => {
  for (const input of ["", "__proto__", "constructor", "https://example.org/photo.webp"]) {
    assert.equal(highResolutionPhoto(input), undefined);
  }
});
