import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("classic backgrounds have moving lane smoke and ground wind without loading other landscapes", async ({ page }) => {
  const errors: string[] = [];
  const artwork = new Set<string>();
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (/\/art\//.test(request.url())) artwork.add(new URL(request.url()).pathname); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#home");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  const wisp = page.locator(".launch-wisp img").first();
  const sand = page.locator(".launch-sand-gust").first();
  await expect(page.locator(".launch-wisp img")).toHaveCount(3);
  await expect(page.locator(".launch-sand-gust")).toHaveCount(2);
  expect(await wisp.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const initial = await wisp.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => wisp.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
  const ground = await sand.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => sand.evaluate(element => getComputedStyle(element).transform)).not.toBe(ground);
  expect(Number(await wisp.evaluate(element => getComputedStyle(element).opacity))).toBeGreaterThan(.1);
  expect(await page.locator(".launch-environment").getAttribute("aria-hidden")).toBe("true");
  expect(await page.locator(".launch-environment").evaluate(element => getComputedStyle(element).pointerEvents)).toBe("none");
  expect([...artwork].sort()).toEqual(["/art/launch-dust-cs1999.webp", "/art/pixel-smoke.png"]);
  for (const id of ["dust-cs1999", "dust-source", "dust-csgo"]) {
    await page.getByLabel("Landscape", { exact: true }).selectOption(id);
    await expect(page.locator(".launch-screen")).toHaveAttribute("data-scene", id);
    await expect(page.locator(".launch-art-previous")).toHaveCount(0);
    await page.screenshot({ path: `outputs/background-motion/${id}-1440.png` });
  }
  await page.setViewportSize({ width: 320, height: 640 });
  for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.screenshot({ path: "outputs/background-motion/dust-csgo-320.png" });
  expect(errors).toEqual([]);
});

test("background moving parts pause when hidden, settle under reduced motion, and stay off the tactic board", async ({ page }) => {
  await page.goto("/#home");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".launch-screen")).toHaveClass(/scene-paused/);
  for (const selector of [".launch-wisp img", ".launch-sand-gust", ".launch-particles i"]) {
    expect(await page.locator(selector).evaluateAll(elements => elements.every(element => getComputedStyle(element).animationPlayState === "paused"))).toBe(true);
  }
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".launch-screen")).not.toHaveClass(/scene-paused/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const selector of [".launch-wisp img", ".launch-sand-gust"]) {
    expect(await page.locator(selector).evaluateAll(elements => elements.every(element => getComputedStyle(element).animationName === "none"))).toBe(true);
  }
  await expect(page.locator(".launch-ground-wind")).toBeHidden();
  await page.getByRole("button", { name: "Tactic board", exact: true }).click();
  await expect(page.locator(".tb-map")).toBeVisible();
  await expect(page.locator(".launch-environment")).toHaveCount(0);
});
