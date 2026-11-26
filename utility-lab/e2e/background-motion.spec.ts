import { test, expect } from "@playwright/test";
import { LAUNCH_SCENES } from "../src/launch-scenes";

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
  expect([...artwork]).toEqual(["/art/maps/dust-1999.webp"]);
  await page.screenshot({ path: "outputs/artist-art-review/dust-1999-3840.png" });
});

test("hidden tabs pause the entrance and reduced motion uses a still picture on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#home");
  const picture = page.locator(".launch-picture.is-loaded");
  await expect(picture).toBeVisible();
  const particle = picture.locator(".launch-ambient i").first();
  await expect(particle).toHaveCSS("animation-play-state", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(picture.locator(".launch-art")).toHaveCSS("animation-play-state", "paused");
  await expect(particle).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(particle).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(picture).toHaveCSS("animation-name", "none");
  await expect(picture.locator(".launch-art")).toHaveCSS("animation-name", "none");
  await expect(picture.locator(".launch-art")).toHaveCSS("transform", "none");
  await expect(picture.locator(".launch-ambient")).toBeHidden();
  await expect(page.locator(".launch-destinations")).toHaveCSS("animation-name", "none");
  for (const name of ["Tactic board","Lineups","Playbooks","Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "Tactic board", exact: true }).click();
  await expect(page.locator(".tb-map")).toBeVisible();
  await expect(page.locator(".launch-picture")).toHaveCount(0);
});

test("sand, river ripples and snowfall animate the active drawing without extra image or video downloads", async ({ page }) => {
  const requested = new Set<string>();
  page.on("request", request => {
    if (["image", "media"].includes(request.resourceType())) requested.add(new URL(request.url()).pathname);
  });
  await page.goto("/#home");
  const scenes = ["dust-1999", "aztec", "office"].map(id => LAUNCH_SCENES.find(scene => scene.id === id)!);
  const current = page.locator(".launch-picture.is-loaded:not(.is-previous)");
  for (const [index, scene] of scenes.entries()) {
    if (index) {
      await page.getByRole("button", { name: /^Map background:/ }).click();
      await page.getByRole("option", { name: scene.name, exact: true }).click();
    }
    await expect(current.locator("img")).toHaveAttribute("data-scene", scene.id);
    await expect(page.locator(".launch-picture.is-previous .launch-ambient")).toHaveCount(0);
    const particles = current.locator(".launch-ambient i");
    await expect(particles.first()).not.toHaveCSS("animation-name", "none");
    const properties = await particles.evaluateAll(nodes => {
      const metadata = new Set(["offset", "computedOffset", "easing", "composite"]);
      return [...new Set(nodes.flatMap(node => node.getAnimations().flatMap(animation => {
        const effect = animation.effect as KeyframeEffect;
        return effect.getKeyframes().flatMap(frame => Object.keys(frame).filter(key => !metadata.has(key)));
      })))].sort();
    });
    expect(properties).toEqual(["opacity", "transform"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(current.locator(".launch-ambient")).toBeHidden();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(particles.first()).not.toHaveCSS("animation-name", "none");
  }
  const expected = [...LAUNCH_SCENES.map(scene => scene.thumbnail), ...scenes.map(scene => scene.src)].sort();
  expect([...requested].sort()).toEqual(expected);
});
