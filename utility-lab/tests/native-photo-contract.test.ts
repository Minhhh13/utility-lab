import test from "node:test";
import assert from "node:assert/strict";
import { GUIDE_LIBRARY } from "../src/guide-library.ts";
import { nativePhotoRecord } from "../src/native-photo-library.ts";
import {
  MAX_LINEUP_PHOTOS,
  MAX_REMOTE_LINEUP_PHOTOS,
  utilityPhotos,
  validateUtility,
  type UtilityPhoto,
} from "../src/utility-data.ts";

const PERSONAL_PHOTO: UtilityPhoto = {
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=",
  caption: "My own aim reference",
  kind: "aim",
};

test("every formerly hosted guide supplies ordered images to our own gallery", () => {
  const remote = GUIDE_LIBRARY.filter((guide) => guide.remotePhotos?.length);
  assert.equal(
    remote.length,
    217,
    "All original online photo guides need native gallery images.",
  );
  for (const guide of remote) {
    const photos = guide.remotePhotos!;
    assert.ok(photos.length <= MAX_REMOTE_LINEUP_PHOTOS, guide.id);
    assert.deepEqual(
      utilityPhotos(guide).slice(0, photos.length),
      photos,
      guide.id,
    );
    assert.ok(validateUtility(guide), guide.id);
    assert.doesNotMatch(guide.steps.join("\n"), /Choose Lineup in the original guide|Load hosted photo guide/i, guide.id);
    const first = photos[0];
    assert.ok(
      first.kind === "position" ||
        /position.*aim|aim.*position/i.test(first.caption),
      `Position must lead, including an honestly combined reference: ${guide.id}`,
    );
    for (const photo of photos) {
      const image = new URL(photo.image);
      assert.equal(image.protocol, "https:", guide.id);
      assert.equal(image.username, "", guide.id);
      assert.equal(image.password, "", guide.id);
      assert.ok(photo.creator?.trim(), `Missing photo credit: ${guide.id}`);
      assert.ok(
        photo.source?.startsWith("https://"),
        `Missing original source: ${guide.id}`,
      );
      assert.ok(photo.caption.trim() && photo.caption.length <= 240, guide.id);
    }
  }
});

test("seven-slide originals remain intact alongside personal photos and through transfer validation", () => {
  const guide = GUIDE_LIBRARY.find(
    (record) => record.id === "lineupspro-cache-highway-firetruck-5erxnx",
  )!;
  assert.ok(guide);
  assert.equal(guide.remotePhotos?.length, 7);
  const personal = validateUtility({
    ...guide,
    userCreated: true,
    photos: [PERSONAL_PHOTO],
  });
  assert.ok(personal);
  assert.deepEqual(personal.remotePhotos, guide.remotePhotos);
  assert.equal(utilityPhotos(personal).length, 8);
  assert.equal(utilityPhotos(personal).at(-1)?.caption, PERSONAL_PHOTO.caption);
  assert.equal(
    MAX_LINEUP_PHOTOS,
    4,
    "Remote galleries must not silently expand the upload limit.",
  );
  assert.equal(
    validateUtility({
      ...guide,
      remotePhotos: Array.from(
        { length: MAX_REMOTE_LINEUP_PHOTOS + 1 },
        () => guide.remotePhotos![0],
      ),
    }),
    null,
  );
});

test("remote gallery imports reject executable, insecure and credential-bearing images", () => {
  const guide = GUIDE_LIBRARY.find((record) => record.remotePhotos?.length)!;
  assert.ok(guide);
  const sample = guide.remotePhotos![0];
  for (const image of [
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "file:///private/photo.png",
    "http://images.example/aim.png",
    "https://user:secret@images.example/aim.png",
  ])
    assert.equal(
      validateUtility({ ...guide, remotePhotos: [{ ...sample, image }] }),
      null,
      image,
    );
  assert.equal(
    validateUtility({
      ...guide,
      remotePhotos: [{ ...sample, source: "javascript:alert(1)" }],
    }),
    null,
  );
});

test("ordinary imported IDs cannot resolve inherited object properties as photo galleries", () => {
  for (const id of ["__proto__", "constructor", "toString"]) {
    const record = validateUtility({
      ...GUIDE_LIBRARY[0],
      id,
      remotePhotos: [],
      photoEmbed: undefined,
      userCreated: true,
    });
    assert.ok(record);
    assert.equal(nativePhotoRecord(record), record);
    assert.doesNotThrow(() => utilityPhotos(nativePhotoRecord(record)));
  }
});
