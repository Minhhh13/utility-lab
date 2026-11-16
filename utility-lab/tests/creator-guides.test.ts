import test from "node:test";
import assert from "node:assert/strict";
import { MAPS } from "../src/maps.ts";
import {
  CREATOR_GUIDES,
  CREATOR_VIDEO_SOURCES,
  GUIDE_CATALOGUE_CHECKED,
} from "../src/creator-guides.ts";
import { parseUtilityVideo, validateUtility } from "../src/utility-data.ts";
import { LEGACY_GUIDE_METADATA } from "../src/data/guides-legacy-metadata.ts";

test("each supported map offers a creator demonstration for every utility and side", () => {
  assert.equal(MAPS.length, 8);
  assert.ok(CREATOR_GUIDES.length >= 64);
  for (const map of MAPS) {
    assert.ok(CREATOR_GUIDES.filter((guide) => guide.mapId === map.id).length >= 20,
      `${map.name} needs useful depth beyond the initial utility examples`);
    for (const side of ["T", "CT"] as const) {
      for (const type of ["Smoke", "Flash", "Molotov", "HE"] as const) {
        assert.ok(
          CREATOR_GUIDES.some(
            (guide) =>
              guide.mapId === map.id &&
              guide.side === side &&
              guide.type === type,
          ),
          `${map.name} needs a ${side} ${type} source`,
        );
      }
    }
  }
});

test("Nuke's lower layer has real B-site smoke, flash and fire demonstrations for both sides", () => {
  const lower = CREATOR_GUIDES.filter(
    (guide) => guide.mapId === "nuke" && guide.levelId === "lower",
  );
  for (const side of ["T", "CT"] as const) {
    for (const type of ["Smoke", "Flash", "Molotov"] as const) {
      assert.ok(
        lower.some((guide) => guide.side === side && guide.type === type),
        `Missing lower-floor ${side} ${type} demonstration`,
      );
    }
  }
  for (const guide of lower) {
    assert.match(guide.target, /^B /, guide.id);
    assert.doesNotMatch(
      guide.target,
      /silo|yard|outside|upper|heaven|hut/i,
      guide.id,
    );
  }
});

test("catalogue IDs and map layers are valid and the original favourite IDs remain stable", () => {
  const ids = new Set<string>();
  for (const guide of CREATOR_GUIDES) {
    assert.ok(!ids.has(guide.id), `Duplicate creator guide: ${guide.id}`);
    ids.add(guide.id);
    const map = MAPS.find((item) => item.id === guide.mapId);
    assert.ok(map, `Unsupported map: ${guide.mapId}`);
    assert.ok(
      map.levels.some((level) => level.id === guide.levelId),
      guide.id,
    );
    assert.ok(
      validateUtility(guide),
      `Guide fails the saved-lineup schema: ${guide.id}`,
    );
    assert.equal(guide.userCreated, false);
  }
  for (const id of [
    "creator-mirage-t-jungle",
    "creator-mirage-ct-palace",
    "creator-dust2-t-mid-b",
    "creator-dust2-ct-tunnels",
    "creator-inferno-t-ct",
    "creator-inferno-ct-halfwall",
    "creator-nuke-t-outside",
    "creator-nuke-ct-door",
    "creator-ancient-t-red",
    "creator-ancient-ct-door",
    "creator-anubis-t-camera",
    "creator-anubis-ct-a-main",
    "creator-cache-t-connector",
    "creator-cache-ct-a-main",
    "creator-vertigo-t-ivy",
    "creator-vertigo-ct-ramp",
  ])
    assert.ok(ids.has(id), `Existing favourite would break: ${id}`);
  assert.equal(Object.keys(LEGACY_GUIDE_METADATA).length, 72);
  for (const id of Object.keys(LEGACY_GUIDE_METADATA))
    assert.ok(ids.has(id), `An existing catalogue link would break: ${id}`);
});

test("every demonstration resolves to an attributed primary video at an in-range offset", () => {
  const referenced = new Set<string>();
  const segments = new Set<string>();
  for (const guide of CREATOR_GUIDES) {
    const video = parseUtilityVideo(guide.videoUrl, guide.videoStart);
    assert.ok(video && video.kind === "youtube", guide.id);
    const source = CREATOR_VIDEO_SOURCES[video.id];
    assert.ok(source, `Missing primary metadata: ${guide.id}`);
    referenced.add(source.id);
    const segment = `${video.id}:${guide.videoStart}`;
    assert.ok(!segments.has(segment), `The same creator segment was counted twice: ${guide.id}`);
    segments.add(segment);
    assert.equal(
      guide.videoUrl,
      `https://www.youtube.com/watch?v=${source.id}`,
    );
    assert.equal(guide.source, guide.videoUrl);
    assert.equal(guide.creator, source.creator);
    assert.equal(guide.sourceTitle, source.title);
    assert.equal(guide.publishedAt, source.publishedAt);
    assert.equal(guide.sourceCheckedAt, GUIDE_CATALOGUE_CHECKED);
    assert.equal(source.embedUrl, `https://www.youtube.com/embed/${source.id}`);
    assert.match(source.id, /^[a-zA-Z0-9_-]{11}$/);
    assert.ok(Number.isInteger(guide.videoStart) && guide.videoStart >= 0);
    assert.ok(
      guide.videoStart < source.duration,
      `Offset exceeds video: ${guide.id}`,
    );
    assert.ok(guide.chapterTitle.trim());
    if (guide.videoStart > 0) {
      assert.ok(
        source.chapters.some(
          (chapter) =>
            chapter.start === guide.videoStart &&
            chapter.title === guide.chapterTitle,
        ),
        `Missing original chapter evidence: ${guide.id}`,
      );
    }
    assert.match(source.publishedAt, /^20\d{2}-\d{2}-\d{2}$/);
    assert.ok(
      source.publishedAt <= source.checkedAt,
      `Source dated after check: ${source.id}`,
    );
  }
  assert.equal(referenced.size, Object.keys(CREATOR_VIDEO_SOURCES).length);
});

test("site and situation metadata remain bounded and each map covers A and B", () => {
  const sites = new Set(["A", "B", "Mid", "Other"]);
  const tags = new Set(["retake", "defence", "fast", "post-plant", "combo", "smoke-break", "outside"]);
  for (const guide of CREATOR_GUIDES) {
    assert.ok(sites.has(guide.site!), guide.id);
    assert.ok(Array.isArray(guide.tags), guide.id);
    assert.ok(guide.tags!.every((tag) => tags.has(tag)), guide.id);
    assert.equal(new Set(guide.tags).size, guide.tags!.length, guide.id);
  }
  for (const map of MAPS) {
    const guides = CREATOR_GUIDES.filter((guide) => guide.mapId === map.id);
    assert.ok(guides.some((guide) => guide.site === "A"), `${map.name} A coverage`);
    assert.ok(guides.some((guide) => guide.site === "B"), `${map.name} B coverage`);
    assert.ok(guides.some((guide) => guide.tags?.includes("retake")), `${map.name} retake coverage`);
  }
});

test("capture views retain finite creator-published camera coordinates without claiming a throw method", () => {
  const views = CREATOR_GUIDES.filter((guide) => guide.captureView);
  assert.ok(views.length >= 5);
  for (const guide of views) {
    const view = guide.captureView!;
    assert.equal(view.sourceUrl, guide.videoUrl);
    assert.equal(view.position.length, 3);
    assert.equal(view.angles.length, 3);
    assert.ok([...view.position, ...view.angles].every(Number.isFinite), guide.id);
    assert.ok(Math.abs(view.angles[0]) <= 90, guide.id);
    assert.ok(Math.abs(view.angles[1]) <= 180, guide.id);
  }
  const ambiguous = CREATOR_GUIDES.find((guide) => guide.id === "creator-cache-t-b-main-lurk-smoke")!;
  assert.equal(ambiguous.videoStart, 0);
  assert.match(ambiguous.sourceNote!, /chapter markers overlap/);
});

test("recorded Cache mouse inputs follow the primary creator's explicit text", () => {
  const recorded = new Map(CREATOR_GUIDES.map((guide) => [guide.id, guide]));
  const left = recorded.get("creator-cache-ct-a-default-fire")!;
  assert.equal(left.throwType, "LMB (left button)");
  assert.match(left.chapterTitle, /mouse 1/i);
  for (const id of ["creator-cache-ct-b-default-fire", "creator-cache-ct-sunroom-fire-combo"]) {
    const guide = recorded.get(id)!;
    assert.equal(guide.throwType, "Jump + LMB");
    assert.match(guide.chapterTitle, /mouse 1 \+ jumpthrow/i);
  }
  const run = recorded.get("creator-cache-ct-quad-retake-fire")!;
  assert.match(run.chapterTitle, /W \+ jumpthrow/);
  assert.doesNotMatch(run.throwType, /LMB|RMB|both buttons/i);
});
