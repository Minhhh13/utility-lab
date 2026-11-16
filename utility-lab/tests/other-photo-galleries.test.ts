import test from "node:test";
import assert from "node:assert/strict";
import { OTHER_PHOTO_GALLERIES } from "../src/data/other-photo-galleries.ts";
import { OTHER_GUIDE_VIDEOS } from "../src/data/other-guide-videos.ts";
import { parseUtilityVideo } from "../src/utility-data.ts";

test("non-GO NADE galleries retain native ordering and original source attribution", () => {
  assert.equal(Object.keys(OTHER_PHOTO_GALLERIES).length, 8);
  assert.equal(Object.values(OTHER_PHOTO_GALLERIES).flat().length, 24);
  for (const [id, photos] of Object.entries(OTHER_PHOTO_GALLERIES)) {
    assert.equal(
      new Set(photos.map((photo) => photo.image)).size,
      photos.length,
      id,
    );
    if (id.startsWith("csnades-")) {
      assert.equal(photos.length, 1);
      assert.equal(photos[0].kind, "aim");
      assert.match(photos[0].caption, /^Position & aim/);
    } else {
      assert.equal(photos[0].kind, "position", id);
      const aim = photos.findIndex((photo) => photo.kind === "aim");
      assert.ok(aim > 0, id);
      assert.ok(
        photos.slice(0, aim).every((photo) => photo.kind === "position"),
        id,
      );
    }
    for (const photo of photos) {
      const image = new URL(photo.image),
        source = new URL(photo.source!);
      assert.equal(image.protocol, "https:", id);
      assert.ok(
        [
          "assets.csnades.gg",
          "d1ntlvfrxziqo6.cloudfront.net",
          "lineups.pro",
        ].includes(image.hostname),
        id,
      );
      assert.equal(
        image.username + image.password + image.search + image.hash,
        "",
        id,
      );
      assert.equal(source.protocol, "https:");
      assert.ok(photo.creator && photo.creator.length <= 120, id);
      assert.ok(photo.caption.length > 0 && photo.caption.length <= 240, id);
      assert.equal(
        photo.license,
        undefined,
        "Source references must not invent a republication license.",
      );
    }
  }
});

test("Cache's seven photographs preserve exact spot, aim, release and result stages", () => {
  const photos =
    OTHER_PHOTO_GALLERIES["lineupspro-cache-highway-firetruck-5erxnx"];
  assert.deepEqual(
    photos.map((photo) => photo.kind),
    ["position", "position", "aim", "release", "landing", "landing", "landing"],
  );
  assert.equal(photos[0].caption, "Find Firetruck.");
  assert.equal(photos[1].caption, "Match this exact standing spot.");
  assert.ok(photos.every((photo) => photo.creator === "scully · Lineups.pro"));
});

test("verified same-guide videos match photo records and unsupported Cache video stays absent", () => {
  assert.equal(Object.keys(OTHER_GUIDE_VIDEOS).length, 7);
  for (const [id, video] of Object.entries(OTHER_GUIDE_VIDEOS)) {
    assert.ok(OTHER_PHOTO_GALLERIES[id], id);
    const parsed = parseUtilityVideo(video.videoUrl, video.videoStart);
    assert.ok(parsed, id);
    if (id.startsWith("csnades-")) {
      assert.equal(parsed.kind, "file");
      assert.match(
        video.videoUrl,
        /^https:\/\/assets\.csnades\.gg\/nades\/nuke-smoke-[a-zA-Z0-9]+\/hq\.mp4$/,
      );
    } else assert.equal(parsed.kind, "youtube");
  }
  assert.equal(
    OTHER_GUIDE_VIDEOS["lineupspro-cache-highway-firetruck-5erxnx"],
    undefined,
  );
});
