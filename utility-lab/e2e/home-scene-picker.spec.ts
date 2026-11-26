import { expect, test } from "@playwright/test";
import { LAUNCH_SCENES } from "../src/launch-scenes";

test.use({ serviceWorkers: "block" });

test("Home previews each map without fetching its full backdrop until selection", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const fetched = new Set<string>();
  page.on("request", request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/art/")) fetched.add(path);
  });
  await page.goto("/#home");
  const trigger = page.getByRole("button", { name: /^Map background:/ });
  await expect(trigger).toHaveAttribute("aria-busy", "false");
  const [first, second] = LAUNCH_SCENES;
  expect([...fetched]).toEqual([first.src]);
  await trigger.click();
  const list = page.getByRole("listbox", { name: "Map background", exact: true });
  const options = list.getByRole("option");
  await expect(options).toHaveText(LAUNCH_SCENES.map(scene => scene.name));
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await expect(options.first().locator(".home-scene-check")).toBeVisible();
  const previews = await list.locator("img").evaluateAll(async images =>
    Promise.all(images.map(async node => {
      const image = node as HTMLImageElement;
      await image.decode();
      return { src: image.getAttribute("src"), width: image.naturalWidth };
    })));
  expect(previews.map(image => image.src)).toEqual(LAUNCH_SCENES.map(scene => scene.thumbnail));
  expect(previews.every(image => image.width > 0 && image.width <= 320)).toBe(true);
  expect([...fetched].filter(path => path.startsWith("/art/maps/"))).toEqual([first.src]);
  await page.screenshot({ path: testInfo.outputPath("home-background-desktop.png"), animations: "disabled" });
  await options.nth(1).click();
  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator(".launch-screen")).toHaveAttribute("data-scene", second.id);
  expect([...fetched].filter(path => path.startsWith("/art/maps/"))).toEqual([first.src, second.src]);
});

test("keyboard users can explore, cancel and select backgrounds without moving the page", async ({ page }) => {
  await page.goto("/#home");
  const trigger = page.getByRole("button", { name: /^Map background:/ });
  const list = page.getByRole("listbox", { name: "Map background" });
  const options = list.getByRole("option");
  // WebKit's native reverse tab order can skip links depending on the OS setting.
  await trigger.press("Shift+Tab");
  const previousTabStop = await page.evaluateHandle(() => document.activeElement);
  await trigger.press("ArrowDown");
  await expect(options.first()).toBeFocused();
  await expect(options.first()).toHaveCSS("outline-style", "solid");
  await expect(page.locator(".home-scene-popup")).toHaveCSS("animation-name", "none");
  await page.keyboard.press("End");
  await expect(options.last()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(options.nth(LAUNCH_SCENES.length - 2)).toBeFocused();
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(list).toHaveCount(0);
  await trigger.press("End");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleName(`Map background: ${LAUNCH_SCENES[1].name}`);
  await trigger.press("Space");
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(list).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Workspace settings", exact: true })).toBeFocused();
  await trigger.press("Enter");
  await page.keyboard.press("Shift+Tab");
  await expect(list).toHaveCount(0);
  await expect.poll(() => previousTabStop.evaluate(node => node === document.activeElement)).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test.describe("touch backgrounds", () => {
  test.use({ isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  for (const [width, height] of [[320, 568], [568, 320]]) {
    test(`the picker stays within a ${width}×${height} phone and dismisses on an outside tap`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height });
      await page.goto("/#home");
      const trigger = page.getByRole("button", { name: /^Map background:/ });
      const list = page.getByRole("listbox", { name: "Map background" });
      await trigger.tap();
      const panel = page.locator(".home-scene-popup");
      await expect(panel).toHaveCSS("animation-name", "none");
      const box = await panel.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(9);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width - 9);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height - 9);
      expect((await list.getByRole("option").first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (height === 320) {
        await expect(list).toHaveCSS("scrollbar-width", "none");
        expect(await list.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
      }
      if (width === 320) await page.screenshot({ path: testInfo.outputPath("home-background-phone.png"), animations: "disabled" });
      await page.touchscreen.tap(5, Math.floor(height / 2));
      await expect(list).toHaveCount(0);
      await trigger.tap();
      await list.getByRole("option").last().tap();
      await expect(page.locator(".launch-screen")).toHaveAttribute("data-scene", LAUNCH_SCENES.at(-1)!.id);
      await expect(list).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
});
