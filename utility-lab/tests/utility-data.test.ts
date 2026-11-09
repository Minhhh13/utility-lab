import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_LINEUP_PHOTOS,
  MAX_PHOTO_DATA_CHARS,
  THROW_METHODS,
  parseUtilityVideo,
  safeSource,
  utilityPhotos,
  validateUtility,
} from "../src/utility-data.ts";

const VIDEO_ID = "MJ-dtTYTUS8";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=";

function lineup(overrides: Record<string, unknown> = {}) {
  return {
    id: "my-window-smoke",
    mapId: "mirage",
    levelId: "main",
    side: "T",
    type: "Smoke",
    title: "Window smoke",
    from: "T spawn",
    target: "Window",
    purpose: "Practice reference",
    throwType: "Both buttons (LMB + RMB)",
    steps: ["Use the standing position in the attached reference."],
    x: 470,
    y: 330,
    userCreated: true,
    ...overrides,
  };
}

test("YouTube watch, share, mobile, Shorts, live and privacy-enhanced embed links identify the same video", () => {
  const urls = [
    WATCH_URL,
    `https://youtube.com/watch?v=${VIDEO_ID}`,
    `https://m.youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtu.be/${VIDEO_ID}?si=share-token`,
    `https://www.youtu.be/${VIDEO_ID}`,
    `https://www.youtube.com/shorts/${VIDEO_ID}`,
    `https://www.youtube.com/live/${VIDEO_ID}`,
    `https://www.youtube.com/embed/${VIDEO_ID}`,
    `https://youtube-nocookie.com/embed/${VIDEO_ID}`,
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
  ];
  for (const url of urls) {
    const video = parseUtilityVideo(url);
    assert.ok(video && video.kind === "youtube", url);
    assert.equal(video.id, VIDEO_ID, url);
    assert.equal(video.start, 0, url);
  }
  assert.equal(parseUtilityVideo("   "), null);
});

test("shared chapter timestamps retain seconds, minutes and hours with a bounded explicit override", () => {
  const cases: [string, number][] = [
    [`${WATCH_URL}&t=47`, 47],
    [`https://youtu.be/${VIDEO_ID}?t=1m30s`, 90],
    [`${WATCH_URL}&start=95`, 95],
    [`${WATCH_URL}&t=1h2m3s`, 3723],
    [`${WATCH_URL}&t=2m`, 120],
    [`${WATCH_URL}&t=invalid`, 0],
    [`${WATCH_URL}&t=-12`, 0],
    [`${WATCH_URL}&t=999999`, 86_400],
  ];
  for (const [url, seconds] of cases)
    assert.equal(parseUtilityVideo(url)?.start, seconds, url);
  assert.equal(parseUtilityVideo(`${WATCH_URL}&t=90`, 15)?.start, 15);
  assert.equal(parseUtilityVideo(WATCH_URL, 15.9)?.start, 15);
  assert.equal(parseUtilityVideo(WATCH_URL, -1)?.start, 0);
  assert.equal(parseUtilityVideo(WATCH_URL, 999_999)?.start, 86_400);
});

test("YouTube-looking foreign hosts, embedded credentials and malformed video IDs are rejected", () => {
  const urls = [
    `https://youtube.com.attacker.example/watch?v=${VIDEO_ID}`,
    `https://attacker-youtube.com/watch?v=${VIDEO_ID}`,
    `https://watch.youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtu.be.attacker.example/${VIDEO_ID}`,
    `https://youtube.com@attacker.example/watch?v=${VIDEO_ID}`,
    `https://attacker.example@youtube.com/watch?v=${VIDEO_ID}`,
    `https://user:password@www.youtube.com/watch?v=${VIDEO_ID}`,
    "https://youtube.com/watch",
    "https://youtube.com/watch?v=short-id",
    `https://youtube.com/watch?v=${VIDEO_ID}x`,
    "https://youtube.com/watch?v=MJ-dtTYTUS%21",
    "https://youtube.com/embed/",
    "https://youtu.be/",
  ];
  for (const url of urls) {
    assert.throws(() => parseUtilityVideo(url), undefined, url);
    assert.equal(validateUtility(lineup({ videoUrl: url })), null, url);
  }
});

test("unsafe protocols and insecure direct videos cannot enter saved lineups", () => {
  const urls = [
    "javascript:alert(1)",
    "data:video/mp4;base64,AAAA",
    "file:///C:/private/lineup.mp4",
    "ftp://media.example/lineup.mp4",
    "http://media.example/lineup.mp4",
    "https://media.example/page?file=lineup.mp4",
  ];
  for (const url of urls) {
    assert.throws(() => parseUtilityVideo(url), undefined, url);
    assert.equal(validateUtility(lineup({ videoUrl: url })), null, url);
  }
  for (const extension of ["mp4", "webm", "ogv", "ogg"]) {
    const url = `https://media.example/lineup.${extension}?token=public`;
    assert.deepEqual(parseUtilityVideo(url), { kind: "file", url, start: 0 });
  }
});

test("saved video metadata preserves the creator and chapter while rejecting invalid explicit starts", () => {
  const record = validateUtility(
    lineup({
      videoUrl: `  ${WATCH_URL}&t=4m40s  `,
      creator: "NartOutHere",
      source: `  ${WATCH_URL}  `,
    }),
  );
  assert.ok(record);
  assert.equal(record.videoUrl, `${WATCH_URL}&t=4m40s`);
  assert.equal(record.videoStart, 280);
  assert.equal(record.creator, "NartOutHere");
  assert.equal(record.source, WATCH_URL);
  assert.equal(
    validateUtility(lineup({ videoUrl: WATCH_URL, videoStart: 0 }))?.videoStart,
    0,
  );

  for (const videoStart of [-1, 86_401, NaN, Infinity, "90"])
    assert.equal(
      validateUtility(lineup({ videoUrl: WATCH_URL, videoStart })),
      null,
    );
  assert.ok(
    validateUtility(lineup({ videoUrl: WATCH_URL, creator: "a".repeat(120) })),
  );
  assert.equal(
    validateUtility(lineup({ videoUrl: WATCH_URL, creator: "a".repeat(121) })),
    null,
  );
});

test("source links normalize whitespace but never retain executable schemes or sign-in details", () => {
  assert.equal(
    safeSource("  https://creator.example/guide  "),
    "https://creator.example/guide",
  );
  assert.equal(safeSource("   "), "");
  for (const source of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "https://user:password@creator.example/guide",
    "not a URL",
  ]) {
    assert.throws(() => safeSource(source));
    assert.equal(validateUtility(lineup({ source })), null);
  }
});

test("old lineups without media still load and a legacy screenshot becomes one reference slide", () => {
  const plain = validateUtility(lineup());
  assert.ok(plain);
  assert.deepEqual(utilityPhotos(plain), []);

  const legacy = validateUtility(lineup({ image: PIXEL }));
  assert.ok(legacy);
  assert.equal(legacy.image, PIXEL);
  assert.deepEqual(utilityPhotos(legacy), [
    { image: PIXEL, caption: "Lineup reference" },
  ]);

  const emptySlides = validateUtility(lineup({ image: PIXEL, photos: [] }));
  assert.ok(emptySlides);
  assert.deepEqual(utilityPhotos(emptySlides), utilityPhotos(legacy));
});

test("photo slides retain their order and captions and take precedence over a legacy image", () => {
  const photos = [
    { image: PIXEL, caption: "1. Stand in this corner" },
    {
      image: "https://creator.example/aim.webp",
      caption: "2. Aim here, then jump",
    },
    { image: PIXEL, caption: "" },
  ];
  const record = validateUtility(lineup({ image: PIXEL, photos }));
  assert.ok(record);
  assert.deepEqual(record.photos, photos);
  assert.deepEqual(utilityPhotos(record), photos);
});

test("photo imports reject executable images, insecure remote URLs and malformed captions", () => {
  const invalidPhotos = [
    { image: "data:image/svg+xml;base64,PHN2Zz4=", caption: "Aim" },
    { image: "javascript:alert(1)", caption: "Aim" },
    { image: "http://creator.example/aim.png", caption: "Aim" },
    { image: "https://user:password@creator.example/aim.png", caption: "Aim" },
    { image: PIXEL, caption: 123 },
    { image: PIXEL },
    null,
  ];
  for (const photo of invalidPhotos)
    assert.equal(validateUtility(lineup({ photos: [photo] })), null);
  assert.equal(validateUtility(lineup({ photos: "not an array" })), null);
  assert.equal(
    validateUtility(lineup({ image: "https://creator.example/old-image.png" })),
    null,
  );
});

test("photo count and caption limits accept the boundary and reject overflow", () => {
  assert.equal(MAX_LINEUP_PHOTOS, 4);
  const photo = { image: PIXEL, caption: "a".repeat(240) };
  assert.ok(
    validateUtility(lineup({ photos: Array.from({ length: 4 }, () => photo) })),
  );
  assert.equal(
    validateUtility(lineup({ photos: Array.from({ length: 5 }, () => photo) })),
    null,
  );
  assert.equal(
    validateUtility(
      lineup({ photos: [{ ...photo, caption: "a".repeat(241) }] }),
    ),
    null,
  );
});

test("per-image and aggregate payload limits include an accompanying legacy screenshot", () => {
  const prefix = "data:image/png;base64,";
  const fullImage = prefix + "A".repeat(1_450_000 - prefix.length);
  const photo = { image: fullImage, caption: "Standing position" };
  assert.ok(validateUtility(lineup({ photos: [photo] })));
  assert.equal(
    validateUtility(lineup({ photos: [{ ...photo, image: fullImage + "A" }] })),
    null,
  );
  assert.equal(validateUtility(lineup({ image: fullImage + "A" })), null);
  assert.equal(fullImage.length * 2, MAX_PHOTO_DATA_CHARS);
  assert.ok(validateUtility(lineup({ photos: [photo, photo] })));
  assert.equal(
    validateUtility(lineup({ image: PIXEL, photos: [photo, photo] })),
    null,
  );
});

test("combined-button throw instructions explicitly mean LMB plus RMB, including jump throws", () => {
  assert.ok(THROW_METHODS.includes("Both buttons (LMB + RMB)"));
  assert.ok(THROW_METHODS.includes("Jump + both buttons (LMB + RMB)"));
  assert.ok(!THROW_METHODS.some((method) => /middle|wheel/i.test(method)));
  const record = validateUtility(
    lineup({ throwType: "Both buttons (LMB + RMB)" }),
  );
  assert.ok(record);
  assert.equal(record.throwType, "Both buttons (LMB + RMB)");
});
