import { readFileSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { utilityPhotos, type UtilityReference } from "../src/utility-data";
import { withAimPlacement } from "../src/aim-placement";

test.use({ serviceWorkers: "block" });
const generated: UtilityReference[] = ["ancient", "anubis", "cache", "nuke"].flatMap(map =>
  JSON.parse(readFileSync(new URL(`../src/data/expanded/${map}.json`, import.meta.url), "utf8")));
const ids = [
  "expanded-cs2tricks-ancient-b-alley-from-ruins-6af7-t",
  "expanded-cs2tricks-anubis-heaven-from-water-d678-t",
  "expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8",
];
const guides = ids.map(id => generated.find(row => row.id === id)!);
guides.push(generated.find(row => row.source === "https://csnades.gg/cache/hegrenades/backsite-from-sun-room")!);
const pixels = new Map<string, { body: Buffer; contentType: string }>();
const layoutErrors = new WeakMap<Page, string[]>();

test.beforeAll(async ({ request }) => {
  for (const image of new Set(guides.flatMap(guide => utilityPhotos(guide).map(photo => photo.image)).filter(image => image.startsWith("https://")))) {
    const response = await request.get(image);
    expect(response.ok(), `Original source image: ${image}`).toBeTruthy();
    pixels.set(image, { body: await response.body(), contentType: response.headers()["content-type"] });
  }
});
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  layoutErrors.set(page, errors);
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (/NaN|ResizeObserver|Maximum update depth/i.test(message.text())) errors.push(message.text());
  });
  await page.route(/^https:\/\//, route => {
    const photo = pixels.get(route.request().url());
    return photo ? route.fulfill({ status: 200, ...photo }) : route.abort();
  });
});
test.afterEach(async ({ page }) => expect(layoutErrors.get(page)).toEqual([]));

async function open(page: Page, guide: UtilityReference) {
  await page.goto(`/#utilities?${new URLSearchParams({ map: guide.mapId, level: guide.levelId, side: guide.side, lineup: guide.id })}`);
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  return viewer;
}
async function decoded(viewer: Locator) {
  const image = viewer.locator(".ul-photo-canvas img");
  await image.evaluate(async (image: HTMLImageElement) => image.decode());
  await expect(image).toHaveCSS("opacity", "1");
}
async function aligned(viewer: Locator, guide: UtilityReference, index: number) {
  await decoded(viewer);
  const photo = utilityPhotos(withAimPlacement(guide))[index];
  expect(photo.aimPoint).toBeTruthy();
  await expect(viewer.getByRole("img", { name: "Aim here", exact: true })).toBeVisible();
  const error = await viewer.evaluate((dialog, photo) => {
    const image = dialog.querySelector<HTMLImageElement>(".ul-photo-canvas img")!;
    const canvas = dialog.querySelector<HTMLElement>(".ul-photo-canvas")!.getBoundingClientRect();
    const marker = dialog.querySelector(".ul-aim-point")!.getBoundingClientRect();
    const region = photo.region;
    const ratio = region
      ? Math.min(canvas.width / region.width, canvas.height / region.height)
      : Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const w = (region?.width || image.naturalWidth) * ratio;
    const h = (region?.height || image.naturalHeight) * ratio;
    const x = region ? photo.aimPoint!.x * region.sourceWidth - region.x : photo.aimPoint!.x * image.naturalWidth;
    const y = region ? photo.aimPoint!.y * region.sourceHeight - region.y : photo.aimPoint!.y * image.naturalHeight;
    return {
      x: Math.abs(marker.x + marker.width / 2 - (canvas.x + (canvas.width - w) / 2 + x * ratio)),
      y: Math.abs(marker.y + marker.height / 2 - (canvas.y + (canvas.height - h) / 2 + y * ratio)),
      animation: getComputedStyle(dialog.querySelector(".ul-aim-point")!).animationName,
      source: image.getAttribute("src"),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  }, photo);
  expect(error.x).toBeLessThan(.05);
  expect(error.y).toBeLessThan(.05);
  expect(error.source).toBe(photo.image);
  expect(error.animation).toBe("none");
  expect(error.overflow).toBe(false);
}

for (const guide of guides) {
  test(`${guide.title}: source-confirmed aim point follows Fit, zoom, pan and phone layout`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    const viewer = await open(page, guide);
    await decoded(viewer);
    await expect(viewer.locator(".ul-aim-point")).toHaveCount(0);
    const photos = utilityPhotos(withAimPlacement(guide));
    for (const [index, photo] of photos.entries()) {
      if (!photo.aimPoint) continue;
      await viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button").nth(index).click();
      await aligned(viewer, guide, index);
      await page.screenshot({ path: testInfo.outputPath(`aim-${index}-desktop.png`) });
      await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
      await aligned(viewer, guide, index);
      const viewport = viewer.locator(".ul-photo-viewport");
      await viewport.focus();
      await page.keyboard.press("ArrowRight");
      await aligned(viewer, guide, index);
      await viewer.getByRole("button", { name: "Hide aim point", exact: true }).click();
      await expect(viewer.locator(".ul-aim-point")).toHaveCount(0);
      await viewer.getByRole("button", { name: "Show aim point", exact: true }).click();
      await aligned(viewer, guide, index);
      await viewer.getByRole("button", { name: "Fit photo", exact: true }).click();
      for (const size of [{ width: 390, height: 844 }, { width: 320, height: 640 }]) {
        await page.setViewportSize(size);
        await aligned(viewer, guide, index);
        await expect(viewer.getByRole("button", { name: "Hide aim point", exact: true })).toBeVisible();
        const keys = await viewer.locator(".ul-media-footer").boundingBox();
        expect(keys!.y + keys!.height).toBeLessThanOrEqual(size.height + .1);
      }
      await page.screenshot({ path: testInfo.outputPath(`aim-${index}-phone.png`) });
      await page.setViewportSize({ width: 1280, height: 720 });
    }
  });
}
