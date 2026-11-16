import test from "node:test";
import assert from "node:assert/strict";
import {
  FILL_PHOTO_LINEUPS,
  FILL_PHOTO_EVIDENCE,
} from "../src/photos.gonade-fill.ts";
import { validateUtility } from "../src/utility-data.ts";

test("targeted photo additions preserve complete original pages and valid metadata", () => {
  assert.equal(FILL_PHOTO_LINEUPS.length, 17);
  assert.equal(new Set(FILL_PHOTO_LINEUPS.map((guide) => guide.id)).size, 17);
  assert.equal(FILL_PHOTO_EVIDENCE.length, 17);
  for (const guide of FILL_PHOTO_LINEUPS) {
    assert.ok(validateUtility(guide), guide.id);
    assert.ok(["dust2", "ancient", "cache"].includes(guide.mapId));
    assert.equal(guide.levelId, "main");
    assert.equal(
      guide.showMarker,
      false,
      "Landing pins require separate registration",
    );
    assert.equal(guide.userCreated, false);
    assert.equal(guide.source, guide.photoEmbed?.postUrl);
    assert.equal(guide.source, guide.photoEmbed?.embedUrl);
    assert.equal(guide.image, undefined);
    assert.equal(guide.photos, undefined);
    assert.equal(guide.videoUrl, undefined);
    assert.equal(guide.steps.length, 3);
    assert.ok(
      guide.steps.every((step) => step.length > 0 && step.length <= 160),
    );
    assert.doesNotMatch(
      guide.steps.join(" "),
      /setpos|setang|console|\.cfg|game build|practice recommended/i,
    );
    const evidence = FILL_PHOTO_EVIDENCE.find((row) => row.id === guide.id)!;
    assert.equal(evidence.source, guide.source);
    assert.ok(evidence.lineupPhotos >= 2);
    assert.ok(evidence.resultPhotos >= 1);
  }
});

test("every requested missing map-side-utility photo combination has an actual source", () => {
  const pairs = [
    ["dust2", "T", "HE"],
    ["dust2", "CT", "Molotov"],
    ["dust2", "CT", "HE"],
    ["ancient", "T", "HE"],
    ["ancient", "CT", "Flash"],
    ["ancient", "CT", "HE"],
    ["cache", "T", "Flash"],
    ["cache", "T", "HE"],
    ["cache", "CT", "Flash"],
    ["cache", "CT", "HE"],
  ];
  for (const [map, side, type] of pairs)
    assert.ok(
      FILL_PHOTO_LINEUPS.some(
        (guide) =>
          guide.mapId === map && guide.side === side && guide.type === type,
      ),
      `${map}:${side}:${type}`,
    );
  assert.equal(
    FILL_PHOTO_LINEUPS.filter(
      (guide) => guide.photoEmbed?.provider === "gonade",
    ).length,
    16,
  );
  assert.equal(
    FILL_PHOTO_EVIDENCE.reduce(
      (sum, row) => sum + row.lineupPhotos + row.resultPhotos,
      0,
    ),
    55,
  );
});

test("Cache T HE uses the public author gallery and published inputs rather than a repurposed CT throw", () => {
  const guide = FILL_PHOTO_LINEUPS.find(
    (guide) =>
      guide.side === "T" && guide.mapId === "cache" && guide.type === "HE",
  )!;
  assert.equal(guide.source, "https://lineups.pro/cache/5erxnx");
  assert.equal(guide.photoEmbed?.provider, "lineupspro");
  assert.equal(guide.creator, "scully · Lineups.pro");
  assert.equal(guide.from, "Firetruck");
  assert.equal(guide.target, "Highway");
  assert.equal(guide.throwType, "Run + Jump + LMB");
  assert.match(guide.steps[1], /AIM.*RELEASE/);
  assert.match(guide.steps[2], /W.*jump.*LMB/);
  const evidence = FILL_PHOTO_EVIDENCE.find((row) => row.id === guide.id)!;
  assert.equal(evidence.lineupPhotos, 4);
  assert.equal(evidence.resultPhotos, 3);
  assert.equal(evidence.publishedAt, "2026-07-05");
  const middle = FILL_PHOTO_LINEUPS.find(
    (guide) => guide.id === "gonade-dust2-a-site-from-ct-spawn-he",
  )!;
  assert.match(middle.throwType, /Middle click \(source label\)/);
  assert.doesNotMatch(
    middle.throwType + middle.steps.join(" "),
    /LMB|RMB|both/i,
  );
  assert.match(
    FILL_PHOTO_LINEUPS.find(
      (guide) => guide.id === "gonade-cache-a-main-from-back-a-site-flash",
    )!.steps[2],
    /Call the flash to your teammate/,
  );
});
