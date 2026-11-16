import test from "node:test";
import assert from "node:assert/strict";
import { GONADE_GUIDE_VIDEOS } from "../src/data/gonade-guide-videos.ts";
import { GONADE_PHOTO_GALLERIES } from "../src/data/gonade-photo-gallery.ts";

test("native video choices belong to the same source guide as their photos", () => {
  for (const [id, video] of Object.entries(GONADE_GUIDE_VIDEOS)) {
    const photos = GONADE_PHOTO_GALLERIES[id];
    assert.ok(photos, `Unknown guide: ${id}`);
    const url = new URL(video.videoUrl);
    assert.equal(url.origin, "https://gonade.app", id);
    assert.equal(url.search, "", id);
    assert.equal(url.hash, "", id);
    const sourceId = /^\/videos\/(\d+)\.mp4$/.exec(url.pathname)?.[1];
    assert.ok(sourceId, id);
    for (const photo of photos)
      assert.ok(
        new URL(photo.image).pathname.includes(`/${sourceId}/`),
        `Wrong original clip for ${id}`,
      );
    assert.ok(video.videoStart === undefined || video.videoStart === 0, id);
  }
});
