import test from "node:test";
import assert from "node:assert/strict";
import { GUIDE_LIBRARY } from "../src/guide-library.ts";
import { MAPS } from "../src/maps.ts";
import { validateUtility, utilityPhotos } from "../src/utility-data.ts";

test("every published guide survives portable validation and has real guide media", () => {
  const ids = new Set<string>();
  for (const guide of GUIDE_LIBRARY) {
    assert.ok(!ids.has(guide.id), `Duplicate: ${guide.id}`);
    ids.add(guide.id);
    assert.ok(validateUtility(guide), `Invalid guide: ${guide.id}`);
    assert.ok(
      guide.videoUrl || guide.photoEmbed || utilityPhotos(guide).length,
      `No media: ${guide.id}`,
    );
    const map = MAPS.find((map) => map.id === guide.mapId);
    assert.ok(
      map?.levels.some((level) => level.id === guide.levelId),
      `Wrong floor: ${guide.id}`,
    );
    assert.ok(
      !guide.id.startsWith("practice-"),
      "Illustrative practice targets must not return to the library.",
    );
  }
});

test("every supported map has source photo access for both sides and all four utilities", () => {
  for (const map of MAPS) for (const side of ["T", "CT"]) for (const type of ["Smoke", "Flash", "Molotov", "HE"]) {
    assert.ok(GUIDE_LIBRARY.some(guide => guide.mapId === map.id && guide.side === side && guide.type === type && (guide.photoEmbed || utilityPhotos(guide).some(photo => photo.kind !== "context"))), `${map.name}: ${side} ${type} needs a real photo guide`);
  }
});
