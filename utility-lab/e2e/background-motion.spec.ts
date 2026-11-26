import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("map pixels scale evenly at 4K and the map entrance settles", async ({ page }) => {
  test.slow(); // Native 4K capture can take longer on software-rendered browsers.
  const artwork = new Set<string>();
  page.on("request", request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/art/")) artwork.add(path);
  });
  await page.setViewportSize({ width: 3840, height: 2160 });
  await page.goto("/#home");
  const picture = page.locator(".launch-picture.is-loaded");
  const foreground = picture.locator(".launch-art");
  await expect(foreground).toHaveCSS("animation-name", "map-scene-settles");
  await expect(foreground).toHaveCSS("animation-iteration-count", "1");
  await expect(foreground).toHaveCSS("image-rendering", "pixelated");
  await expect.poll(() => foreground.evaluate(el => el.getAnimations().every(animation => animation.playState === "finished"))).toBe(true);
  const dimensions = await picture.locator(".launch-art").evaluate((image: HTMLImageElement) => {
    const { x, y, width, height } = image.getBoundingClientRect();
    return { x, y, width, height, pixelX: width * devicePixelRatio / image.naturalWidth,
      pixelY: height * devicePixelRatio / image.naturalHeight };
  });
  expect(Number.isInteger(dimensions.pixelX)).toBe(true);
  expect(dimensions.pixelX).toBe(dimensions.pixelY);
  expect(dimensions.x).toBeLessThanOrEqual(0);
  expect(dimensions.y).toBeLessThanOrEqual(0);
  expect(dimensions.width + dimensions.x).toBeGreaterThanOrEqual(3840);
  expect(dimensions.height + dimensions.y).toBeGreaterThanOrEqual(2160);
  expect([...artwork].sort()).toEqual(["/art/maps/dust2.webp"]);
  await page.screenshot({ path: "outputs/artist-art-review/dust2-3840.png" });
});

test("hidden tabs pause the entrance and reduced motion uses a still picture on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#home");
  const picture = page.locator(".launch-picture.is-loaded");
  await expect(picture).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(picture.locator(".launch-art")).toHaveCSS("animation-play-state", "paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(picture).toHaveCSS("animation-name", "none");
  await expect(picture.locator(".launch-art")).toHaveCSS("animation-name", "none");
  await expect(picture.locator(".launch-art")).toHaveCSS("transform", "none");
  await expect(page.locator(".launch-destinations")).toHaveCSS("animation-name", "none");
  for (const name of ["Tactic board","Lineups","Playbooks","Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "Tactic board", exact: true }).click();
  await expect(page.locator(".tb-map")).toBeVisible();
  await expect(page.locator(".launch-picture")).toHaveCount(0);
});
