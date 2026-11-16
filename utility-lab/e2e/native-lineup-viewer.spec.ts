import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { GUIDE_LIBRARY } from "../src/guide-library";
import { utilityPhotos, type UtilityReference } from "../src/utility-data";
import {makePersonalCopy} from './lineup-helpers';

test.use({ serviceWorkers: "block" });

const findGuide = (id: string) => {
  const guide = GUIDE_LIBRARY.find((record) => record.id === id);
  if (!guide) throw new Error(`Missing real guide fixture: ${id}`);
  return guide;
};
const routeFor = (guide: UtilityReference) =>
  `/#utilities?${new URLSearchParams({ map: guide.mapId, level: guide.levelId, side: guide.side, lineup: guide.id })}`;

async function mockRemoteMedia(page: Page, failFirstPhoto = false, videoGate?: Promise<void>) {
  const image = await readFile("public/icons/icon-192.png");
  const documents: string[] = [];
  let imageRequests = 0;
  await page.route(/^https:\/\//, async (route) => {
    const request = route.request();
    if (request.resourceType() === "image") {
      imageRequests++;
      if (failFirstPhoto && imageRequests === 1) return route.abort();
      return route.fulfill({ contentType: "image/png", body: image });
    }
    if (request.resourceType() === "document") documents.push(request.url());
    if (request.resourceType() === "media" && videoGate) {
      await videoGate;
      return route.abort().catch(() => {});
    }
    // These UI tests isolate the viewer from provider pages and video playback.
    return route.abort();
  });
  return documents;
}

test("remote position and aim photos use our own swipe/zoom viewer and video remains a separate choice", async ({
  page,
}) => {
  let releaseVideo!: () => void;
  const videoGate = new Promise<void>(resolve => { releaseVideo = resolve; });
  page.once("close", () => releaseVideo());
  const documents = await mockRemoteMedia(page, false, videoGate);
  const guide = findGuide("gonade-nuke-a-site-from-t-spawn-flash");
  const photos = utilityPhotos(guide);
  expect(photos.length).toBeGreaterThan(2);
  await page.goto(routeFor(guide));
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src", photos[0].image);
  await expect(image).toBeVisible();
  await expect(viewer.locator("iframe")).toHaveCount(0);
  await expect(viewer.getByRole("button", { name: /^Photos/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(viewer.locator(".ul-photo-kind")).toHaveText(/Position/i);

  await viewer
    .getByRole("button", { name: "Zoom in photo", exact: true })
    .click();
  await expect(
    viewer.getByRole("button", { name: "Fit photo", exact: true }),
  ).toContainText("150%");
  const viewport = viewer.locator(".ul-photo-viewport");
  const before = await viewport.evaluate((element) => element.scrollLeft);
  await viewport.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  await expect(image).toHaveAttribute("src", photos[0].image);
  await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(image).toHaveAttribute("src", photos[1].image);
  await expect(
    viewer.getByRole("button", { name: "Fit photo", exact: true }),
  ).toContainText("100%");

  await viewport.dispatchEvent("pointerdown", {
    pointerId: 31,
    pointerType: "touch",
    isPrimary: true,
    clientX: 260,
    clientY: 160,
  });
  await viewport.dispatchEvent("pointerup", {
    pointerId: 31,
    pointerType: "touch",
    isPrimary: true,
    clientX: 120,
    clientY: 164,
  });
  await expect(image).toHaveAttribute("src", photos[2].image);
  await page.keyboard.press("ArrowLeft");
  await expect(image).toHaveAttribute("src", photos[1].image);

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      viewer.getByRole("button", { name: "Close lineup media", exact: true }),
    ).toBeInViewport();
    await expect(
      viewer.getByRole("button", { name: "Next photo", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }
  await viewer.getByRole("button", { name: "Video", exact: true }).click();
  await expect(viewer.locator("img, iframe, video")).toHaveCount(0);
  await viewer.getByRole("button", { name: "Load video", exact: true }).click();
  await expect(viewer.locator("video")).toHaveAttribute("src", guide.videoUrl!);
  await expect(viewer.locator("video")).toHaveAttribute("controls", "");
  await expect(viewer.locator("video")).not.toHaveAttribute("autoplay", "");
  await viewer.getByRole("button", { name: /^Photos/ }).click();
  await expect(viewer.locator("video, iframe")).toHaveCount(0);
  releaseVideo();
  await expect(image).toHaveAttribute("src", photos[1].image);
  expect(documents).toEqual([]);
});

test("combined references and the seven-slide gallery render natively and personal copies keep all source slides", async ({
  page,
}) => {
  const documents = await mockRemoteMedia(page);
  for (const id of [
    "gonade-mirage-6029",
    "csnades-nuke-double-doors-from-b-ramp",
    "lineupspro-cache-highway-firetruck-5erxnx",
  ]) {
    const guide = findGuide(id);
    await page.goto(routeFor(guide));
    const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
    await expect(viewer).toBeVisible();
    await expect(viewer.locator(".ul-photo-canvas img")).toBeVisible();
    await expect(viewer.locator("iframe")).toHaveCount(0);
    if (id === "gonade-mirage-6029") {
      await expect(viewer.locator(".ul-photo-kind")).toHaveText("Position & aim");
      await expect(viewer.locator(".ul-viewer-keys .ul-key-input")).toHaveText("Run");
      await expect(viewer.locator(".ul-viewer-keys .ul-mouse-input")).toContainText("LMB");
    }
    if (id.startsWith("lineupspro")) {
      await expect(
        viewer
          .getByRole("group", { name: "Choose lineup photo", exact: true })
          .getByRole("button"),
      ).toHaveCount(7);
      await viewer.getByRole("button", { name: /^Photo 7:/ }).click();
      await expect(viewer.locator(".ul-photo-caption > span")).toHaveText(
        "7 / 7",
      );
      await expect(viewer.locator(".ul-photo-canvas img")).toHaveAttribute(
        "src",
        utilityPhotos(guide)[6].image,
      );
    }
    if(!id.startsWith('lineupspro'))await viewer.getByRole("button", { name: "Close lineup media", exact: true }).click();
  }
  await makePersonalCopy(page);
  await page.getByRole("button", { name: "Save lineup", exact: true }).click();
  await expect(page.locator(".app-notice")).toContainText("saved on this device");
  const copied = await page.evaluate(
    () => JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!)[0],
  );
  expect(copied.remotePhotos).toHaveLength(7);
  expect(copied.photos || []).toHaveLength(0);
  expect(documents).toEqual([]);
});

test("a failed source image stays in our viewer, can be retried, and never opens a source website iframe", async ({
  page,
}) => {
  const documents = await mockRemoteMedia(page, true);
  const guide = findGuide("gonade-nuke-a-site-from-t-spawn-flash");
  await page.goto(routeFor(guide));
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  await expect(
    viewer.getByRole("button", { name: /Retry photo|Try.*again/i }),
  ).toBeVisible();
  expect(await viewer.textContent()).not.toMatch(/Restore a backup/i);
  await expect(viewer.locator("iframe")).toHaveCount(0);
  await viewer.getByRole("button", { name: /Retry photo|Try.*again/i }).click();
  await expect(viewer.locator(".ul-photo-canvas img")).toBeVisible();
  await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(viewer.locator(".ul-photo-canvas img")).toHaveAttribute(
    "src",
    utilityPhotos(guide)[1].image,
  );
  expect(documents).toEqual([]);
});

test("a slow remote photo shows loading inside the viewer until the image is ready", async ({
  page,
}) => {
  const guide = findGuide("gonade-nuke-a-site-from-t-spawn-flash");
  const first = utilityPhotos(guide)[0].image;
  const image = await readFile("public/icons/icon-192.png");
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/^https:\/\//, async (route) => {
    if (route.request().resourceType() !== "image") return route.abort();
    if (route.request().url() === first) await pending;
    return route.fulfill({ contentType: "image/png", body: image });
  });
  await page.goto(routeFor(guide), { waitUntil: "domcontentloaded" });
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  try {
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/Loading photo/i)).toBeVisible();
    await expect(viewer.locator("iframe")).toHaveCount(0);
  } finally {
    release();
  }
  await expect(viewer.locator(".ul-photo-canvas img")).toBeVisible();
  await expect(viewer.getByText(/Loading photo/i)).toHaveCount(0);
});
