import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { withPublisherAimCloseup } from "../scripts/publisher-aim-closeup.mjs";
import bindings from "../docs/data/cs2tricks-aim-closeups.json" with { type: "json" };
import { MAPS } from "../src/maps.ts";
import { utilityPhotos, type UtilityReference } from "../src/utility-data.ts";

const pages = "https://www.cs2tricks.com/nades/";
const cdn = "https://d1ntlvfrxziqo6.cloudfront.net/";
const guides: UtilityReference[] = MAPS.flatMap(map =>
  JSON.parse(readFileSync(new URL(`../src/data/expanded/${map.id}.json`, import.meta.url), "utf8"))
);

test("every audited creator zoom file follows its own wide image in the published catalogue", () => {
  for (const [path, pair] of Object.entries(bindings)) {
    const matching = guides.filter(guide => guide.source === pages + path);
    assert.ok(matching.length, path);
    for (const guide of matching) {
      const aims = utilityPhotos(guide).filter(photo => photo.kind === "aim");
      assert.deepEqual(aims.map(photo => photo.image), [cdn + pair.wide, cdn + pair.detail], guide.id);
      assert.notEqual(aims[0].image, aims[1].image, guide.id);
      assert.equal(aims[1].creator, aims[0].creator, guide.id);
      assert.equal(aims[1].source, guide.source, guide.id);
      assert.deepEqual(aims[1].aimPoint, { x: 0.5, y: 0.5 }, guide.id);
    }
    assert.match(pair.sha256, /^[a-f0-9]{64}$/, path);
    assert.ok(pair.width >= 1000 && pair.height >= 720, path);
  }
});

test("a creator close-up applies only to the original wide view and preserves prior galleries", () => {
  const [path, pair] = Object.entries(bindings)[0];
  const source = pages + path;
  const wide = { source, kind: "aim", caption: "Wide", image: cdn + pair.wide };
  const record = { source, photos: [wide], userCreated: false };
  const complete = withPublisherAimCloseup(record);
  assert.equal(complete.photos[1].image, cdn + pair.detail);
  assert.equal(withPublisherAimCloseup(complete), complete);
  for (const other of [
    { ...record, source: source + "-copy" }, { ...record, userCreated: true },
    { ...record, photos: [{ ...wide, image: cdn + pair.detail }] },
    { ...record, photos: [{ ...wide, source: source + "-copy" }] },
    { ...record, photos: [{ ...wide, aimPoint: { x: 0.25, y: 0.75 } }] },
    { ...record, photos: [{ ...wide, region: { x: 0, y: 0, width: 128, height: 72 } }] },
  ]) assert.equal(withPublisherAimCloseup(other), other);
});
