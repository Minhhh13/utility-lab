import test from "node:test";
import assert from "node:assert/strict";
import {
  MIRAGE_ONLINE_PHOTO_EVIDENCE,
  MIRAGE_ONLINE_PHOTO_LINEUPS,
} from "../src/photos.mirage-online.ts";
import { COMPENDIUM_PHOTO_LINEUPS } from "../src/photos.compendium.ts";
import { validateUtility } from "../src/utility-data.ts";

test("Mirage has at least two photo choices for each formerly missing side and utility pair", () => {
  assert.equal(MIRAGE_ONLINE_PHOTO_LINEUPS.length, 14);
  const missing = [
    ["T", "Flash"],
    ["T", "Molotov"],
    ["T", "HE"],
    ["CT", "Smoke"],
    ["CT", "Flash"],
    ["CT", "Molotov"],
    ["CT", "HE"],
  ];
  for (const [side, type] of missing)
    assert.ok(
      MIRAGE_ONLINE_PHOTO_LINEUPS.filter(
        (guide) => guide.side === side && guide.type === type,
      ).length >= 2,
      `${side} ${type}`,
    );
  const combined = [
    ...COMPENDIUM_PHOTO_LINEUPS,
    ...MIRAGE_ONLINE_PHOTO_LINEUPS,
  ];
  for (const side of ["T", "CT"])
    for (const type of ["Smoke", "Flash", "Molotov", "HE"])
      assert.ok(
        combined.some(
          (guide) =>
            guide.mapId === "mirage" &&
            guide.side === side &&
            guide.type === type,
        ),
        `${side} ${type}`,
      );
});

test("new Mirage guides retain canonical original pages and actual position/aim/result evidence", () => {
  assert.equal(
    new Set(MIRAGE_ONLINE_PHOTO_LINEUPS.map((guide) => guide.id)).size,
    14,
  );
  for (const guide of MIRAGE_ONLINE_PHOTO_LINEUPS) {
    assert.ok(validateUtility(guide), guide.id);
    assert.equal(guide.mapId, "mirage");
    assert.equal(guide.levelId, "main");
    assert.equal(guide.photoEmbed?.embedUrl, guide.source);
    assert.equal(guide.photoEmbed?.postUrl, guide.source);
    assert.deepEqual(guide.photos, []);
    assert.equal(guide.videoUrl, undefined);
    assert.equal(guide.showMarker, false);
    assert.equal(guide.steps.length, 3);
    assert.doesNotMatch(
      guide.steps.join(" "),
      /setpos|setang|bind |sv_cheats|current.build|copyright|license/i,
    );
    const evidence = MIRAGE_ONLINE_PHOTO_EVIDENCE.find(
      (row) => row.id === guide.id,
    );
    assert.ok(evidence, guide.id);
    assert.equal(evidence.source, guide.source);
    assert.ok(evidence.positionAimImages >= 2);
    assert.equal(evidence.resultImages, 1);
    if (evidence.sourceSide !== "Any Team")
      assert.equal(evidence.sourceSide, guide.side);
  }
});

test("Mirage T HE references are source-labelled T or Any Team and use the current working URL", () => {
  const catwalk = MIRAGE_ONLINE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "cs2tricks-mirage-t-catwalk-he",
  )!;
  const bench = MIRAGE_ONLINE_PHOTO_LINEUPS.find(
    (guide) => guide.id === "cs2tricks-mirage-t-bench-he",
  )!;
  assert.equal(catwalk.photoEmbed?.provider, "cs2tricks");
  assert.equal(
    catwalk.source,
    "https://www.cs2tricks.com/nades/mirage/grenades/catwalk-from-back-alley-9376",
  );
  assert.equal(catwalk.throwType, "Jump + LMB");
  assert.equal(
    bench.source,
    "https://www.cs2tricks.com/nades/mirage/grenades/bench-from-b-apartments-a7b9",
  );
  assert.equal(bench.throwType, "Run two steps + LMB");
  assert.equal(
    MIRAGE_ONLINE_PHOTO_EVIDENCE.find((row) => row.id === bench.id)?.sourceSide,
    "Any Team",
  );
});
