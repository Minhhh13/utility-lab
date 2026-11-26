import { readFileSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { GUIDE_LIBRARY } from "../src/guide-library";
import { utilityPhotos, type UtilityReference } from "../src/utility-data";

test.use({ serviceWorkers: "block" });
const sizes = [
  { width: 1519, height: 1008 }, { width: 1519, height: 937 },
  { width: 1280, height: 720 }, { width: 1024, height: 600 },
  { width: 390, height: 844 }, { width: 320, height: 640 },
];
const generated: UtilityReference[] = ["dust2", "ancient"].flatMap(map =>
  JSON.parse(readFileSync(new URL(`../src/data/expanded/${map}.json`, import.meta.url), "utf8")));
const guides = [
  "expanded-cs2tricks-dust2-x-box-from-t-spawn-fd23-t",
  "expanded-cs2tricks-ancient-top-mid-from-t-spawn-3-2799-t",
  "expanded-cs2tricks-ancient-ct-from-mid-c721-ct",
].map(id => {
  const guide = generated.find(row => row.id === id);
  if (!guide) throw Error(`Missing reported photo fixture: ${id}`);
  return guide;
});
const sourcePixels = new Map<string, { body: Buffer; contentType: string }>();

test.beforeAll(async ({ request }) => {
  // Keep the source's actual image bytes in memory; no substitute screenshots,
  // generated pixels, asset rehosting, or source-site iframe is used.
  for (const url of new Set(guides.flatMap(guide => utilityPhotos(guide).slice(0, 2).map(photo => photo.image)).filter(url => url.startsWith("https://")))) {
    const response = await request.get(url);
    expect(response.ok(), `Original source image ${url}`).toBeTruthy();
    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/^image\//);
    sourcePixels.set(url, { body: await response.body(), contentType });
  }
});

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, route => {
    const fixture = sourcePixels.get(route.request().url());
    return fixture ? route.fulfill({ status: 200, ...fixture }) : route.abort();
  });
  await page.addInitScript(() => {
    const target = window as typeof window & { photoLayoutErrors: string[] };
    target.photoLayoutErrors = [];
    window.addEventListener("error", event => {
      if (/ResizeObserver/i.test(event.message)) target.photoLayoutErrors.push(event.message);
    });
  });
});

const routeFor = (guide: UtilityReference) => `/#utilities?${new URLSearchParams({ map: guide.mapId, level: guide.levelId, side: guide.side, lineup: guide.id })}`;
async function open(page: Page, guide: UtilityReference) {
  await page.goto(routeFor(guide), { waitUntil: "domcontentloaded" });
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  await decoded(viewer);
  await expect(viewer.locator("iframe, video")).toHaveCount(0);
  return viewer;
}
async function decoded(viewer: Locator) {
  const image = viewer.locator(".ul-photo-canvas img");
  await image.evaluate(async (img: HTMLImageElement) => { await img.decode(); });
  await expect(image).toHaveCSS("opacity", "1");
}
async function samples(viewer: Locator) {
  return viewer.evaluate(async dialog => {
    const rect = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const rows = [];
    for (let index = 0; index < 36; index++) {
      await new Promise(requestAnimationFrame);
      const viewport = dialog.querySelector<HTMLElement>(".ul-photo-viewport")!;
      const image = dialog.querySelector<HTMLImageElement>(".ul-photo-canvas img")!;
      const box = rect(image), ratio = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
      const width = image.naturalWidth * ratio, height = image.naturalHeight * ratio;
      const x = box.x + (box.width - width) / 2, y = box.y + (box.height - height) / 2;
      const region = dialog.querySelector(".ul-photo-region");
      rows.push({
        frame: rect(dialog.querySelector(".ul-photo-frame")!), viewport: rect(viewport),
        canvas: rect(dialog.querySelector(".ul-photo-canvas")!),
        painted: region ? rect(region) : { x, y, width, height, right: x + width, bottom: y + height },
        keys: rect(dialog.querySelector(".ul-media-footer")!),
        imageSrc: image.getAttribute("src"), imageOpacity: getComputedStyle(image).opacity,
        scroll: { left: viewport.scrollLeft, top: viewport.scrollTop, width: viewport.scrollWidth, height: viewport.scrollHeight, clientWidth: viewport.clientWidth, clientHeight: viewport.clientHeight },
        overflow: getComputedStyle(viewport).overflow,
        screen: { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth },
      });
    }
    return rows.slice(6);
  });
}
async function stable(viewer: Locator, scale: 1 | 1.5) {
  const rows = await samples(viewer), final = rows.at(-1)!;
  // Thirty consecutive painted frames catch alternating scrollbar/client-size
  // feedback, not just a single fortunate screenshot between oscillations.
  expect(new Set(rows.map(row => JSON.stringify(row))).size).toBe(1);
  for (const row of rows) {
    expect(row.imageOpacity).toBe("1");
    expect(Math.abs(row.canvas.width - row.frame.width * scale)).toBeLessThan(.03);
    expect(Math.abs(row.canvas.height - row.frame.height * scale)).toBeLessThan(.03);
    expect(row.keys.y).toBeGreaterThanOrEqual(0);
    expect(row.keys.bottom).toBeLessThanOrEqual(row.screen.height + .03);
    expect(row.screen.documentWidth).toBe(row.screen.width);
    if (scale === 1) {
      expect(row.overflow).toBe("hidden");
      expect(row.scroll.left).toBe(0);
      expect(row.scroll.top).toBe(0);
      expect(row.scroll.width).toBe(row.scroll.clientWidth);
      expect(row.scroll.height).toBe(row.scroll.clientHeight);
      expect(row.painted.x).toBeGreaterThanOrEqual(row.viewport.x - .03);
      expect(row.painted.y).toBeGreaterThanOrEqual(row.viewport.y - .03);
      expect(row.painted.right).toBeLessThanOrEqual(row.viewport.right + .03);
      expect(row.painted.bottom).toBeLessThanOrEqual(row.viewport.bottom + .03);
      expect(row.painted.width).toBeGreaterThan(60);
      expect(row.painted.height).toBeGreaterThan(60);
    }
  }
  return final;
}

for (const guide of guides) {
  test(`${guide.title}: stable full photos and keys through Fit/150% and six viewport sizes`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    const viewer = await open(page, guide);
    // Exercise non-overlay desktop scrollbars as well as the phone layout.
    await page.addStyleTag({ content: ".ul-photo-viewport::-webkit-scrollbar{width:17px;height:17px}" });
    for (const [index, size] of sizes.entries()) {
      await page.setViewportSize(size);
      const name = index % 2 ? "Step 3: First-person aim" : "Step 1: Where to stand";
      await viewer.getByRole("button", { name, exact: true }).click();
      await decoded(viewer);
      await stable(viewer, 1);
      await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
      await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("150%");
      await stable(viewer, 1.5);
      const viewport = viewer.locator(".ul-photo-viewport");
      await viewport.focus();
      const before = await viewport.evaluate(element => element.scrollLeft);
      await page.keyboard.press("ArrowRight");
      expect(await viewport.evaluate(element => element.scrollLeft)).toBeGreaterThan(before);
      await viewer.getByRole("button", { name: "Fit photo", exact: true }).click();
      await stable(viewer, 1);
    }
    await expect.poll(() => page.evaluate(() => (window as typeof window & { photoLayoutErrors: string[] }).photoLayoutErrors)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("stable-320px.png") });
  });
}

test("source panel crops and full Overview remain stable through open-window resizes and zoom", async ({ page }) => {
  test.setTimeout(60_000);
  const guide = GUIDE_LIBRARY.find(row => row.id === "compendium-mirage-palace-jungle")!;
  const viewer = await open(page, guide);
  await expect(viewer.locator(".ul-photo-region")).toHaveCount(1);
  for (const size of sizes) {
    await page.setViewportSize(size);
    await stable(viewer, 1);
    await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
    await stable(viewer, 1.5);
    await viewer.getByRole("button", { name: "Fit photo", exact: true }).click();
  }
  await viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button").last().click();
  await decoded(viewer);
  await expect(viewer.locator(".ul-photo-region")).toHaveCount(0);
  await stable(viewer, 1);
});

test("a late original-image decode cannot resize or reload the photo frame; swipe still changes the slide", async ({ page }) => {
  const guide = guides[0], first = utilityPhotos(guide)[0];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(first.image, async route => { await gate; await route.fulfill({ status: 200, ...sourcePixels.get(first.image)! }); });
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(routeFor(guide), { waitUntil: "domcontentloaded" });
    const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
    await expect(viewer).toBeVisible();
    const frame = viewer.locator(".ul-photo-frame"), before = await frame.boundingBox();
    const image = viewer.locator(".ul-photo-canvas img");
    await image.evaluate(img => { img.setAttribute("data-load-count", "0"); img.addEventListener("load", () => img.setAttribute("data-load-count", String(Number(img.getAttribute("data-load-count")) + 1))); });
    release();
    await decoded(viewer);
    await stable(viewer, 1);
    expect(await frame.boundingBox()).toEqual(before);
    await expect(image).toHaveAttribute("data-load-count", "1");
    const viewport = viewer.locator(".ul-photo-viewport"), box = (await viewport.boundingBox())!;
    await viewport.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 7, isPrimary: true, clientX: box.x + 240, clientY: box.y + 50 });
    await viewport.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 7, isPrimary: true, clientX: box.x + 100, clientY: box.y + 50 });
    await expect(viewer.getByRole("button", { name: "Step 2: First-person standing view", exact: true })).toHaveAttribute("aria-pressed", "true");
    await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(viewer.locator(".ul-photo-kind")).toHaveText("Aim");
    await decoded(viewer);
    await stable(viewer, 1);
  } finally { release(); }
});
