import { test, expect, type Locator, type Page } from "@playwright/test";
import { GUIDE_LIBRARY } from "../src/guide-library";
import { utilityPhotos, type UtilityReference } from "../src/utility-data";

test.use({ serviceWorkers: "block" });

const sizes = [
  { width: 1280, height: 720 },
  { width: 1519, height: 1008 },
  { width: 1024, height: 600 },
  { width: 390, height: 844 },
  { width: 320, height: 640 },
];
const guides = [
  "compendium-mirage-palace-jungle",
  "photo-kielson-cache-s_wozek_0-t",
].map((id) => {
  const guide = GUIDE_LIBRARY.find((record) => record.id === id);
  if (!guide) throw new Error(`Missing original photo-fit fixture: ${id}`);
  return guide;
});
const routeFor = (guide: UtilityReference) =>
  `/#utilities?${new URLSearchParams({ map: guide.mapId, level: guide.levelId, side: guide.side, lineup: guide.id })}`;

async function geometry(viewer: Locator) {
  return viewer.evaluate((dialog) => {
    const image = dialog.querySelector<HTMLImageElement>(".ul-photo-canvas img")!;
    const viewport = dialog.querySelector<HTMLElement>(".ul-photo-viewport")!;
    const rect = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const box = rect(image);
    const style = getComputedStyle(image);
    const region = dialog.querySelector<HTMLElement>(".ul-photo-region[data-photo-region]");
    // The img's CSS box may include letterboxing. Measure the actual painted
    // pixels, so a tall composite clipped by a footer cannot pass as "visible".
    const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = box.x + (box.width - width) / 2;
    const y = box.y + (box.height - height) / 2;
    return {
      painted: region ? rect(region) : { x, y, width, height, right: x + width, bottom: y + height },
      region: !!region,
      image: box,
      objectFit: style.objectFit,
      natural: { width: image.naturalWidth, height: image.naturalHeight },
      viewport: rect(viewport),
      stage: rect(dialog.querySelector(".ul-photo-stage")!),
      dialog: rect(dialog),
      toolbar: rect(dialog.querySelector(".ul-photo-zoom")!),
      keys: rect(dialog.querySelector(".ul-media-footer")!),
      close: rect(dialog.querySelector('[aria-label="Close lineup media"]')!),
      scroll: {
        left: viewport.scrollLeft,
        top: viewport.scrollTop,
        width: viewport.scrollWidth,
        height: viewport.scrollHeight,
        clientWidth: viewport.clientWidth,
        clientHeight: viewport.clientHeight,
      },
      screen: { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth },
    };
  });
}

async function expectFit(viewer: Locator) {
  await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("100%");
  const g = await geometry(viewer);
  if (!g.region) expect(g.objectFit).toBe("contain");
  expect(g.painted.width).toBeGreaterThan(60);
  expect(g.painted.height).toBeGreaterThan(60);
  expect(Math.abs(g.viewport.width - g.stage.width)).toBeLessThanOrEqual(1);
  expect(g.painted.x).toBeGreaterThanOrEqual(g.viewport.x - 1);
  expect(g.painted.y).toBeGreaterThanOrEqual(g.viewport.y - 1);
  expect(g.painted.right).toBeLessThanOrEqual(g.viewport.right + 1);
  expect(g.painted.bottom).toBeLessThanOrEqual(g.viewport.bottom + 1);
  expect(g.viewport.x).toBeGreaterThanOrEqual(g.dialog.x - 1);
  expect(g.viewport.y).toBeGreaterThanOrEqual(g.dialog.y - 1);
  expect(g.viewport.right).toBeLessThanOrEqual(g.dialog.right + 1);
  expect(g.viewport.bottom).toBeLessThanOrEqual(g.dialog.bottom + 1);
  expect(g.viewport.bottom).toBeLessThanOrEqual(g.keys.y + 1);
  expect(g.toolbar.bottom).toBeLessThanOrEqual(g.viewport.y + 1);
  expect(g.scroll.left).toBeLessThanOrEqual(1);
  expect(g.scroll.top).toBeLessThanOrEqual(1);
  expect(g.scroll.width).toBeLessThanOrEqual(g.scroll.clientWidth + 1);
  expect(g.scroll.height).toBeLessThanOrEqual(g.scroll.clientHeight + 1);
  for (const control of [g.close, g.keys]) {
    expect(control.x).toBeGreaterThanOrEqual(0);
    expect(control.y).toBeGreaterThanOrEqual(0);
    expect(control.right).toBeLessThanOrEqual(g.screen.width + 1);
    expect(control.bottom).toBeLessThanOrEqual(g.screen.height + 1);
  }
  expect(g.screen.documentWidth).toBe(g.screen.width);
  return g;
}

async function openOriginal(page: Page, guide: UtilityReference) {
  await page.goto(routeFor(guide));
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src", utilityPhotos(guide)[0].image);
  await image.evaluate(async (element: HTMLImageElement) => { await element.decode(); });
  await expect(image).toHaveCSS("opacity", "1");
  await expect(viewer.locator("iframe, video")).toHaveCount(0);
  return viewer;
}

for (const size of sizes) {
  test(`original composite and landscape photos fit completely at ${size.width}x${size.height}, including after zoom`, async ({ page }, testInfo) => {
    await page.setViewportSize(size);
    // Keep these geometry regressions independent of remote providers, while
    // rendering the actual bundled compendium and landscape image bytes.
    await page.route(/^https:\/\//, (route) => route.abort());
    for (const guide of guides) {
      const viewer = await openOriginal(page, guide);
      if (guide.id.startsWith("compendium")) {
        await expect(viewer.locator(".ul-photo-kind")).toContainText("Position");
        await expectFit(viewer);
        await viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button").last().click();
        await expect(viewer.locator(".ul-photo-region")).toHaveCount(0);
      }
      const fitted = await expectFit(viewer);
      if (guide.id.startsWith("compendium")) {
        expect(fitted.natural).toEqual({ width: 1280, height: 800 });
      } else {
        expect(fitted.natural.width / fitted.natural.height).toBeGreaterThan(1.7);
      }
      await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
      await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("150%");
      await expect.poll(async () => (await geometry(viewer)).painted.width).toBeGreaterThan(fitted.painted.width * 1.4);
      await expect.poll(async () => (await geometry(viewer)).painted.height).toBeGreaterThan(fitted.painted.height * 1.4);
      await viewer.getByRole("button", { name: "Fit photo", exact: true }).click();
      await expectFit(viewer);
      await page.screenshot({ path: testInfo.outputPath(`${guide.id}-${size.width}x${size.height}.png`) });
    }
  });
}

test("an open original composite refits when the window changes size", async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  const viewer = await openOriginal(page, guides[0]);
  await viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button").last().click();
  for (const size of sizes) {
    await page.setViewportSize(size);
    await expectFit(viewer);
  }
});
