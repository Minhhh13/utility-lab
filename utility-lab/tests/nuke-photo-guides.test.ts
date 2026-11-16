import test from "node:test";
import assert from "node:assert/strict";
import {
  NUKE_PHOTO_LINEUPS,
  NUKE_PHOTO_SOURCE_COUNTS,
} from "../src/photos.nuke.ts";
import { validateUtility } from "../src/utility-data.ts";

test("Nuke's original source-hosted photo guides retain valid sources and exact input labels", () => {
  assert.equal(NUKE_PHOTO_LINEUPS.length, 50);
  assert.equal(new Set(NUKE_PHOTO_LINEUPS.map((guide) => guide.id)).size, 50);
  for (const guide of NUKE_PHOTO_LINEUPS) {
    assert.ok(validateUtility(guide), guide.id);
    assert.equal(guide.mapId, "nuke");
    const sourceProviders = {
      gonade: {
        creator: "GO NADE",
        pattern: /^https:\/\/gonade\.app\/nade\/nuke-[a-z0-9-]+$/,
      },
      csnades: {
        creator: "CSNADES.gg",
        pattern: /^https:\/\/csnades\.gg\/nuke\/smokes\/[a-z0-9-]+$/,
      },
      cs2tricks: {
        creator: "CS2Tricks x NadeKing",
        pattern:
          /^https:\/\/www\.cs2tricks\.com\/nades\/nuke\/grenades\/[a-z0-9-]+$/,
      },
    };
    const provider = guide.photoEmbed?.provider as keyof typeof sourceProviders;
    assert.ok(Object.hasOwn(sourceProviders, provider), guide.id);
    assert.equal(guide.creator, sourceProviders[provider].creator);
    assert.equal(guide.source, guide.photoEmbed?.postUrl);
    assert.equal(guide.photoEmbed?.postUrl, guide.photoEmbed?.embedUrl);
    assert.match(guide.source!, sourceProviders[provider].pattern);
    assert.equal(
      guide.photos,
      undefined,
      "Source photos must remain on the original page",
    );
    assert.equal(guide.image, undefined, "No copied or hotlinked media");
    assert.equal(guide.steps.length, 3);
    assert.ok(guide.steps.every((step) => step.length <= 500));
    assert.ok(
      !guide.steps.some((step) => /setpos|setang|console|\.cfg/.test(step)),
      "No game configuration instructions in app summaries",
    );
  }
  for (const id of [
    "gonade-nuke-lobby-push-from-a-site-flash",
    "gonade-nuke-main-from-t-roof-smoke",
  ]) {
    const guide = NUKE_PHOTO_LINEUPS.find((item) => item.id === id)!;
    assert.match(guide.throwType, /Middle click \(source label\)/);
    assert.doesNotMatch(guide.throwType, /LMB|RMB/);
  }
  const videoGuides = NUKE_PHOTO_LINEUPS.filter((guide) => guide.videoUrl);
  assert.equal(videoGuides.length, 5);
  for (const guide of videoGuides) {
    assert.match(
      guide.videoUrl!,
      /^https:\/\/gonade\.app\/videos\/[0-9]+\.mp4$/,
    );
    assert.equal(guide.videoStart, 0);
  }
  assert.equal(
    NUKE_PHOTO_LINEUPS.find(
      (guide) => guide.id === "gonade-nuke-b-dark-from-ramp-incendiary",
    )!.videoUrl,
    undefined,
    "A status-200 HTML fallback is not a video",
  );
});

test("Nuke photo references distinguish destination-confirmed lower guides and retain source image counts", () => {
  const lower = NUKE_PHOTO_LINEUPS.filter((guide) => guide.levelId === "lower");
  assert.deepEqual(
    lower.map((guide) => guide.target),
    [
      "B Dark",
      "Double Stairs",
      "B double doors",
      "B decon",
      "B site (New End)",
    ],
  );
  assert.ok(lower.some((guide) => guide.side === "T"));
  assert.ok(lower.some((guide) => guide.side === "CT"));
  const counts = Object.values(NUKE_PHOTO_SOURCE_COUNTS);
  assert.equal(
    counts.reduce((sum, count) => sum + count.lineup + count.result, 0),
    146,
  );
  assert.equal(counts.filter((count) => count.lineup >= 2).length, 43);
  assert.equal(counts.filter((count) => count.lineup === 1).length, 7);
  for (const side of ["T", "CT"])
    for (const type of ["Smoke", "Flash", "Molotov", "HE"])
      assert.ok(
        NUKE_PHOTO_LINEUPS.some(
          (guide) => guide.side === side && guide.type === type,
        ),
        `${side} ${type}`,
      );
  const roof = NUKE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "gonade-nuke-top-hut-from-t-spawnroof-molotov",
  )!;
  assert.match(roof.steps[0], /Break the window/);
  assert.match(roof.steps[2], /generator/);
});

test("Nuke additional HE references keep their source side, jump inputs and preparation", () => {
  const lower = NUKE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "cs2tricks-nuke-new-end-he-from-ramp",
  )!;
  assert.equal(lower.side, "CT");
  assert.equal(lower.levelId, "lower");
  assert.equal(lower.target, "B site (New End)");
  assert.equal(lower.throwType, "LMB");
  const hut = NUKE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "cs2tricks-nuke-hut-he-from-t-roof",
  )!;
  const site = NUKE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "cs2tricks-nuke-a-site-he-from-t-roof",
  )!;
  for (const guide of [hut, site]) {
    assert.equal(guide.side, "T");
    assert.equal(guide.type, "HE");
    assert.match(guide.steps[0], /Break the roof glass/);
  }
  assert.equal(hut.throwType, "Run + jump + LMB");
  assert.equal(site.throwType, "Jump + LMB");
});
