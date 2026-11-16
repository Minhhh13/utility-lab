import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { photoAimPosition, withAimPlacement } from "../src/aim-placement.ts";
import { utilityPhotos, validateUtility, type UtilityPhoto, type UtilityReference } from "../src/utility-data.ts";

const rows: UtilityReference[] = ["mirage", "dust2", "inferno", "ancient", "anubis", "cache", "nuke", "vertigo"].flatMap(map =>
  JSON.parse(readFileSync(new URL(`../src/data/expanded/${map}.json`, import.meta.url), "utf8")));
const sourceRow = rows.find(row => row.id === "expanded-cs2tricks-ancient-b-alley-from-ruins-6af7-t")!;
assert.ok(sourceRow);
function withoutPoint(photo: UtilityPhoto): UtilityPhoto {
  const { aimPoint: _verified, ...original } = photo;
  return original;
}
// Generated catalogues can already carry the restored metadata. Exercise
// inference on original, unannotated camera photos separately from retention.
const source: UtilityReference = { ...sourceRow,
  photos: sourceRow.photos?.map(withoutPoint),
  remotePhotos: sourceRow.remotePhotos?.map(withoutPoint),
};
const aim = { image: "https://example.com/photo.webp", caption: "Aim", kind: "aim", aimPoint: { x: .25, y: .75 } } satisfies UtilityPhoto;

test("publisher overlays restore only verified source camera views, including its zoom detail", () => {
  const original = structuredClone(source);
  const restored = withAimPlacement(source);
  const photos = utilityPhotos(restored);
  assert.deepEqual(source, original, "keep original records and image pixels untouched");
  assert.deepEqual(photos.filter(photo => photo.kind === "aim").map(photo => photo.aimPoint), [{ x: .5, y: .5 }]);
  assert.ok(photos.filter(photo => photo.kind !== "aim").every(photo => !photo.aimPoint));
  const detailed = rows.find(row => row.id === "expanded-cs2tricks-anubis-heaven-from-water-d678-t")!;
  assert.ok(detailed);
  assert.deepEqual(utilityPhotos(withAimPlacement(detailed)).filter(photo => photo.kind === "aim").map(photo => photo.aimPoint), [{ x: .5, y: .5 }, { x: .5, y: .5 }]);
  const csnades = rows.find(row => row.source === "https://csnades.gg/cache/hegrenades/backsite-from-sun-room")!;
  assert.ok(csnades);
  assert.deepEqual(utilityPhotos(withAimPlacement(csnades)).find(photo => photo.kind === "aim")?.aimPoint, { x: .5, y: .5 });
});

test("inference excludes personal images, unknown hosts, non-camera crops and unreviewed extra Aim views", () => {
  assert.equal(withAimPlacement({ ...source, userCreated: true }).remotePhotos?.find(photo => photo.kind === "aim")?.aimPoint, undefined);
  const transformed = { ...source, remotePhotos: [
    { ...aim, aimPoint: undefined, source: source.source },
    { ...source.remotePhotos!.find(photo => photo.kind === "aim")!, region: { x: 0, y: 0, width: 500, height: 500, sourceWidth: 1400, sourceHeight: 788 } },
  ] };
  assert.ok(utilityPhotos(withAimPlacement(transformed)).every(photo => !photo.aimPoint));
  const custom = { ...source, remotePhotos: [{ ...aim, source: source.source }] };
  assert.deepEqual(utilityPhotos(withAimPlacement(custom))[0].aimPoint, aim.aimPoint, "explicit reviewed points are retained");
});

test("normalized aim metadata survives validation/export and rejects ambiguous coordinates", () => {
  const valid = validateUtility({ ...source, remotePhotos: [aim] });
  assert.ok(valid);
  assert.deepEqual(valid.remotePhotos?.[0].aimPoint, aim.aimPoint);
  assert.deepEqual(validateUtility(JSON.parse(JSON.stringify(valid)))?.remotePhotos?.[0].aimPoint, aim.aimPoint);
  assert.deepEqual(utilityPhotos(withAimPlacement({ ...valid, userCreated: true }))[0].aimPoint, aim.aimPoint, "portable personal copies retain their original verified point");
  for (const point of [null, { x: -.01, y: .5 }, { x: .5, y: 1.01 }, { x: "0.5", y: .5 }, { x: Infinity, y: .5 }, { x: NaN, y: .5 }]) {
    assert.equal(validateUtility({ ...source, remotePhotos: [{ ...aim, aimPoint: point }] }), null);
  }
  assert.equal(validateUtility({ ...source, remotePhotos: [{ ...aim, kind: "position" }] }), null);
});

test("every current publisher camera Aim keeps its verified overlay across all eight maps", () => {
  const provider = rows.filter(row => row.source?.includes("www.cs2tricks.com/nades/") || row.source?.includes("csnades.gg/") && !row.source.includes("/community/"));
  assert.equal(new Set(provider.map(row => row.mapId)).size, 8);
  assert.ok(provider.length > 1400);
  for (const row of provider) {
    for (const photo of utilityPhotos(withAimPlacement(row)).filter(photo => photo.kind === "aim"))
      assert.deepEqual(photo.aimPoint, { x: .5, y: .5 }, `${row.id}: missing original publisher overlay on ${photo.image}`);
  }
});

test("contain placement respects letterboxes, source aspect and proportional zoom", () => {
  assert.deepEqual(photoAimPosition(aim, { width: 1000, height: 1000 }, { width: 1600, height: 900 }), { x: 250, y: 640.625 });
  assert.deepEqual(photoAimPosition(aim, { width: 1500, height: 1500 }, { width: 1600, height: 900 }), { x: 375, y: 960.9375 });
  assert.deepEqual(photoAimPosition(aim, { width: 1000, height: 1000 }, { width: 900, height: 1600 }), { x: 359.375, y: 750 });
  assert.equal(photoAimPosition(aim, { width: 0, height: 1000 }, { width: 1600, height: 900 }), null);
  assert.equal(photoAimPosition({ ...aim, kind: "position" }, { width: 1000, height: 1000 }, { width: 1600, height: 900 }), null);
});

test("portrait original reticle maps into its selected panel rather than panel centre", () => {
  const guide = rows.find(row => row.id === "expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8")!;
  assert.ok(guide);
  const photo = utilityPhotos(withAimPlacement(guide)).find(photo => photo.kind === "aim")!;
  const point = photoAimPosition(photo, { width: 650, height: 1460 }, { width: 1080, height: 1920 });
  assert.deepEqual(point, { x: 110, y: 500 });
  assert.deepEqual(photoAimPosition(photo, { width: 975, height: 2190 }, { width: 1080, height: 1920 }), { x: 165, y: 750 });
  assert.equal(photoAimPosition({ ...photo, aimPoint: { x: .1, y: .1 } }, { width: 650, height: 1460 }, { width: 1080, height: 1920 }), null, "off-panel points cannot float outside a crop");
});
