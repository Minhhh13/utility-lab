import { test, expect, type Locator, type Page } from "@playwright/test";
import { GUIDE_LIBRARY } from "../src/guide-library";
import { utilityPhotos } from "../src/utility-data";

test.use({ serviceWorkers: "block" });

const guide = GUIDE_LIBRARY.find((record) => record.id === "photo-kielson-cache-s_wozek_0-t")!;
if (!guide) throw new Error("Missing original landscape photo fixture");
const route = `/#utilities?${new URLSearchParams({ map: guide.mapId, level: guide.levelId, side: guide.side, lineup: guide.id })}`;

async function openPhoto(page: Page) {
  // Render the actual bundled source photo without depending on remote media.
  await page.route(/^https:\/\//, (request) => request.abort());
  await page.goto(route);
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src", utilityPhotos(guide)[0].image);
  await image.evaluate(async (element: HTMLImageElement) => { await element.decode(); });
  await expect(image).toHaveCSS("opacity", "1");
  await expect(viewer.locator("iframe, video")).toHaveCount(0);
  return viewer;
}

async function measure(viewer: Locator) {
  return viewer.evaluate((dialog) => {
    const image = dialog.querySelector<HTMLImageElement>(".ul-photo-canvas img")!;
    const viewport = dialog.querySelector<HTMLElement>(".ul-photo-viewport")!;
    const rect = (element: Element) => {
      const { x, y, width, height, right, bottom } = element.getBoundingClientRect();
      return { x, y, width, height, right, bottom };
    };
    const imageBox = rect(image);
    // object-fit includes letterboxing in the img's CSS box. Assert the actual
    // painted photograph, so making only the gray frame larger cannot pass.
    const scale = Math.min(imageBox.width / image.naturalWidth, imageBox.height / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    const x = imageBox.x + (imageBox.width - width) / 2;
    const y = imageBox.y + (imageBox.height - height) / 2;
    const controls = [...dialog.querySelectorAll<HTMLButtonElement>(".ul-photo-toolbar button, [aria-label='Close lineup media'], .ul-slide-prev, .ul-slide-next")];
    return {
      painted: { x, y, width, height, right: x + width, bottom: y + height },
      naturalRatio: image.naturalWidth / image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
      viewport: rect(viewport),
      keys: rect(dialog.querySelector(".ul-media-footer")!),
      controls: controls.map((button) => ({
        name: button.getAttribute("aria-label") || button.textContent,
        ...rect(button),
        reachable: document.elementFromPoint(rect(button).x + rect(button).width / 2, rect(button).y + rect(button).height / 2)?.closest("button") === button,
      })),
      scroll: { left: viewport.scrollLeft, top: viewport.scrollTop, width: viewport.scrollWidth, height: viewport.scrollHeight, clientWidth: viewport.clientWidth, clientHeight: viewport.clientHeight },
      screen: { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth },
    };
  });
}

async function expectFullPhoto(viewer: Locator, minimumHeight: number) {
  await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("100%");
  // The ResizeObserver can run one frame after a viewport resize.
  await expect.poll(async () => (await measure(viewer)).painted.height).toBeGreaterThan(minimumHeight);
  const geometry = await measure(viewer);
  expect(geometry.objectFit).toBe("contain");
  expect(geometry.naturalRatio).toBeGreaterThan(1.7);
  expect(geometry.painted.width / geometry.painted.height).toBeCloseTo(geometry.naturalRatio, 4);
  expect(geometry.painted.x).toBeGreaterThanOrEqual(geometry.viewport.x - 1);
  expect(geometry.painted.y).toBeGreaterThanOrEqual(geometry.viewport.y - 1);
  expect(geometry.painted.right).toBeLessThanOrEqual(geometry.viewport.right + 1);
  expect(geometry.painted.bottom).toBeLessThanOrEqual(geometry.viewport.bottom + 1);
  expect(geometry.painted.bottom).toBeLessThanOrEqual(geometry.keys.y + 1);
  expect(geometry.keys.bottom).toBeLessThanOrEqual(geometry.screen.height);
  expect(geometry.keys.height).toBeGreaterThan(35);
  expect(geometry.scroll.left).toBeLessThanOrEqual(1);
  expect(geometry.scroll.top).toBeLessThanOrEqual(1);
  expect(geometry.scroll.width).toBeLessThanOrEqual(geometry.scroll.clientWidth + 1);
  expect(geometry.scroll.height).toBeLessThanOrEqual(geometry.scroll.clientHeight + 1);
  expect(geometry.screen.documentWidth).toBe(geometry.screen.width);
  for (const control of geometry.controls) {
    expect(control.x, control.name || "control").toBeGreaterThanOrEqual(0);
    expect(control.y, control.name || "control").toBeGreaterThanOrEqual(0);
    expect(control.right, control.name || "control").toBeLessThanOrEqual(geometry.screen.width + 1);
    expect(control.bottom, control.name || "control").toBeLessThanOrEqual(geometry.screen.height + 1);
    expect(control.reachable, control.name || "control").toBe(true);
  }
  await expect(viewer.locator(".ul-viewer-keys")).toContainText("Jump");
  await expect(viewer.locator(".ul-viewer-keys")).toContainText("LMB + RMB");
  return geometry;
}

for (const size of [
  { width: 1440, height: 900, minimumPhotoHeight: 600 },
  { width: 1920, height: 1080, minimumPhotoHeight: 780 },
  { width: 2560, height: 1440, minimumPhotoHeight: 1140 },
  { width: 320, height: 640, minimumPhotoHeight: 170 },
  { width: 960, height: 540, minimumPhotoHeight: 250 },
]) {
  test(`the full landscape photo uses the larger viewer at ${size.width}x${size.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(size);
    const viewer = await openPhoto(page);
    await expectFullPhoto(viewer, size.minimumPhotoHeight);
    await page.screenshot({ path: testInfo.outputPath(`larger-photo-${size.width}x${size.height}.png`) });
    // Navigation stays usable with the enlarged photo and visible throw keys.
    await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(viewer.locator(".ul-photo-kind")).toHaveText("Aim");
    await expectFullPhoto(viewer, size.minimumPhotoHeight);
  });
}

test("resizing a large photo to a phone keeps Fit and the throw controls available", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  const viewer = await openPhoto(page);
  await expectFullPhoto(viewer, 1140);
  await page.setViewportSize({ width: 320, height: 640 });
  await expectFullPhoto(viewer, 170);
  await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
  await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("150%");
  await viewer.getByRole("button", { name: "Fit photo", exact: true }).click();
  await expectFullPhoto(viewer, 170);
  await viewer.getByRole("button", { name: "Close lineup media", exact: true }).click();
  await expect(viewer).not.toBeVisible();
});
