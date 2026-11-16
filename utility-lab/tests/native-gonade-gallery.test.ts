import test from "node:test";
import assert from "node:assert/strict";
import { GONADE_PHOTO_GALLERIES } from "../src/data/gonade-photo-gallery.ts";
import { NUKE_PHOTO_LINEUPS } from "../src/photos.nuke.ts";
import { VERTIGO_PHOTO_LINEUPS } from "../src/photos.vertigo.ts";
import { OTHER_MAP_PHOTO_LINEUPS } from "../src/photos.gonade-other.ts";
import { MIRAGE_ONLINE_PHOTO_LINEUPS } from "../src/photos.mirage-online.ts";
import { FILL_PHOTO_LINEUPS } from "../src/photos.gonade-fill.ts";

const records = [
  ...NUKE_PHOTO_LINEUPS,
  ...VERTIGO_PHOTO_LINEUPS,
  ...OTHER_MAP_PHOTO_LINEUPS,
  ...MIRAGE_ONLINE_PHOTO_LINEUPS,
  ...FILL_PHOTO_LINEUPS,
].filter((record) => record.source?.startsWith("https://gonade.app/nade/"));

test("every GO NADE guide has its own direct online images, ordered source roles and credits", () => {
  assert.deepEqual(
    new Set(Object.keys(GONADE_PHOTO_GALLERIES)),
    new Set(records.map((record) => record.id)),
  );
  for (const record of records) {
    const photos = GONADE_PHOTO_GALLERIES[record.id];
    assert.ok(photos.length >= 2 && photos.length <= 12, record.id);
    const ownDirectory = new URL(photos[0].image).pathname.replace(
      /\/[^/]+$/,
      "/",
    );
    for (const photo of photos) {
      const url = new URL(photo.image);
      assert.equal(url.origin, "https://gonade.app", record.id);
      assert.match(
        url.pathname,
        /^\/images\/maps\/(?:\d+\/\d+\/(?:lineup\d+|result)\.png|webp\/\d+\/(?:lineup\d+|result)\.webp)$/,
        record.id,
      );
      assert.ok(
        !url.pathname.includes("/thumbs/"),
        `${record.id}: a result thumbnail must not replace a full reference`,
      );
      assert.ok(
        url.pathname.startsWith(ownDirectory),
        `${record.id}: related-guide images must not be mixed in`,
      );
      assert.equal(photo.source, record.source);
      assert.equal(photo.creator, "GO NADE");
      assert.ok(photo.caption && photo.caption.length <= 240, record.id);
    }
    assert.equal(photos.at(-1)?.kind, "landing", record.id);
    assert.ok(["position", "aim"].includes(photos[0].kind || ""), record.id);
    assert.ok(
      photos.slice(0, -1).every((photo) => photo.kind !== "landing"),
      record.id,
    );
  }
});

test("the user's Mirage running flash keeps combined position/aim and the real release reference", () => {
  const photos = GONADE_PHOTO_GALLERIES["gonade-mirage-6029"];
  assert.equal(photos.length, 3);
  assert.match(photos[0].caption, /Position & aim/);
  assert.equal(photos[1].kind, "release");
  assert.match(photos[1].image, /\/6029\/lineup1\.(?:png|webp)/);
  assert.equal(photos[2].kind, "landing");
});
