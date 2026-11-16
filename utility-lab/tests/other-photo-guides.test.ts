import test from "node:test";
import assert from "node:assert/strict";
import {
  OTHER_MAP_PHOTO_LINEUPS,
  OTHER_PHOTO_EVIDENCE,
  OTHER_PHOTO_SOURCE_CHECKED,
} from "../src/photos.gonade-other.ts";
import { validateUtility } from "../src/utility-data.ts";

test("Inferno and Anubis photo references retain complete original pages without copying media", () => {
  assert.equal(OTHER_MAP_PHOTO_LINEUPS.length, 95);
  assert.equal(
    new Set(OTHER_MAP_PHOTO_LINEUPS.map((guide) => guide.id)).size,
    95,
  );
  assert.equal(OTHER_PHOTO_EVIDENCE.length, 95);
  assert.equal(OTHER_PHOTO_SOURCE_CHECKED, "2026-11-09");
  for (const guide of OTHER_MAP_PHOTO_LINEUPS) {
    assert.ok(validateUtility(guide), guide.id);
    assert.ok(["inferno", "anubis"].includes(guide.mapId), guide.id);
    assert.equal(guide.levelId, "main");
    assert.equal(guide.creator, "GO NADE");
    assert.equal(guide.photoEmbed?.provider, "gonade");
    assert.equal(guide.source, guide.photoEmbed?.postUrl);
    assert.equal(guide.source, guide.photoEmbed?.embedUrl);
    assert.match(
      guide.source!,
      new RegExp(`^https://gonade\\.app/nade/${guide.mapId}-[a-z0-9-]+$`),
    );
    assert.equal(guide.image, undefined);
    assert.equal(guide.photos, undefined);
    assert.equal(
      guide.videoUrl,
      undefined,
      "A declared MP4 path alone does not prove playable video",
    );
    assert.equal(guide.userCreated, false);
    assert.equal(
      guide.showMarker,
      false,
      "Central registration decides whether a target has a pin",
    );
    assert.equal(guide.steps.length, 3);
    assert.ok(
      guide.steps.every((step) => step.length > 0 && step.length < 160),
    );
    assert.ok(
      !guide.steps.some((step) =>
        /setpos|setang|console|\.cfg|game build|practice recommended/i.test(
          step,
        ),
      ),
    );
    const evidence = OTHER_PHOTO_EVIDENCE.find((row) => row.id === guide.id)!;
    assert.equal(evidence.source, guide.source);
    assert.ok(evidence.lineupPhotos >= 2);
    assert.equal(evidence.resultPhotos, 1);
  }
});

test("both maps cover four utility types and both sides, and an explicitly uncertain updated guide is omitted", () => {
  for (const [map, expected] of [
    ["inferno", 45],
    ["anubis", 50],
  ] as const) {
    const guides = OTHER_MAP_PHOTO_LINEUPS.filter(
      (guide) => guide.mapId === map,
    );
    assert.equal(guides.length, expected);
    for (const side of ["T", "CT"]) {
      for (const type of ["Smoke", "Flash", "Molotov", "HE"])
        assert.ok(
          guides.some((guide) => guide.side === side && guide.type === type),
          `${map}:${side}:${type}`,
        );
    }
  }
  assert.equal(
    OTHER_PHOTO_EVIDENCE.reduce(
      (sum, row) => sum + row.lineupPhotos + row.resultPhotos,
      0,
    ),
    299,
  );
  assert.ok(
    !OTHER_MAP_PHOTO_LINEUPS.some(
      (guide) => guide.id === "gonade-anubis-a-plat-from-outside-a-main-smoke",
    ),
  );
});

test("photo roles, movement prerequisites and source-labelled middle clicks remain faithful", () => {
  const find = (slug: string) =>
    OTHER_MAP_PHOTO_LINEUPS.find((guide) => guide.id === `gonade-${slug}`)!;
  assert.equal(
    OTHER_PHOTO_EVIDENCE.filter((row) => row.finalPhotoRole === "release")
      .length,
    29,
  );
  for (const row of OTHER_PHOTO_EVIDENCE.filter(
    (row) => row.sourceClick === "Middle click",
  )) {
    const guide = OTHER_MAP_PHOTO_LINEUPS.find((guide) => guide.id === row.id)!;
    assert.match(guide.throwType, /Middle click \(source label\)/);
    assert.doesNotMatch(guide.throwType, /LMB|RMB|both/i);
    assert.doesNotMatch(guide.steps.join(" "), /LMB|RMB|both/i);
  }
  assert.equal(
    OTHER_PHOTO_EVIDENCE.filter((row) => row.sourceClick === "Middle click")
      .length,
    9,
  );
  assert.match(find("anubis-b-site-from-back-b-site-flash").throwType, /RMB/);
  assert.match(
    find("anubis-t-stairs-from-a-plat-he").steps[1],
    /wood covering the window/,
  );
  assert.match(
    find("anubis-mid-doorswindow-from-ruins-molotov").steps[2],
    /second step/,
  );
  assert.match(
    find("anubis-t-stairs-from-mid-window-flash").steps[1],
    /left window.*release point/,
  );
  assert.match(
    find("anubis-back-b-site-from-eboxb-connector-he").steps[1],
    /two clips in the wire/,
  );
  assert.match(
    find("inferno-coffins-from-car-smoke").steps[1],
    /line on the wood/,
  );
  assert.match(
    find("inferno-coffins-from-car-smoke").steps[2],
    /Ctrl.*jump.*LMB/,
  );
  assert.match(
    find("inferno-car-from-coffins-flash").steps[1],
    /top of the antenna/,
  );
  assert.match(
    find("inferno-ct-b-from-t-spawn-smoke").steps[2],
    /W \+ Shift.*jump.*shown point/,
  );
  assert.match(
    find("inferno-deep-banana-from-corner-he").steps[1],
    /same point while running/,
  );
});
