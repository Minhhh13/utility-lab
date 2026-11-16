import test from "node:test";
import assert from "node:assert/strict";
import {
  VERTIGO_PHOTO_EVIDENCE,
  VERTIGO_PHOTO_LINEUPS,
} from "../src/photos.vertigo.ts";
import { validateUtility } from "../src/utility-data.ts";

test("Vertigo has source-hosted position/aim guides for every utility and both sides", () => {
  assert.equal(VERTIGO_PHOTO_LINEUPS.length, 41);
  for (const side of ["T", "CT"] as const)
    for (const type of ["Smoke", "Flash", "Molotov", "HE"] as const)
      assert.ok(
        VERTIGO_PHOTO_LINEUPS.some(
          (guide) => guide.side === side && guide.type === type,
        ),
        `${side} ${type}`,
      );
  for (const guide of VERTIGO_PHOTO_LINEUPS) {
    assert.ok(validateUtility(guide), guide.id);
    assert.equal(guide.mapId, "vertigo");
    assert.equal(guide.userCreated, false);
    assert.equal(guide.showMarker, false);
    assert.equal(guide.photoEmbed?.provider, "gonade");
    assert.equal(guide.photoEmbed?.postUrl, guide.source);
    assert.equal(guide.photoEmbed?.embedUrl, guide.source);
    assert.match(
      guide.source!,
      /^https:\/\/gonade\.app\/nade\/vertigo-[a-z0-9-]+$/,
    );
    assert.deepEqual(guide.photos, []);
    // All 41 same-guide MP4 endpoint HEAD checks returned HTML, not video.
    assert.equal(guide.videoUrl, undefined);
    assert.equal(guide.steps.length, 3);
    assert.doesNotMatch(
      guide.steps.join(" "),
      /setpos|setang|exec\s|game files|sv_cheats|license|copyright|current.build/i,
    );
  }
});

test("photo evidence names actual source steps and preserves ambiguous click labels", () => {
  assert.equal(
    new Set(VERTIGO_PHOTO_LINEUPS.map((guide) => guide.id)).size,
    VERTIGO_PHOTO_LINEUPS.length,
  );
  assert.equal(VERTIGO_PHOTO_EVIDENCE.length, VERTIGO_PHOTO_LINEUPS.length);
  for (const evidence of VERTIGO_PHOTO_EVIDENCE) {
    assert.ok(evidence.positionAimImages >= 2);
    assert.equal(evidence.resultImages, 1);
    const guide = VERTIGO_PHOTO_LINEUPS.find(
      (guide) => guide.id === evidence.id,
    )!;
    assert.ok(guide);
    assert.equal(guide.source, evidence.source);
    if (evidence.sourceClick === "Middle click") {
      assert.match(guide.throwType, /Middle click \(source label\)/);
      assert.doesNotMatch(guide.throwType, /LMB|RMB|both/i);
    }
    if (evidence.finalPhotoRole === "release")
      assert.match(guide.steps[1], /release.position reference/);
  }
});

test("lower-floor placement follows the inspected destination rather than every lower-origin flag", () => {
  const lower = VERTIGO_PHOTO_LINEUPS.filter(
    (guide) => guide.levelId === "lower",
  );
  assert.deepEqual(
    lower.map((guide) => guide.id),
    ["gonade-vertigo-4029"],
  );
  assert.equal(lower[0].from, "Bottom Ramp");
  assert.equal(lower[0].showMarker, false);
  assert.equal(
    VERTIGO_PHOTO_LINEUPS.find((guide) => guide.id === "gonade-vertigo-4021")
      ?.levelId,
    "upper",
  );
  // These source pages contain only one aim image, not a documented sequence.
  for (const id of [4005, 4010, 4012, 4014, 4015, 4017, 4023, 4040])
    assert.ok(
      !VERTIGO_PHOTO_LINEUPS.some(
        (guide) => guide.id === `gonade-vertigo-${id}`,
      ),
    );
});
