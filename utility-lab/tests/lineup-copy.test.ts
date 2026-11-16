import test from "node:test";
import assert from "node:assert/strict";
import { clearPhotoInstructions } from "../src/lineup-copy.ts";
import { PHOTO_LINEUPS } from "../src/lineup-photos.ts";
import { COMPENDIUM_PHOTO_LINEUPS } from "../src/photos.compendium.ts";

test("source photo instructions stay short and retain throw inputs and attribution", () => {
  for (const original of PHOTO_LINEUPS) {
    const guide = clearPhotoInstructions(original);
    assert.equal(guide.steps.length, 3);
    assert.ok(guide.steps[0].includes(original.from));
    assert.equal(guide.steps[2], original.throwType + ".");
    assert.equal(guide.purpose, "");
    for (const [index, photo] of (guide.photos || []).entries()) {
      assert.equal(photo.image, original.photos[index].image);
      assert.equal(photo.license, original.photos[index].license);
      assert.equal(photo.source, original.photos[index].source);
      assert.ok(photo.caption.length < 100);
    }
  }
});

test("composites retain numbered panel alignment and personal instructions stay unchanged", () => {
  for (const guide of COMPENDIUM_PHOTO_LINEUPS) {
    const value = clearPhotoInstructions(guide);
    const suffix = guide.id.split("-").at(-1);
    if (guide.id.includes("window-spawn")) {
      assert.ok(value.steps[0].includes(suffix!));
      assert.ok(value.steps[1].includes(suffix!));
      assert.match(value.steps[2], /Shift \+ W/);
    }
    assert.equal(value.steps.length, 3);
  }
  const personal = { ...PHOTO_LINEUPS[0], userCreated: true };
  assert.equal(clearPhotoInstructions(personal), personal);
});
